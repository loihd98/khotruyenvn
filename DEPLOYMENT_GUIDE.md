# Deployment Guide — vivutruyenhay.com

Complete A-to-Z guide for deploying the website to a fresh **Ubuntu 20.04 VPS** with IP `103.199.18.123` and domain `vivutruyenhay.com`.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [DNS Configuration](#2-dns-configuration)
3. [VPS Initial Setup](#3-vps-initial-setup)
4. [Install Docker & Docker Compose](#4-install-docker--docker-compose)
5. [Deploy the Application](#5-deploy-the-application)
6. [SSL Certificate Setup](#6-ssl-certificate-setup)
7. [Database Seeding & Initial Account](#7-database-seeding--initial-account)
8. [Verify Everything Works](#8-verify-everything-works)
9. [SSL Auto-Renewal](#9-ssl-auto-renewal)
10. [Database Backup & Restore](#10-database-backup--restore)
11. [Maintenance & Updates](#11-maintenance--updates)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- A VPS with Ubuntu 20.04 LTS (IP: `103.199.18.123`)
- Root SSH access to the VPS
- Domain `vivutruyenhay.com` registered and ready to configure
- Your project code pushed to GitHub at `https://github.com/loihd98/vivutruyenhay.git`

---

## 2. DNS Configuration

At your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare), create these DNS records:

| Type | Host | Value          | TTL |
| ---- | ---- | -------------- | --- |
| A    | @    | 103.199.18.123 | 300 |
| A    | www  | 103.199.18.123 | 300 |

Wait 5-15 minutes for DNS propagation, then verify:

```bash
# From your local machine
nslookup vivutruyenhay.com
ping vivutruyenhay.com
```

Both should resolve to `103.199.18.123`.

---

## 3. VPS Initial Setup

### 3.1 Connect to VPS

```bash
ssh root@103.199.18.123
```

### 3.2 Update System

```bash
apt update && apt upgrade -y
```

### 3.3 Install Essential Packages

```bash
apt install -y git curl wget ufw apt-transport-https ca-certificates gnupg lsb-release
```

### 3.4 Configure Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

Expected output:

```
Status: active
To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### 3.5 Create a Non-Root User (Recommended)

```bash
adduser deploy
usermod -aG sudo deploy
cp -r ~/.ssh /home/deploy/
chown -R deploy:deploy /home/deploy/.ssh
```

From now on, you can SSH as `deploy@103.199.18.123` (optional — using root is fine for single-admin setups).

---

## 4. Install Docker & Docker Compose

> **Important:** On Ubuntu 20.04 (focal), do NOT use `curl -fsSL https://get.docker.com | sh` — it may fail due to missing packages on this release. Use the manual method below.

### 4.1 Add Docker's GPG Key & Repository

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 4.2 Install Docker Engine

```bash
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 4.3 Verify Installation

```bash
docker --version
docker compose version
```

Expected output (versions may differ):

```
Docker version 27.x.x
Docker Compose version v2.x.x
```

### 4.4 Enable Docker on Boot

```bash
systemctl enable docker
systemctl start docker
```

---

## 5. Deploy the Application

### 5.1 Clone the Repository

```bash
mkdir -p /opt
cd /opt
git clone https://github.com/loihd98/vivutruyenhay.git webtruyen
cd /opt/webtruyen
```

### 5.2 Create Production Environment File

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Fill in the following values — **change all secrets and passwords**:

```env
# Database
POSTGRES_DB=web_truyen
POSTGRES_USER=webtruyen_user
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD_HERE
DATABASE_URL=postgresql://webtruyen_user:YOUR_STRONG_DB_PASSWORD_HERE@postgres:5432/web_truyen

# JWT — generate with: openssl rand -base64 48
JWT_SECRET=PASTE_GENERATED_SECRET_HERE
JWT_REFRESH_SECRET=PASTE_DIFFERENT_GENERATED_SECRET_HERE

# URLs
BASE_URL=https://vivutruyenhay.com
CORS_ORIGIN=https://vivutruyenhay.com
FRONTEND_URL=https://vivutruyenhay.com
BACKEND_URL=https://vivutruyenhay.com
DOMAIN=vivutruyenhay.com

# Frontend
NEXT_PUBLIC_API_URL=https://vivutruyenhay.com/api
NEXT_PUBLIC_BASE_URL=https://vivutruyenhay.com
NEXT_PUBLIC_MEDIA_URL=https://vivutruyenhay.com
NEXT_PUBLIC_SITE_URL=https://vivutruyenhay.com
API_URL=http://backend:5000/api

# File upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/uploads

# Environment
NODE_ENV=production
PORT=5000
FRONTEND_PORT=3000
```

Generate strong secrets:

```bash
# Run these commands and paste the output into .env.prod
echo "JWT_SECRET: $(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET: $(openssl rand -base64 48)"
echo "DB_PASSWORD: $(openssl rand -base64 24)"
```

### 5.3 Create Upload Directories

```bash
mkdir -p /opt/webtruyen/uploads/audio
mkdir -p /opt/webtruyen/uploads/image
mkdir -p /opt/webtruyen/logs/backend
mkdir -p /opt/webtruyen/logs/nginx
```

### 5.4 Initial HTTP-Only Deployment (Before SSL)

Before obtaining SSL certificates, Nginx must serve over HTTP first so Let's Encrypt can verify your domain.

Create a temporary HTTP-only Nginx config:

```bash
cat > /opt/webtruyen/nginx/prod.conf << 'EOF'
server {
    listen 80;
    server_name vivutruyenhay.com www.vivutruyenhay.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /uploads/;
        autoindex off;
        expires 1y;
    }
}
EOF
```

### 5.5 Build & Start All Services

```bash
cd /opt/webtruyen
docker compose -f docker-compose.prod.yml up -d --build
```

This will:

1. Pull/build all Docker images (PostgreSQL, backend, frontend, Nginx)
2. Start PostgreSQL and wait until healthy
3. Start the backend (runs database migrations automatically)
4. Build the Next.js frontend
5. Start Nginx

> **Note:** The first build will take 5-15 minutes depending on your VPS specs, especially the Next.js build.

### 5.6 Check Status

```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show `Up` or `Up (healthy)`:

```
NAME          STATUS
postgres      Up (healthy)
backend       Up (healthy)
frontend      Up
nginx         Up
```

### 5.7 Verify HTTP Access

```bash
curl -I http://vivutruyenhay.com
curl http://vivutruyenhay.com/api/health
```

If the site is accessible via HTTP, proceed to SSL setup.

---

## 6. SSL Certificate Setup

### 6.1 Obtain SSL Certificate from Let's Encrypt

```bash
cd /opt/webtruyen

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d vivutruyenhay.com -d www.vivutruyenhay.com \
  --email your-email@gmail.com \
  --agree-tos --no-eff-email
```

Expected output:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/vivutruyenhay.com/fullchain.pem
Key is saved at: /etc/letsencrypt/live/vivutruyenhay.com/privkey.pem
```

### 6.2 Restore the Full HTTPS Nginx Config

Now replace the temporary HTTP-only config with the full production config that includes HTTPS:

```bash
cd /opt/webtruyen
git checkout nginx/prod.conf
```

This restores the production config that includes:

- HTTP → HTTPS redirect
- www → non-www redirect
- SSL with security headers
- Gzip compression
- Static asset caching

### 6.3 Reload Nginx

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### 6.4 Verify HTTPS

```bash
curl -I https://vivutruyenhay.com
```

Expected: HTTP 200 with security headers (`Strict-Transport-Security`, `X-Frame-Options`, etc.).

Open in a browser: **https://vivutruyenhay.com** — you should see a green padlock.

---

## 7. Database Seeding & Initial Account

### 7.1 Run Database Seed

The seed script creates initial genres, sample stories, and an admin account:

```bash
cd /opt/webtruyen

# Run the full seed (genres + sample stories + admin account)
docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed-users-only.js
```

### 7.2 Seed Film Reviews (Optional)

```bash
docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed-film-reviews.js
```

### 7.3 Create Admin Account Manually

If you prefer to create an admin account manually instead of using the seed:

```bash
# Connect to the database
docker compose -f docker-compose.prod.yml exec postgres psql -U webtruyen_user -d web_truyen
```

Then in the psql shell:

```sql
-- First, register a user via the website's /auth/register page, then promote to admin:
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, name, role FROM users;

-- Exit
\q
```

### 7.4 Register via API (Alternative)

```bash
# Register a user
curl -X POST https://vivutruyenhay.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@vivutruyenhay.com", "password": "YourStrongPassword123", "name": "Admin"}'

# Then promote to admin via database
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U webtruyen_user -d web_truyen -c \
  "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@vivutruyenhay.com';"
```

---

## 8. Verify Everything Works

### 8.1 Service Health Checks

```bash
# All containers running
docker compose -f docker-compose.prod.yml ps

# Backend health
curl https://vivutruyenhay.com/api/health

# Frontend loads
curl -s -o /dev/null -w "%{http_code}" https://vivutruyenhay.com

# SSL certificate info
curl -vI https://vivutruyenhay.com 2>&1 | grep -E "expire|subject|issuer"
```

### 8.2 Feature Checklist

| Feature      | URL                                     | Expected                               |
| ------------ | --------------------------------------- | -------------------------------------- |
| Homepage     | https://vivutruyenhay.com               | Loads with stories                     |
| API Health   | https://vivutruyenhay.com/api/health    | `{"status":"OK"}`                      |
| Registration | https://vivutruyenhay.com/auth/register | Registration form                      |
| Login        | https://vivutruyenhay.com/auth/login    | Login form                             |
| Admin Panel  | https://vivutruyenhay.com/admin         | Admin dashboard (requires admin login) |
| Sitemap      | https://vivutruyenhay.com/sitemap.xml   | XML sitemap                            |
| SSL          | https://vivutruyenhay.com               | Green padlock                          |

### 8.3 Check Logs If Issues

```bash
# All logs
docker compose -f docker-compose.prod.yml logs

# Specific service logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs postgres
```

---

## 9. SSL Auto-Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

### 9.1 Create Renewal Script

```bash
cat > /opt/webtruyen/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /opt/webtruyen
docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
echo "$(date): SSL renewal check completed" >> /var/log/ssl-renewal.log
EOF

chmod +x /opt/webtruyen/renew-ssl.sh
```

### 9.2 Add Cron Job

```bash
crontab -e
```

Add this line (runs at 3 AM every day):

```
0 3 * * * /opt/webtruyen/renew-ssl.sh
```

### 9.3 Manual Renewal (if needed)

```bash
cd /opt/webtruyen
docker compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker compose -f docker-compose.prod.yml restart nginx
```

### 9.4 Check Certificate Expiry

```bash
docker run --rm -v webtruyen_certbot-certs:/certs alpine/openssl x509 \
  -in /certs/live/vivutruyenhay.com/fullchain.pem -noout -dates
```

---

## 10. Database Backup & Restore

### 10.1 Create a Backup

```bash
cd /opt/webtruyen
DATE=$(date +%Y%m%d_%H%M%S)

# Database only
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U webtruyen_user web_truyen > backup_db_$DATE.sql

# Full backup (database + uploads)
mkdir -p backups
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U webtruyen_user web_truyen > backups/db_$DATE.sql
tar -czf backups/uploads_$DATE.tar.gz uploads/
```

### 10.2 Setup Automated Daily Backup

```bash
cat > /opt/webtruyen/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups/webtruyen
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
cd /opt/webtruyen

# Database backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U webtruyen_user web_truyen | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "$(date): Backup completed" >> /var/log/webtruyen-backup.log
EOF

chmod +x /opt/webtruyen/backup.sh
```

Add to cron (runs at 2 AM daily):

```bash
crontab -e
```

```
0 2 * * * /opt/webtruyen/backup.sh
```

### 10.3 Restore from Backup

```bash
cd /opt/webtruyen

# Stop application (keep database running)
docker compose -f docker-compose.prod.yml stop backend frontend nginx

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U webtruyen_user -d web_truyen < backups/db_YYYYMMDD_HHMMSS.sql

# Restart
docker compose -f docker-compose.prod.yml up -d
```

---

## 11. Maintenance & Updates

### 11.1 Deploy Code Updates

```bash
cd /opt/webtruyen

# Pull latest code
git pull origin master

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

### 11.2 Restart Individual Services

```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml restart nginx
```

### 11.3 View Real-Time Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend --tail=100
```

### 11.4 Clean Docker Resources

```bash
# Remove unused images
docker image prune -f

# Remove all unused data (careful!)
docker system prune -f
```

### 11.5 Database Migration

If the schema changes (new Prisma migrations):

```bash
cd /opt/webtruyen
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## 12. Troubleshooting

### Container Won't Start

```bash
# Check which containers are failing
docker compose -f docker-compose.prod.yml ps

# View detailed error logs
docker compose -f docker-compose.prod.yml logs <service-name>

# Rebuild from scratch
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Check connection string
docker compose -f docker-compose.prod.yml exec backend printenv DATABASE_URL
```

### Frontend Build Fails (Out of Memory)

If the VPS has low RAM (< 2GB), the Next.js build may fail:

```bash
# Add swap space
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Then rebuild
docker compose -f docker-compose.prod.yml up -d --build frontend
```

### SSL Certificate Not Working

```bash
# Check if certificates exist
docker run --rm -v webtruyen_certbot-certs:/certs alpine \
  ls -la /certs/live/vivutruyenhay.com/

# If missing, re-run the SSL setup from Section 6
```

### Nginx 502 Bad Gateway

This means Nginx can't reach the backend or frontend:

```bash
# Check if backend and frontend are running
docker compose -f docker-compose.prod.yml ps

# Check backend health
docker compose -f docker-compose.prod.yml exec backend curl http://localhost:5000/health

# Check Docker network
docker network ls
docker network inspect webtruyen_app-network
```

### Reset Everything

```bash
cd /opt/webtruyen

# Stop and remove all containers + volumes (WARNING: destroys database!)
docker compose -f docker-compose.prod.yml down -v

# Rebuild everything
docker compose -f docker-compose.prod.yml up -d --build

# Re-run seed
docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed.js
```

---

## 13. Cập Nhật Schema / Migration Không Mất Dữ Liệu

### 13.1 Quy trình an toàn khi thay đổi Prisma schema

Khi bạn sửa file `backend/prisma/schema.prisma` (thêm bảng, thêm cột, đổi relation...), làm theo quy trình sau để **không mất dữ liệu**:

**Bước 1: Tạo migration ở local (máy dev)**

```bash
# Ở máy dev, trong thư mục backend/
cd backend
npx prisma migrate dev --name ten_migration_cua_ban
```

Lệnh này tạo file migration SQL trong `prisma/migrations/`. Commit và push lên GitHub.

**Bước 2: Deploy migration trên VPS**

```bash
ssh root@103.199.18.123
cd /opt/webtruyen

# Pull code mới (chứa file migration)
git pull origin master

# Chạy migration — CHỈ apply, KHÔNG reset database
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

> **Quan trọng:** Luôn dùng `migrate deploy` trên production, **KHÔNG BAO GIỜ** dùng `migrate dev` hoặc `migrate reset` trên VPS — các lệnh đó sẽ xóa toàn bộ dữ liệu.

**Bước 3: Xác nhận migration thành công**

```bash
# Kiểm tra trạng thái migration
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate status

# Kiểm tra bảng mới có trong DB
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U webtruyen_user -d web_truyen -c "\dt"
```

### 13.2 Rollback migration nếu gặp lỗi

Prisma không có lệnh rollback tự động. Nếu migration lỗi:

```bash
# 1. Backup DB trước (nếu chưa backup)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U webtruyen_user web_truyen > emergency_backup.sql

# 2. Sửa lỗi bằng SQL thủ công
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U webtruyen_user -d web_truyen

# Trong psql shell — ví dụ xóa cột vừa thêm sai:
# ALTER TABLE stories DROP COLUMN IF EXISTS wrong_column;
# \q

# 3. Đánh dấu migration đã resolve
docker compose -f docker-compose.prod.yml exec backend \
  npx prisma migrate resolve --rolled-back "20260227_ten_migration"
```

---

## 14. Restart Không Ảnh Hưởng Website Đang Chạy

### 14.1 Restart từng service (zero-downtime cho người dùng)

```bash
cd /opt/webtruyen

# ✅ AN TOÀN: Restart backend — Nginx sẽ retry, user thấy chậm 1-2 giây
docker compose -f docker-compose.prod.yml restart backend

# ✅ AN TOÀN: Restart frontend — tương tự, Nginx buffer request
docker compose -f docker-compose.prod.yml restart frontend

# ✅ AN TOÀN: Reload Nginx config (không mất connection)
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# ✅ AN TOÀN: Restart Nginx (mất connection ~1 giây)
docker compose -f docker-compose.prod.yml restart nginx
```

### 14.2 Rebuild & deploy code mới không downtime

```bash
cd /opt/webtruyen
git pull origin master

# Rebuild từng service một — service khác vẫn chạy
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend
# Đợi backend healthy (~30s)
sleep 30

docker compose -f docker-compose.prod.yml up -d --build --no-deps frontend
# Đợi frontend build xong (~2-5 phút)

# Reload Nginx để nhận container mới
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

> **Flag quan trọng:** `--no-deps` = chỉ rebuild service đó, KHÔNG restart các service phụ thuộc (postgres, nginx...).

### 14.3 Lệnh NGUY HIỂM — tránh dùng khi web đang chạy

```bash
# ❌ NGUY HIỂM: down -v = XÓA toàn bộ volume (database, uploads, SSL certs)
docker compose -f docker-compose.prod.yml down -v

# ❌ NGUY HIỂM: down = dừng TẤT CẢ container, web offline hoàn toàn
docker compose -f docker-compose.prod.yml down

# ❌ NGUY HIỂM: docker system prune -a = xóa TẤT CẢ images, kể cả đang dùng
docker system prune -a

# ❌ NGUY HIỂM: migrate reset = xóa sạch database
npx prisma migrate reset
```

### 14.4 Kiểm tra volume trước khi thao tác

```bash
# Liệt kê tất cả volumes
docker volume ls

# Xem chi tiết volume database — KHÔNG BAO GIỜ xóa volume này
docker volume inspect webtruyen_postgres_data

# Xem dung lượng volumes
docker system df -v
```

---

## 15. Dọn Rác Trên VPS

### 15.1 Dọn Docker images cũ (an toàn)

```bash
# Xóa images không được container nào sử dụng (dangling images)
docker image prune -f

# Xóa images cũ hơn 30 ngày mà không có container nào dùng
docker image prune -a --filter "until=720h" -f

# Xem dung lượng Docker đang chiếm
docker system df
```

**Output ví dụ:**

```
TYPE            TOTAL    ACTIVE   SIZE      RECLAIMABLE
Images          12       4        3.2GB     1.8GB (56%)
Containers      5        5        120MB     0B (0%)
Build Cache     30       0        500MB     500MB (100%)
```

### 15.2 Dọn build cache

```bash
# Xóa build cache (không ảnh hưởng container đang chạy, nhưng lần build sau sẽ lâu hơn)
docker builder prune -f

# Xóa build cache cũ hơn 7 ngày
docker builder prune --filter "until=168h" -f
```

### 15.3 Dọn container đã dừng

```bash
# Xóa container đã exit (certbot run --rm thường để lại)
docker container prune -f
```

### 15.4 Dọn log files

```bash
# Xem dung lượng log
du -sh /opt/webtruyen/logs/*

# Xóa log Nginx cũ (giữ 7 ngày gần nhất)
find /opt/webtruyen/logs/nginx -name "*.log" -mtime +7 -delete

# Xóa log backend cũ
find /opt/webtruyen/logs/backend -name "*.log" -mtime +7 -delete

# Giới hạn log của Docker container (tránh log phình to)
# Thêm vào /etc/docker/daemon.json:
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker để áp dụng
systemctl restart docker
```

### 15.5 Dọn backup cũ

```bash
# Xóa backup database cũ hơn 30 ngày
find /opt/backups/webtruyen -name "*.sql.gz" -mtime +30 -delete

# Xem dung lượng backup
du -sh /opt/backups/webtruyen/
```

### 15.6 Dọn hệ thống Ubuntu

```bash
# Xóa package cache
apt-get clean
apt-get autoremove -y

# Xóa log hệ thống cũ
journalctl --vacuum-time=7d

# Kiểm tra dung lượng ổ đĩa
df -h

# Tìm thư mục chiếm nhiều dung lượng nhất
du -sh /* 2>/dev/null | sort -rh | head -10
```

### 15.7 Script dọn rác tự động (khuyên dùng)

```bash
cat > /opt/webtruyen/cleanup.sh << 'EOF'
#!/bin/bash
echo "=== VPS Cleanup — $(date) ==="

# Docker cleanup
echo "🐳 Cleaning Docker..."
docker container prune -f
docker image prune -f
docker builder prune --filter "until=168h" -f

# Log cleanup
echo "📝 Cleaning logs..."
find /opt/webtruyen/logs -name "*.log" -mtime +7 -delete

# Old backups
echo "💾 Cleaning old backups..."
find /opt/backups/webtruyen -name "*.sql.gz" -mtime +30 -delete 2>/dev/null

# System
echo "🖥️ Cleaning system..."
apt-get clean -qq
journalctl --vacuum-time=7d --quiet

# Report
echo "📊 Disk usage:"
df -h /
docker system df

echo "=== Cleanup done ==="
EOF

chmod +x /opt/webtruyen/cleanup.sh
```

Thêm vào cron (chạy mỗi Chủ Nhật lúc 4 giờ sáng):

```bash
crontab -e
```

```
0 4 * * 0 /opt/webtruyen/cleanup.sh >> /var/log/webtruyen-cleanup.log 2>&1
```

### 15.8 Tổng hợp Cron Jobs

Sau khi setup đầy đủ, crontab của bạn sẽ trông như thế này:

```
# Backup database — 2 AM hàng ngày
0 2 * * * /opt/webtruyen/backup.sh

# SSL renewal — 3 AM hàng ngày
0 3 * * * /opt/webtruyen/renew-ssl.sh

# Dọn rác — 4 AM mỗi Chủ Nhật
0 4 * * 0 /opt/webtruyen/cleanup.sh >> /var/log/webtruyen-cleanup.log 2>&1
```

---

## Quick Reference

| Command                                                                                        | Description           |
| ---------------------------------------------------------------------------------------------- | --------------------- |
| `docker compose -f docker-compose.prod.yml up -d --build`                                      | Build & start all     |
| `docker compose -f docker-compose.prod.yml down`                                               | Stop all (giữ data)   |
| `docker compose -f docker-compose.prod.yml ps`                                                 | Check status          |
| `docker compose -f docker-compose.prod.yml logs -f`                                            | View logs             |
| `docker compose -f docker-compose.prod.yml restart nginx`                                      | Restart Nginx         |
| `docker compose -f docker-compose.prod.yml up -d --build --no-deps backend`                    | Rebuild chỉ backend   |
| `docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy`             | Chạy migration        |
| `docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed.js`              | Seed DB               |
| `docker compose -f docker-compose.prod.yml exec postgres psql -U webtruyen_user -d web_truyen` | DB shell              |
| `docker image prune -f`                                                                        | Dọn images cũ         |
| `docker system df`                                                                             | Xem dung lượng Docker |
