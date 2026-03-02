# vivutruyenhay.com

A full-stack web application for reading stories, listening to audio stories, and reviewing films. Built with **Next.js 14**, **Node.js/Express**, **PostgreSQL**, and **Docker**.

---

## Features

**User-facing:**
- Story reading with clean, responsive interface
- Audio story playback with built-in player
- Film review browsing and commenting
- User registration/login (JWT + OAuth)
- Bookmarks, comments, dark/light theme

**Admin:**
- Dashboard with analytics
- Story, chapter, and genre management
- Film review and category management
- Comment moderation, user management
- Affiliate link management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL 15 |
| Infra | Docker, Nginx, Let's Encrypt SSL |

---

## Project Structure

```
webtruyen/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API business logic
│   │   ├── routes/         # Express route definitions
│   │   ├── middleware/      # Auth middleware
│   │   ├── lib/            # Shared modules (Prisma client)
│   │   ├── utils/          # Helpers (JWT, validation)
│   │   ├── scripts/        # Seed scripts, health check
│   │   ├── config/         # App config, OAuth passport
│   │   └── index.js        # Server entry point
│   └── prisma/             # Database schema & migrations
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── store/          # Redux state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Client utilities & API client
│   │   └── contexts/       # React contexts
│   ├── public/             # Static assets (robots.txt, manifest)
│   └── styles/             # Global CSS
├── nginx/                  # Nginx configs (prod + dev)
├── docker-compose.prod.yml # Production deployment
├── docker-compose.dev.yml  # Local development
├── DEPLOYMENT_GUIDE.md     # Full deployment instructions
└── .env.prod.example       # Environment template
```

---

## Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose installed
- Git

### Setup

```bash
git clone https://github.com/loihd98/vivutruyenhay.git
cd vivutruyenhay

# Create environment file
cp .env.dev.example .env.dev

# Start all services
docker compose -f docker-compose.dev.yml up -d --build

# Wait for services to start, then seed database
docker compose -f docker-compose.dev.yml exec backend node src/scripts/seed.js
```

### Access

| Service | URL |
|---------|-----|
| Website | http://localhost |
| API | http://localhost/api |
| API direct | http://localhost:5000 |
| Frontend direct | http://localhost:3000 |

### Architecture (Development)

```
Browser → nginx:80 → {
  /api/*      → backend:5000
  /uploads/*  → static files
  /*          → frontend:3000 (hot reload)
}
```

---

## Production Deployment

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete A-to-Z instructions covering:

- Fresh Ubuntu 20.04 VPS setup
- Docker installation
- SSL certificate with Let's Encrypt
- Database seeding & admin account creation
- Automated backups & SSL renewal
- Troubleshooting

**Quick deploy (if VPS is already set up):**

```bash
cd /opt/webtruyen
git pull origin master
docker compose -f docker-compose.prod.yml up -d --build
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/facebook` | Facebook OAuth login |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | List stories (paginated, filterable) |
| GET | `/api/stories/:slug` | Get story details |
| POST | `/api/stories` | Create story (admin) |
| PUT | `/api/stories/:id` | Update story (admin) |
| DELETE | `/api/stories/:id` | Delete story (admin) |

### Chapters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chapters/:id` | Get chapter content |
| POST | `/api/chapters` | Create chapter (admin) |
| PUT | `/api/chapters/:id` | Update chapter (admin) |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/chapters/:chapterId/comments` | Get comments |
| POST | `/api/comments/chapters/:chapterId/comments` | Create comment |
| DELETE | `/api/comments/:id` | Delete comment |

### Film Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/film-reviews` | List film reviews |
| GET | `/api/film-reviews/:slug` | Get review details |
| POST | `/api/film-reviews` | Create review (admin) |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/users` | User management |
| GET | `/api/admin/comments` | Comment moderation |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Contact form |
| GET | `/api/bookmarks` | User bookmarks |
| GET | `/api/media` | Media management |

---

## Environment Variables

### Production (`.env.prod`)

See `.env.prod.example` for the full template. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (generate with `openssl rand -base64 48`) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `NEXT_PUBLIC_API_URL` | Frontend API URL (baked into build) |
| `API_URL` | Server-side API URL (Docker internal) |
| `DOMAIN` | Domain name |

### Development (`.env.dev`)

See `.env.dev.example` for the full template.

---

## SEO

The project includes built-in SEO optimization:

- **Meta tags & Open Graph** — Dynamic per-page titles, descriptions, OG images
- **Structured data** — JSON-LD schemas (Organization, Website, Book, Article)
- **Sitemap** — Auto-generated at `/sitemap.xml` from database content
- **robots.txt** — Configured with proper allow/disallow rules
- **Progressive Web App** — `manifest.json` with app metadata
- **Performance** — Gzip compression, static asset caching, image optimization

### SEO Checklist for Production

- [ ] Register on [Google Search Console](https://search.google.com/search-console)
- [ ] Submit sitemap URL: `https://vivutruyenhay.com/sitemap.xml`
- [ ] Add Google verification code to `layout.tsx`
- [ ] (Optional) Set up Google Analytics
- [ ] (Optional) Create Facebook App for social login & OG debugging

---

## Database

### Schema Overview

| Model | Description |
|-------|-------------|
| User | Users with roles (USER/ADMIN), OAuth support |
| Story | Stories with types (TEXT/AUDIO), genres, status |
| Chapter | Story chapters with text content or audio URL |
| Comment | Threaded comments on chapters |
| Bookmark | User bookmarks for stories/chapters |
| FilmReview | Film reviews with categories, actors, ratings |
| FilmComment | Comments on film reviews |
| Genre | Story genres |
| FilmCategory | Film categories |
| FilmActor | Film actors |
| AffiliateLink | Affiliate links for stories/reviews |
| Media | Uploaded media files |

### Useful Commands

```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database
docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed.js

# Open Prisma Studio (dev only)
docker compose -f docker-compose.dev.yml exec backend npx prisma studio

# Database shell
docker compose -f docker-compose.prod.yml exec postgres psql -U webtruyen_user -d web_truyen
```

---

## Backup & Recovery

```bash
# Create backup
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U webtruyen_user web_truyen > backup_$DATE.sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U webtruyen_user -d web_truyen < backup_YYYYMMDD_HHMMSS.sql
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#10-database-backup--restore) for automated backup setup.

---

## SSL Certificate

Managed via Let's Encrypt (Certbot) with automatic renewal.

```bash
# Check certificate expiry
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 \
  -in /certs/live/vivutruyenhay.com/fullchain.pem -noout -dates

# Force renewal
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker compose -f docker-compose.prod.yml restart nginx
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#9-ssl-auto-renewal) for auto-renewal cron setup.

---

## License

MIT
