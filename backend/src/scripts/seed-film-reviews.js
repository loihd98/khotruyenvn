const { PrismaClient } = require("@prisma/client");
const slugify = require("slugify");

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Seeding film reviews data...");

  // Get or create admin user for authoring
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("❌ No admin user found. Run the main seed first.");
    process.exit(1);
  }

  // Get existing affiliate links
  const affiliateLinks = await prisma.affiliateLink.findMany({
    where: { isActive: true },
  });

  // Create additional affiliate links for films if none exist
  let filmAffiliateLinks = affiliateLinks;
  if (affiliateLinks.length === 0) {
    const newLinks = [
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

    for (const linkData of newLinks) {
      const link = await prisma.affiliateLink.create({ data: linkData });
      filmAffiliateLinks.push(link);
    }
    console.log(`🔗 Created ${newLinks.length} affiliate links for films`);
  }

  // ===== Create Film Categories =====
  const categoryNames = [
    "Hành Động",
    "Kinh Dị",
    "Hài Hước",
    "Tình Cảm",
    "Khoa Học Viễn Tưởng",
    "Hoạt Hình",
    "Phiêu Lưu",
    "Tâm Lý",
    "Chiến Tranh",
    "Tài Liệu",
  ];

  const createdCategories = [];
  for (const name of categoryNames) {
    const slug = slugify(name, { lower: true, strict: true, locale: "vi" });
    const category = await prisma.filmCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    createdCategories.push(category);
  }
  console.log(`🏷️ Created/found ${createdCategories.length} film categories`);

  // ===== Create Film Actors =====
  const actorData = [
    { name: "Trấn Thành", avatar: null },
    { name: "Ngô Thanh Vân", avatar: null },
    { name: "Trường Giang", avatar: null },
    { name: "Lý Hải", avatar: null },
    { name: "Ninh Dương Lan Ngọc", avatar: null },
    { name: "Kaity Nguyễn", avatar: null },
    { name: "Kiều Minh Tuấn", avatar: null },
    { name: "Thu Trang", avatar: null },
    { name: "Hồng Đào", avatar: null },
    { name: "Tuấn Trần", avatar: null },
    { name: "Robert Downey Jr.", avatar: null },
    { name: "Chris Evans", avatar: null },
    { name: "Scarlett Johansson", avatar: null },
    { name: "Keanu Reeves", avatar: null },
    { name: "Timothée Chalamet", avatar: null },
  ];

  const createdActors = [];
  for (const actor of actorData) {
    const slug = slugify(actor.name, {
      lower: true,
      strict: true,
      locale: "vi",
    });
    const created = await prisma.filmActor.upsert({
      where: { slug },
      update: {},
      create: { name: actor.name, slug, avatar: actor.avatar },
    });
    createdActors.push(created);
  }
  console.log(`🎭 Created/found ${createdActors.length} actors`);

  // ===== Create Film Reviews =====
  const filmReviews = [
    {
      title: "Mai - Câu Chuyện Tình Yêu Đầy Nước Mắt",
      description: `"Mai" là bộ phim điện ảnh Việt Nam do Trấn Thành đạo diễn, kể về cuộc đời đầy biến cố của một cô gái trẻ mang tên Mai. Phim xoay quanh câu chuyện tình yêu giữa Mai và Dương - một chàng trai phong lưu bị cuốn vào vòng xoáy cảm xúc không thể cưỡng lại.

Với diễn xuất xuất sắc của dàn diễn viên, đặc biệt là Phương Anh Đào trong vai Mai, phim đã chạm đến trái tim hàng triệu khán giả. Câu chuyện không chỉ là về tình yêu mà còn là về sự hy sinh, lòng tự trọng và ước mơ của người phụ nữ Việt Nam.

Phần hình ảnh được quay rất đẹp, âm nhạc phù hợp tạo nên tổng thể hoàn hảo. Đây là một trong những bộ phim Việt đáng xem nhất trong năm.`,
      rating: 8.5,
      reviewLink: "https://www.youtube.com/watch?v=mai-review",
      tags: ["phim-viet", "tinh-cam", "tran-thanh", "dien-anh-2024"],
      status: "PUBLISHED",
      categoryIndexes: [3, 7], // Tình Cảm, Tâm Lý
      actorIndexes: [0, 4], // Trấn Thành, Ninh Dương Lan Ngọc
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
      categoryIndexes: [3, 6], // Tình Cảm, Phiêu Lưu
      actorIndexes: [3, 6], // Lý Hải, Kiều Minh Tuấn
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
      actorIndexes: [14], // Timothée
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
      categoryIndexes: [0, 6], // Hành Động, Phiêu Lưu
      actorIndexes: [13], // Keanu
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
      categoryIndexes: [2, 3], // Hài Hước, Tình Cảm
      actorIndexes: [0, 7, 8], // Trấn Thành, Thu Trang, Hồng Đào
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
      categoryIndexes: [5, 6], // Hoạt Hình, Phiêu Lưu
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
      categoryIndexes: [2, 7], // Hài Hước, Tâm Lý
      actorIndexes: [6, 7, 4], // Kiều Minh Tuấn, Thu Trang, Ninh Dương
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
      categoryIndexes: [0, 7], // Hành Động, Tâm Lý
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
      categoryIndexes: [6, 3], // Phiêu Lưu, Tình Cảm
      actorIndexes: [9], // Tuấn Trần
      viewCount: 16780,
    },
  ];

  const createdReviews = [];
  for (const reviewData of filmReviews) {
    const slug = slugify(reviewData.title, {
      lower: true,
      strict: true,
      locale: "vi",
    });

    // Check if already exists
    const existing = await prisma.filmReview.findUnique({ where: { slug } });
    if (existing) {
      console.log(
        `   ⏭️ Review "${reviewData.title}" already exists, skipping`,
      );
      createdReviews.push(existing);
      continue;
    }

    // Pick a random affiliate link (80% chance)
    const affiliateId =
      Math.random() > 0.2 && filmAffiliateLinks.length > 0
        ? filmAffiliateLinks[
            Math.floor(Math.random() * filmAffiliateLinks.length)
          ].id
        : null;

    const connectCategories = reviewData.categoryIndexes
      .filter((i) => i < createdCategories.length)
      .map((i) => ({ id: createdCategories[i].id }));

    const connectActors = reviewData.actorIndexes
      .filter((i) => i < createdActors.length)
      .map((i) => ({ id: createdActors[i].id }));

    const review = await prisma.filmReview.create({
      data: {
        title: reviewData.title,
        slug,
        description: reviewData.description,
        rating: reviewData.rating,
        reviewLink: reviewData.reviewLink,
        tags: reviewData.tags,
        status: reviewData.status,
        viewCount: reviewData.viewCount,
        authorId: admin.id,
        affiliateId,
        categories: { connect: connectCategories },
        actors:
          connectActors.length > 0 ? { connect: connectActors } : undefined,
      },
    });
    createdReviews.push(review);
    console.log(`   ✅ Created: "${reviewData.title}" [${reviewData.status}]`);
  }

  console.log(`🎬 Created ${createdReviews.length} film reviews`);

  // ===== Create Sample Film Comments =====
  const user = await prisma.user.findFirst({ where: { role: "USER" } });
  if (user) {
    const publishedReviews = createdReviews.filter(
      (r) => r.status === "PUBLISHED",
    );

    const sampleComments = [
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

    let commentCount = 0;
    for (const review of publishedReviews.slice(0, 8)) {
      const numComments = Math.floor(Math.random() * 4) + 1;

      for (let i = 0; i < numComments; i++) {
        const comment = await prisma.filmComment.create({
          data: {
            content:
              sampleComments[Math.floor(Math.random() * sampleComments.length)],
            isApproved: Math.random() > 0.2, // 80% approved
            userId: Math.random() > 0.5 ? user.id : admin.id,
            filmReviewId: review.id,
          },
        });

        // Add a reply to some comments (40% chance)
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
          commentCount++;
        }
        commentCount++;
      }
    }
    console.log(`💬 Created ${commentCount} film comments`);
  }

  console.log("\n✅ Film review seeding completed!");
  console.log(`🏷️ ${createdCategories.length} film categories`);
  console.log(`🎭 ${createdActors.length} actors`);
  console.log(`🎬 ${createdReviews.length} film reviews`);

  const publishedCount = await prisma.filmReview.count({
    where: { status: "PUBLISHED" },
  });
  const draftCount = await prisma.filmReview.count({
    where: { status: "DRAFT" },
  });
  const withAffiliate = await prisma.filmReview.count({
    where: { affiliateId: { not: null } },
  });
  console.log(`📊 Published: ${publishedCount}, Draft: ${draftCount}`);
  console.log(`🔗 ${withAffiliate} reviews have affiliate links`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding film reviews:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
