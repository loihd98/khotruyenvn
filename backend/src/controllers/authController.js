const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const tokenService = require("../utils/tokenService");
const validationService = require("../utils/validationService");
const config = require("../config");

/**
 * Helper: extract client metadata for refresh token records
 */
function getClientMeta(req) {
  return {
    userAgent: req.headers["user-agent"] || null,
    ipAddress:
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      null,
  };
}

/**
 * Helper: build safe user response (never expose passwordHash)
 */
function toUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || null,
    role: user.role,
    googleId: user.googleId || null,
    facebookId: user.facebookId || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt || user.createdAt,
  };
}

class AuthController {
  // ───────────────────────────────────────────── Register ─────
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validation
      validationService.validateEmail(email);
      validationService.validatePassword(password);
      validationService.validateName(name);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Conflict",
          message: "Email này đã được sử dụng",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name: name.trim(),
          role: "USER",
        },
      });

      // Generate access token
      const accessToken = tokenService.generateAccessToken(user);

      // Create refresh token in DB + set httpOnly cookie
      const { rawToken } = await tokenService.createRefreshToken(
        user,
        getClientMeta(req)
      );
      tokenService.setRefreshCookie(res, rawToken);

      res.status(201).json({
        message: "Đăng ký thành công",
        data: {
          user: toUserResponse(user),
          accessToken, // returned in body — stored in memory only
          // refreshToken is NOT in the JSON body — it's in the cookie
        },
      });
    } catch (error) {
      console.error("Register error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi đăng ký",
      });
    }
  }

  // ───────────────────────────────────────────── Login ────────
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      validationService.validateEmail(email);
      validationService.validatePassword(password);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Generate access token
      const accessToken = tokenService.generateAccessToken(user);

      // Create refresh token in DB + set httpOnly cookie
      const { rawToken } = await tokenService.createRefreshToken(
        user,
        getClientMeta(req)
      );
      tokenService.setRefreshCookie(res, rawToken);

      res.json({
        message: "Đăng nhập thành công",
        data: {
          user: toUserResponse(user),
          accessToken,
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          message: error.message,
        });
      }

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi đăng nhập",
      });
    }
  }

  // ───────────────────────────────────────────── Refresh ──────
  async refresh(req, res) {
    try {
      // Read refresh token from httpOnly cookie (NOT from body)
      const rawToken = req.cookies?.refreshToken;

      if (!rawToken) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Refresh token không được cung cấp",
        });
      }

      // Rotate: verify old → revoke old → issue new pair
      const { accessToken, rawRefreshToken, user } =
        await tokenService.rotateRefreshToken(rawToken, getClientMeta(req));

      // Set the new refresh token in cookie
      tokenService.setRefreshCookie(res, rawRefreshToken);

      res.json({
        message: "Token đã được làm mới",
        data: {
          user: toUserResponse(user),
          accessToken,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);

      // Clear the bad cookie
      tokenService.clearRefreshCookie(res);

      res.status(401).json({
        error: "Unauthorized",
        message: "Refresh token không hợp lệ",
      });
    }
  }

  // ───────────────────────────────────────────── Logout ───────
  async logout(req, res) {
    try {
      const rawToken = req.cookies?.refreshToken;

      if (rawToken) {
        // Revoke the token in DB
        await tokenService.revokeToken(rawToken);
      }

      // Clear cookie
      tokenService.clearRefreshCookie(res);

      res.json({ message: "Đăng xuất thành công" });
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear cookie even on error
      tokenService.clearRefreshCookie(res);
      res.json({ message: "Đăng xuất thành công" });
    }
  }

  // ───────────────────────────────────── Logout all devices ──
  async logoutAll(req, res) {
    try {
      await tokenService.revokeAllUserTokens(req.user.id);
      tokenService.clearRefreshCookie(res);

      res.json({ message: "Đã đăng xuất tất cả thiết bị" });
    } catch (error) {
      console.error("Logout all error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra",
      });
    }
  }

  // ───────────────────────────────────────────── Me ───────────
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              bookmarks: true,
              comments: true,
              stories: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "Not Found",
          message: "Người dùng không tồn tại",
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);

      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy thông tin người dùng",
      });
    }
  }

  // ───────────────────────────────────── OAuth success ────────
  async oauthSuccess(req, res) {
    try {
      const user = req.user;

      // Generate access token
      const accessToken = tokenService.generateAccessToken(user);

      // Create refresh token in DB + set httpOnly cookie
      const { rawToken } = await tokenService.createRefreshToken(
        user,
        getClientMeta(req)
      );
      tokenService.setRefreshCookie(res, rawToken);

      // Redirect to frontend with access token only (refresh is in cookie)
      const redirectUrl = `${config.corsOrigin}/auth/callback?token=${accessToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth success error:", error);
      res.redirect(`${config.corsOrigin}/auth/error`);
    }
  }

  // ───────────────────────────────────── OAuth failure ────────
  async oauthFailure(req, res) {
    res.redirect(
      `${config.corsOrigin}/auth/error?message=OAuth authentication failed`
    );
  }
}

module.exports = new AuthController();
