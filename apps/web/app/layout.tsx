import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CarDealer - Đại Lý Ô Tô Ủy Quyền',
  description: 'Nền tảng tra cứu giá xe ô tô, dự toán lăn bánh và trả góp tự động',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: '#F9FAFB',
          color: '#111827',
        }}
      >
        {children}
      </body>
    </html>
  );
}
