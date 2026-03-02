// app/layout.tsx (RootLayout - server component)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import ClientProvider from "./providers";
import ThemeProvider from "@/components/layout/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vivutruyenhay.com";
const siteName = "vivutruyenhay.com";
const siteDescription =
  "Nền tảng đọc truyện online, nghe truyện audio và review phim miễn phí hàng đầu Việt Nam. Cập nhật liên tục các thể loại: tiên hiệp, kiếm hiệp, ngôn tình, huyền huyễn, đô thị, phim hành động, phim tình cảm...";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "vivutruyenhay.com - Đọc truyện online & Review phim miễn phí",
    template: "%s | vivutruyenhay.com",
  },
  description: siteDescription,
  keywords: [
    "đọc truyện online",
    "truyện chữ",
    "truyện audio",
    "truyện hay",
    "kho truyện",
    "truyện miễn phí",
    "tiên hiệp",
    "kiếm hiệp",
    "ngôn tình",
    "huyền huyễn",
    "truyện full",
    "đọc truyện miễn phí",
    "review phim",
    "đánh giá phim",
    "phim hay",
    "xem phim",
    "phim mới nhất",
    "review phim hay",
  ],
  authors: [{ name: "Evanloi9x", url: siteUrl }],
  creator: "Evanloi9x",
  publisher: "Evanloi9x",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: siteName,
    title: "vivutruyenhay.com - Đọc truyện online miễn phí",
    description: siteDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "vivutruyenhay.com - Kho truyện online",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "vivutruyenhay.com - Đọc truyện online miễn phí",
    description: siteDescription,
    images: ["/og-image.svg"],
    creator: "@Evanloi9x",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
    other: [
      {
        rel: "mask-icon",
        url: "/logo.svg",
        color: "#1e40af",
      },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Thêm các mã xác thực của bạn ở đây khi có
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: "entertainment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="vivutruyenhay.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="vivutruyenhay.com" />
        <link rel="author" href={`${siteUrl}/humans.txt`} />
        {/* Inline script runs before React hydration to prevent flash of light theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var persisted = localStorage.getItem('persist:ui');
                  var theme = 'dark';
                  if (persisted) {
                    var parsed = JSON.parse(persisted);
                    if (parsed.theme) {
                      theme = JSON.parse(parsed.theme);
                    }
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
