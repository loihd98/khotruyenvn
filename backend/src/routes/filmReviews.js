const express = require("express");
const filmReviewsController = require("../controllers/filmReviewsController");
const { optionalAuth, requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", optionalAuth, filmReviewsController.getFilmReviews);
router.get("/categories", filmReviewsController.getFilmCategories);
router.get("/tags", filmReviewsController.getFilmTags);

// Film review detail (must be after /categories and /tags)
router.get("/:slug", optionalAuth, filmReviewsController.getFilmReviewBySlug);

// Comments
router.get("/:slug/comments", filmReviewsController.getFilmComments);
router.post(
  "/:slug/comments",
  requireAuth,
  filmReviewsController.createFilmComment,
);

module.exports = router;
