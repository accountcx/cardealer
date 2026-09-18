import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CarDealer Admin Portal',
  description: 'Cổng quản trị nội bộ hệ thống CarDealer',
};

export default function AdminLayout({
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
          backgroundColor: '#F3F4F6',
          color: '#1F2937',
        }}
      >
        {children}
      </body>
    </html>
  );
}
