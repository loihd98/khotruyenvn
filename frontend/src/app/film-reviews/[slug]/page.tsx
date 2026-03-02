import React from "react";
import { Metadata } from "next";
import Layout from "../../../components/layout/Layout";
import FilmReviewDetail from "./FilmReviewDetail";
import JsonLd, {
  getFilmReviewSchema,
  getBreadcrumbSchema,
} from "../../../components/seo/JsonLd";

const API_BASE_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "/api";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivutruyenhay.com";

// SSR: Fetch film review on server for SEO
async function getFilmReview(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/film-reviews/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const filmReview = await getFilmReview(params.slug);

  if (!filmReview) {
    return {
      title: "Không tìm thấy review phim | vivutruyenhay.com",
      description: "Bài review phim không tồn tại hoặc đã bị xóa.",
    };
  }

  const title = `${filmReview.title} - Review Phim | vivutruyenhay.com`;
  const description = filmReview.description
    ? filmReview.description.substring(0, 160)
    : `Review phim ${filmReview.title}. Đánh giá: ${filmReview.rating}/10`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "vi_VN",
      images: filmReview.thumbnailUrl
        ? [{ url: filmReview.thumbnailUrl, width: 800, height: 450 }]
        : undefined,
    },
    alternates: {
      canonical: `/film-reviews/${params.slug}`,
    },
  };
}

export default async function FilmReviewPage({
  params,
}: {
  params: { slug: string };
}) {
  const filmReview = await getFilmReview(params.slug);

  return (
    <>
      {filmReview && (
        <>
          <JsonLd data={getFilmReviewSchema(filmReview, siteUrl)} />
          <JsonLd
            data={getBreadcrumbSchema(
              [
                { name: "Trang chủ", url: "/" },
                { name: "Review Phim", url: "/film-reviews" },
                {
                  name: filmReview.title,
                  url: `/film-reviews/${params.slug}`,
                },
              ],
              siteUrl
            )}
          />
        </>
      )}
      <Layout>
        <FilmReviewDetail initialData={filmReview} slug={params.slug} />
      </Layout>
    </>
  );
}
