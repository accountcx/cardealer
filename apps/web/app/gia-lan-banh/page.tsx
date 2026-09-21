import { Suspense } from 'react';
import type { Metadata } from 'next';
import CalculatorMasterView from '../../components/calculator/CalculatorMasterView';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { getCarsList } from '../../services/cars.service';
import { getStorefrontSettings } from '../../services/settings.service';

// 🧠 Mental Model: Server Component cho Trang Tính Giá Lăn Bánh & Trả Góp Ô Tô Xe Hyundai Vinh.
// Chuẩn thiết kế Storefront Hyundai (Hyundai Deep Navy & Electric Blue).
// 1. Tận dụng Navbar & Footer & Widgets toàn cục từ RootLayout.
// 2. SEO Rich Results (R14): Nhúng JSON-LD Schema 'SoftwareApplication' & 'FinanceApplication'.
// 3. Tải danh sách xe từ cars.service với ISR caching và fallback Zero-Crash.
// 4. Đồng bộ Hotline và Link Zalo từ hệ thống quản trị Settings CMS.
// 5. Tự động nhận diện query parameter (?xe=tucson) để tự động chọn dòng xe và phiên bản tương ứng.

export const metadata: Metadata = {
  title: 'Bảng Tính Giá Lăn Bánh & Trả Góp Xe Hyundai 2026 | Xe Hyundai Vinh',
  description:
    'Công cụ tính toán chính xác giá lăn bánh xe ô tô Hyundai tại Nghệ An & Hà Tĩnh: Grand i10, Accent, Creta, Tucson, Santa Fe, Custin, Palisade. Dự toán lãi suất trả góp chỉ 7.9%/năm.',
  openGraph: {
    title: 'Tính Giá Lăn Bánh Xe Hyundai Nhanh Chóng & Nhận Ưu Đãi Độc Quyền',
    description:
      'Dự toán trọn gói các khoản thuế trước bạ 10%, biển số, đăng kiểm. Nhận ưu đãi tiền mặt độc quyền tại Xe Hyundai Vinh!',
    type: 'website',
  },
};

interface GiaLanBanhPageProps {
  searchParams?: Promise<{ xe?: string; car?: string }>;
}

export default async function GiaLanBanhPage(props: GiaLanBanhPageProps) {
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const initialCarSlug = resolvedParams?.xe || resolvedParams?.car;

  const [cars, settings] = await Promise.all([
    getCarsList(),
    getStorefrontSettings(),
  ]);

  const hotline = settings.contact.hotlineKinhDoanh || '0981.234.567';
  const zaloUrl = settings.contact.sellerZalo || 'https://zalo.me/0981234567';

  // JSON-LD Schema chuẩn Schema.org cho ứng dụng tài chính (R14)
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Công cụ tính Giá Lăn Bánh Xe Hyundai - Xe Hyundai Vinh',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    price: '0',
    priceCurrency: 'VND',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    description:
      'Công cụ dự toán chi phí lăn bánh ô tô và ước tính trả góp ngân hàng chính xác tại Nghệ An & Hà Tĩnh',
  };

  return (
    <div className="w-full pb-20">
      {/* Script SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Hero Section Banner */}
      <section className="bg-gradient-to-b from-[#002C6C] via-[#051c42] to-slate-50 text-white pt-8 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Hero Content Container: Căn lề trái thẳng hàng với khung tính toán bên dưới */}
        <div className="max-w-4xl mx-auto relative z-10 text-left">
          {/* Breadcrumbs tự động sinh theo URL: Căn trái, thuần túy không viền/nền, phân cấp thị giác */}
          <Breadcrumbs />

          {/* Tiêu đề trang đại diện thay cho lặp lại logo */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Công Cụ Tính Giá Lăn Bánh &amp; Trả Góp Ô Tô
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 mt-3 max-w-2xl leading-relaxed font-normal">
            Dự toán chính xác 100% biểu phí trước bạ, biển số, bảo trì đường bộ theo quy định tại Nghệ An &amp; Hà Tĩnh cùng bảng tính gốc lãi trả góp ngân hàng ưu đãi.
          </p>
        </div>
      </section>

      {/* Main Master Calculator Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <Suspense fallback={<div className="h-96 w-full rounded-3xl bg-white/50 animate-pulse" />}>
          <CalculatorMasterView
            cars={cars}
            initialCarSlug={initialCarSlug}
            defaultHotline={hotline}
            defaultZaloUrl={zaloUrl}
          />
        </Suspense>

        {/* Showroom 4-Pillar Commitment Grid */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0072CE]">Cam Kết Vàng</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Tại Sao Khách Hàng Chọn Mua Xe Tại Xe Hyundai Vinh?
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
              Hệ thống phân phối xe ô tô Hyundai chính hãng uy tín tại khu vực Bắc Miền Trung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#002C6C] flex items-center justify-center font-bold text-lg mb-3">
                🏆
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Cam Kết Giá Tốt Nhất</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                Chính sách giá minh bạch, luôn có chương trình giảm tiền mặt và quà tặng giá trị cao nhất tháng.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3">
                ⚡
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Hỗ Trợ Vay Đến 85%</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                Liên kết các ngân hàng lớn (Vietcombank, BIDV, Techcombank), giải ngân nhanh chóng trong 24 giờ.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg mb-3">
                🚗
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Sẵn Xe Đủ Màu Giao Ngay</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                Kho xe lớn nhất khu vực, hỗ trợ xem xe thực tế và giao xe tận nhà theo phong thủy của khách.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mb-3">
                🔧
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Bảo Hành 5 Năm / 100.000 KM</h3>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                Xưởng dịch vụ 3S tiêu chuẩn quốc tế, phụ tùng chính hãng, cứu hộ giao thông 24/7 an tâm tuyệt đối.
              </p>
            </div>
          </div>
        </div>

        {/* Section FAQ: Hỏi đáp phổ biến về giá lăn bánh */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0072CE]">Giải Đáp Thắc Mắc</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Câu Hỏi Thường Gặp Về Giá Lăn Bánh Ô Tô
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <details className="border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer open:bg-sky-50/30 open:border-sky-200 transition group">
              <summary className="font-bold text-slate-900 group-hover:text-[#0072CE] transition flex items-center justify-between">
                <span>1. Giá lăn bánh bao gồm những khoản chi phí bắt buộc nào?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed pl-2 border-l-2 border-[#0072CE]">
                Giá lăn bánh là tổng chi phí để xe lưu thông hợp pháp trên đường, bao gồm: Giá niêm yết của xe, Lệ phí trước bạ (10% tại Nghệ An), Phí cấp biển số, Phí đăng kiểm cơ giới, Phí bảo trì đường bộ 12 tháng và Bảo hiểm trách nhiệm dân sự bắt buộc.
              </p>
            </details>

            <details className="border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer open:bg-sky-50/30 open:border-sky-200 transition group">
              <summary className="font-bold text-slate-900 group-hover:text-[#0072CE] transition flex items-center justify-between">
                <span>2. Tại sao phí biển số tại TP. Vinh cao hơn các huyện khác trong tỉnh?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed pl-2 border-l-2 border-[#0072CE]">
                Theo Thông tư số 60/2023/TT-BTC của Bộ Tài chính về lệ phí đăng ký, cấp biển phương tiện giao thông: Thành phố Vinh áp dụng mức phí 1.000.000 VNĐ cho ô tô con dưới 10 chỗ. Trong khi đó, các huyện, thị xã khác trong tỉnh Nghệ An áp dụng mức phí 200.000 VNĐ.
              </p>
            </details>

            <details className="border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer open:bg-sky-50/30 open:border-sky-200 transition group">
              <summary className="font-bold text-slate-900 group-hover:text-[#0072CE] transition flex items-center justify-between">
                <span>3. Thủ tục mua xe trả góp cần chuẩn bị những giấy tờ gì?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed pl-2 border-l-2 border-[#0072CE]">
                Khách hàng cá nhân chỉ cần chuẩn bị CCCD gắn chip và giấy tờ chứng minh thu nhập cơ bản (sao kê bảng lương, hợp đồng lao động hoặc giấy tờ kinh doanh / sổ tiết kiệm). Chuyên viên ngân hàng đối tác của Showroom sẽ hỗ trợ hoàn thiện hồ sơ tận nơi và giải ngân trong 24 giờ.
              </p>
            </details>

            <details className="border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer open:bg-sky-50/30 open:border-sky-200 transition group">
              <summary className="font-bold text-slate-900 group-hover:text-[#0072CE] transition flex items-center justify-between">
                <span>4. Báo giá trên công cụ tính này đã phải là giá cuối cùng chưa?</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed pl-2 border-l-2 border-[#0072CE]">
                Giá tính toán là giá tạm tính theo niêm yết của hãng và biểu phí nhà nước, <strong className="text-red-600">CHƯA TRỪ</strong> các chương trình ưu đãi giảm tiền mặt, quà tặng phụ kiện và gói bảo hiểm độc quyền từ Showroom trong tháng. Hãy để lại số điện thoại để nhận báo giá thực tế tốt nhất!
              </p>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
