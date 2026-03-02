"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMediaUrl } from "../../utils/media";
import apiClient from "../../utils/api";
import { FilmCategory, FilmReview } from "../../types";
import {
  isAffiliateCooldown,
  markAffiliateShown,
} from "../../utils/affiliateCooldown";

interface FilmReviewsClientProps {
  categories: FilmCategory[];
  tags: string[];
}

const FilmReviewsClient: React.FC<FilmReviewsClientProps> = ({
  categories: ssrCategories,
  tags: ssrTags,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filmReviews, setFilmReviews] = useState<FilmReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FilmCategory[]>(ssrCategories);
  const [tags, setTags] = useState<string[]>(ssrTags);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Affiliate popup state
  const [popupReview, setPopupReview] = useState<FilmReview | null>(null);

  // Fetch categories/tags client-side if SSR failed
  useEffect(() => {
    if (ssrCategories.length === 0) {
      apiClient.get("/film-reviews/categories").then((res) => {
        setCategories(res.data?.data || []);
      }).catch(() => {});
    }
    if (ssrTags.length === 0) {
      apiClient.get("/film-reviews/tags").then((res) => {
        setTags(res.data?.data || []);
      }).catch(() => {});
    }
  }, [ssrCategories, ssrTags]);

  // Filters from URL
  const currentCategory = searchParams.get("category") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "createdAt";
  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchFilmReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: "12",
        sort: currentSort,
      };
      if (currentCategory) params.category = currentCategory;
      if (currentTag) params.tag = currentTag;
      if (currentSearch) params.search = currentSearch;

      const response = await apiClient.get("/film-reviews", { params });
      const responseData = response.data;

      setFilmReviews(responseData.data || []);
      setPagination(responseData.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
    } catch (error) {
      console.error("Error fetching film reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentTag, currentSearch, currentSort, currentPage]);

  useEffect(() => {
    fetchFilmReviews();
  }, [fetchFilmReviews]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Only reset page when changing filters, not when navigating pages
    if (key !== "page") {
      params.set("page", "1");
    }
    router.push(`/film-reviews?${params.toString()}`);
  };

  const renderStars = (rating: number) => {
    const stars = Math.round(rating / 2); // Convert 0-10 to 0-5
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= stars ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              defaultValue={currentSearch}
              placeholder="Tìm phim..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilters("search", (e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thể loại
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilters("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tag
            </label>
            <select
              value={currentTag}
              onChange={(e) => updateFilters("tag", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sắp xếp
            </label>
            <select
              value={currentSort}
              onChange={(e) => updateFilters("sort", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Mới nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="viewCount">Xem nhiều</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(currentCategory || currentTag || currentSearch) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                Tìm: &quot;{currentSearch}&quot;
                <button
                  onClick={() => updateFilters("search", "")}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            )}
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                Thể loại: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button
                  onClick={() => updateFilters("category", "")}
                  className="hover:text-green-900 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            )}
            {currentTag && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                #{currentTag}
                <button
                  onClick={() => updateFilters("tag", "")}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => router.push("/film-reviews")}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 underline"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Film Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse"
            >
              <div className="h-56 bg-gray-300 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filmReviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Chưa có review phim nào
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Hãy quay lại sau để xem các bài review phim mới nhất
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filmReviews.map((review) => (
              <div
                key={review.id}
                onClick={() => {
                  if (
                    review.affiliate?.targetUrl &&
                    !isAffiliateCooldown(review.affiliate.targetUrl)
                  ) {
                    setPopupReview(review);
                  } else {
                    router.push(`/film-reviews/${review.slug}`);
                  }
                }}
                className="cursor-pointer group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {review.thumbnailUrl ? (
                    <Image
                      src={getMediaUrl(review.thumbnailUrl)}
                      alt={review.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">
                      🎬
                    </div>
                  )}
                  {/* Rating badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    ⭐ {review.rating.toFixed(1)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {review.title}
                  </h3>

                  {/* Stars */}
                  <div className="mb-2">{renderStars(review.rating)}</div>

                  {/* Categories */}
                  {review.categories && review.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {review.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {review.tags && review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {review.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        👁 {review.viewCount}
                      </span>
                      {review._count && (
                        <span className="flex items-center gap-1">
                          💬 {review._count.comments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateFilters("page", (currentPage - 1).toString())
                  }
                  disabled={currentPage <= 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Trước
                </button>

                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        updateFilters("page", pageNum.toString())
                      }
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    updateFilters("page", (currentPage + 1).toString())
                  }
                  disabled={currentPage >= pagination.pages}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Affiliate Popup - No close button, only "Xem Phim" button */}
      {popupReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Thumbnail */}
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
              {/* Thank you message */}
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
                Nhấn nút bên dưới để xem phim. Cảm ơn bạn đã ủng hộ chúng tôi! ❤️
              </p>

              {/* Only button - opens affiliate link & closes popup */}
              <button
                onClick={() => {
                  // Open affiliate link in new tab
                  if (popupReview.affiliate?.targetUrl) {
                    markAffiliateShown(popupReview.affiliate.targetUrl);
                    window.open(popupReview.affiliate.targetUrl, "_blank", "noopener,noreferrer");
                  }
                  // Close popup and navigate to detail
                  const slug = popupReview.slug;
                  setPopupReview(null);
                  router.push(`/film-reviews/${slug}`);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xem Phim Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmReviewsClient;
