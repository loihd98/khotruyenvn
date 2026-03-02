import React from "react";
import { Metadata } from "next";
import GenresClient from "./GenresClient";

const API_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

export const metadata: Metadata = {
  title: "Thể Loại Truyện - vivutruyenhay.com",
  description:
    "Khám phá tất cả thể loại truyện tại vivutruyenhay.com. Tiên hiệp, kiếm hiệp, đô thị, ngôn tình, huyền huyễn và nhiều thể loại hấp dẫn khác.",
  keywords: [
    "thể loại truyện",
    "tiên hiệp",
    "kiếm hiệp",
    "đô thị",
    "ngôn tình",
    "huyền huyễn",
    "truyện audio",
    "đọc truyện online",
    "vivutruyenhay.com",
  ],
  openGraph: {
    title: "Thể Loại Truyện - vivutruyenhay.com",
    description:
      "Khám phá tất cả thể loại truyện tại vivutruyenhay.com. Tiên hiệp, kiếm hiệp, đô thị, ngôn tình, huyền huyễn và nhiều thể loại hấp dẫn khác.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/genres",
  },
};

async function fetchGenres() {
  try {
    const res = await fetch(`${API_URL}/stories/genres`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.genres || [];
  } catch {
    return [];
  }
}

export default async function GenresPage() {
  const genres = await fetchGenres();

  return <GenresClient initialGenres={genres} />;
}
