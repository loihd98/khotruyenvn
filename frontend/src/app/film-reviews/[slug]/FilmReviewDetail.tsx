"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { getMediaUrl } from "../../../utils/media";
import apiClient from "../../../utils/api";
import { FilmReview, FilmComment } from "../../../types";

interface FilmReviewDetailProps {
  initialData: FilmReview | null;
  slug: string;
}

const FilmReviewDetail: React.FC<FilmReviewDetailProps> = ({
  initialData,
  slug,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [filmReview, setFilmReview] = useState<FilmReview | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<FilmComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [commentPagination, setCommentPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (!initialData) {
      fetchFilmReview();
    }
    fetchComments();
  }, [slug]);

  const fetchFilmReview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/film-reviews/${slug}`);
      setFilmReview(response.data?.data || null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (page = 1) => {
    try {
      setCommentsLoading(true);
      const response = await apiClient.get(
        `/film-reviews/${slug}/comments?page=${page}&limit=10`
      );
      setComments(response.data?.data || []);
      setCommentPagination(
        response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        }
      );
      setCommentPage(page);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await apiClient.post(`/film-reviews/${slug}/comments`, {
        content: commentContent.trim(),
      });
      setCommentContent("");
      fetchComments(1);
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await apiClient.post(`/film-reviews/${slug}/comments`, {
        content: replyContent.trim(),
        parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      fetchComments(commentPage);
    } catch (err) {
      console.error("Error submitting reply:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = Math.round(rating / 2);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-6 h-6 ${
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
        <span className="text-xl font-bold text-gray-800 dark:text-white ml-2">
          {rating.toFixed(1)}/10
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-64 md:h-96 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6" />
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !filmReview) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Không tìm thấy review phim
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error || "Bài review phim không tồn tại hoặc đã bị xóa."}
        </p>
        <Link
          href="/film-reviews"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/film-reviews"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6 text-sm"
        >
          ← Quay lại danh sách review phim
        </Link>

        {/* 1. Thumbnail - clickable to open YouTube/review link */}
        <div
          className="relative w-full h-64 md:h-[450px] rounded-xl overflow-hidden mb-6 bg-gray-200 dark:bg-gray-700 cursor-pointer group"
          onClick={() => {
            if (filmReview.reviewLink) {
              window.open(filmReview.reviewLink, "_blank", "noopener,noreferrer");
            }
          }}
          title="Nhấn để xem video trên YouTube"
        >
          {filmReview.thumbnailUrl ? (
            <Image
              src={getMediaUrl(filmReview.thumbnailUrl)}
              alt={filmReview.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-8xl">
              🎬
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {filmReview.title}
        </h1>

        {/* 3. Rating */}
        <div className="mb-6">{renderStars(filmReview.rating)}</div>

        {/* 4. Actors */}
        {filmReview.actors && filmReview.actors.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              🎭 Diễn viên
            </h2>
            <div className="flex flex-wrap gap-3">
              {filmReview.actors.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  {actor.avatar ? (
                    <Image
                      src={getMediaUrl(actor.avatar)}
                      alt={actor.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {actor.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Description */}
        {filmReview.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              📝 Mô tả
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {filmReview.description}
            </div>
          </div>
        )}

        {/* 6. Tags */}
        {filmReview.tags && filmReview.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              🏷️ Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {filmReview.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/film-reviews?tag=${tag}`}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 7. Categories */}
        {filmReview.categories && filmReview.categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              📂 Thể loại
            </h2>
            <div className="flex flex-wrap gap-2">
              {filmReview.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/film-reviews?category=${cat.slug}`}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 8. Comments Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            💬 Bình luận ({commentPagination.total})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={submitComment} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentContent.trim() || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Đang gửi..." : "Gửi bình luận"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Bạn cần đăng nhập để bình luận
              </p>
              <Link
                href="/auth/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.user?.avatar ? (
                      <Image
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {comment.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {comment.content}
                      </p>
                    </div>

                    {/* Reply button */}
                    {isAuthenticated && (
                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 ml-2"
                      >
                        Trả lời
                      </button>
                    )}

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-2 ml-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Viết trả lời..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => submitReply(comment.id)}
                            disabled={!replyContent.trim() || submitting}
                            className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Gửi
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            className="px-4 py-1 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <div className="flex-shrink-0">
                              {reply.user?.avatar ? (
                                <Image
                                  src={reply.user.avatar}
                                  alt={reply.user.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                  {reply.user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                  {reply.user?.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    reply.createdAt
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Comments pagination */}
              {commentPagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  {Array.from(
                    { length: commentPagination.pages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchComments(page)}
                      className={`w-8 h-8 rounded-full text-sm ${
                        commentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 9. Review Link */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            🔗 Link Review Phim
          </h2>
          <a
            href={filmReview.reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Xem Review Đầy Đủ
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* 10. Related film reviews */}
        {filmReview.relatedReviews && filmReview.relatedReviews.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              🎬 Phim cùng thể loại
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filmReview.relatedReviews.map((related) => (
                <Link
                  key={related.id}
                  href={`/film-reviews/${related.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
                    {related.thumbnailUrl ? (
                      <Image
                        src={getMediaUrl(related.thumbnailUrl)}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="200px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-3xl">
                        🎬
                      </div>
                    )}
                    <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 px-1.5 py-0.5 rounded text-xs font-bold">
                      ⭐ {related.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <span>
            📅 Đăng ngày:{" "}
            {new Date(filmReview.createdAt).toLocaleDateString("vi-VN")}
          </span>
          <span>👁 Lượt xem: {filmReview.viewCount}</span>
          {filmReview.author && <span>✍️ Bởi: {filmReview.author.name}</span>}
        </div>
      </div>
    </div>
  );
};

export default FilmReviewDetail;
