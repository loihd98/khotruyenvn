import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Điều khoản sử dụng - vivutruyenhay.com",
  description:
    "Điều khoản và điều kiện sử dụng dịch vụ vivutruyenhay.com. Vui lòng đọc kỹ trước khi sử dụng trang web.",
  openGraph: {
    title: "Điều khoản sử dụng - vivutruyenhay.com",
    description:
      "Điều khoản và điều kiện sử dụng dịch vụ vivutruyenhay.com. Vui lòng đọc kỹ trước khi sử dụng trang web.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            Điều khoản sử dụng
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            Điều khoản và điều kiện sử dụng dịch vụ vivutruyenhay.com
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 animate-slide-up animation-delay-300">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 animate-slide-up animation-delay-300">
            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Tóm tắt nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✅</span>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    Được phép
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Đọc, nghe, bookmark, chia sẻ nội dung
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">❌</span>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    Không được phép
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Sao chép, phân phối lại, làm tổn hại hệ thống
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 animate-slide-up animation-delay-400">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                1. Chấp nhận điều khoản
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Bằng việc truy cập và sử dụng trang web vivutruyenhay.com, bạn đồng ý
                tuân thủ các điều khoản và điều kiện được nêu trong tài liệu
                này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản
                này, vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                2. Mô tả dịch vụ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                vivutruyenhay.com cung cấp nền tảng đọc và nghe truyện online với các
                tính năng:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>Đọc truyện chữ và nghe truyện audio miễn phí</li>
                <li>Tìm kiếm và phân loại theo thể loại</li>
                <li>Tính năng bookmark và theo dõi tiến độ đọc</li>
                <li>Hệ thống bình luận và tương tác</li>
                <li>Thông báo cập nhật chương mới</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                3. Tài khoản người dùng
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Trách nhiệm của người dùng:
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Cung cấp thông tin chính xác khi đăng ký</li>
                  <li>Bảo mật thông tin đăng nhập</li>
                  <li>
                    Thông báo ngay khi phát hiện tài khoản bị truy cập trái phép
                  </li>
                  <li>
                    Chịu trách nhiệm cho mọi hoạt động dưới tài khoản của mình
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                4. Quy tắc sử dụng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                    <span className="mr-2">✅</span>Được phép
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Đọc và nghe nội dung miễn phí</li>
                    <li>• Tạo bookmark cá nhân</li>
                    <li>• Bình luận tích cực và xây dựng</li>
                    <li>• Chia sẻ link trang web</li>
                    <li>• Báo cáo nội dung vi phạm</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                    <span className="mr-2">❌</span>Không được phép
                  </h3>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Sao chép nội dung để phân phối</li>
                    <li>• Spam, quảng cáo không mong muốn</li>
                    <li>• Tấn công hệ thống hoặc gian lận</li>
                    <li>• Đăng nội dung vi phạm pháp luật</li>
                    <li>• Sử dụng bot hoặc công cụ tự động</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                5. Quyền sở hữu trí tuệ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Tất cả nội dung trên vivutruyenhay.com, bao gồm văn bản, hình ảnh,
                audio, và thiết kế, đều được bảo vệ bởi luật bản quyền. Người
                dùng không được sao chép, phân phối lại hoặc sử dụng thương mại
                mà không có sự cho phép bằng văn bản.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                6. Điều khoản tài chính
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                vivutruyenhay.com hiện tại cung cấp dịch vụ hoàn toàn miễn phí. Chúng
                tôi có quyền giới thiệu các gói dịch vụ trả phí trong tương lai
                với thông báo trước ít nhất 30 ngày.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                7. Giới hạn trách nhiệm
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                vivutruyenhay.com không chịu trách nhiệm cho bất kỳ thiệt hại trực
                tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng dịch vụ. Chúng
                tôi cũng không đảm bảo dịch vụ hoạt động liên tục không bị gián
                đoạn.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                8. Chấm dứt dịch vụ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu
                vi phạm các điều khoản này. Bạn cũng có thể chấm dứt tài khoản
                bất cứ lúc nào bằng cách liên hệ với bộ phận hỗ trợ.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                9. Thay đổi điều khoản
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                vivutruyenhay.com có quyền cập nhật các điều khoản này bất cứ lúc
                nào. Những thay đổi quan trọng sẽ được thông báo qua email hoặc
                thông báo trên trang web ít nhất 7 ngày trước khi có hiệu lực.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                10. Liên hệ
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng
                  liên hệ:
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Email:</strong> legal@webtruyen.com
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Hoặc sử dụng:</strong>{" "}
                  <a
                    href="/contact"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Trang liên hệ
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Agreement Confirmation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 animate-slide-up animation-delay-500">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <span className="mr-2">🤝</span>Xác nhận đồng ý
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
              Bằng việc tiếp tục sử dụng vivutruyenhay.com, bạn xác nhận đã đọc, hiểu
              và đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu ở
              trên.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
