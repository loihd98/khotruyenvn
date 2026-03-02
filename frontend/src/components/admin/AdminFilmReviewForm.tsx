"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/utils/api";
import { getMediaUrl } from "@/utils/media";
import AffiliateLinkSelect from "./AffiliateLinkSelect";

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
  affiliateId?: string;
  categories?: FilmCategory[];
  actors?: Array<{ id: string; name: string; slug: string; avatar?: string }>;
}

interface AdminFilmReviewFormProps {
  review?: FilmReview;
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminFilmReviewForm: React.FC<AdminFilmReviewFormProps> = ({
  review,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    rating: 7,
    reviewLink: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [actorNames, setActorNames] = useState<string[]>([]);
  const [actorInput, setActorInput] = useState("");
  const [affiliateId, setAffiliateId] = useState<string | null>(null);

  const [availableCategories, setAvailableCategories] = useState<
    FilmCategory[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (review) {
      setFormData({
        title: review.title,
        description: review.description || "",
        thumbnailUrl: review.thumbnailUrl || "",
        rating: review.rating,
        reviewLink: review.reviewLink,
        status: review.status,
      });
      setTags(review.tags || []);
      setSelectedCategoryIds(
        review.categories?.map((c) => c.id) || []
      );
      setActorNames(review.actors?.map((a) => a.name) || []);
      setAffiliateId(review.affiliateId || null);
    }
  }, [review]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await apiClient.get(
        "/admin/film-categories?limit=100"
      );
      setAvailableCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Tiêu đề phải có ít nhất 3 ký tự";
    }

    if (!formData.reviewLink.trim()) {
      newErrors.reviewLink = "Link review là bắt buộc";
    } else {
      try {
        new URL(formData.reviewLink.trim());
      } catch {
        newErrors.reviewLink = "Link review không hợp lệ";
      }
    }

    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = "Đánh giá phải từ 0 đến 10";
    }

    if (
      formData.thumbnailUrl.trim() &&
      !formData.thumbnailUrl.trim().startsWith("http") &&
      !formData.thumbnailUrl.trim().startsWith("/")
    ) {
      newErrors.thumbnailUrl = "URL ảnh không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        rating: Number(formData.rating),
        reviewLink: formData.reviewLink.trim(),
        status: formData.status,
        tags,
        categoryIds: selectedCategoryIds,
        actorNames,
        affiliateId: affiliateId || null,
      };

      if (review) {
        await apiClient.put(
          `/admin/film-reviews/${review.id}`,
          payload
        );
        toast.success("Cập nhật review phim thành công!");
      } else {
        await apiClient.post("/admin/film-reviews", payload);
        toast.success("Tạo review phim thành công!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Film review form error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi lưu review phim";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ cho phép upload file ảnh (JPG, PNG, WEBP, GIF)");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File ảnh không được vượt quá 10MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await apiClient.post("/admin/media/upload/image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = response.data.file?.url || response.data.url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, thumbnailUrl: imageUrl }));
        toast.success("Upload ảnh thành công!");
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi upload ảnh");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Tag management
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // Actor management
  const handleAddActor = () => {
    const trimmed = actorInput.trim();
    if (trimmed && !actorNames.includes(trimmed)) {
      setActorNames((prev) => [...prev, trimmed]);
      setActorInput("");
    }
  };

  const handleActorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddActor();
    }
  };

  const handleRemoveActor = (actor: string) => {
    setActorNames((prev) => prev.filter((a) => a !== actor));
  };

  // Category management
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {review ? "Chỉnh sửa review phim" : "Tạo review phim mới"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề review phim..."
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Mô tả / Nội dung review
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập nội dung review phim..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Review Link */}
          <div>
            <label
              htmlFor="reviewLink"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Link Review (YouTube/Blog...) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="reviewLink"
              name="reviewLink"
              value={formData.reviewLink}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.reviewLink ? "border-red-500" : ""
              }`}
            />
            {errors.reviewLink && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.reviewLink}
              </p>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Ảnh thumbnail
            </label>
            {/* Upload button */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang upload...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload ảnh
                  </>
                )}
              </button>
              {formData.thumbnailUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))}
                  className="px-3 py-2 text-red-600 hover:text-red-700 text-sm border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Xóa ảnh
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            {/* URL input as fallback */}
            <input
              type="text"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              placeholder="Hoặc nhập URL ảnh trực tiếp..."
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm ${
                errors.thumbnailUrl ? "border-red-500" : ""
              }`}
            />
            {errors.thumbnailUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.thumbnailUrl}
              </p>
            )}
            {/* Image preview */}
            {formData.thumbnailUrl && (
              <div className="mt-3 relative inline-block">
                <img
                  src={getMediaUrl(formData.thumbnailUrl)}
                  alt="Preview"
                  className="w-32 h-44 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute bottom-1 left-1 right-1 bg-black/60 rounded text-white text-[10px] px-1.5 py-0.5 text-center truncate">
                  {formData.thumbnailUrl.split("/").pop()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating */}
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <span className="text-yellow-500">⭐</span> Đánh giá (0-10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                id="rating"
                name="rating"
                min="0"
                max="10"
                step="0.5"
                value={formData.rating}
                onChange={handleChange}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <span
                className={`text-lg font-bold min-w-[3rem] text-center ${
                  formData.rating >= 8
                    ? "text-green-500"
                    : formData.rating >= 5
                    ? "text-yellow-500"
                    : formData.rating > 0
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {formData.rating}
              </span>
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.rating}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="DRAFT">Nháp</option>
              <option value="PUBLISHED">Xuất bản</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Danh mục phim
          </label>
          {loadingCategories ? (
            <div className="text-sm text-gray-500">Đang tải danh mục...</div>
          ) : availableCategories.length === 0 ? (
            <div className="text-sm text-gray-500">
              Chưa có danh mục nào. Hãy tạo danh mục trước.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedCategoryIds.includes(cat.id)
                      ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300"
                      : "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {selectedCategoryIds.includes(cat.id) && (
                    <span className="mr-1">✓</span>
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Diễn viên
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={actorInput}
              onChange={(e) => setActorInput(e.target.value)}
              onKeyDown={handleActorKeyDown}
              placeholder="Nhập tên diễn viên và nhấn Enter..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="button"
              onClick={handleAddActor}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Thêm
            </button>
          </div>
          {actorNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actorNames.map((actor) => (
                <span
                  key={actor}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {actor}
                  <button
                    type="button"
                    onClick={() => handleRemoveActor(actor)}
                    className="hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Affiliate Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Affiliate Link
          </label>
          <AffiliateLinkSelect
            value={affiliateId || undefined}
            onChange={(id) => setAffiliateId(id)}
            placeholder="Chọn affiliate link cho phim..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Khi người dùng click vào card phim sẽ hiện popup dẫn đến link affiliate này
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Nhập tag và nhấn Enter..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Thêm
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            )}
            {review ? "Cập nhật review" : "Tạo review mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export { AdminFilmReviewForm };
export default AdminFilmReviewForm;
