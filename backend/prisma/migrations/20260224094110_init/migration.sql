/*
  Warnings:

  - The primary key for the `_FilmActorToFilmReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_FilmCategoryToFilmReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_FilmActorToFilmReview` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_FilmCategoryToFilmReview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_FilmActorToFilmReview" DROP CONSTRAINT "_FilmActorToFilmReview_AB_pkey";

-- AlterTable
ALTER TABLE "_FilmCategoryToFilmReview" DROP CONSTRAINT "_FilmCategoryToFilmReview_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_FilmActorToFilmReview_AB_unique" ON "_FilmActorToFilmReview"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_FilmCategoryToFilmReview_AB_unique" ON "_FilmCategoryToFilmReview"("A", "B");
