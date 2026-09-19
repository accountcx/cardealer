import type { Metadata } from 'next';
import './globals.css';
import AdminShell from './components/AdminShell';

export const metadata: Metadata = {
  title: 'CarDealer Admin Portal | Quản Trị Showroom Hyundai',
  description: 'Cổng quản trị nội bộ hệ thống đại lý xe ô tô Hyundai Vinh chính hãng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased selection:bg-[#0072CE] selection:text-white">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
