"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StoryCard from "../stories/StoryCard";
import { storiesAPI } from "../../utils/api";
import { Story } from "../../types";

interface FeaturedStoriesProps {
  type: "AUDIO" | "TEXT";
  initialStories?: Story[];
}

const FeaturedStories: React.FC<FeaturedStoriesProps> = ({ type, initialStories }) => {
  const [stories, setStories] = useState<Story[]>(initialStories || []);
  const [isLoading, setIsLoading] = useState(!initialStories || initialStories.length === 0);

  useEffect(() => {
    if (initialStories && initialStories.length > 0) return;
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const response = await storiesAPI.getStories({
        type,
        limit: 8,
        sort: "createdAt",
      });
      setStories(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAudio = type === "AUDIO";
  const title = isAudio ? "Truyện Audio Nổi Bật" : "Truyện Văn Bản Mới Nhất";
  const icon = isAudio ? "🎧" : "📖";
  const href = isAudio ? "/stories?type=AUDIO" : "/stories?type=TEXT";
  const emptyIcon = isAudio ? "🎧" : "📚";
  const emptyMessage = isAudio ? "Chưa có truyện audio nào." : "Chưa có truyện văn bản nào.";

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-600" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">{icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {isAudio ? "Nghe truyện audio mới nhất" : "Đọc truyện văn bản mới nhất"}
              </p>
            </div>
          </div>
          <Link
            href={href}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base transition-colors"
          >
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        {stories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stories.slice(0, 8).map((story) => (
              <StoryCard key={story.id} story={story} variant="card" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">{emptyIcon}</div>
            <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedStories;
