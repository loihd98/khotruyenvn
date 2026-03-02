import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import HomepageContent from "../components/home/HomepageContent";
import JsonLd, {
  getOrganizationSchema,
  getWebsiteSchema,
} from "../components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://khotruyen.vn";

function getApiUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
}

async function fetchHomepageData() {
  try {
    const API_URL = getApiUrl();
    console.log("[Homepage] Fetching data from API_URL:", API_URL);
    const [
      filmReviewsRes,
      textStoriesRes,
      audioStoriesRes,
      trendingStoriesRes,
      trendingReviewsRes,
    ] = await Promise.all([
      fetch(`${API_URL}/film-reviews?limit=8&sort=createdAt`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_URL}/stories?type=TEXT&limit=8&sort=createdAt`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_URL}/stories?type=AUDIO&limit=8&sort=createdAt`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_URL}/stories?sort=viewCount&limit=6`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_URL}/film-reviews?sort=viewCount&limit=6`, { next: { revalidate: 300 } }).catch(() => null),
    ]);

    const filmReviews = filmReviewsRes?.ok ? (await filmReviewsRes.json())?.data || [] : [];
    const textStories = textStoriesRes?.ok ? (await textStoriesRes.json())?.data || [] : [];
    const audioStories = audioStoriesRes?.ok ? (await audioStoriesRes.json())?.data || [] : [];
    const trendingStories = trendingStoriesRes?.ok ? (await trendingStoriesRes.json())?.data || [] : [];
    const trendingReviews = trendingReviewsRes?.ok ? (await trendingReviewsRes.json())?.data || [] : [];

    return { filmReviews, textStories, audioStories, trendingStories, trendingReviews };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return { filmReviews: [], textStories: [], audioStories: [], trendingStories: [], trendingReviews: [] };
  }
}

export default async function HomePage() {
  const { filmReviews, textStories, audioStories, trendingStories, trendingReviews } = await fetchHomepageData();

  return (
    <>
      <JsonLd data={getOrganizationSchema(siteUrl)} />
      <JsonLd data={getWebsiteSchema(siteUrl)} />
      <Layout>
        <Hero />
        <HomepageContent
          audioStories={audioStories}
          filmReviews={filmReviews}
          textStories={textStories}
          trendingStories={trendingStories}
          trendingReviews={trendingReviews}
        />
      </Layout>
    </>
  );
}
