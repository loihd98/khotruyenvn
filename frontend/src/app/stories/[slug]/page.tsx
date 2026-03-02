import { Metadata } from "next";
import StoryDetailClient from "./StoryDetailClient";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

async function fetchStory(slug: string) {
  try {
    const res = await fetch(`${API_URL}/stories/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.story || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const story = await fetchStory(params.slug);

  if (!story) {
    return {
      title: "Truyện không tồn tại - vivutruyenhay.com",
      description: "Truyện bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
    };
  }

  const isAudio = story.type === "AUDIO";
  const typeLabel = isAudio ? "Truyện Audio" : "Truyện Chữ";
  const title = `${story.title} - ${typeLabel} | vivutruyenhay.com`;
  const description =
    story.description?.substring(0, 160) ||
    `Đọc ${story.title} - ${typeLabel} miễn phí tại vivutruyenhay.com. ${story.chapters?.length || 0} chương.`;

  const genres = story.genres?.map((g: any) => g.name).join(", ") || "";

  return {
    title,
    description,
    keywords: [
      story.title,
      typeLabel,
      ...( story.genres?.map((g: any) => g.name) || []),
      "đọc truyện online",
      "nghe truyện audio",
      "truyện hay",
      "vivutruyenhay.com",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      locale: "vi_VN",
      siteName: "vivutruyenhay.com",
      ...(story.thumbnailUrl && {
        images: [
          {
            url: story.thumbnailUrl.startsWith("http")
              ? story.thumbnailUrl
              : `${process.env.NEXT_PUBLIC_SITE_URL || "https://vivutruyenhay.com"}${story.thumbnailUrl}`,
            width: 1200,
            height: 630,
            alt: story.title,
          },
        ],
      }),
    },
    alternates: {
      canonical: `/stories/${params.slug}`,
    },
    other: {
      "article:author": story.author?.name || "vivutruyenhay.com",
      ...(genres && { "article:tag": genres }),
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const story = await fetchStory(params.slug);

  return (
    <StoryDetailClient
      params={params}
      initialStory={story}
    />
  );
}
