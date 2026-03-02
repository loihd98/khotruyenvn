"use strict";
/**
 * Unified database seed script.
 * Covers: Users, Genres, AffiliateLinks, Media, Stories, Chapters,
 *         Comments, Bookmarks, FilmCategories, FilmActors, FilmReviews,
 *         FilmComments.
 *
 * Idempotent – safe to run multiple times.
 * Usage:  node src/scripts/seed.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");

const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────

/** slugify that correctly maps Vietnamese đ/Đ → d/D */
function viSlug(str, opts = {}) {
  return slugify(
    str.replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D")),
    { lower: true, ...opts }
  );
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── data ─────────────────────────────────────────────────────────────────────

const CHAPTER_TITLES = [
  "Khởi Đầu Hành Trình",  "Gặp Gỡ Định Mệnh",     "Thử Thách Đầu Tiên",
  "Bí Mật Được Hé Lộ",    "Cuộc Chiến Khốc Liệt",  "Đột Phá Giới Hạn",
  "Người Bạn Mới",         "Kẻ Thù Nguy Hiểm",     "Lựa Chọn Khó Khăn",
  "Chiến Thắng Vẻ Vang",  "Sự Thật Đau Lòng",      "Hy Vọng Mới",
  "Phục Thù",              "Tình Bạn Thắt Chặt",    "Thành Công Rực Rỡ",
  "Tỉnh Ngộ Thần Thông",  "Gặp Gỡ Cao Nhân",       "Tranh Đoạt Bảo Vật",
  "Sinh Tử Một Mình",      "Báo Thù Ân Oán",        "Tình Duyên Lận Đận",
  "Tiến Vào Tuyệt Địa",   "Phát Hiện Âm Mưu",      "Quyết Chiến Sinh Tử",
  "Đại Thắng Mỹ Mãn",     "Chia Tay Bạn Bè",       "Khám Phá Thế Giới Mới",
  "Thần Bí Sư Phụ",        "Tranh Giành Ngôi Vị",  "Tình Yêu Đầu Đời",
  "Thảm Kịch Gia Tộc",    "Hồi Sinh Từ Tro Tàn",  "Chinh Phục Thiên Hạ",
  "Đại Kết Cục",
];

const STORY_COMMENTS = [
  "Chương này hay quá! Mong tác giả cập nhật sớm!",
  "Cảm ơn tác giả đã mang đến câu chuyện tuyệt vời.",
  "Không thể chờ đợi chương tiếp theo được!",
  "Nhân vật chính thật tuyệt vời!",
  "Cốt truyện rất hấp dẫn và cuốn hút.",
  "Tôi đã đọc suốt đêm, không thể ngừng được!",
  "Rất mong được đọc tiếp phần sau.",
  "Câu chuyện ngày càng thú vị!",
];

const FILM_COMMENTS = [
  "Phim hay quá! Recommend cho mọi người.",
  "Xem rồi, cảm động lắm luôn 😭",
  "Diễn viên đóng xuất sắc!",
  "Mình đã xem 3 lần rồi vẫn thấy hay.",
  "Cốt truyện rất ấn tượng, không đoán trước được.",
  "Phim ảnh đẹp, âm nhạc tuyệt vời!",
  "Tối nay đi xem ngay!",
  "Cho mình hỏi phim này chiếu ở đâu vậy?",
  "Review rất chi tiết, cảm ơn admin!",
  "Mấy phim này hay nha mọi người, nhớ xem nhé.",
];

function generateChapterContent(title) {
  return `# ${title}

Đây là nội dung của chương truyện. Trong chương này, nhân vật chính sẽ trải qua những thử thách mới và khám phá ra những bí mật thú vị.

## Phần 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Phần 2

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

---

*Hẹn gặp lại trong chương tiếp theo!*`;
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // ══════════════════════════════
  //  1. USERS
  // ══════════════════════════════
  console.log("👤 Seeding users...");

  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@webtruyen.com" },
    update: {},
    create: {
      email: "admin@webtruyen.com",
      passwordHash: adminPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash("user123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: userPassword,
      name: "Demo User",
      role: "USER",
    },
  });

  console.log(`   ✅ admin@webtruyen.com / admin123456`);
  console.log(`   ✅ user@example.com   / user123456`);

  // ══════════════════════════════
  //  2. GENRES
  // ══════════════════════════════
  console.log("\n🏷️  Seeding genres...");

  const genreNames = [
    "Tiên Hiệp",   // 0
    "Đô Thị",      // 1
    "Huyền Huyễn", // 2
    "Kiếm Hiệp",   // 3
    "Ngôn Tình",   // 4
    "Quan Trường", // 5
    "Lịch Sử",     // 6
    "Khoa Huyễn",  // 7
    "Trinh Thám",  // 8
    "Võng Du",     // 9
  ];

  const genres = [];
  for (const name of genreNames) {
    const slug = viSlug(name);
    const genre = await prisma.genre.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    genres.push(genre);
    console.log(`   ✅ ${genre.name} (${genre.slug})`);
  }

  // ══════════════════════════════
  //  3. AFFILIATE LINKS
  // ══════════════════════════════
  console.log("\n🔗 Seeding affiliate links...");

  const affiliateLinkData = [
    {
      provider: "Google Drive",
      targetUrl: "https://drive.google.com/drive/folders/example1",
      label: "Tải từ Google Drive",
      description: "Link tải chính từ Google Drive với tốc độ cao",
      isActive: true,
    },
    {
      provider: "Fshare",
      targetUrl: "https://www.fshare.vn/file/example2",
      label: "Tải từ Fshare",
      description: "Link tải dự phòng từ Fshare",
      isActive: true,
    },
    {
      provider: "Mega",
      targetUrl: "https://mega.nz/file/example3",
      label: "Tải từ Mega",
      description: "Link tải từ Mega.nz an toàn",
      isActive: true,
    },
    {
      provider: "MediaFire",
      targetUrl: "https://www.mediafire.com/file/example4",
      label: "Tải từ MediaFire",
      description: "Link tải từ MediaFire tốc độ ổn định",
      isActive: true,
    },
    {
      provider: "Dropbox",
      targetUrl: "https://www.dropbox.com/s/example5",
      label: "Tải từ Dropbox",
      description: "Link tải từ Dropbox bảo mật cao",
      isActive: false,
    },
    {
      provider: "Netflix",
      targetUrl: "https://www.netflix.com/vn/",
      label: "Xem trên Netflix",
      description: "Xem phim chất lượng cao trên Netflix",
      isActive: true,
    },
    {
      provider: "FPT Play",
      targetUrl: "https://fptplay.vn/",
      label: "Xem trên FPT Play",
      description: "Xem phim miễn phí trên FPT Play",
      isActive: true,
    },
    {
      provider: "Galaxy Cinema",
      targetUrl: "https://www.galaxycine.vn/",
      label: "Đặt vé Galaxy",
      description: "Đặt vé xem phim tại Galaxy Cinema",
      isActive: true,
    },
  ];

  const affiliateLinks = [];
  for (const data of affiliateLinkData) {
    let link = await prisma.affiliateLink.findFirst({
      where: { provider: data.provider, targetUrl: data.targetUrl },
    });
    if (!link) {
      link = await prisma.affiliateLink.create({ data });
    }
    affiliateLinks.push(link);
    console.log(`   ✅ ${link.provider}`);
  }

  const activeLinks = affiliateLinks.filter((l) => l.isActive);

  // ══════════════════════════════
  //  4. MEDIA FILES
  // ══════════════════════════════
  console.log("\n📁 Seeding media files...");

  const mediaData = [
    {
      filename: "sample-image-1.jpg",
      originalName: "Ảnh bìa truyện 1.jpg",
      mimeType: "image/jpeg",
      size: 245760,
      url: "/uploads/image/sample-image-1.jpg",
      type: "image",
      isActive: true,
    },
    {
      filename: "sample-image-2.png",
      originalName: "Ảnh bìa truyện 2.png",
      mimeType: "image/png",
      size: 512000,
      url: "/uploads/image/sample-image-2.png",
      type: "image",
      isActive: true,
    },
    {
      filename: "sample-audio-1.mp3",
      originalName: "Chương 1 - Khởi đầu.mp3",
      mimeType: "audio/mpeg",
      size: 5242880,
      url: "/uploads/audio/sample-audio-1.mp3",
      type: "audio",
      isActive: true,
    },
    {
      filename: "sample-audio-2.mp3",
      originalName: "Chương 2 - Gặp gỡ.mp3",
      mimeType: "audio/mpeg",
      size: 4718592,
      url: "/uploads/audio/sample-audio-2.mp3",
      type: "audio",
      isActive: true,
    },
    {
      filename: "old-image.jpg",
      originalName: "Ảnh cũ không dùng.jpg",
      mimeType: "image/jpeg",
      size: 102400,
      url: "/uploads/image/old-image.jpg",
      type: "image",
      isActive: false,
    },
  ];

  const mediaFiles = [];
  for (const data of mediaData) {
    let media = await prisma.media.findFirst({ where: { filename: data.filename } });
    if (!media) {
      media = await prisma.media.create({ data });
    }
    mediaFiles.push(media);
    console.log(`   ✅ ${media.filename}`);
  }

  const activeAudioFiles = mediaFiles.filter(
    (m) => m.type === "audio" && m.isActive
  );

  // ══════════════════════════════
  //  5. STORIES
  // ══════════════════════════════
  console.log("\n📚 Seeding stories...");

  const storyData = [
    {
      title: "Đấu Phá Thương Khung",
      description:
        "Thiếu niên tài ba, đánh mất đấu khí bỗng chốc trở thành phế vật của gia tộc. Nhưng với sự giúp đỡ của Dược Lão, cậu bắt đầu con đường tu luyện gian khó nhưng đầy hào hùng...",
      type: "TEXT",
      thumbnailUrl: "/uploads/image/sample-image-1.jpg",
      genreIndexes: [0, 2], // Tiên Hiệp, Huyền Huyễn
    },
    {
      title: "Tôi Là Đại Thần Tiên",
      description:
        "Trọng sinh về thời đại tu tiên, với kiến thức hiện đại chinh phục thế giới tu tiên. Từ một kẻ phế vật trở thành đại thần tiên làm chấn động ba giới...",
      type: "AUDIO",
      thumbnailUrl: "/uploads/image/sample-image-2.png",
      genreIndexes: [0], // Tiên Hiệp
    },
    {
      title: "Toàn Chức Pháp Sư",
      description:
        "Phép thuật và công nghệ kết hợp, mở ra một thế giới hoàn toàn mới. Trong thế giới mà ma pháp là tất cả, làm thế nào để trở thành pháp sư mạnh nhất?",
      type: "TEXT",
      thumbnailUrl: "/uploads/image/sample-image-1.jpg",
      genreIndexes: [2, 7], // Huyền Huyễn, Khoa Huyễn
    },
    {
      title: "Thần Hôn",
      description:
        "Câu chuyện tình yêu giữa thần tiên và con người, vượt qua mọi thử thách của số phận để đến với nhau. Một cuộc tình bất diệt xuyên suốt ba sinh ba thế...",
      type: "AUDIO",
      thumbnailUrl: "/uploads/image/sample-image-2.png",
      genreIndexes: [0, 4], // Tiên Hiệp, Ngôn Tình
    },
    {
      title: "Đô Thị Tu Tiên",
      description:
        "Tu tiên trong thời đại hiện đại, khi thần thông gặp gỡ công nghệ. Liệu có thể tu luyện thành tiên trong thế giới đầy ô nhiễm này?",
      type: "TEXT",
      thumbnailUrl: "/uploads/image/sample-image-1.jpg",
      genreIndexes: [1, 0], // Đô Thị, Tiên Hiệp
    },
    {
      title: "Thiên Tài Lập Trình Viên",
      description:
        "Từ một lập trình viên bình thường trở thành thiên tài công nghệ, xây dựng đế chế kinh doanh và chinh phục thế giới số...",
      type: "TEXT",
      thumbnailUrl: "/uploads/image/sample-image-2.png",
      genreIndexes: [1, 7], // Đô Thị, Khoa Huyễn
    },
  ];

  const stories = [];
  for (const data of storyData) {
    const slug = viSlug(data.title);
    const story = await prisma.story.upsert({
      where: { slug },
      update: {
        description: data.description,
        type: data.type,
        thumbnailUrl: data.thumbnailUrl,
      },
      create: {
        title: data.title,
        slug,
        description: data.description,
        type: data.type,
        thumbnailUrl: data.thumbnailUrl,
        authorId: admin.id,
        affiliateId: pick(activeLinks).id,
        viewCount: randomInt(100, 10000),
        genres: {
          connect: data.genreIndexes.map((i) => ({ id: genres[i].id })),
        },
      },
    });
    stories.push(story);
    console.log(`   ✅ ${story.title} [${story.type}]`);
  }

  // ══════════════════════════════
  //  6. CHAPTERS
  // ══════════════════════════════
  console.log("\n📖 Seeding chapters...");

  let totalChapters = 0;
  for (const story of stories) {
    const count = randomInt(15, 45);
    for (let i = 1; i <= count; i++) {
      const title = `Chương ${i}: ${pick(CHAPTER_TITLES)}`;
      const audioUrl =
        story.type === "AUDIO" && activeAudioFiles.length > 0
          ? activeAudioFiles[i % activeAudioFiles.length].url
          : null;
      const affiliateId =
        Math.random() > 0.4 ? pick(activeLinks).id : null;

      await prisma.chapter.upsert({
        where: { storyId_number: { storyId: story.id, number: i } },
        update: { title, audioUrl, affiliateId },
        create: {
          number: i,
          title,
          content: story.type === "TEXT" ? generateChapterContent(title) : null,
          audioUrl,
          isLocked: i > 3,
          storyId: story.id,
          affiliateId,
        },
      });
      totalChapters++;
    }
  }
  console.log(`   ✅ ${totalChapters} chapters across ${stories.length} stories`);

  // ══════════════════════════════
  //  7. STORY COMMENTS
  // ══════════════════════════════
  console.log("\n💬 Seeding story comments...");

  let storyCommentCount = 0;
  for (const story of stories) {
    const chapters = await prisma.chapter.findMany({
      where: { storyId: story.id },
      take: 3,
    });
    for (const chapter of chapters) {
      await prisma.comment.create({
        data: {
          content: pick(STORY_COMMENTS),
          isApproved: true,
          userId: demoUser.id,
          chapterId: chapter.id,
        },
      });
      await prisma.comment.create({
        data: {
          content: "Cảm ơn bạn đã đọc! Chúc bạn có những giây phút thư giãn tuyệt vời.",
          isApproved: true,
          userId: admin.id,
          chapterId: chapter.id,
        },
      });
      storyCommentCount += 2;
    }
  }
  console.log(`   ✅ ${storyCommentCount} story comments`);

  // ══════════════════════════════
  //  8. BOOKMARKS
  // ══════════════════════════════
  console.log("\n🔖 Seeding bookmarks...");

  for (const story of stories.slice(0, 2)) {
    try {
      await prisma.bookmark.create({
        data: { userId: demoUser.id, storyId: story.id },
      });
    } catch {
      // already exists (unique constraint)
    }
  }
  console.log(`   ✅ 2 bookmarks for demo user`);

  // ══════════════════════════════
  //  9. FILM CATEGORIES
  // ══════════════════════════════
  console.log("\n🎭 Seeding film categories...");

  const filmCategoryNames = [
    "Hành Động",              // 0
    "Kinh Dị",                // 1
    "Hài Hước",               // 2
    "Tình Cảm",               // 3
    "Khoa Học Viễn Tưởng",    // 4
    "Hoạt Hình",              // 5
    "Phiêu Lưu",              // 6
    "Tâm Lý",                 // 7
    "Chiến Tranh",            // 8
    "Tài Liệu",               // 9
  ];

  const filmCategories = [];
  for (const name of filmCategoryNames) {
    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });
    const category = await prisma.filmCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    filmCategories.push(category);
    console.log(`   ✅ ${category.name}`);
  }

  // ══════════════════════════════
  //  10. FILM ACTORS
  // ══════════════════════════════
  console.log("\n🎬 Seeding film actors...");

  const actorData = [
    { name: "Trấn Thành",            avatar: null }, // 0
    { name: "Ngô Thanh Vân",         avatar: null }, // 1
    { name: "Trường Giang",          avatar: null }, // 2
    { name: "Lý Hải",                avatar: null }, // 3
    { name: "Ninh Dương Lan Ngọc",   avatar: null }, // 4
    { name: "Kaity Nguyễn",          avatar: null }, // 5
    { name: "Kiều Minh Tuấn",        avatar: null }, // 6
    { name: "Thu Trang",             avatar: null }, // 7
    { name: "Hồng Đào",              avatar: null }, // 8
    { name: "Tuấn Trần",             avatar: null }, // 9
    { name: "Robert Downey Jr.",     avatar: null }, // 10
    { name: "Chris Evans",           avatar: null }, // 11
    { name: "Scarlett Johansson",    avatar: null }, // 12
    { name: "Keanu Reeves",          avatar: null }, // 13
    { name: "Timothée Chalamet",     avatar: null }, // 14
  ];

  const actors = [];
  for (const data of actorData) {
    const slug = slugify(data.name, { lower: true, strict: true, locale: "vi" });
    const actor = await prisma.filmActor.upsert({
      where: { slug },
      update: {},
      create: { name: data.name, slug, avatar: data.avatar },
    });
    actors.push(actor);
    console.log(`   ✅ ${actor.name}`);
  }

  // ══════════════════════════════
  //  11. FILM REVIEWS
  // ══════════════════════════════
  console.log("\n🎬 Seeding film reviews...");

  const filmReviewData = [
    {
      title: "Mai - Câu Chuyện Tình Yêu Đầy Nước Mắt",
      description: `"Mai" là bộ phim điện ảnh Việt Nam do Trấn Thành đạo diễn, kể về cuộc đời đầy biến cố của một cô gái trẻ mang tên Mai. Phim xoay quanh câu chuyện tình yêu giữa Mai và Dương - một chàng trai phong lưu bị cuốn vào vòng xoáy cảm xúc không thể cưỡng lại.

Với diễn xuất xuất sắc của dàn diễn viên, đặc biệt là Phương Anh Đào trong vai Mai, phim đã chạm đến trái tim hàng triệu khán giả. Câu chuyện không chỉ là về tình yêu mà còn là về sự hy sinh, lòng tự trọng và ước mơ của người phụ nữ Việt Nam.

Phần hình ảnh được quay rất đẹp, âm nhạc phù hợp tạo nên tổng thể hoàn hảo. Đây là một trong những bộ phim Việt đáng xem nhất trong năm.`,
      rating: 8.5,
      reviewLink: "https://www.youtube.com/watch?v=mai-review",
      tags: ["phim-viet", "tinh-cam", "tran-thanh", "dien-anh-2024"],
      status: "PUBLISHED",
      categoryIndexes: [3, 7],  // Tình Cảm, Tâm Lý
      actorIndexes: [0, 4],     // Trấn Thành, Ninh Dương Lan Ngọc
      viewCount: 15230,
    },
    {
      title: "Lật Mặt 7: Một Điều Ước - Kỷ Lục Phòng Vé",
      description: `Lật Mặt 7 tiếp tục thành công của franchise Lật Mặt với câu chuyện cảm động về gia đình. Lý Hải một lần nữa chứng minh tài năng đạo diễn với phim doanh thu kỷ lục.

Bộ phim xoay quanh câu chuyện về một gia đình nghèo ở miền Tây Nam Bộ, nơi người cha già phải đối mặt với những lựa chọn khắc nghiệt để bảo vệ gia đình. Câu chuyện giản dị nhưng đầy xúc động.

Điểm mạnh của phim là diễn xuất tự nhiên và cảm xúc chân thật, cùng với bối cảnh miền Tây đẹp mắt. Phim đã lập kỷ lục phòng vé Việt Nam với doanh thu vượt mốc 500 tỷ đồng.`,
      rating: 7.8,
      reviewLink: "https://www.youtube.com/watch?v=lat-mat-7",
      tags: ["phim-viet", "gia-dinh", "ly-hai", "ky-luc-phong-ve"],
      status: "PUBLISHED",
      categoryIndexes: [3, 6],  // Tình Cảm, Phiêu Lưu
      actorIndexes: [3, 6],     // Lý Hải, Kiều Minh Tuấn
      viewCount: 23450,
    },
    {
      title: "Avengers: Doomsday - Siêu Phẩm Marvel Trở Lại",
      description: `Marvel Studios đã chính thức công bố Avengers: Doomsday, đánh dấu sự trở lại đầy bất ngờ của Robert Downey Jr. trong vai trò mới.

Phim hứa hẹn sẽ là bom tấn lớn nhất của MCU Phase 6, với sự tham gia của dàn siêu anh hùng hùng hậu. Câu chuyện xoay quanh mối đe dọa mới - Doctor Doom, một trong những villain mạnh nhất lịch sử Marvel.

Đạo diễn Anthony và Joe Russo quay trở lại chỉ đạo, mang theo kinh nghiệm từ Infinity War và Endgame. Fan Marvel trên toàn thế giới đang vô cùng háo hức.`,
      rating: 9.0,
      reviewLink: "https://www.youtube.com/watch?v=avengers-doomsday",
      tags: ["marvel", "avengers", "sieu-anh-hung", "mcu", "hollywood"],
      status: "PUBLISHED",
      categoryIndexes: [0, 4, 6], // Hành Động, KHVT, Phiêu Lưu
      actorIndexes: [10, 11, 12], // Robert, Chris, Scarlett
      viewCount: 45670,
    },
    {
      title: "Dune: Part Two - Sử Thi Khoa Học Viễn Tưởng",
      description: `Dune: Part Two là sự tiếp nối hoàn hảo cho phần đầu tiên, đưa khán giả vào hành trình chinh phục sa mạc Arrakis đầy cam go.

Timothée Chalamet tiếp tục thể hiện xuất sắc vai Paul Atreides, với sự phát triển nhân vật sâu sắc hơn. Phần hình ảnh và âm nhạc của Hans Zimmer vẫn đẹp đến nghẹt thở.

Đạo diễn Denis Villeneuve đã tạo nên một kiệt tác điện ảnh thực sự, kết hợp hoàn hảo giữa action, drama và triết lý. Đây chắc chắn là một trong những phim hay nhất năm.`,
      rating: 9.2,
      reviewLink: "https://www.youtube.com/watch?v=dune-part-two",
      tags: ["khoa-hoc-vien-tuong", "su-thi", "hollywood", "oscar"],
      status: "PUBLISHED",
      categoryIndexes: [0, 4, 6], // Hành Động, KHVT, Phiêu Lưu
      actorIndexes: [14],         // Timothée
      viewCount: 38920,
    },
    {
      title: "John Wick: Chapter 4 - Hành Động Đỉnh Cao",
      description: `John Wick 4 mang đến những pha hành động mãn nhãn nhất trong toàn bộ franchise. Keanu Reeves một lần nữa khẳng định vị trí của mình trong dòng phim hành động.

Phim kéo dài gần 3 tiếng nhưng không có phút giây nào nhàm chán. Các cảnh chiến đấu được biên đạo sáng tạo, đặc biệt là trận đánh ở Paris với góc quay top-down ấn tượng.

Đây là phần kết hoàn hảo cho hành trình của John Wick, với cái kết đầy bất ngờ và xúc động.`,
      rating: 8.7,
      reviewLink: "https://www.youtube.com/watch?v=john-wick-4",
      tags: ["hanh-dong", "keanu-reeves", "john-wick", "hollywood"],
      status: "PUBLISHED",
      categoryIndexes: [0, 6],  // Hành Động, Phiêu Lưu
      actorIndexes: [13],       // Keanu
      viewCount: 29340,
    },
    {
      title: "Nhà Bà Nữ - Hài Kịch Gia Đình Siêu Vui",
      description: `Nhà Bà Nữ tiếp tục thành công của dòng phim hài gia đình Việt Nam, với sự kết hợp ăn ý giữa Trấn Thành, Lê Giang và dàn diễn viên tài năng.

Phim kể về cuộc sống hài hước và cảm động của một gia đình ba thế hệ sống chung dưới một mái nhà. Những tình huống dở khóc dở cười nhưng ẩn chứa bài học sâu sắc về tình thân.

Điểm cộng lớn nhất của phim là diễn xuất tự nhiên và lời thoại dí dỏm góp phần tạo nên tiếng cười sảng khoái cho khán giả.`,
      rating: 7.5,
      reviewLink: "https://www.youtube.com/watch?v=nha-ba-nu",
      tags: ["phim-viet", "hai", "gia-dinh", "tran-thanh"],
      status: "PUBLISHED",
      categoryIndexes: [2, 3],  // Hài Hước, Tình Cảm
      actorIndexes: [0, 7, 8],  // Trấn Thành, Thu Trang, Hồng Đào
      viewCount: 18760,
    },
    {
      title: "Suzume - Kiệt Tác Anime Nhật Bản",
      description: `Suzume của đạo diễn Makoto Shinkai là một tác phẩm anime tuyệt đẹp về hành trình khám phá bản thân và cứu rỗi thế giới.

Câu chuyện xoay quanh cô gái Suzume phải đóng lại những cánh cửa bí ẩn mở ra thảm họa. Hình ảnh lung linh, âm nhạc cảm xúc và cốt truyện sâu sắc.

Đây là phim anime hay nhất của Shinkai kể từ Your Name, với doanh thu toàn cầu ấn tượng.`,
      rating: 8.3,
      reviewLink: "https://www.youtube.com/watch?v=suzume-review",
      tags: ["anime", "nhat-ban", "hoat-hinh", "shinkai"],
      status: "PUBLISHED",
      categoryIndexes: [5, 6],  // Hoạt Hình, Phiêu Lưu
      actorIndexes: [],
      viewCount: 21540,
    },
    {
      title: "Oppenheimer - Phim Tiểu Sử Hấp Dẫn",
      description: `Christopher Nolan đã tạo nên một kiệt tác điện ảnh với Oppenheimer. Phim kể lại câu chuyện về cha đẻ bom nguyên tử J. Robert Oppenheimer.

Diễn xuất xuất sắc của toàn bộ dàn cast, đặc biệt Cillian Murphy đã xứng đáng nhận giải Oscar. Phần âm thanh và hình ảnh được thiết kế tinh tế.

Một bộ phim đầy triết lý về trách nhiệm đối với khoa học và nhân loại.`,
      rating: 9.0,
      reviewLink: "https://www.youtube.com/watch?v=oppenheimer-review",
      tags: ["oscar", "tieu-su", "chien-tranh", "christopher-nolan"],
      status: "PUBLISHED",
      categoryIndexes: [7, 8, 9], // Tâm Lý, Chiến Tranh, Tài Liệu
      actorIndexes: [],
      viewCount: 35210,
    },
    {
      title: "Tiệc Trăng Máu - Bí Mật Sau Bữa Tiệc",
      description: `Tiệc Trăng Máu là phim remake Việt từ Perfect Strangers. Câu chuyện xoay quanh một bữa tiệc nơi các cặp đôi đồng ý chia sẻ mọi tin nhắn và cuộc gọi.

Thu Trang, Kiều Minh Tuấn và dàn cast đã tạo nên những khoảnh khắc vô cùng hài hước và đầy kịch tính.`,
      rating: 7.2,
      reviewLink: "https://www.youtube.com/watch?v=tiec-trang-mau",
      tags: ["phim-viet", "hai", "tam-ly", "remake"],
      status: "PUBLISHED",
      categoryIndexes: [2, 7],  // Hài Hước, Tâm Lý
      actorIndexes: [6, 7, 4],  // Kiều Minh Tuấn, Thu Trang, Ninh Dương
      viewCount: 12340,
    },
    {
      title: "Spider-Man: Across the Spider-Verse - Đỉnh Cao Hoạt Hình",
      description: `Phần tiếp theo của Into the Spider-Verse không chỉ giữ được phong độ mà còn vượt xa kỳ vọng. Hình ảnh đẹp đến kinh ngạc với nhiều phong cách nghệ thuật khác nhau.

Miles Morales tiếp tục hành trình trở thành Spider-Man, đối mặt với mối đe dọa đa vũ trụ. Cốt truyện phức tạp nhưng hấp dẫn.`,
      rating: 9.1,
      reviewLink: "https://www.youtube.com/watch?v=spider-verse-2",
      tags: ["hoat-hinh", "marvel", "spider-man", "da-vu-tru"],
      status: "PUBLISHED",
      categoryIndexes: [0, 5, 6], // Hành Động, Hoạt Hình, Phiêu Lưu
      actorIndexes: [],
      viewCount: 42100,
    },
    {
      title: "The Batman 2 - Kỵ Sĩ Bóng Đêm Trở Lại (Sắp Ra Mắt)",
      description: `The Batman phần 2 đang trong giai đoạn sản xuất. Tin đồn về villain mới và cốt truyện noir đen tối hơn. Robert Pattinson tiếp tục vai Bruce Wayne.

Chúng tôi sẽ cập nhật review đầy đủ khi phim ra mắt.`,
      rating: 0,
      reviewLink: "https://www.youtube.com/watch?v=the-batman-2",
      tags: ["dc", "batman", "sap-ra-mat"],
      status: "DRAFT",
      categoryIndexes: [0, 7],  // Hành Động, Tâm Lý
      actorIndexes: [],
      viewCount: 0,
    },
    {
      title: "Đất Rừng Phương Nam - Phiên Bản Điện Ảnh",
      description: `Bộ phim chuyển thể từ tiểu thuyết nổi tiếng của Đoàn Giỏi, đưa khán giả trở lại vùng đất phương Nam với những câu chuyện tuổi thơ đầy mộng mơ.

Hình ảnh thiên nhiên miền Tây tuyệt đẹp, âm nhạc mang đậm dấu ấn dân gian. Dàn diễn viên trẻ diễn xuất rất tự nhiên và đáng yêu.`,
      rating: 7.0,
      reviewLink: "https://www.youtube.com/watch?v=dat-rung-phuong-nam",
      tags: ["phim-viet", "phieu-luu", "lich-su", "mien-tay"],
      status: "PUBLISHED",
      categoryIndexes: [6, 3],  // Phiêu Lưu, Tình Cảm
      actorIndexes: [9],        // Tuấn Trần
      viewCount: 16780,
    },
  ];

  const filmReviews = [];
  for (const data of filmReviewData) {
    const slug = slugify(data.title, { lower: true, strict: true, locale: "vi" });
    const existing = await prisma.filmReview.findUnique({ where: { slug } });

    if (existing) {
      console.log(`   ⏭️  "${data.title}" – already exists`);
      filmReviews.push(existing);
      continue;
    }

    const review = await prisma.filmReview.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        rating: data.rating,
        reviewLink: data.reviewLink,
        tags: data.tags,
        status: data.status,
        viewCount: data.viewCount,
        authorId: admin.id,
        affiliateId: Math.random() > 0.2 ? pick(activeLinks).id : null,
        categories: {
          connect: data.categoryIndexes.map((i) => ({ id: filmCategories[i].id })),
        },
        actors:
          data.actorIndexes.length > 0
            ? { connect: data.actorIndexes.map((i) => ({ id: actors[i].id })) }
            : undefined,
      },
    });
    filmReviews.push(review);
    console.log(`   ✅ "${review.title}" [${review.status}]`);
  }

  // ══════════════════════════════
  //  12. FILM COMMENTS
  // ══════════════════════════════
  console.log("\n💬 Seeding film comments...");

  const publishedReviews = filmReviews.filter((r) => r.status === "PUBLISHED");
  let filmCommentCount = 0;

  for (const review of publishedReviews.slice(0, 8)) {
    const numComments = randomInt(1, 4);
    for (let i = 0; i < numComments; i++) {
      const comment = await prisma.filmComment.create({
        data: {
          content: pick(FILM_COMMENTS),
          isApproved: Math.random() > 0.2,
          userId: Math.random() > 0.5 ? demoUser.id : admin.id,
          filmReviewId: review.id,
        },
      });
      filmCommentCount++;

      if (Math.random() > 0.6) {
        await prisma.filmComment.create({
          data: {
            content: "Cảm ơn bạn đã chia sẻ! 😊",
            isApproved: true,
            userId: admin.id,
            filmReviewId: review.id,
            parentId: comment.id,
          },
        });
        filmCommentCount++;
      }
    }
  }
  console.log(`   ✅ ${filmCommentCount} film comments`);

  // ══════════════════════════════
  //  SUMMARY
  // ══════════════════════════════
  console.log("\n✅ Database seeded successfully!");
  console.log("─────────────────────────────────");
  console.log(`👤 Users        : 2 (admin + demo)`);
  console.log(`🏷️  Genres       : ${genres.length}`);
  console.log(`🔗 Aff. links   : ${affiliateLinks.length}`);
  console.log(`📁 Media files  : ${mediaFiles.length}`);
  console.log(`📚 Stories      : ${stories.length}`);
  console.log(`📖 Chapters     : ${totalChapters}`);
  console.log(`💬 Story cmts   : ${storyCommentCount}`);
  console.log(`🎭 Film cats    : ${filmCategories.length}`);
  console.log(`🎬 Film actors  : ${actors.length}`);
  console.log(`🎞️  Film reviews : ${filmReviews.length}`);
  console.log(`💬 Film cmts    : ${filmCommentCount}`);
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
