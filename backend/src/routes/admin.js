const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAdmin);

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getUsers);
router.patch("/users/:id", adminController.updateUser);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

// Story management
router.get("/stories", adminController.getStories);
router.get("/stories/:id", adminController.getStoryById);
router.post("/stories", adminController.createStory);
router.patch("/stories/:id", adminController.updateStory);
router.put("/stories/:id", adminController.updateStory);
router.delete("/stories/:id", adminController.deleteStory);

// Chapter management
router.get("/chapters", adminController.getChapters);
router.post("/stories/:storyId/chapters", adminController.createChapter);
router.patch("/chapters/:id", adminController.updateChapter);
router.put("/chapters/:id", adminController.updateChapter);
router.delete("/chapters/:id", adminController.deleteChapter);

// Comment moderation
router.get("/comments", adminController.getComments);
router.get("/comments/pending", adminController.getPendingComments);
router.patch("/comments/:id/approve", adminController.approveComment);
router.delete("/comments/:id", adminController.deleteComment);

// Genre management
router.get("/genres", adminController.getGenres);
router.post("/genres", adminController.createGenre);
router.patch("/genres/:id", adminController.updateGenre);
router.delete("/genres/:id", adminController.deleteGenre);

// Affiliate link management
router.get("/affiliate-links", adminController.getAffiliateLinks);
router.post("/affiliate-links", adminController.createAffiliateLink);
router.patch("/affiliate-links/:id", adminController.updateAffiliateLink);
router.delete("/affiliate-links/:id", adminController.deleteAffiliateLink);

// Media management - Mount media routes
const mediaRoutes = require("./media");
router.use("/media", mediaRoutes);

// Film Review management
const filmReviewsController = require("../controllers/filmReviewsController");
router.get("/film-reviews", filmReviewsController.adminGetFilmReviews);
router.patch(
  "/film-reviews/bulk-affiliate",
  filmReviewsController.adminBulkAssignAffiliate,
);
router.get("/film-reviews/:id", filmReviewsController.adminGetFilmReviewById);
router.post("/film-reviews", filmReviewsController.adminCreateFilmReview);
router.put("/film-reviews/:id", filmReviewsController.adminUpdateFilmReview);
router.patch("/film-reviews/:id", filmReviewsController.adminUpdateFilmReview);
router.delete("/film-reviews/:id", filmReviewsController.adminDeleteFilmReview);

// Film Category management
router.get("/film-categories", filmReviewsController.adminGetFilmCategories);
router.post("/film-categories", filmReviewsController.adminCreateFilmCategory);
router.patch(
  "/film-categories/:id",
  filmReviewsController.adminUpdateFilmCategory,
);
router.delete(
  "/film-categories/:id",
  filmReviewsController.adminDeleteFilmCategory,
);

// Film Comment management
router.get("/film-comments", filmReviewsController.adminGetFilmComments);
router.patch(
  "/film-comments/:id/approve",
  filmReviewsController.adminApproveFilmComment,
);
router.delete(
  "/film-comments/:id",
  filmReviewsController.adminDeleteFilmComment,
);

// Sample data and analytics
router.post("/sample-data", adminController.createSampleData);
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
