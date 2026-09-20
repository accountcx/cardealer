import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hyundai Vinh | Đại Lý Ô Tô Ủy Quyền Chính Hãng TC Motor',
  description: 'Nền tảng tra cứu giá xe ô tô Hyundai, bảng tính giá lăn bánh và dự toán trả góp tự động tại Nghệ An & Hà Tĩnh.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#0072CE] selection:text-white">
        {children}
      </body>
    </html>
  );
}
