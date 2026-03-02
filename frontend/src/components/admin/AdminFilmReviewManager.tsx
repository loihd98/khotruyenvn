"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/utils/api";
import AdminFilmReviewForm from "./AdminFilmReviewForm";

interface AffiliateLink {
  id: string;
  provider: string;
  label?: string;
  targetUrl: string;
  isActive: boolean;
}

interface FilmCategory {
  id: string;
  name: string;
  slug: string;
}

interface FilmReview {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  rating: number;
  reviewLink: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  categories?: FilmCategory[];
  actors?: Array<{ id: string; name: string; slug: string; avatar?: string }>;
  _count?: {
    comments: number;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminFilmReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<FilmReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<FilmReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<FilmReview | null>(null);

  // Selection states for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkAffiliate, setShowBulkAffiliate] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState<Set<string>>(new Set());
  const [bulkAssigning, setBulkAssigning] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await apiClient.get(`/admin/film-reviews?${params}`);
      const { data: filmReviews, pagination: paginationData } = response.data;

      setReviews(filmReviews || []);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching film reviews:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách review phim");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchReviews();
  };

  // Fetch affiliate links for bulk assignment
  const fetchAffiliateLinks = async () => {
    try {
      const response = await apiClient.get("/admin/affiliate-links?limit=100&isActive=true");
      if (response.data.success) {
        setAffiliateLinks(response.data.data.affiliateLinks || []);
      }
    } catch (error) {
      console.error("Error fetching affiliate links:", error);
    }
  };

  useEffect(() => {
    fetchAffiliateLinks();
  }, []);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAffiliateSelection = (id: string) => {
    const newSet = new Set(selectedAffiliateIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAffiliateIds(newSet);
  };

  const handleBulkAssignAffiliate = async () => {
    if (selectedIds.size === 0 || selectedAffiliateIds.size === 0) {
      toast.error("Cần chọn ít nhất 1 film review và 1 affiliate link");
      return;
    }

    try {
      setBulkAssigning(true);
      await apiClient.patch("/admin/film-reviews/bulk-affiliate", {
        filmReviewIds: Array.from(selectedIds),
        affiliateLinkIds: Array.from(selectedAffiliateIds),
      });
      toast.success(`Đã gán affiliate link cho ${selectedIds.size} film review`);
      setSelectedIds(new Set());
      setSelectedAffiliateIds(new Set());
      setShowBulkAffiliate(false);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setBulkAssigning(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateNew = () => {
    setEditingReview(null);
    setShowForm(true);
  };

  const handleEdit = (review: FilmReview) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  const handleDeleteClick = (review: FilmReview) => {
    setDeletingReview(review);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;

    try {
      await apiClient.delete(`/admin/film-reviews/${deletingReview.id}`);
      toast.success("Xóa review phim thành công!");
      setDeletingReview(null);
      fetchReviews();
    } catch (error: any) {
      console.error("Error deleting film review:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi xóa review phim";
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (review: FilmReview) => {
    try {
      const newStatus =
        review.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await apiClient.patch(`/admin/film-reviews/${review.id}`, {
        status: newStatus,
      });
      toast.success(
        newStatus === "PUBLISHED"
          ? "Đã xuất bản review!"
          : "Đã chuyển về nháp!"
      );
      fetchReviews();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái");
    }
  };

  const handleDeleteCancel = () => {
    setDeletingReview(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Đã xuất bản
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Nháp
          </span>
        );
      default:
        return null;
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
                ? "text-yellow-400 fill-current"
                : "text-gray-300 dark:text-gray-600"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
          {rating}/10
        </span>
      </div>
    );
  };

  if (showForm) {
    return (
      <AdminFilmReviewForm
        review={editingReview || undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Review Phim
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tạo và quản lý các bài review phim
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tạo review mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm review phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Nháp</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Đã chọn {selectedIds.size} film review
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkAffiliate(!showBulkAffiliate)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🔗 Gán Affiliate Link
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Bulk Affiliate Assignment Panel */}
      {showBulkAffiliate && selectedIds.size > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔗 Chọn Affiliate Links (Round-Robin)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Các affiliate links được chọn sẽ được gán luân phiên cho {selectedIds.size} film review đã chọn.
            Ví dụ: 3 links cho 6 films → film1→link1, film2→link2, film3→link3, film4→link1, ...
          </p>
          {affiliateLinks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Chưa có affiliate link nào</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {affiliateLinks.map((link) => (
                <label
                  key={link.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAffiliateIds.has(link.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAffiliateIds.has(link.id)}
                    onChange={() => toggleAffiliateSelection(link.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {link.label || link.provider}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {link.targetUrl}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    {link.provider}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBulkAssignAffiliate}
              disabled={selectedAffiliateIds.size === 0 || bulkAssigning}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {bulkAssigning ? "Đang xử lý..." : `Gán cho ${selectedIds.size} films`}
            </button>
            <button
              onClick={() => {
                setShowBulkAffiliate(false);
                setSelectedAffiliateIds(new Set());
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            {selectedAffiliateIds.size > 0 && (
              <span className="text-sm text-green-600 dark:text-green-400">
                {selectedAffiliateIds.size} link(s) selected
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Danh sách review phim ({pagination.total})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white dark:bg-gray-800 transition ease-in-out duration-150">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang tải...
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không có review phim nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter
                ? "Không tìm thấy review phù hợp"
                : "Bắt đầu bằng cách tạo review phim đầu tiên"}
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo review mới
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={reviews.length > 0 && selectedIds.size === reviews.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lượt xem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reviews.map((review, index) => (
                    <tr
                      key={review.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedIds.has(review.id)
                          ? "bg-blue-50 dark:bg-blue-900/10"
                          : ""
                      }`}
                    >
                      {/* Per-row checkbox */}
                      <td className="px-3 py-4 text-center w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(review.id)}
                          onChange={() => toggleSelectRow(review.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      {/* Row number */}
                      <td className="px-3 py-4 text-center w-10 text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {review.thumbnailUrl ? (
                            <img
                              src={review.thumbnailUrl}
                              alt={review.title}
                              className="w-12 h-16 object-cover rounded mr-3 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 dark:bg-gray-600 rounded mr-3 flex-shrink-0 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[250px]">
                              {review.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {review.categories
                                ?.map((c) => c.name)
                                .join(", ") || "Chưa phân loại"}
                            </div>
                            {review._count && (
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {review._count.comments} bình luận
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(review)}
                          title="Click để đổi trạng thái"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {getStatusBadge(review.status)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {review.viewCount.toLocaleString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View on site */}
                          <a
                            href={`/film-reviews/${review.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded transition-colors"
                            title="Xem trên trang"
                          >
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(review)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(review)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded transition-colors"
                            title="Xóa"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Hiển thị{" "}
                    {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    trong tổng số {pagination.total} review
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.page - 1)
                      }
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Trang {pagination.page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.page + 1)
                      }
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Xác nhận xóa review phim
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn có chắc chắn muốn xóa review &quot;{deletingReview.title}
              &quot;?
              {deletingReview._count &&
                deletingReview._count.comments > 0 && (
                  <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                    Review này có {deletingReview._count.comments} bình
                    luận sẽ bị xóa theo.
                  </span>
                )}
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFilmReviewManager;
