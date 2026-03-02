import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";
import StoriesClient from "./StoriesClient";
import StorySidebar from "../../components/layout/StorySidebar";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

// Generate metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const type = searchParams.type as string;
  const search = searchParams.search as string;
  const genre = searchParams.genre as string;

  let title = "Kho Truyện - vivutruyenhay.com";
  let description =
    "Khám phá hàng ngàn câu chuyện hay từ các tác giả tài năng. Đọc truyện chữ và nghe truyện audio miễn phí.";

  if (type === "TEXT") {
    title = "Truyện Chữ - Kho Truyện";
    description =
      "Đọc truyện chữ online miễn phí. Hàng ngàn câu chuyện hay từ các thể loại đa dạng.";
  } else if (type === "AUDIO") {
    title = "Truyện Audio - Kho Truyện";
    description =
      "Nghe truyện audio online miễn phí. Thư giãn với những câu chuyện được kể một cách sinh động.";
  }

  if (genre) {
    title = `Thể loại ${genre} - Kho Truyện`;
    description = `Khám phá những câu chuyện thuộc thể loại ${genre}. Đọc và nghe truyện miễn phí.`;
  }

  if (search) {
    title = `Tìm kiếm: ${search} - Kho Truyện`;
    description = `Kết quả tìm kiếm cho "${search}". Khám phá những câu chuyện phù hợp với từ khóa của bạn.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "vi_VN",
    },
    alternates: {
      canonical: "/stories",
    },
  };
}

// Loading component
const StoriesLoading = () => (
  <div className="space-y-8">
    {/* Filter skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>

    {/* Stories grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse"
        >
          <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Server-side data fetching
async function fetchInitialData(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const params = new URLSearchParams();
    params.set("page", (searchParams.page as string) || "1");
    params.set("limit", "10");
    if (searchParams.type) params.set("type", searchParams.type as string);
    if (searchParams.genre) params.set("genre", searchParams.genre as string);
    if (searchParams.search) params.set("search", searchParams.search as string);
    if (searchParams.sort) params.set("sort", searchParams.sort as string);

    const [storiesRes, genresRes] = await Promise.all([
      fetch(`${API_URL}/stories?${params}`, { next: { revalidate: 60 } }).catch(() => null),
      fetch(`${API_URL}/stories/genres`, { next: { revalidate: 300 } }).catch(() => null),
    ]);

    const storiesData = storiesRes?.ok ? await storiesRes.json() : null;
    const genresData = genresRes?.ok ? await genresRes.json() : null;

    return {
      stories: storiesData?.data?.data || storiesData?.data || [],
      pagination: storiesData?.data?.pagination || storiesData?.pagination || null,
      genres: genresData?.genres || [],
    };
  } catch {
    return { stories: [], pagination: null, genres: [] };
  }
}

// Client-side page component
export default async function StoriesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { stories, pagination, genres } = await fetchInitialData(searchParams);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with animation */}
        <div className="text-center mb-8 animate-fade-in hidden sm:block">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            Kho Truyện
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 animate-slide-up animation-delay-200">
            Khám phá hàng ngàn câu chuyện hay từ các tác giả tài năng
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <StoriesClient
              initialStories={stories}
              initialPagination={pagination}
              initialGenres={genres}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <StorySidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
}
