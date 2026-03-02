-- CreateEnum
CREATE TYPE "FilmReviewStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "film_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "film_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "film_actors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_actors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "film_reviews" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewLink" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "FilmReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "film_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "film_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "filmReviewId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "film_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable (many-to-many: film_reviews <-> film_categories)
CREATE TABLE "_FilmCategoryToFilmReview" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FilmCategoryToFilmReview_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable (many-to-many: film_reviews <-> film_actors)
CREATE TABLE "_FilmActorToFilmReview" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FilmActorToFilmReview_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "film_categories_name_key" ON "film_categories"("name");
CREATE UNIQUE INDEX "film_categories_slug_key" ON "film_categories"("slug");
CREATE UNIQUE INDEX "film_actors_slug_key" ON "film_actors"("slug");
CREATE UNIQUE INDEX "film_reviews_slug_key" ON "film_reviews"("slug");

CREATE INDEX "_FilmCategoryToFilmReview_B_index" ON "_FilmCategoryToFilmReview"("B");
CREATE INDEX "_FilmActorToFilmReview_B_index" ON "_FilmActorToFilmReview"("B");

-- AddForeignKey
ALTER TABLE "film_reviews" ADD CONSTRAINT "film_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "film_comments" ADD CONSTRAINT "film_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "film_comments" ADD CONSTRAINT "film_comments_filmReviewId_fkey" FOREIGN KEY ("filmReviewId") REFERENCES "film_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "film_comments" ADD CONSTRAINT "film_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "film_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_FilmCategoryToFilmReview" ADD CONSTRAINT "_FilmCategoryToFilmReview_A_fkey" FOREIGN KEY ("A") REFERENCES "film_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_FilmCategoryToFilmReview" ADD CONSTRAINT "_FilmCategoryToFilmReview_B_fkey" FOREIGN KEY ("B") REFERENCES "film_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_FilmActorToFilmReview" ADD CONSTRAINT "_FilmActorToFilmReview_A_fkey" FOREIGN KEY ("A") REFERENCES "film_actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_FilmActorToFilmReview" ADD CONSTRAINT "_FilmActorToFilmReview_B_fkey" FOREIGN KEY ("B") REFERENCES "film_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
