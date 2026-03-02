# Tổng Quan Kiến Trúc & Công Nghệ Dự Án vivutruyenhay.com

## 1. Tổng Quan Dự Án

**vivutruyenhay.com** là một nền tảng full-stack cho phép đọc truyện online, nghe truyện audio và review phim. Dự án được containerize hoàn toàn bằng Docker, triển khai trên VPS Ubuntu với Nginx reverse proxy và SSL.

---

## 2. Tech Stack Chi Tiết

| Layer              | Công nghệ               | Phiên bản | Vai trò                                        |
| ------------------ | ----------------------- | --------- | ---------------------------------------------- |
| **Frontend**       | Next.js (App Router)    | 14.x      | SSR/SSG, SEO, routing                          |
|                    | TypeScript              | -         | Type safety                                    |
|                    | Tailwind CSS            | -         | Utility-first styling                          |
|                    | Redux Toolkit           | 1.9.x     | Global state management                        |
|                    | redux-persist           | -         | Persist auth state qua reload                  |
|                    | Axios                   | 1.12.x    | HTTP client                                    |
|                    | Framer Motion           | 10.x      | Animation                                      |
| **Backend**        | Node.js + Express       | -         | REST API server                                |
|                    | Prisma ORM              | 5.6.x     | Database ORM, migrations                       |
|                    | bcryptjs                | -         | Password hashing                               |
|                    | jsonwebtoken (JWT)      | -         | Access token + Refresh token                   |
|                    | slugify                 | -         | URL-friendly slug generation                   |
|                    | multer                  | -         | File upload handling                           |
| **Database**       | PostgreSQL              | 15.x      | Relational database chính                      |
| **Infrastructure** | Docker + Docker Compose | -         | Containerization                               |
|                    | Nginx                   | alpine    | Reverse proxy, static serving, SSL termination |
|                    | Let's Encrypt           | -         | Free SSL certificate                           |
| **SEO**            | JSON-LD Structured Data | -         | Schema.org markup                              |
|                    | Dynamic Sitemap         | -         | Auto-generated từ DB                           |
|                    | Open Graph + Meta Tags  | -         | Social sharing optimization                    |

---

## 3. Kiến Trúc Tổng Thể (Architecture)

### 3.1 Request Flow

```
Browser/Client
    │
    ▼
┌─────────────────────────────────────────┐
│              Nginx (:80/:443)           │
│  ┌────────────────────────────────────┐ │
│  │  /api/*       → proxy backend:5000│ │
│  │  /uploads/*   → static files      │ │
│  │  /*           → proxy frontend:3000│ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
    │                           │
    ▼                           ▼
┌──────────┐            ┌──────────────┐
│ Backend  │            │   Frontend   │
│ :5000    │            │   :3000      │
│ Express  │            │   Next.js    │
│ REST API │            │   SSR + CSR  │
└────┬─────┘            └──────────────┘
     │
     ▼
┌──────────┐    ┌──────────────┐
│ PostgreSQL│    │ uploads/     │
│ :5432    │    │ (volume)     │
└──────────┘    └──────────────┘
```

### 3.2 Docker Services (Production)

```yaml
services:
  postgres: # Database
  backend: # Express API server
  frontend: # Next.js SSR server
  nginx: # Reverse proxy + SSL + static files
```

### 3.3 Docker Services (Development)

```yaml
services:
  postgres: # Database
  backend: # Express with nodemon (hot reload)
  frontend: # Next.js dev server (hot reload)
  nginx: # Reverse proxy (no SSL)
```

---

## 4. Cấu Trúc Thư Mục Chi Tiết

```
webtruyen/
│
├── .env                          # Shared env (nếu có)
├── .env.dev                      # Dev environment variables
├── .env.dev.example              # Template cho dev
├── .env.prod                     # Prod environment variables
├── .env.prod.example             # Template cho prod
├── .gitignore
├── README.md                     # Tài liệu dự án
├── DEPLOYMENT_GUIDE.md           # Hướng dẫn deploy A-Z
├── docker-compose.dev.yml        # Docker config cho dev
├── docker-compose.prod.yml       # Docker config cho production
│
├── backend/
│   ├── Dockerfile                # Multi-stage build cho backend
│   ├── package.json              # Dependencies & scripts
│   ├── prisma/
│   │   ├── schema.prisma         # ★ Database schema definition
│   │   └── migrations/           # Auto-generated migration files
│   ├── src/
│   │   ├── .env                  # Backend-specific env
│   │   ├── index.js              # ★ Entry point - Express server setup
│   │   ├── config/               # App config, OAuth passport setup
│   │   ├── controllers/          # ★ Business logic
│   │   │   ├── adminController.js    # Admin CRUD operations
│   │   │   ├── authController.js     # Login, register, refresh, logout
│   │   │   ├── mediaController.js    # File upload/list/delete
│   │   │   ├── storiesController.js  # Story & chapter operations
│   │   │   └── ...
│   │   ├── routes/               # ★ API route definitions
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── stories.js
│   │   │   ├── media.js
│   │   │   └── ...
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.js               # JWT verification middleware
│   │   │   └── ...
│   │   ├── lib/                  # Shared modules
│   │   │   └── prisma.js             # Prisma client singleton
│   │   ├── utils/                # Helper functions
│   │   │   ├── tokenService.js       # JWT sign/verify helpers
│   │   │   └── validationService.js  # Input validation
│   │   └── scripts/              # CLI scripts
│   │       ├── seed.js               # Full database seed
│   │       ├── seed-film-reviews.js  # Film review seed
│   │       └── seed-users-only.js    # User-only seed
│   ├── uploads/                  # Local upload directory (dev)
│   └── logs/                     # Application logs
│
├── frontend/
│   ├── Dockerfile                # Multi-stage build cho frontend
│   ├── package.json              # Dependencies & scripts
│   ├── next.config.js            # Next.js configuration
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # PostCSS config
│   ├── next-env.d.ts             # Next.js TypeScript declarations
│   │
│   ├── public/                   # Static assets (served directly)
│   │   ├── manifest.json            # PWA manifest
│   │   ├── robots.txt                # SEO crawling rules
│   │   ├── humans.txt                # Thông tin team
│   │   └── ...
│   │
│   ├── styles/
│   │   └── globals.css               # Global styles + Tailwind imports
│   │
│   └── src/
│       ├── imageLoader.ts        # Custom image loader
│       ├── app/                  # ★ Next.js App Router (pages)
│       │   ├── layout.tsx            # Root layout + metadata
│       │   ├── page.tsx              # Homepage
│       │   ├── providers.tsx         # Client providers (Redux, etc.)
│       │   ├── sitemap.ts            # Dynamic sitemap generation
│       │   ├── icon.tsx              # Dynamic favicon
│       │   ├── apple-icon.tsx        # Apple touch icon
│       │   ├── opengraph-image.tsx   # OG image generation
│       │   │
│       │   ├── stories/              # Truyện
│       │   ├── film-reviews/         # Review phim
│       │   ├── genres/               # Thể loại
│       │   ├── admin/                # Admin panel
│       │   ├── auth/                 # Login / Register
│       │   ├── bookmarks/            # Bookmark truyện
│       │   ├── profile/              # Hồ sơ cá nhân
│       │   ├── audio-demo/           # Demo audio player
│       │   ├── contact/              # Liên hệ
│       │   ├── help/                 # Trợ giúp
│       │   ├── terms/                # Điều khoản
│       │   ├── privacy/              # Chính sách riêng tư
│       │   └── dmca/                 # DMCA
│       │
│       ├── components/           # ★ React components
│       │   ├── layout/               # Layout wrappers
│       │   ├── home/                 # Homepage components
│       │   ├── stories/              # Story components
│       │   ├── admin/                # Admin panel components
│       │   ├── audio/                # Audio player components
│       │   ├── comments/             # Comment components
│       │   ├── contact/              # Contact form
│       │   ├── seo/                  # JSON-LD structured data
│       │   └── ui/                   # Reusable UI components
│       │
│       ├── store/                # ★ Redux state management
│       │   ├── index.ts              # Redux store configuration
│       │   └── slices/
│       │       └── authSlice.ts      # Auth state + async thunks
│       │
│       ├── types/                # TypeScript type definitions
│       │   ├── index.ts              # ★ All shared types/interfaces
│       │   └── admin.ts              # Admin-specific types
│       │
│       ├── utils/                # Client utilities
│       │   ├── api.ts                # ★ Axios client + API functions
│       │   ├── media.ts              # Media URL helpers
│       │   └── affiliateCooldown.ts  # Affiliate timing logic
│       │
│       ├── contexts/             # React contexts
│       │   └── LanguageContext.tsx    # i18n translations
│       │
│       └── hooks/                # Custom React hooks
│           ├── useAuth.ts            # Auth hook
│           └── useAuthReady.ts       # Auth ready state hook
│
├── nginx/
│   ├── nginx.conf                # Base Nginx config
│   ├── dev.conf                  # Dev-specific server block
│   └── prod.conf                 # Prod with SSL, caching, gzip
│
├── uploads/                      # ★ Media storage volume
│   ├── audio/                    # Audio files (.mp3, etc.)
│   └── image/                    # Image files (.jpg, .png, etc.)
│
└── logs/
    ├── backend/                  # Express app logs
    └── nginx/                    # Nginx access/error logs
```

---

## 5. Authentication Flow Chi Tiết

### 5.1 Mô hình bảo mật

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTH ARCHITECTURE                         │
│                                                             │
│  Access Token (JWT)          Refresh Token (JWT)            │
│  ├── Short-lived (~15min)    ├── Long-lived (~7 days)       │
│  ├── Stored in Redux state   ├── Stored in httpOnly cookie  │
│  ├── Sent via Authorization  ├── Sent automatically by      │
│  │   header                  │   browser                    │
│  └── NOT persisted to disk   └── Cannot be accessed by JS   │
│                                  (XSS-safe)                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Login Flow

```
Client                    Backend                    Database
  │                         │                           │
  │  POST /auth/login       │                           │
  │  {email, password}      │                           │
  │────────────────────────>│                           │
  │                         │  Find user by email       │
  │                         │──────────────────────────>│
  │                         │  Compare bcrypt hash      │
  │                         │<──────────────────────────│
  │                         │                           │
  │  200 OK                 │                           │
  │  Body: {user, accessToken}                          │
  │  Set-Cookie: refreshToken=xxx; HttpOnly; Secure     │
  │<────────────────────────│                           │
  │                         │                           │
  │  Redux: store user +    │                           │
  │         accessToken     │                           │
```

### 5.3 Silent Refresh Flow

```
App Load / Token Expired
  │
  │  POST /auth/refresh
  │  Cookie: refreshToken (auto-sent)
  │──────────────────────────────────>  Backend
  │                                      │
  │  Verify refresh token from cookie    │
  │  Issue new access token              │
  │                                      │
  │  200: {accessToken, user}            │
  │<──────────────────────────────────   │
  │                                      │
  │  Redux: update accessToken           │
```

### 5.4 Rehydration (redux-persist)

Khi app load lại, `redux-persist` khôi phục `user` từ localStorage nhưng **KHÔNG khôi phục `accessToken`**. Thay vào đó, app gọi silent refresh để lấy access token mới:

```typescript
// accessToken luôn = null sau rehydrate
// Provider sẽ gọi refreshToken() thunk để lấy token mới
return {
  ...state,
  user: persistedAuth.user,
  accessToken: null, // ← forced null
  isAuthenticated: true,
  isLoading: false,
  error: null,
};
```

### 5.5 Role-Based Authorization

```typescript
switch (user.role) {
  case "ADMIN":
    return "/admin";
  case "USER":
  default:
    return "/";
}
```

---

## 6. Database Schema Overview

### 6.1 Entity Relationship

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────<│  Story   │────<│ Chapter  │
│          │     │          │     │          │
│ id       │     │ id       │     │ id       │
│ email    │     │ slug     │     │ number   │
│ name     │     │ title    │     │ title    │
│ role     │     │ type     │     │ content  │
│ password │     │ status   │     │ audioUrl │
│ avatar   │     │ authorId │     │ isLocked │
│ googleId │     │ viewCount│     │ storyId  │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     │           ┌────┘                │
     │           ▼                     ▼
     │      ┌──────────┐        ┌──────────┐
     │      │  Genre   │        │ Comment  │
     │      │ (M:N)    │        │          │
     │      └──────────┘        └──────────┘
     │
     ├────<┌──────────┐
     │     │ Bookmark │
     │     └──────────┘
     │
     └────<┌──────────────┐     ┌──────────────┐
           │ FilmReview   │────<│ FilmComment  │
           │              │     └──────────────┘
           │ slug, rating │
           │ categories   │────>┌──────────────┐
           │ actors       │     │ FilmCategory │
           └──────────────┘     └──────────────┘
                  │
                  └────────────>┌──────────────┐
                                │ FilmActor    │
                                └──────────────┘

┌──────────────┐     ┌──────────┐     ┌──────────────┐
│AffiliateLink │     │  Media   │     │ RefreshToken │
│              │     │          │     │              │
│ provider     │     │ filename │     │ token        │
│ targetUrl    │     │ url      │     │ userId       │
│ isActive     │     │ type     │     │ expiresAt    │
└──────────────┘     │ isActive │     └──────────────┘
                     └──────────┘
```

### 6.2 Bảng dữ liệu chính

| Model             | Mô tả                            | Quan hệ                          |
| ----------------- | -------------------------------- | -------------------------------- |
| **User**          | Tài khoản, hỗ trợ OAuth (Google) | `1:N` → Story, Comment, Bookmark |
| **Story**         | Truyện chữ hoặc audio            | `N:M` → Genre, `1:N` → Chapter   |
| **Chapter**       | Chương truyện (text/audio)       | `1:N` → Comment                  |
| **Genre**         | Thể loại truyện                  | `N:M` → Story                    |
| **Comment**       | Bình luận threaded trên chapter  | `N:1` → User, Chapter            |
| **Bookmark**      | Đánh dấu truyện                  | `N:1` → User, Story              |
| **FilmReview**    | Bài review phim                  | `N:M` → FilmCategory, FilmActor  |
| **FilmComment**   | Bình luận review phim            | `N:1` → User, FilmReview         |
| **FilmCategory**  | Thể loại phim                    | `N:M` → FilmReview               |
| **FilmActor**     | Diễn viên                        | `N:M` → FilmReview               |
| **AffiliateLink** | Link liên kết quảng cáo          | Optional → Story, Chapter        |
| **Media**         | File upload (image/audio)        | Standalone                       |
| **RefreshToken**  | JWT refresh token stored in DB   | `N:1` → User                     |

---

## 7. API Architecture

### 7.1 Route Structure

```
/api
├── /auth
│   ├── POST   /login              # Đăng nhập
│   ├── POST   /register           # Đăng ký
│   ├── POST   /refresh            # Silent refresh (cookie-based)
│   ├── POST   /logout             # Đăng xuất (clear cookie)
│   └── GET    /profile            # Lấy thông tin user hiện tại
│
├── /stories
│   ├── GET    /                   # Danh sách (pagination, filter)
│   ├── GET    /:slug              # Chi tiết truyện + chapters
│   └── ...
│
├── /chapters
│   ├── GET    /:id                # Chi tiết chapter
│   └── ...
│
├── /genres
│   └── GET    /                   # Danh sách thể loại
│
├── /bookmarks
│   ├── GET    /                   # Bookmark của user
│   ├── POST   /                   # Thêm bookmark
│   └── DELETE /:id                # Xóa bookmark
│
├── /comments
│   ├── GET    /                   # List comments
│   ├── POST   /                   # Tạo comment
│   └── ...
│
├── /film-reviews
│   ├── GET    /                   # Danh sách review
│   ├── GET    /:slug              # Chi tiết review
│   └── ...
│
├── /affiliate
│   └── ...                        # Affiliate link management
│
├── /contact
│   └── POST   /                   # Gửi liên hệ
│
├── /media
│   ├── POST   /upload             # Upload file (auth required)
│   ├── GET    /                   # List files (pagination)
│   └── DELETE /:id                # Delete file
│
├── /users
│   └── ...                        # User profile management
│
└── /admin
    ├── GET    /stats              # Dashboard statistics
    ├── CRUD   /stories            # Quản lý truyện
    ├── CRUD   /chapters           # Quản lý chapters
    ├── CRUD   /genres             # Quản lý thể loại
    ├── CRUD   /users              # Quản lý users
    ├── CRUD   /comments           # Quản lý comments
    ├── CRUD   /film-reviews       # Quản lý film reviews
    ├── CRUD   /film-categories    # Quản lý film categories
    └── POST   /sample-data        # Tạo dữ liệu mẫu
```

### 7.2 Middleware Chain

```
Request → CORS → JSON Parser → Cookie Parser
    │
    ├── Public routes (no auth)
    │   └── GET /stories, /genres, /film-reviews
    │
    ├── Auth routes
    │   └── POST /auth/login, /register, /refresh
    │
    └── Protected routes
        └── JWT Verify Middleware → Role Check → Controller
```

### 7.3 Frontend API Client (`utils/api.ts`)

```typescript
// Axios instance với interceptors
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // ← gửi cookie tự động
});

// Request interceptor: gắn Authorization header
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Gọi /auth/refresh → lấy accessToken mới → retry request
    }
  },
);
```

---

## 8. Frontend Architecture Chi Tiết

### 8.1 Next.js App Router Pattern

```
┌─────────────────────────────────────────────────┐
│              Server Components (SSR)             │
│                                                  │
│  page.tsx                                        │
│  ├── Fetch data on server (direct API call)     │
│  ├── Generate metadata (SEO)                     │
│  ├── Render JSON-LD structured data              │
│  └── Pass data to Client Component               │
│                                                  │
└──────────────────┬──────────────────────────────┘
                   │ props
                   ▼
┌─────────────────────────────────────────────────┐
│             Client Components (CSR)              │
│  "use client"                                    │
│                                                  │
│  *Client.tsx / *Detail.tsx                       │
│  ├── Interactive UI (click, scroll, etc.)       │
│  ├── Client-side data fetching (pagination)     │
│  ├── Redux state (auth, bookmarks)               │
│  └── Dynamic imports (audio player, etc.)        │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Ví dụ pattern SSR + CSR:**

```typescript
// Server Component — SEO-optimized (stories/[slug]/page.tsx)
export async function generateMetadata({ params }) {
  const story = await fetchStory(params.slug);
  return { title: story.title, openGraph: { ... } };
}

export default async function StoryPage({ params }) {
  const story = await fetchStory(params.slug);
  return <StoryDetailClient initialStory={story} />;
}
```

### 8.2 State Management

```
┌─────────────────────────────────────────┐
│            Redux Store                   │
│                                          │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │  authSlice   │  │  bookmarkSlice  │  │
│  │  ─────────── │  │  ───────────────│  │
│  │  user        │  │  items          │  │
│  │  accessToken │  │  isLoading      │  │
│  │  isAuth      │  │                 │  │
│  │  isLoading   │  │                 │  │
│  │  error       │  │                 │  │
│  └─────────────┘  └─────────────────┘  │
│                                          │
│  redux-persist: chỉ persist user info   │
│  (KHÔNG persist accessToken)             │
└─────────────────────────────────────────┘
```

### 8.3 Async Thunks (authSlice.ts)

| Thunk          | API Call              | Mô tả                                |
| -------------- | --------------------- | ------------------------------------ |
| `loginUser`    | `POST /auth/login`    | Login, nhận accessToken + set cookie |
| `registerUser` | `POST /auth/register` | Register + auto-login                |
| `refreshToken` | `POST /auth/refresh`  | Silent refresh, cookie auto-sent     |
| `logoutUser`   | `POST /auth/logout`   | Clear cookie + clear state           |
| `getProfile`   | `GET /auth/profile`   | Fetch user profile                   |

---

## 9. SEO Implementation

### 9.1 Các layer SEO

| Layer               | File/Component                   | Mô tả                                                |
| ------------------- | -------------------------------- | ---------------------------------------------------- |
| **Global Metadata** | `app/layout.tsx`                 | Title template, description, robots, icons, manifest |
| **Page Metadata**   | Mỗi `page.tsx`                   | Dynamic `generateMetadata()` function                |
| **Structured Data** | `components/seo/JsonLd.tsx`      | Schema.org JSON-LD                                   |
| **Sitemap**         | `app/sitemap.ts`                 | Auto-generated from database                         |
| **robots.txt**      | `public/robots.txt`              | Crawling rules                                       |
| **PWA**             | `public/manifest.json`           | Progressive Web App metadata                         |
| **Dynamic Icons**   | `app/icon.tsx`, `apple-icon.tsx` | Generated at build time                              |
| **OG Image**        | `app/opengraph-image.tsx`        | Dynamic Open Graph image                             |

### 9.2 JSON-LD Schemas có sẵn

```typescript
// Trong components/seo/JsonLd.tsx
getOrganizationSchema(); // Schema.org/Organization
getWebsiteSchema(); // Schema.org/WebSite + SearchAction
getBookSchema(); // Schema.org/Book (cho Story)
getArticleSchema(); // Schema.org/Article (cho Chapter)
getAudioBookSchema(); // Schema.org/AudioBook (cho Audio Story)
getBreadcrumbSchema(); // Schema.org/BreadcrumbList
getFilmReviewSchema(); // Schema.org/Review + Movie
getFilmReviewsListSchema(); // Schema.org/CollectionPage
```

### 9.3 Metadata Pattern

```typescript
// Mỗi page SSR đều có generateMetadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params.slug);
  return {
    title: `${data.title} | vivutruyenhay.com`,
    description: data.description?.substring(0, 160),
    openGraph: {
      title,
      description,
      type: "article",
      locale: "vi_VN",
      images: [{ url: data.thumbnailUrl }],
    },
    alternates: { canonical: `/path/${params.slug}` },
  };
}
```

---

## 10. Media & File Upload System

### 10.1 Upload Flow

```
Admin UI                Backend                    Disk
  │                       │                         │
  │  POST /media/upload   │                         │
  │  multipart/form-data  │                         │
  │  (file + type)        │                         │
  │──────────────────────>│                         │
  │                       │  multer middleware       │
  │                       │  validate size/type      │
  │                       │                         │
  │                       │  Save to /uploads/{type}/│
  │                       │──────────────────────────>│
  │                       │                         │
  │                       │  Create Media record     │
  │                       │  in database             │
  │                       │                         │
  │  { url, filename }    │                         │
  │<──────────────────────│                         │
```

### 10.2 File Storage Structure

```
uploads/                  # Docker volume mount
├── audio/                # Audio files (.mp3, .m4a, etc.)
│   ├── sample-audio-1.mp3
│   └── ...
└── image/                # Image files (.jpg, .png, .webp)
    ├── sample-image-1.jpg
    └── ...
```

### 10.3 Nginx Static Serving

```nginx
location /uploads/ {
    alias /uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 10.4 Media Controller Endpoints

| Endpoint        | Method | Mô tả                                     |
| --------------- | ------ | ----------------------------------------- |
| `/media/upload` | POST   | Upload file (image/audio)                 |
| `/media`        | GET    | List files với pagination, filter by type |
| `/media/:id`    | DELETE | Delete file từ disk + DB                  |

---

## 11. Docker & Deployment

### 11.1 Environment Variables

| Variable              | Mô tả                              | Ví dụ                                     |
| --------------------- | ---------------------------------- | ----------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection              | `postgresql://user:pass@postgres:5432/db` |
| `JWT_SECRET`          | Sign access token                  | `openssl rand -base64 48`                 |
| `JWT_REFRESH_SECRET`  | Sign refresh token                 | `openssl rand -base64 48`                 |
| `NEXT_PUBLIC_API_URL` | Frontend gọi API (baked vào build) | `https://domain.com/api`                  |
| `API_URL`             | Server-side API (Docker internal)  | `http://backend:5000/api`                 |
| `CORS_ORIGIN`         | Allowed origins                    | `https://domain.com`                      |
| `UPLOAD_PATH`         | Thư mục upload                     | `/uploads`                                |
| `DOMAIN`              | Domain name                        | `vivutruyenhay.com`                       |

### 11.2 Docker Compose Volumes

```yaml
# Production volumes
volumes:
  - postgres_data:/var/lib/postgresql/data # DB persistence
  - ./uploads:/uploads # Media files
  - ./logs/backend:/app/logs # Backend logs
  - ./logs/nginx:/var/log/nginx # Nginx logs
  - ./nginx/prod.conf:/etc/nginx/nginx.conf # Nginx config
  - ./certbot/conf:/etc/letsencrypt # SSL certs
```

### 11.3 Build Commands

```bash
# Development
docker compose -f docker-compose.dev.yml up -d --build

# Production
docker compose -f docker-compose.prod.yml up -d --build

# Rebuild single service
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend

# Database migration
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Database seed
docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed.js
```

### 11.4 Nginx Configuration Highlights

```nginx
# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Proxy to backend
location /api/ {
    proxy_pass http://backend:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Proxy to frontend (SSR)
location / {
    proxy_pass http://frontend:3000;
}

# Static uploads with long cache
location /uploads/ {
    alias /uploads/;
    expires 30d;
}

# SSL (production)
ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;
```

---

## 12. Internationalization (i18n)

Dự án sử dụng React Context cho i18n (`contexts/LanguageContext.tsx`):

```typescript
// Key-value translation map
const translations = {
  "admin.dashboard": "Bảng điều khiển",
  "admin.stats.total_users": "Tổng người dùng",
  "genres.cta.button": "Xem Tất Cả Truyện",
  // ...100+ keys
};

// Usage trong component
const { t } = useLanguage();
<h1>{t("admin.dashboard")}</h1>
```

> **Lưu ý:** Hiện tại chỉ hỗ trợ tiếng Việt. Có thể mở rộng multi-language bằng cách thêm translation objects cho từng locale.

---

## 13. Admin Panel

### 13.1 Admin Tabs

```typescript
export type AdminTab =
  | "dashboard" // Thống kê tổng quan
  | "stories" // Quản lý truyện
  | "chapters" // Quản lý chương
  | "genres" // Quản lý thể loại
  | "affiliate-links" // Quản lý link liên kết
  | "users" // Quản lý người dùng
  | "comments" // Quản lý bình luận
  | "media" // Quản lý file upload
  | "settings" // Cài đặt hệ thống
  | "film-reviews" // Quản lý review phim
  | "film-categories"; // Quản lý thể loại phim
```

### 13.2 Admin Components chính

| Component          | Chức năng                       |
| ------------------ | ------------------------------- |
| `AdminStats`       | Dashboard với số liệu tổng quan |
| `AdminStoryForm`   | CRUD form cho Story             |
| `AdminChapterForm` | CRUD form cho Chapter           |
| `AdminMediaUpload` | Upload & manage files           |
| `MediaManager`     | Full media library UI           |

---

## 14. Seed Scripts

| Script                 | Lệnh                                    | Mô tả                                                            |
| ---------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| `seed.js`              | `node src/scripts/seed.js`              | Full seed: users, genres, stories, chapters, comments, film data |
| `seed-film-reviews.js` | `node src/scripts/seed-film-reviews.js` | Chỉ film reviews + categories + actors                           |
| `seed-users-only.js`   | `node src/scripts/seed-users-only.js`   | Chỉ tạo admin + demo user                                        |

**Default accounts sau seed:**

| Role  | Email                 | Password      |
| ----- | --------------------- | ------------- |
| Admin | `admin@webtruyen.com` | `admin123456` |
| User  | `user@example.com`    | `user123456`  |

---

## 15. Key Design Patterns

### 15.1 SSR-First với Client Hydration

Mọi page content-facing đều SSR để SEO tốt, sau đó hydrate thành interactive client components.

### 15.2 Cookie-Based Refresh Token

Refresh token trong httpOnly cookie → XSS-safe. Access token ngắn hạn trong memory (Redux) → không persist.

### 15.3 Slug-Based Routing

Tất cả content entities (Story, Genre, FilmReview) đều có `slug` field để tạo SEO-friendly URLs.

### 15.4 Idempotent Seeding

Seed scripts sử dụng `upsert` / `findFirst` → chạy nhiều lần không duplicate data.

### 15.5 Volume-Based Media Storage

Upload files lưu trên Docker volume (`./uploads`) → persistent qua container restart, serve trực tiếp qua Nginx.

### 15.6 Multi-Stage Docker Build

Dockerfiles có `deps` stage cho dev (hot reload) và `runner` stage cho prod (optimized build).

### 15.7 Axios Interceptor Auto-Refresh

Response interceptor tự động gọi `/auth/refresh` khi nhận 401, rồi retry original request với token mới.

---

## 16. End-to-End Flow

```
1. User truy cập https://vivutruyenhay.com/stories/dau-pha-thuong-khung

2. Nginx nhận request → proxy đến Frontend :3000

3. Next.js Server Component:
   a. Gọi API http://backend:5000/api/stories/dau-pha-thuong-khung (internal)
   b. Generate metadata (title, OG, description)
   c. Render JSON-LD structured data
   d. SSR HTML với data → trả về client

4. Client nhận HTML (SEO-ready) → hydrate React components

5. Client-side interactions:
   a. Redux store khôi phục auth state
   b. Silent refresh /auth/refresh nếu có user
   c. Lazy load comments, audio player, etc.

6. User đăng nhập:
   a. POST /api/auth/login → nhận accessToken + cookie
   b. Redux dispatch loginUser.fulfilled
   c. Redirect theo role (ADMIN → /admin, USER → /)
```

---

## 17. Hướng Dẫn Nhanh

### Development

```bash
# Clone và cài đặt
git clone <repo-url> && cd webtruyen

# Copy env files
cp .env.dev.example .env.dev

# Khởi chạy tất cả services
docker compose -f docker-compose.dev.yml up -d --build

# Chạy migration + seed
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
docker compose -f docker-compose.dev.yml exec backend node src/scripts/seed.js

# Truy cập: http://localhost
```

### Production

```bash
# Copy và cấu hình env
cp .env.prod.example .env.prod
# Sửa DOMAIN, JWT_SECRET, DATABASE_URL, etc.

# Build và deploy
docker compose -f docker-compose.prod.yml up -d --build

# Setup SSL
# (Xem chi tiết trong DEPLOYMENT_GUIDE.md)

# Truy cập: https://your-domain.com
```

---

> **Tài liệu này phục vụ mục đích tham khảo kiến trúc để áp dụng cho dự án mới.** Các pattern về SSR + Redux auth, cookie-based refresh, Docker multi-service, Nginx reverse proxy, và SEO structured data đều có thể tái sử dụng.
