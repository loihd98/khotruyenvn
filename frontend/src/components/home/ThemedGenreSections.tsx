"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { storiesAPI } from "../../utils/api";
import { Story } from "../../types";
import { getMediaUrl } from "../../utils/media";
import apiClient from "../../utils/api";

interface ThemedSection {
  title: string;
  emoji: string;
  type: "AUDIO" | "TEXT" | "FILM";
  genre?: string; // genre slug for stories
  category?: string; // category slug for film reviews
  linkAll: string;
}

const THEMED_SECTIONS: ThemedSection[] = [
  {
    title: "Audio Kiếm Hiệp",
    emoji: "⚔️",
    type: "AUDIO",
    genre: "kiem-hiep",
    linkAll: "/stories?type=AUDIO&genre=kiem-hiep",
  },
  {
    title: "Audio Tiên Hiệp",
    emoji: "🌟",
    type: "AUDIO",
    genre: "tien-hiep",
    linkAll: "/stories?type=AUDIO&genre=tien-hiep",
  },
  {
    title: "Audio Ngôn Tình",
    emoji: "💕",
    type: "AUDIO",
    genre: "ngon-tinh",
    linkAll: "/stories?type=AUDIO&genre=ngon-tinh",
  },
  {
    title: "Audio Đô Thị",
    emoji: "🏙️",
    type: "AUDIO",
    genre: "do-thi",
    linkAll: "/stories?type=AUDIO&genre=do-thi",
  },
];

interface FilmReview {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  rating: number;
  viewCount: number;
  createdAt: string;
}

interface ThemedGenreSectionsProps {
  initialSectionData?: Record<string, Story[]>;
}

const ThemedGenreSections: React.FC<ThemedGenreSectionsProps> = ({ initialSectionData }) => {
  const router = useRouter();
  const [sectionData, setSectionData] = useState<
    Record<string, Story[]>
  >(initialSectionData || {});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Skip fetching for sections that already have initial data
    THEMED_SECTIONS.forEach((section) => {
      const key = `${section.type}-${section.genre || section.category}`;
      if (initialSectionData && initialSectionData[key]?.length > 0) return;
      fetchSectionData(section);
    });
  }, []);

  const fetchSectionData = async (section: ThemedSection) => {
    const key = `${section.type}-${section.genre || section.category}`;
    try {
      setLoading((prev) => ({ ...prev, [key]: true }));

      if (section.type === "AUDIO" || section.type === "TEXT") {
        const params: Record<string, any> = {
          type: section.type,
          limit: 6,
          sort: "viewCount",
        };
        if (section.genre) params.genre = section.genre;

        const response = await storiesAPI.getStories(params);
        setSectionData((prev) => ({
          ...prev,
          [key]: response.data?.data || [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const renderStoryCard = (story: Story) => (
    <Link
      key={story.id}
      href={`/stories/${story.slug}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {story.thumbnailUrl ? (
          <Image
            src={getMediaUrl(story.thumbnailUrl)}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            {story.type === "AUDIO" ? "🎧" : "📚"}
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/60 text-white">
          {story.type === "AUDIO" ? "🎧 Audio" : "📖 Text"}
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {story.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
          <span className="flex items-center gap-0.5">
            👁 {story.viewCount?.toLocaleString("vi-VN") || 0}
          </span>
          {story.genres && story.genres.length > 0 && (
            <span className="truncate max-w-[80px]">
              {story.genres[0].name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  const renderSkeletons = (count: number) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden animate-pulse"
        >
          <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-700" />
          <div className="p-2.5 space-y-1.5">
            <div className="h-3.5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-2.5 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-10 py-4">
      {THEMED_SECTIONS.map((section: any) => {
        const key = `${section.type}-${section.genre || section.category}`;
        const stories = sectionData[key] || [];
        console.log(JSON.stringify(sectionData[key]));
        const isLoading = loading[key];

        // Don't render section if no data and not loading
        if (!isLoading && stories.length === 0) return null;

        return (
          <section key={key}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{section.emoji}</span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <Link
                href={section.linkAll}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
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

            {isLoading ? (
              renderSkeletons(6)
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* {stories?.map((story) => renderStoryCard(story))} */}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ThemedGenreSections;
