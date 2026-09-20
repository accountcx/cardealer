import type { Metadata } from 'next';
import CalculatorMasterView from '../../components/calculator/CalculatorMasterView';
import type { CarItem } from '../../components/calculator/SmartCalculator';

// 🧠 Mental Model: Server Component cho Trang Tính Giá Lăn Bánh & Trả Góp Ô Tô.
// Chuẩn thiết kế Storefront Hyundai Showroom Flagship (Hyundai Deep Navy & Electric Blue).
// 1. SEO Rich Results (R14): Nhúng JSON-LD Schema 'SoftwareApplication' & 'FinanceApplication'.
// 2. Tải danh sách xe đang bán từ Backend API nội bộ (http://localhost:4000/api/cars).
// 3. Tích hợp trọn bộ 2 công cụ tài chính: Giá lăn bánh & Dự toán trả góp đồng bộ trạng thái.

export const metadata: Metadata = {
  title: 'Bảng Tính Giá Lăn Bánh & Trả Góp Xe Hyundai 2026 | Hyundai Vinh Chính Hãng',
  description:
    'Công cụ tính toán chính xác giá lăn bánh xe ô tô Hyundai tại Nghệ An & Hà Tĩnh: Grand i10, Accent, Creta, Tucson, Santa Fe, Custin, Palisade. Dự toán lãi suất trả góp chỉ 7.9%/năm.',
  openGraph: {
    title: 'Tính Giá Lăn Bánh Xe Hyundai Nhanh Chóng & Nhận Ưu Đãi Độc Quyền',
    description: 'Dự toán trọn gói các khoản thuế trước bạ 10%, biển số, đăng kiểm. Nhận ưu đãi tiền mặt độc quyền!',
    type: 'website',
  },
};

// Dữ liệu xe mẫu dự phòng nếu API máy chủ đang khởi động
const FALLBACK_CARS: CarItem[] = [
  {
    id: 'tucson-default',
    tenXe: 'Hyundai Tucson 2025',
    slug: 'hyundai-tucson',
    versions: [
      { id: 'v-tucson-1', tenPhienBan: '2.0 Xăng Tiêu Chuẩn', giaNiemYet: 769_000_000 },
      { id: 'v-tucson-2', tenPhienBan: '2.0 Xăng Đặc Biệt', giaNiemYet: 859_000_000 },
      { id: 'v-tucson-3', tenPhienBan: '1.6 Turbo HTRAC', giaNiemYet: 979_000_000 },
      { id: 'v-tucson-4', tenPhienBan: '2.0 Dầu Đặc Biệt', giaNiemYet: 989_000_000 },
    ],
  },
  {
    id: 'accent-default',
    tenXe: 'Hyundai Accent Thế Hệ Mới',
    slug: 'hyundai-accent',
    versions: [
      { id: 'v-accent-1', tenPhienBan: '1.5 MT Tiêu Chuẩn', giaNiemYet: 439_000_000 },
      { id: 'v-accent-2', tenPhienBan: '1.5 AT Tiêu Chuẩn', giaNiemYet: 489_000_000 },
      { id: 'v-accent-3', tenPhienBan: '1.5 AT Đặc Biệt', giaNiemYet: 529_000_000 },
      { id: 'v-accent-4', tenPhienBan: '1.5 AT Cao Cấp', giaNiemYet: 569_000_000 },
    ],
  },
  {
    id: 'creta-default',
    tenXe: 'Hyundai Creta',
    slug: 'hyundai-creta',
    versions: [
      { id: 'v-creta-1', tenPhienBan: '1.5 Tiêu Chuẩn', giaNiemYet: 599_000_000 },
      { id: 'v-creta-2', tenPhienBan: '1.5 Đặc Biệt', giaNiemYet: 650_000_000 },
      { id: 'v-creta-3', tenPhienBan: '1.5 Cao Cấp', giaNiemYet: 699_000_000 },
    ],
  },
  {
    id: 'santafe-default',
    tenXe: 'Hyundai Santa Fe Hoàn Toàn Mới',
    slug: 'hyundai-santafe',
    versions: [
      { id: 'v-santafe-1', tenPhienBan: 'Exclusive 2.5 Xăng', giaNiemYet: 1_069_000_000 },
      { id: 'v-santafe-2', tenPhienBan: 'Prestige 2.5 Xăng', giaNiemYet: 1_265_000_000 },
      { id: 'v-santafe-3', tenPhienBan: 'Calligraphy 2.5 Xăng', giaNiemYet: 1_365_000_000 },
      { id: 'v-santafe-4', tenPhienBan: 'Calligraphy 2.5 Turbo', giaNiemYet: 1_465_000_000 },
    ],
  },
  {
    id: 'custin-default',
    tenXe: 'Hyundai Custin',
    slug: 'hyundai-custin',
    versions: [
      { id: 'v-custin-1', tenPhienBan: '1.5T Tiêu Chuẩn', giaNiemYet: 820_000_000 },
      { id: 'v-custin-2', tenPhienBan: '1.5T Đặc Biệt', giaNiemYet: 915_000_000 },
      { id: 'v-custin-3', tenPhienBan: '2.0T Cao Cấp', giaNiemYet: 974_000_000 },
    ],
  },
];

async function getCarsList(): Promise<CarItem[]> {
  try {
    const apiPort = process.env.API_PORT || 4000;
    const res = await fetch(`http://localhost:${apiPort}/api/cars`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return FALLBACK_CARS;
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((c: any) => ({
        id: c.id,
        tenXe: c.tenXe,
        slug: c.slug,
        versions: (c.versions || []).map((v: any) => ({
          id: v.id,
          tenPhienBan: v.tenPhienBan,
          giaNiemYet: Number(v.giaNiemYet || 0),
        })),
      }));
    }
    return FALLBACK_CARS;
  } catch {
    return FALLBACK_CARS;
  }
}

export default async function GiaLanBanhPage() {
  const cars = await getCarsList();

  // JSON-LD Schema chuẩn Schema.org cho ứng dụng tài chính (R14)
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Công cụ tính Giá Lăn Bánh Xe Hyundai',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    price: '0',
    priceCurrency: 'VND',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
    },
    description: 'Công cụ dự toán chi phí lăn bánh ô tô và ước tính trả góp ngân hàng chính xác tại Nghệ An',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Script SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* 1. Showroom Top Navbar Header */}
      <header className="bg-[#002C6C] text-white border-b border-blue-900/40 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 text-white no-underline">
            <div className="w-9 h-9 rounded-xl bg-white text-[#002C6C] flex items-center justify-center font-black text-xl shadow">
              H
            </div>
            <div>
              <div className="text-sm font-black tracking-wider uppercase">HYUNDAI VINH</div>
              <div className="text-[10px] text-sky-200 tracking-tight font-medium">Đại Lý Ủy Quyền Chính Hãng TC Motor</div>
            </div>
          </a>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] uppercase text-sky-200 font-bold">Hotline Bán Hàng 24/7</span>
              <a href="tel:0941153666" className="text-sm font-black text-white hover:text-sky-200 transition">
                0941.153.666
              </a>
            </div>

            <a
              href="tel:0941153666"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-xs font-black tracking-wider uppercase transition shadow-md shadow-red-900/30 flex items-center gap-2"
            >
              <span>📞</span>
              <span>GỌI TƯ VẤN</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Banner */}
      <section className="bg-gradient-to-b from-[#002C6C] via-[#051c42] to-slate-50 text-white pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Breadcrumbs */}
          <nav className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-200 border border-white/15 backdrop-blur-md mb-6">
            <a href="/" className="hover:text-white transition">Trang chủ</a>
            <span>&gt;</span>
            <span className="text-white font-bold">Dự toán giá lăn bánh</span>
          </nav>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Công Cụ Tính Giá Lăn Bánh & Trả Góp Ô Tô
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed">
            Dự toán chính xác 100% biểu phí trước bạ, biển số, bảo trì đường bộ theo quy định tại Nghệ An & Hà Tĩnh cùng bảng tính gốc lãi trả góp ngân hàng ưu đãi.
          </p>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3">
              <div className="text-base">🛡️</div>
              <div className="text-xs font-bold text-white mt-1">Biểu Phí Chuẩn 2026</div>
              <div className="text-[10px] text-slate-300">Áp dụng đúng quy định</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3">
              <div className="text-base">💰</div>
              <div className="text-xs font-bold text-white mt-1">Ưu Đãi Tiền Mặt</div>
              <div className="text-[10px] text-slate-300">Tặng kèm gói phụ kiện</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3">
              <div className="text-base">⚡</div>
              <div className="text-xs font-bold text-white mt-1">Duyệt Vay 24H</div>
              <div className="text-[10px] text-slate-300">Lãi suất chỉ từ 7.9%</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3">
              <div className="text-base">🚗</div>
              <div className="text-xs font-bold text-white mt-1">Lái Thử Tận Nhà</div>
              <div className="text-[10px] text-slate-300">Phục vụ toàn khu vực</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Master Calculator Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <CalculatorMasterView
          cars={cars}
          defaultHotline="0941.153.666"
          defaultZaloUrl="https://zalo.me/0941153666"
        />

        {/* 4. Showroom 4-Pillar Commitment Grid */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0072CE]">Cam Kết Vàng</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Tại Sao Khách Hàng Chọn Mua Xe Tại Hyundai Vinh?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Đại lý ủy quyền phân phối xe ô tô Hyundai chính hãng lớn nhất tại khu vực Bắc Miền Trung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#002C6C] flex items-center justify-center font-bold text-lg mb-3">
                🏆
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Cam Kết Giá Tốt Nhất</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Chính sách giá minh bạch, luôn có chương trình giảm tiền mặt và quà tặng giá trị cao nhất tháng.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-3">
                ⚡
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Hỗ Trợ Vay Đến 85%</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Liên kết các ngân hàng lớn (Vietcombank, BIDV, Techcombank), giải ngân nhanh chóng trong 24 giờ.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg mb-3">
                🚗
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Sẵn Xe Đủ Màu Giao Ngay</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kho xe lớn nhất khu vực, hỗ trợ xem xe thực tế và giao xe tận nhà theo phong thủy của khách.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mb-3">
                🔧
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Bảo Hành 5 Năm / 100.000 KM</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Xưởng dịch vụ 3S tiêu chuẩn quốc tế, phụ tùng chính hãng, cứu hộ giao thông 24/7 an tâm tuyệt đối.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Section FAQ: Hỏi đáp phổ biến về giá lăn bánh */}
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

      {/* 6. Sticky Floating Bottom Quick Contact Bar (Mobile & Desktop) */}
      <aside aria-label="Hỗ trợ trực tuyến" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 p-3 sm:hidden shadow-2xl">
        <div className="flex items-center gap-2">
          <a
            href="tel:0941153666"
            className="flex-1 py-3 px-4 rounded-xl font-black text-white text-xs text-center bg-[#002C6C] shadow-md flex items-center justify-center gap-2"
          >
            <span>📞</span> GỌI HOTLINE
          </a>
          <a
            href="https://zalo.me/0941153666"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl font-black text-white text-xs text-center bg-[#0072CE] shadow-md flex items-center justify-center gap-2"
          >
            <span>💬</span> CHAT ZALO
          </a>
        </div>
      </aside>
    </div>
  );
}
