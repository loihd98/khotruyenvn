"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import StoryCard from "../stories/StoryCard";
import { getMediaUrl } from "../../utils/media";
import {
    isAffiliateCooldown,
    markAffiliateShown,
} from "../../utils/affiliateCooldown";
import { Story } from "../../types";

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
}

interface HomepageContentProps {
    audioStories: Story[];
    filmReviews: FilmReview[];
    textStories: Story[];
    trendingStories: Story[];
    trendingReviews: FilmReview[];
}

/* ─── small helpers ─────────────────────────────────── */
const CardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse">
        <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-600" />
        <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
    </div>
);

const SectionHeader = ({
    icon,
    title,
    subtitle,
    href,
}: {
    icon: string;
    title: string;
    subtitle: string;
    href: string;
}) => (
    <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{icon}</span>
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    {subtitle}
                </p>
            </div>
        </div>
        <Link
            href={href}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
        >
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    </div>
);

/* ─── main component ────────────────────────────────── */
const HomepageContent: React.FC<HomepageContentProps> = ({
    audioStories,
    filmReviews,
    textStories,
    trendingStories,
    trendingReviews,
}) => {
    const router = useRouter();
    const [popupReview, setPopupReview] = useState<FilmReview | null>(null);

    const handleReviewClick = (review: FilmReview) => {
        if (review.affiliate?.targetUrl && !isAffiliateCooldown(review.affiliate.targetUrl)) {
            setPopupReview(review);
        } else {
            router.push(`/film-reviews/${review.slug}`);
        }
    };

    const renderStars = (rating: number) => {
        const stars = Math.round(rating / 2);
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                        key={s}
                        className={`w-3 h-3 ${s <= stars ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5">{rating.toFixed(1)}</span>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* ── Main content (3/4) ── */}
                <div className="lg:col-span-3 space-y-12">

                    {/* Audio Stories */}
                    <section>
                        <SectionHeader
                            icon="🎧"
                            title="Truyện Audio Nổi Bật"
                            subtitle="Nghe truyện audio mới nhất"
                            href="/stories?type=AUDIO"
                        />
                        {audioStories.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {audioStories.slice(0, 8).map((story) => (
                                    <StoryCard key={story.id} story={story} variant="card" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        )}
                    </section>

                    {/* Film Reviews */}
                    <section>
                        <SectionHeader
                            icon="🎬"
                            title="Review Phim Hay"
                            subtitle="Đánh giá phim mới nhất từ cộng đồng"
                            href="/film-reviews"
                        />
                        {filmReviews.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filmReviews.slice(0, 8).map((review) => (
                                    <div
                                        key={review.id}
                                        onClick={() => handleReviewClick(review)}
                                        className="cursor-pointer group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="relative h-44 sm:h-52 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            {review.thumbnailUrl ? (
                                                <Image
                                                    src={getMediaUrl(review.thumbnailUrl)}
                                                    alt={review.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-4xl">🎬</div>
                                            )}
                                            {review.rating > 0 && (
                                                <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    ⭐ {review.rating.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {review.title}
                                            </h3>
                                            <div className="mb-1.5">{renderStars(review.rating)}</div>
                                            {review.categories && review.categories.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1.5">
                                                    {review.categories.slice(0, 2).map((cat) => (
                                                        <span key={cat.id} className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                                            {cat.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                                <span>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                                                <span>👁 {review.viewCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        )}
                    </section>

                    {/* Text Stories */}
                    <section>
                        <SectionHeader
                            icon="📖"
                            title="Truyện Văn Bản Mới Nhất"
                            subtitle="Đọc truyện văn bản mới nhất"
                            href="/stories?type=TEXT"
                        />
                        {textStories.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {textStories.slice(0, 8).map((story) => (
                                    <StoryCard key={story.id} story={story} variant="card" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Sidebar (1/4) ── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-20 space-y-6">

                        {/* Trending Stories */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                🔥 Truyện Nổi Bật
                            </h3>
                            {trendingStories.length > 0 ? (
                                <div className="space-y-4">
                                    {trendingStories.slice(0, 6).map((story, index) => (
                                        <Link
                                            key={story.id}
                                            href={`/stories/${story.slug}`}
                                            className="flex gap-3 group"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {story.thumbnailUrl && (
                                                    <img
                                                        src={getMediaUrl(story.thumbnailUrl)}
                                                        alt={story.title}
                                                        className="w-12 h-16 object-cover rounded mb-1.5"
                                                    />
                                                )}
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                                                    {story.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {(story as any).author?.name || ""}
                                                </p>
                                                <div className="flex items-center mt-0.5 text-xs text-gray-400">
                                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    {story.viewCount || 0}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có dữ liệu.</p>
                            )}
                        </div>

                        {/* Trending Film Reviews */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                🎬 Review Phim Nổi Bật
                            </h3>
                            {trendingReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {trendingReviews.slice(0, 6).map((review, index) => (
                                        <Link
                                            key={review.id}
                                            href={`/film-reviews/${review.slug}`}
                                            className="flex gap-3 group"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {review.thumbnailUrl && (
                                                    <img
                                                        src={getMediaUrl(review.thumbnailUrl)}
                                                        alt={review.title}
                                                        className="w-12 h-16 object-cover rounded mb-1.5"
                                                    />
                                                )}
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                                                    {review.title}
                                                </h4>
                                                <div className="mt-0.5">{renderStars(review.rating)}</div>
                                                <div className="flex items-center mt-0.5 text-xs text-gray-400">
                                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    {review.viewCount}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có dữ liệu.</p>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                                📋 Danh mục
                            </h3>
                            <div className="space-y-2">
                                <Link href="/genres" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    🏷️ Thể loại
                                </Link>
                                <Link href="/stories?sort=viewCount" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    👀 Xem nhiều nhất
                                </Link>
                                <Link href="/stories?sort=createdAt" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    ❤️ Mới nhất
                                </Link>
                                <Link href="/film-reviews" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    🎬 Review phim
                                </Link>
                                <Link href="/stories?status=COMPLETED" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    ✅ Truyện hoàn thành
                                </Link>
                                <Link href="/stories?status=ONGOING" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    🔄 Đang cập nhật
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Affiliate Popup */}
            {popupReview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {popupReview.thumbnailUrl && (
                            <div className="relative h-48 w-full">
                                <Image src={getMediaUrl(popupReview.thumbnailUrl)} alt={popupReview.title} fill className="object-cover" sizes="448px" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                        )}
                        <div className="p-6 text-center">
                            <div className="text-4xl mb-3">🎬</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cảm ơn bạn đã quan tâm!</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">Bạn đang xem review phim:</p>
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">{popupReview.title}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Nhấn nút bên dưới để xem phim. Cảm ơn bạn đã ủng hộ chúng tôi! ❤️</p>
                            <button
                                onClick={() => {
                                    if (popupReview.affiliate?.targetUrl) {
                                        markAffiliateShown(popupReview.affiliate.targetUrl);
                                        window.open(popupReview.affiliate.targetUrl, "_blank", "noopener,noreferrer");
                                    }
                                    const slug = popupReview.slug;
                                    setPopupReview(null);
                                    router.push(`/film-reviews/${slug}`);
                                }}
                                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                ▶ Xem Phim Ngay
                            </button>
                            <button
                                onClick={() => { const slug = popupReview.slug; setPopupReview(null); router.push(`/film-reviews/${slug}`); }}
                                className="mt-3 w-full py-2 px-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
                            >
                                Xem Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageContent;
