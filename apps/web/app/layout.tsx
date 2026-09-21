import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

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
    <html lang="vi" className="overflow-x-hidden">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-[#0072CE] selection:text-white overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
