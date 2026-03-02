interface JsonLdProps {
  data: any;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Schema for Organization
export function getOrganizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "vivutruyenhay.com",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    description:
      "Kho truyện online miễn phí với hàng ngàn truyện chữ và truyện audio hấp dẫn",
    founder: {
      "@type": "Person",
      name: "Evanloi9x",
    },
    sameAs: [
      // Thêm các social media links của bạn
      // "https://facebook.com/yourpage",
      // "https://twitter.com/yourhandle",
      // "https://instagram.com/yourhandle",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Vietnamese"],
    },
  };
}

// Schema for Website
export function getWebsiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "vivutruyenhay.com",
    url: siteUrl,
    description:
      "Kho truyện online miễn phí - Đọc và nghe truyện mọi lúc mọi nơi",
    publisher: {
      "@type": "Organization",
      name: "vivutruyenhay.com",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/stories?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "vi-VN",
  };
}

// Schema for Book (Story)
export function getBookSchema(story: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: story.title,
    description: story.description,
    url: `${siteUrl}/stories/${story.slug}`,
    image: story.coverImage || `${siteUrl}/og-image.svg`,
    author: {
      "@type": "Person",
      name: story.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "vivutruyenhay.com",
    },
    datePublished: story.createdAt,
    dateModified: story.updatedAt,
    inLanguage: "vi-VN",
    genre: story.genres?.join(", ") || "Fiction",
    aggregateRating: story.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: story.rating.average,
          reviewCount: story.rating.count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

// Schema for Article (Chapter)
export function getArticleSchema(chapter: any, story: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: chapter.title,
    description: story.description,
    url: `${siteUrl}/stories/${story.slug}/${chapter.slug}`,
    image: story.coverImage || `${siteUrl}/og-image.svg`,
    author: {
      "@type": "Person",
      name: story.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "vivutruyenhay.com",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.svg`,
      },
    },
    datePublished: chapter.createdAt,
    dateModified: chapter.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/stories/${story.slug}/${chapter.slug}`,
    },
    isPartOf: {
      "@type": "Book",
      name: story.title,
      url: `${siteUrl}/stories/${story.slug}`,
    },
    inLanguage: "vi-VN",
  };
}

// Schema for AudioBook
export function getAudioBookSchema(story: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: story.title,
    description: story.description,
    url: `${siteUrl}/stories/${story.slug}`,
    thumbnail: story.coverImage || `${siteUrl}/og-image.svg`,
    contentUrl: story.audioUrl,
    encodingFormat: "audio/mpeg",
    author: {
      "@type": "Person",
      name: story.author || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "vivutruyenhay.com",
    },
    datePublished: story.createdAt,
    inLanguage: "vi-VN",
  };
}

// Schema for BreadcrumbList
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

// Schema for Film Review (Review + Movie)
export function getFilmReviewSchema(review: any, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: review.title,
    reviewBody: review.description,
    url: `${siteUrl}/film-reviews/${review.slug}`,
    datePublished: review.createdAt,
    dateModified: review.updatedAt,
    author: {
      "@type": "Person",
      name: review.author?.name || "vivutruyenhay.com",
    },
    publisher: {
      "@type": "Organization",
      name: "vivutruyenhay.com",
      url: siteUrl,
    },
    reviewRating: review.rating
      ? {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 10,
          worstRating: 0,
        }
      : undefined,
    itemReviewed: {
      "@type": "Movie",
      name: review.title,
      image: review.thumbnailUrl || `${siteUrl}/og-image.svg`,
      genre: review.categories?.map((c: any) => c.name) || [],
      actor: review.actors?.map((a: any) => ({
        "@type": "Person",
        name: a.name,
      })) || [],
    },
    inLanguage: "vi-VN",
  };
}

// Schema for Film Reviews List page
export function getFilmReviewsListSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Review Phim - vivutruyenhay.com",
    description:
      "Xem các bài review phim hay nhất. Đánh giá phim, xếp hạng và nhận xét từ cộng đồng.",
    url: `${siteUrl}/film-reviews`,
    publisher: {
      "@type": "Organization",
      name: "vivutruyenhay.com",
      url: siteUrl,
    },
    inLanguage: "vi-VN",
  };
}
