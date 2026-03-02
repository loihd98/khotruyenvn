"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StorySidebar from "../../components/layout/StorySidebar";
import Layout from "@/components/layout/Layout";

interface Genre {
  id: string;
  name: string;
  slug: string;
  _count: {
    stories: number;
  };
}

interface GenresClientProps {
  initialGenres: Genre[];
}

export default function GenresClient({ initialGenres }: GenresClientProps) {
  const router = useRouter();
  const [genres] = useState<Genre[]>(initialGenres);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "count">("name");

  const getGenreDescription = (genreName: string) => {
    const descriptions: { [key: string]: string } = {
      "Tiên Hiệp":
        "Tu tiên, tu chân, tu thần, các câu chuyện về việc tu luyện để trở thành tiên nhân.",
      "Đô Thị":
        "Câu chuyện hiện đại, đời sống thành thị, tình yêu và sự nghiệp trong xã hội hiện tại.",
      "Huyền Huyễn":
        "Thế giới kỳ ảo, phép thuật, ma pháp và những cuộc phiêu lưu không tưởng.",
      "Kiếm Hiệp":
        "Võ lâm, giang hồ, kiếm pháp và những câu chuyện anh hùng hào kiệt.",
      "Ngôn Tình":
        "Tình yêu lãng mạn, câu chuyện tình cảm ngọt ngào và cảm động.",
      "Quan Trường":
        "Chính trị, quyền lực, đấu tranh trong triều đình và quan trường.",
      "Lịch Sử":
        "Dựa trên sự kiện lịch sử, nhân vật lịch sử và bối cảnh thời đại xưa.",
      "Khoa Huyễn":
        "Tương lai, công nghệ, vũ trụ và những câu chuyện viễn tưởng.",
      "Trinh Thám": "Phá án, điều tra, bí ẩn và những câu chuyện hồi hộp.",
      "Võng Du": "Game online, thế giới ảo và những cuộc phiêu lưu trong game.",
    };
    return (
      descriptions[genreName] ||
      "Khám phá những câu chuyện thú vị trong thể loại này."
    );
  };

  const filteredAndSortedGenres = genres
    .filter((genre) =>
      genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "vi");
      } else {
        return b._count.stories - a._count.stories;
      }
    });

  const popularGenres = [...genres]
    .sort((a, b) => b._count.stories - a._count.stories)
    .slice(0, 8);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    📚 Thể Loại Truyện
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Khám phá kho tàng truyện đa dạng với {genres.length} thể
                    loại phong phú
                  </p>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="🔍 Tìm kiếm thể loại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "name" | "count")
                      }
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="name">Sắp xếp theo tên</option>
                      <option value="count">Sắp xếp theo số lượng</option>
                    </select>
                  </div>
                </div>

                {/* Genres Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredAndSortedGenres.map((genre, index) => (
                    <div
                      key={genre.id}
                      onClick={() =>
                        router.push(`/stories?genre=${genre.slug}`)
                      }
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer group transform hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-300"></div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {genre.name}
                          </h3>
                        </div>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm px-2 py-1 rounded-full">
                          {genre._count.stories}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {getGenreDescription(genre.name)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* No Results */}
                {filteredAndSortedGenres.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Không tìm thấy thể loại
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Không có thể loại nào phù hợp với &quot;{searchTerm}&quot;
                    </p>
                  </div>
                )}

                {/* Popular Genres */}
                {popularGenres.length > 0 && !searchTerm && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                      🌟 Thể Loại Phổ Biến
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                      {popularGenres.map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() =>
                            router.push(`/stories?genre=${genre.slug}`)
                          }
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                        >
                          {genre.name} ({genre._count.stories})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                {!searchTerm && (
                  <div className="mt-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Không tìm thấy thể loại yêu thích?
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                      Khám phá tất cả các truyện trong kho tàng của chúng
                      tôi
                    </p>
                    <button
                      onClick={() => router.push("/stories")}
                      className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      📚 Xem Tất Cả Truyện
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <StorySidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
