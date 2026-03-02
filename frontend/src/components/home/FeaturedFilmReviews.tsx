"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "../../utils/media";
import apiClient from "../../utils/api";
import {
  isAffiliateCooldown,
  markAffiliateShown,
} from "../../utils/affiliateCooldown";

interface FilmReview {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  rating: number;
  viewCount: number;
  createdAt: string;
  categories?: Array<{ id: string; name: string; slug: string }>;
  affiliate?: { id: string; targetUrl: string; label?: string };
  _count?: { comments: number };
}

interface FeaturedFilmReviewsProps {
  initialReviews?: FilmReview[];
}

const FeaturedFilmReviews: React.FC<FeaturedFilmReviewsProps> = ({ initialReviews }) => {
  const router = useRouter();
  const [reviews, setReviews] = useState<FilmReview[]>(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews || initialReviews.length === 0);
  const [popupReview, setPopupReview] = useState<FilmReview | null>(null);

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) return;
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get("/film-reviews", {
        params: { limit: 8, sort: "createdAt" },
      });
      setReviews(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching film reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (review: FilmReview) => {
    if (
      review.affiliate?.targetUrl &&
      !isAffiliateCooldown(review.affiliate.targetUrl)
    ) {
      setPopupReview(review);
    } else {
      router.push(`/film-reviews/${review.slug}`);
    }
  };

  const renderStars = (rating: number) => {
    const stars = Math.round(rating / 2);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= stars
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden animate-pulse"
              >
                <div className="h-44 sm:h-56 bg-gray-300 dark:bg-gray-700" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🎬</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Review Phim Hay
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Đánh giá phim mới nhất từ cộng đồng
              </p>
            </div>
          </div>
          <Link
            href="/film-reviews"
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base transition-colors"
          >
            Xem tất cả
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Film Reviews Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.slice(0, 8).map((review) => (
            <div
              key={review.id}
              onClick={() => handleCardClick(review)}
              className="cursor-pointer group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative h-44 sm:h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {review.thumbnailUrl ? (
                  <Image
                    src={getMediaUrl(review.thumbnailUrl)}
                    alt={review.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl sm:text-5xl">
                    🎬
                  </div>
                )}
                {/* Rating badge */}
                {review.rating > 0 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-0.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1">
                    ⭐ {review.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {review.title}
                </h3>

                {/* Stars */}
                <div className="mb-1.5">{renderStars(review.rating)}</div>

                {/* Categories */}
                {review.categories && review.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {review.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat.id}
                        className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    👁 {review.viewCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliate Popup */}
      {popupReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {popupReview.thumbnailUrl && (
              <div className="relative h-48 w-full">
                <Image
                  src={getMediaUrl(popupReview.thumbnailUrl)}
                  alt={popupReview.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 448px) 100vw, 448px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🎬</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cảm ơn bạn đã quan tâm!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">
                Bạn đang xem review phim:
              </p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                {popupReview.title}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Nhấn nút bên dưới để xem phim. Cảm ơn bạn đã ủng hộ chúng tôi!
                ❤️
              </p>
              <button
                onClick={() => {
                  if (popupReview.affiliate?.targetUrl) {
                    markAffiliateShown(popupReview.affiliate.targetUrl);
                    window.open(
                      popupReview.affiliate.targetUrl,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                  const slug = popupReview.slug;
                  setPopupReview(null);
                  router.push(`/film-reviews/${slug}`);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Xem Phim Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedFilmReviews;
