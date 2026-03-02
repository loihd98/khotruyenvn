import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";
import FilmReviewsClient from "./FilmReviewsClient";
import JsonLd, {
  getFilmReviewsListSchema,
  getBreadcrumbSchema,
} from "../../components/seo/JsonLd";

const API_BASE_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "/api";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivutruyenhay.com";

// SSR: Fetch categories and tags on server
async function getFilmCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/film-reviews/categories`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("SSR getFilmCategories error:", e);
    return [];
  }
}

async function getFilmTags() {
  try {
    const res = await fetch(`${API_BASE_URL}/film-reviews/tags`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    console.error("SSR getFilmTags error:", e);
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const category = searchParams.category as string;
  const tag = searchParams.tag as string;
  const search = searchParams.search as string;

  let title = "Review Phim - vivutruyenhay.com";
  let description =
    "Xem các bài review phim hay nhất. Đánh giá phim, xếp hạng và nhận xét từ cộng đồng.";

  if (category) {
    title = `Review Phim - ${category} | vivutruyenhay.com`;
    description = `Review phim thể loại ${category}. Xem đánh giá, xếp hạng phim mới nhất.`;
  }

  if (tag) {
    title = `Review Phim - #${tag} | vivutruyenhay.com`;
    description = `Review phim với tag #${tag}. Xem đánh giá, xếp hạng phim.`;
  }

  if (search) {
    title = `Tìm kiếm: ${search} - Review Phim | vivutruyenhay.com`;
    description = `Kết quả tìm kiếm review phim cho "${search}".`;
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
      canonical: "/film-reviews",
    },
  };
}

export default async function FilmReviewsPage() {
  const [categories, tags] = await Promise.all([
    getFilmCategories(),
    getFilmTags(),
  ]);

  return (
    <>
      <JsonLd data={getFilmReviewsListSchema(siteUrl)} />
      <JsonLd
        data={getBreadcrumbSchema(
          [
            { name: "Trang chủ", url: "/" },
            { name: "Review Phim", url: "/film-reviews" },
          ],
          siteUrl
        )}
      />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 hidden sm:block">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🎬 Review Phim
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Khám phá các bài review phim hay nhất, xếp hạng và đánh giá từ cộng
              đồng
            </p>
          </div>

          <FilmReviewsClient categories={categories} tags={tags} />
      </div>
    </Layout>
    </>
  );
}
