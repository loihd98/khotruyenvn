"use client";

import React from "react";
import Link from "next/link";

const Hero: React.FC = () => {
  return (
    <div>
      {/* Desktop Banner */}
      <div className="hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Kho Truyện & Review Phim Số 1 Việt Nam
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Đọc và nghe hàng ngàn câu chuyện hay, xem review phim mới nhất từ
            cộng đồng. Trải nghiệm hoàn toàn miễn phí tại vivutruyenhay.com
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link
              href="/stories"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              📚 Khám phá truyện
            </Link>
            <Link
              href="/stories?type=AUDIO"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🎧 Nghe truyện audio
            </Link>
            <Link
              href="/film-reviews"
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg"
            >
              🎬 Review Phim
            </Link>
          </div>

          <div className="mt-12 grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto grid">
            <div className="text-center">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-2">Đọc miễn phí</h3>
              <p className="text-blue-100">
                Hàng ngàn truyện hay hoàn toàn miễn phí
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-xl font-semibold mb-2">Audio chất lượng</h3>
              <p className="text-blue-100">
                Trải nghiệm nghe truyện với âm thanh sống động
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">Review Phim</h3>
              <p className="text-blue-100">
                Đánh giá phim hay nhất từ cộng đồng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Banner - 3 action buttons vertical */}
      <div className="sm:hidden bg-white dark:bg-gray-900 py-2 px-3">
        <div className="flex flex-col gap-2">
          <Link
            href="/stories"
            className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <span className="text-2xl">📚</span>
            <div>
              <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Đọc Truyện</div>
              <div className="text-xs text-blue-500 dark:text-blue-400">Hàng ngàn truyện hay miễn phí</div>
            </div>
            <svg className="ml-auto h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/stories?type=AUDIO"
            className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-3 py-2.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <span className="text-2xl">🎧</span>
            <div>
              <div className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Nghe Audio</div>
              <div className="text-xs text-purple-500 dark:text-purple-400">Trải nghiệm âm thanh sống động</div>
            </div>
            <svg className="ml-auto h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/film-reviews"
            className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 px-3 py-2.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <span className="text-2xl">🎬</span>
            <div>
              <div className="font-semibold text-rose-700 dark:text-rose-300 text-sm">Review Phim</div>
              <div className="text-xs text-rose-500 dark:text-rose-400">Đánh giá phim hay nhất từ cộng đồng</div>
            </div>
            <svg className="ml-auto h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
