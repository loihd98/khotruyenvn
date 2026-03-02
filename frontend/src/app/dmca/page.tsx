import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "DMCA - Báo cáo vi phạm bản quyền - vivutruyenhay.com",
  description:
    "Chính sách DMCA và hướng dẫn báo cáo vi phạm bản quyền tại vivutruyenhay.com. Chúng tôi tôn trọng quyền sở hữu trí tuệ.",
  openGraph: {
    title: "DMCA - Báo cáo vi phạm bản quyền - vivutruyenhay.com",
    description:
      "Chính sách DMCA và hướng dẫn báo cáo vi phạm bản quyền tại vivutruyenhay.com. Chúng tôi tôn trọng quyền sở hữu trí tuệ.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/dmca",
  },
};

export default function DMCAPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            Chính sách DMCA
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            vivutruyenhay.com tôn trọng quyền sở hữu trí tuệ và tuân thủ Đạo luật Bản
            quyền Thiên niên kỷ số (DMCA)
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Report Section */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8 animate-slide-up animation-delay-300">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Báo cáo vi phạm bản quyền nhanh
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              Nếu bạn phát hiện nội dung vi phạm bản quyền của mình trên trang
              web, vui lòng liên hệ ngay:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 text-center"
              >
                📧 Gửi báo cáo
              </a>
              <a
                href="mailto:dmca@webtruyen.com"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 text-center"
              >
                ✉️ dmca@webtruyen.com
              </a>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 animate-slide-up animation-delay-400">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                1. Cam kết của chúng tôi
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                vivutruyenhay.com cam kết tôn trọng quyền tác giả và quyền sở hữu trí
                tuệ. Chúng tôi nghiêm túc đối phó với mọi vi phạm bản quyền và
                sẽ xử lý nhanh chóng các báo cáo hợp lệ theo DMCA.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                2. Cách báo cáo vi phạm bản quyền
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Để gửi báo cáo DMCA hợp lệ, vui lòng cung cấp các thông tin sau:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>
                  Chữ ký điện tử hoặc chữ ký vật lý của chủ sở hữu bản quyền
                </li>
                <li>Mô tả chi tiết về tác phẩm bị vi phạm bản quyền</li>
                <li>URL cụ thể của nội dung vi phạm trên trang web</li>
                <li>
                  Thông tin liên hệ của bạn (tên, địa chỉ, điện thoại, email)
                </li>
                <li>
                  Tuyên bố rằng bạn tin tưởng việc sử dụng không được phép
                </li>
                <li>Tuyên bố rằng thông tin trong báo cáo là chính xác</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                3. Quy trình xử lý
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📨</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Bước 1
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nhận và xem xét báo cáo trong 24h
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔍</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Bước 2
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Điều tra và xác minh tính hợp lệ
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Bước 3
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gỡ bỏ nội dung và thông báo kết quả
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                4. Counter-Notice (Phản đối gỡ bỏ)
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Nếu bạn tin rằng nội dung của mình bị gỡ bỏ một cách sai trái,
                bạn có thể gửi counter-notice theo quy định của DMCA. Chúng tôi
                sẽ xem xét và có thể khôi phục nội dung nếu hợp lệ.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                5. Chính sách vi phạm nhiều lần
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Tài khoản vi phạm bản quyền nhiều lần sẽ bị đình chỉ hoặc khóa
                vĩnh viễn. Chúng tôi duy trì danh sách các tài khoản vi phạm để
                thực thi chính sách này.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                6. Thông tin liên hệ DMCA
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>DMCA Agent:</strong> vivutruyenhay.com Legal Team
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Email:</strong> dmca@webtruyen.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Địa chỉ:</strong> [Địa chỉ công ty]
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Điện thoại:</strong> [Số điện thoại hỗ trợ]
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 animate-slide-up animation-delay-500">
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3">
              ⚠️ Lưu ý quan trọng
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
              Việc gửi báo cáo DMCA sai sự thật có thể dẫn đến hậu quả pháp lý.
              Vui lòng đảm bảo bạn có quyền hợp pháp trước khi gửi báo cáo.
              Chính sách này có thể được cập nhật mà không cần thông báo trước.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
