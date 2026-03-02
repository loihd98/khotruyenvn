const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config");
const prisma = require("../lib/prisma");

class TokenService {
  // ─── Access Token ──────────────────────────────────────────────
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0, // version check prevents replay
    };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  // ─── Refresh Token ─────────────────────────────────────────────
  /**
   * Creates a raw refresh token (random bytes), stores its SHA-256 hash
   * in the database, and returns { rawToken, dbRecord }.
   *
   * @param {object} user       - user object (must have .id, .tokenVersion)
   * @param {object} meta       - { userAgent, ipAddress }
   * @param {string|null} family - existing family id (null = new login → new family)
   * @param {string|null} parentId - the DB id of the token this one replaces
   */
  async createRefreshToken(user, meta = {}, family = null, parentId = null) {
    const rawToken = crypto.randomBytes(64).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + config.refreshTokenMaxAgeDays * 24 * 60 * 60 * 1000
    );

    const familyId = family || crypto.randomUUID();

    const dbRecord = await prisma.refreshToken.create({
      data: {
        tokenHash,
        family: familyId,
        userId: user.id,
        expiresAt,
        userAgent: meta.userAgent || null,
        ipAddress: meta.ipAddress || null,
      },
    });

    // Mark the parent token as replaced (for rotation tracking)
    if (parentId) {
      await prisma.refreshToken.update({
        where: { id: parentId },
        data: { revokedAt: new Date(), replacedBy: dbRecord.id },
      });
    }

    return { rawToken, dbRecord };
  }

  /**
   * Verify a raw refresh token:
   *  1. Lookup the hash in DB
   *  2. Validate not revoked and not expired
   *  3. Detect token reuse (replay attack)
   *
   * Returns { tokenRecord, user } or throws.
   */
  async verifyRefreshToken(rawToken) {
    const tokenHash = this.hashToken(rawToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new Error("Invalid refresh token");
    }

    // ── Reuse detection ──────────────────────────────────────────
    // If the token was already revoked / replaced, it means someone
    // is replaying an old token.  Revoke the ENTIRE family.
    if (tokenRecord.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { family: tokenRecord.family },
        data: { revokedAt: new Date() },
      });
      throw new Error("Refresh token reuse detected – family revoked");
    }

    // ── Expiry check ─────────────────────────────────────────────
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
      throw new Error("Refresh token expired");
    }

    return { tokenRecord, user: tokenRecord.user };
  }

  /**
   * Rotate: verify the incoming token, revoke it, issue a new one in
   * the same family.  Returns { accessToken, rawRefreshToken }.
   */
  async rotateRefreshToken(rawToken, meta = {}) {
    const { tokenRecord, user } = await this.verifyRefreshToken(rawToken);

    // Issue replacement in the same family
    const { rawToken: newRawToken, dbRecord: newRecord } =
      await this.createRefreshToken(
        user,
        meta,
        tokenRecord.family,
        tokenRecord.id
      );

    const accessToken = this.generateAccessToken(user);

    return { accessToken, rawRefreshToken: newRawToken, user };
  }

  // ─── Revocation helpers ────────────────────────────────────────
  async revokeToken(rawToken) {
    const tokenHash = this.hashToken(rawToken);
    await prisma.refreshToken
      .update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      })
      .catch(() => {}); // token may already not exist
  }

  async revokeAllUserTokens(userId) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Prune expired / revoked tokens older than 30 days */
  async pruneExpiredTokens() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: cutoff } },
          { revokedAt: { lt: cutoff } },
        ],
      },
    });
  }

  // ─── Cookie helpers ────────────────────────────────────────────
  getRefreshCookieOptions() {
    return {
      httpOnly: true,                       // not accessible via JS
      secure: config.isProduction,          // HTTPS-only in prod
      sameSite: config.isProduction ? "strict" : "lax",
      path: "/api/auth",                    // only sent to auth endpoints
      maxAge: config.refreshTokenMaxAgeDays * 24 * 60 * 60 * 1000,
      ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
    };
  }

  setRefreshCookie(res, rawToken) {
    res.cookie("refreshToken", rawToken, this.getRefreshCookieOptions());
  }

  clearRefreshCookie(res) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? "strict" : "lax",
      path: "/api/auth",
      ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
    });
  }

  // ─── Utilities ─────────────────────────────────────────────────
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

module.exports = new TokenService();
