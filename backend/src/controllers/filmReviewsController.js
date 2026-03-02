const prisma = require("../lib/prisma");
const slugify = require("slugify");

class FilmReviewsController {
  // ==================== PUBLIC ENDPOINTS ====================

  // GET /api/film-reviews - List film reviews with filters
  async getFilmReviews(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      const { category, tag, search, sort = "createdAt" } = req.query;

      const where = { status: "PUBLISHED" };

      if (category) {
        where.categories = {
          some: { slug: category },
        };
      }

      if (tag) {
        where.tags = { has: tag };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          {
            slug: {
              contains: search.replace(/\s+/g, "-"),
              mode: "insensitive",
            },
          },
        ];
      }

      let orderBy = { createdAt: "desc" };
      if (sort === "rating") orderBy = { rating: "desc" };
      else if (sort === "viewCount") orderBy = { viewCount: "desc" };
      else if (sort === "title") orderBy = { title: "asc" };

      const [filmReviews, total] = await Promise.all([
        prisma.filmReview.findMany({
          where,
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            categories: { select: { id: true, name: true, slug: true } },
            actors: {
              select: { id: true, name: true, slug: true, avatar: true },
            },
            affiliate: {
              select: {
                id: true,
                provider: true,
                targetUrl: true,
                label: true,
              },
            },
            _count: { select: { comments: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.filmReview.count({ where }),
      ]);

      res.json({
        data: filmReviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get film reviews error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách review phim",
      });
    }
  }

  // GET /api/film-reviews/categories - Get all film categories
  async getFilmCategories(req, res) {
    try {
      const categories = await prisma.filmCategory.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { filmReviews: true } },
        },
      });

      res.json({ data: categories });
    } catch (error) {
      console.error("Get film categories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách thể loại phim",
      });
    }
  }

  // GET /api/film-reviews/tags - Get all unique tags
  async getFilmTags(req, res) {
    try {
      const reviews = await prisma.filmReview.findMany({
        where: { status: "PUBLISHED" },
        select: { tags: true },
      });

      const tagSet = new Set();
      reviews.forEach((r) => r.tags.forEach((t) => tagSet.add(t)));
      const tags = Array.from(tagSet).sort();

      res.json({ data: tags });
    } catch (error) {
      console.error("Get film tags error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách tags",
      });
    }
  }

  // GET /api/film-reviews/:slug - Get film review detail
  async getFilmReviewBySlug(req, res) {
    try {
      const { slug } = req.params;

      const filmReview = await prisma.filmReview.findUnique({
        where: { slug },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          categories: { select: { id: true, name: true, slug: true } },
          actors: {
            select: { id: true, name: true, slug: true, avatar: true },
          },
          affiliate: {
            select: { id: true, provider: true, targetUrl: true, label: true },
          },
          _count: { select: { comments: true } },
        },
      });

      if (!filmReview) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy review phim",
        });
      }

      // Only show published reviews to non-admin users
      if (filmReview.status !== "PUBLISHED") {
        if (!req.user || req.user.role !== "ADMIN") {
          return res.status(404).json({
            error: "Not Found",
            message: "Không tìm thấy review phim",
          });
        }
      }

      // Increment view count
      await prisma.filmReview.update({
        where: { id: filmReview.id },
        data: { viewCount: { increment: 1 } },
      });

      // Get related film reviews (same categories)
      const categoryIds = filmReview.categories.map((c) => c.id);
      const relatedReviews = await prisma.filmReview.findMany({
        where: {
          id: { not: filmReview.id },
          status: "PUBLISHED",
          categories: {
            some: { id: { in: categoryIds } },
          },
        },
        include: {
          categories: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true } },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      res.json({
        data: {
          ...filmReview,
          relatedReviews,
        },
      });
    } catch (error) {
      console.error("Get film review by slug error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy chi tiết review phim",
      });
    }
  }

  // GET /api/film-reviews/:slug/comments - Get comments for a film review
  async getFilmComments(req, res) {
    try {
      const { slug } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filmReview = await prisma.filmReview.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!filmReview) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy review phim",
        });
      }

      const where = {
        filmReviewId: filmReview.id,
        parentId: null, // Only top-level comments
        isApproved: true,
      };

      const [comments, total] = await Promise.all([
        prisma.filmComment.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: {
              where: { isApproved: true },
              include: {
                user: { select: { id: true, name: true, avatar: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.filmComment.count({ where }),
      ]);

      res.json({
        data: comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get film comments error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy bình luận",
      });
    }
  }

  // POST /api/film-reviews/:slug/comments - Create a comment
  async createFilmComment(req, res) {
    try {
      const { slug } = req.params;
      const { content, parentId } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Nội dung bình luận không được để trống",
        });
      }

      const filmReview = await prisma.filmReview.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!filmReview) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy review phim",
        });
      }

      // If parentId provided, verify parent exists
      if (parentId) {
        const parentComment = await prisma.filmComment.findUnique({
          where: { id: parentId },
        });
        if (!parentComment) {
          return res.status(404).json({
            error: "Not Found",
            message: "Không tìm thấy bình luận cha",
          });
        }
      }

      const comment = await prisma.filmComment.create({
        data: {
          content: content.trim(),
          userId: req.user.id,
          filmReviewId: filmReview.id,
          parentId: parentId || null,
          isApproved: req.user.role === "ADMIN", // Auto-approve admin comments
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      res.status(201).json({
        message:
          req.user.role === "ADMIN"
            ? "Bình luận đã được đăng"
            : "Bình luận đang chờ phê duyệt",
        data: comment,
      });
    } catch (error) {
      console.error("Create film comment error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo bình luận",
      });
    }
  }

  // ==================== ADMIN ENDPOINTS ====================

  // GET /api/admin/film-reviews - List all film reviews (admin)
  async adminGetFilmReviews(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      const { search, status, category, sort = "createdAt" } = req.query;

      const where = {};

      if (status) where.status = status;

      if (category) {
        where.categories = { some: { slug: category } };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      let orderBy = { createdAt: "desc" };
      if (sort === "rating") orderBy = { rating: "desc" };
      else if (sort === "viewCount") orderBy = { viewCount: "desc" };
      else if (sort === "title") orderBy = { title: "asc" };

      const [filmReviews, total] = await Promise.all([
        prisma.filmReview.findMany({
          where,
          include: {
            author: { select: { id: true, name: true } },
            categories: { select: { id: true, name: true, slug: true } },
            actors: { select: { id: true, name: true, slug: true } },
            affiliate: {
              select: {
                id: true,
                provider: true,
                targetUrl: true,
                label: true,
              },
            },
            _count: { select: { comments: true } },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.filmReview.count({ where }),
      ]);

      res.json({
        data: filmReviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Admin get film reviews error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách review phim",
      });
    }
  }

  // GET /api/admin/film-reviews/:id - Get single film review by id (admin)
  async adminGetFilmReviewById(req, res) {
    try {
      const { id } = req.params;

      const filmReview = await prisma.filmReview.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, name: true } },
          categories: { select: { id: true, name: true, slug: true } },
          actors: {
            select: { id: true, name: true, slug: true, avatar: true },
          },
          affiliate: {
            select: { id: true, provider: true, targetUrl: true, label: true },
          },
          _count: { select: { comments: true } },
        },
      });

      if (!filmReview) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy review phim",
        });
      }

      res.json({ data: filmReview });
    } catch (error) {
      console.error("Admin get film review by id error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy chi tiết review phim",
      });
    }
  }

  // POST /api/admin/film-reviews - Create film review (admin)
  async adminCreateFilmReview(req, res) {
    try {
      const {
        title,
        description,
        thumbnailUrl,
        rating,
        reviewLink,
        tags,
        status,
        categoryIds,
        actorNames,
        affiliateId,
      } = req.body;

      // Validation
      if (!title || !title.trim()) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Tên phim không được để trống",
        });
      }

      if (!reviewLink || !reviewLink.trim()) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Link review là bắt buộc",
        });
      }

      // Generate slug
      let slug = slugify(title, { lower: true, strict: true, locale: "vi" });

      // Check slug uniqueness
      const existing = await prisma.filmReview.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      // Handle actors - create if not exist
      let actorConnections = [];
      if (actorNames && actorNames.length > 0) {
        for (const actorName of actorNames) {
          const actorSlug = slugify(actorName, {
            lower: true,
            strict: true,
            locale: "vi",
          });
          let actor = await prisma.filmActor.findUnique({
            where: { slug: actorSlug },
          });
          if (!actor) {
            actor = await prisma.filmActor.create({
              data: { name: actorName, slug: actorSlug },
            });
          }
          actorConnections.push({ id: actor.id });
        }
      }

      const filmReview = await prisma.filmReview.create({
        data: {
          title: title.trim(),
          slug,
          description: description?.trim() || null,
          thumbnailUrl: thumbnailUrl || null,
          rating: parseFloat(rating) || 0,
          reviewLink: reviewLink.trim(),
          tags: tags || [],
          status: status || "DRAFT",
          authorId: req.user.id,
          affiliateId: affiliateId || null,
          categories: categoryIds?.length
            ? { connect: categoryIds.map((id) => ({ id })) }
            : undefined,
          actors: actorConnections.length
            ? { connect: actorConnections }
            : undefined,
        },
        include: {
          author: { select: { id: true, name: true } },
          categories: { select: { id: true, name: true, slug: true } },
          actors: { select: { id: true, name: true, slug: true } },
          affiliate: {
            select: { id: true, provider: true, targetUrl: true, label: true },
          },
        },
      });

      res.status(201).json({
        message: "Đã tạo review phim thành công",
        data: filmReview,
      });
    } catch (error) {
      console.error("Admin create film review error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo review phim",
      });
    }
  }

  // PUT /api/admin/film-reviews/:id - Update film review (admin)
  async adminUpdateFilmReview(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        thumbnailUrl,
        rating,
        reviewLink,
        tags,
        status,
        categoryIds,
        actorNames,
        affiliateId,
      } = req.body;

      const existing = await prisma.filmReview.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy review phim",
        });
      }

      // Generate new slug if title changed
      let slug = existing.slug;
      if (title && title.trim() !== existing.title) {
        slug = slugify(title, { lower: true, strict: true, locale: "vi" });
        const slugExists = await prisma.filmReview.findFirst({
          where: { slug, id: { not: id } },
        });
        if (slugExists) slug = `${slug}-${Date.now()}`;
      }

      // Handle actors
      let actorConnections = [];
      if (actorNames && actorNames.length > 0) {
        for (const actorName of actorNames) {
          const actorSlug = slugify(actorName, {
            lower: true,
            strict: true,
            locale: "vi",
          });
          let actor = await prisma.filmActor.findUnique({
            where: { slug: actorSlug },
          });
          if (!actor) {
            actor = await prisma.filmActor.create({
              data: { name: actorName, slug: actorSlug },
            });
          }
          actorConnections.push({ id: actor.id });
        }
      }

      const updateData = {
        title: title?.trim() || existing.title,
        slug,
        description:
          description !== undefined
            ? description?.trim() || null
            : existing.description,
        thumbnailUrl:
          thumbnailUrl !== undefined
            ? thumbnailUrl || null
            : existing.thumbnailUrl,
        rating:
          rating !== undefined ? parseFloat(rating) || 0 : existing.rating,
        reviewLink: reviewLink?.trim() || existing.reviewLink,
        tags: tags !== undefined ? tags : existing.tags,
        status: status || existing.status,
        affiliateId:
          affiliateId !== undefined
            ? affiliateId || null
            : existing.affiliateId,
      };

      // Handle category updates
      if (categoryIds !== undefined) {
        updateData.categories = {
          set: [], // Disconnect all first
          connect: categoryIds.map((id) => ({ id })),
        };
      }

      // Handle actor updates
      if (actorNames !== undefined) {
        updateData.actors = {
          set: [], // Disconnect all first
          connect: actorConnections,
        };
      }

      const filmReview = await prisma.filmReview.update({
        where: { id },
        data: updateData,
        include: {
          author: { select: { id: true, name: true } },
          categories: { select: { id: true, name: true, slug: true } },
          actors: { select: { id: true, name: true, slug: true } },
          affiliate: {
            select: { id: true, provider: true, targetUrl: true, label: true },
          },
        },
      });

      res.json({
        message: "Đã cập nhật review phim thành công",
        data: filmReview,
      });
    } catch (error) {
      console.error("Admin update film review error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật review phim",
      });
    }
  }

  // DELETE /api/admin/film-reviews/:id - Delete film review (admin)
  async adminDeleteFilmReview(req, res) {
    try {
      const { id } = req.params;

      const existing = await prisma.filmReview.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy review phim",
        });
      }

      await prisma.filmReview.delete({ where: { id } });

      res.json({ message: "Đã xóa review phim thành công" });
    } catch (error) {
      console.error("Admin delete film review error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa review phim",
      });
    }
  }

  // PATCH /api/admin/film-reviews/bulk-affiliate - Bulk assign affiliate links (round-robin)
  async adminBulkAssignAffiliate(req, res) {
    try {
      const { filmReviewIds, affiliateLinkIds } = req.body;

      if (
        !Array.isArray(filmReviewIds) ||
        filmReviewIds.length === 0 ||
        !Array.isArray(affiliateLinkIds) ||
        affiliateLinkIds.length === 0
      ) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Cần chọn ít nhất 1 film review và 1 affiliate link",
        });
      }

      // Verify affiliate links exist
      const affiliateLinks = await prisma.affiliateLink.findMany({
        where: { id: { in: affiliateLinkIds } },
      });

      if (affiliateLinks.length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Không tìm thấy affiliate link hợp lệ",
        });
      }

      // Round-robin assignment
      const updates = filmReviewIds.map((reviewId, index) => {
        const affiliateId = affiliateLinks[index % affiliateLinks.length].id;
        return prisma.filmReview.update({
          where: { id: reviewId },
          data: { affiliateId },
        });
      });

      await Promise.all(updates);

      res.json({
        message: `Đã gán affiliate link cho ${filmReviewIds.length} film review thành công`,
        updated: filmReviewIds.length,
      });
    } catch (error) {
      console.error("Admin bulk assign affiliate error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi gán affiliate link hàng loạt",
      });
    }
  }

  // ==================== ADMIN FILM CATEGORIES ====================

  // GET /api/admin/film-categories
  async adminGetFilmCategories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { search } = req.query;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ];
      }

      const [categories, total] = await Promise.all([
        prisma.filmCategory.findMany({
          where,
          include: {
            _count: { select: { filmReviews: true } },
          },
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
        prisma.filmCategory.count({ where }),
      ]);

      res.json({
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Admin get film categories error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách thể loại phim",
      });
    }
  }

  // POST /api/admin/film-categories
  async adminCreateFilmCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Tên thể loại không được để trống",
        });
      }

      const slug = slugify(name, { lower: true, strict: true, locale: "vi" });

      const existing = await prisma.filmCategory.findFirst({
        where: { OR: [{ name: name.trim() }, { slug }] },
      });

      if (existing) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Thể loại phim đã tồn tại",
        });
      }

      const category = await prisma.filmCategory.create({
        data: { name: name.trim(), slug },
      });

      res.status(201).json({
        message: "Đã tạo thể loại phim thành công",
        data: category,
      });
    } catch (error) {
      console.error("Admin create film category error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi tạo thể loại phim",
      });
    }
  }

  // PATCH /api/admin/film-categories/:id
  async adminUpdateFilmCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Tên thể loại không được để trống",
        });
      }

      const existing = await prisma.filmCategory.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy thể loại phim",
        });
      }

      const slug = slugify(name, { lower: true, strict: true, locale: "vi" });

      // Check for duplicate name/slug
      const duplicate = await prisma.filmCategory.findFirst({
        where: {
          OR: [{ name: name.trim() }, { slug }],
          id: { not: id },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Thể loại phim đã tồn tại",
        });
      }

      const category = await prisma.filmCategory.update({
        where: { id },
        data: { name: name.trim(), slug },
      });

      res.json({
        message: "Đã cập nhật thể loại phim thành công",
        data: category,
      });
    } catch (error) {
      console.error("Admin update film category error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi cập nhật thể loại phim",
      });
    }
  }

  // DELETE /api/admin/film-categories/:id
  async adminDeleteFilmCategory(req, res) {
    try {
      const { id } = req.params;

      const existing = await prisma.filmCategory.findUnique({
        where: { id },
        include: { _count: { select: { filmReviews: true } } },
      });

      if (!existing) {
        return res.status(404).json({
          error: "Not Found",
          message: "Không tìm thấy thể loại phim",
        });
      }

      if (existing._count.filmReviews > 0) {
        return res.status(400).json({
          error: "Validation Error",
          message: `Không thể xóa thể loại đang được sử dụng bởi ${existing._count.filmReviews} review phim`,
        });
      }

      await prisma.filmCategory.delete({ where: { id } });

      res.json({ message: "Đã xóa thể loại phim thành công" });
    } catch (error) {
      console.error("Admin delete film category error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa thể loại phim",
      });
    }
  }

  // ==================== ADMIN FILM COMMENTS ====================

  // GET /api/admin/film-comments
  async adminGetFilmComments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { approved } = req.query;

      const where = {};
      if (approved === "true") where.isApproved = true;
      else if (approved === "false") where.isApproved = false;

      const [comments, total] = await Promise.all([
        prisma.filmComment.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            filmReview: { select: { id: true, title: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.filmComment.count({ where }),
      ]);

      res.json({
        data: comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Admin get film comments error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách bình luận phim",
      });
    }
  }

  // PATCH /api/admin/film-comments/:id/approve
  async adminApproveFilmComment(req, res) {
    try {
      const { id } = req.params;

      const comment = await prisma.filmComment.update({
        where: { id },
        data: { isApproved: true },
      });

      res.json({ message: "Đã phê duyệt bình luận", data: comment });
    } catch (error) {
      console.error("Admin approve film comment error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi phê duyệt bình luận",
      });
    }
  }

  // DELETE /api/admin/film-comments/:id
  async adminDeleteFilmComment(req, res) {
    try {
      const { id } = req.params;

      await prisma.filmComment.delete({ where: { id } });

      res.json({ message: "Đã xóa bình luận" });
    } catch (error) {
      console.error("Admin delete film comment error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi xóa bình luận",
      });
    }
  }
}

module.exports = new FilmReviewsController();
