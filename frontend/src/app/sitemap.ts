import { MetadataRoute } from "next";

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost/api";

async function fetchAllStorySlugs(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/stories?limit=1000&status=PUBLISHED`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((s: any) => ({
      slug: s.slug,
      updatedAt: s.updatedAt,
    }));
  } catch {
    return [];
  }
}

async function fetchAllFilmReviewSlugs(): Promise<
  Array<{ slug: string; updatedAt: string }>
> {
  try {
    const res = await fetch(`${API_BASE_URL}/film-reviews?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((r: any) => ({
      slug: r.slug,
      updatedAt: r.updatedAt,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://vivutruyenhay.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/film-reviews`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic story pages
  const stories = await fetchAllStorySlugs();
  const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${baseUrl}/stories/${story.slug}`,
    lastModified: new Date(story.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic film review pages
  const filmReviews = await fetchAllFilmReviewSlugs();
  const filmReviewPages: MetadataRoute.Sitemap = filmReviews.map((review) => ({
    url: `${baseUrl}/film-reviews/${review.slug}`,
    lastModified: new Date(review.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...storyPages, ...filmReviewPages];
}
