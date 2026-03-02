-- AlterTable: Add affiliate link to film_reviews (safe additive migration)
ALTER TABLE "film_reviews" ADD COLUMN "affiliateId" TEXT;

-- AddForeignKey
ALTER TABLE "film_reviews" ADD CONSTRAINT "film_reviews_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliate_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;
