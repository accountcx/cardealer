import { Button, Card } from '@cardealer/ui';

export default function AdminDashboardPage() {
  return (
    <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#111827' }}>
            🛠️ CarDealer Back-Office Portal
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
            Quản trị danh mục xe, tiếp nhận Lead khách hàng và cấu hình hệ thống
          </p>
        </div>
        <Button variant="primary" size="sm">
          + Thêm Dòng Xe Mới
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <Card title="Quản Lý Dòng Xe" subtitle="12 Dòng xe đang kích hoạt">
          <p style={{ fontSize: '13px', color: '#4B5563' }}>
            Cập nhật giá niêm yết, thông số kỹ thuật, bảng màu ngoại thất và bài viết đánh giá.
          </p>
          <Button variant="outline" size="sm" style={{ marginTop: '12px' }}>
            Xem Danh Sách
          </Button>
        </Card>

        <Card title="Khách Hàng & Leads" subtitle="5 Yêu cầu báo giá mới hôm nay">
          <p style={{ fontSize: '13px', color: '#4B5563' }}>
            Phân luồng khách hàng có nhu cầu lái thử, tư vấn trả góp và tính lăn bánh tự động.
          </p>
          <Button variant="outline" size="sm" style={{ marginTop: '12px' }}>
            Quản Lý Lead
          </Button>
        </Card>

        <Card title="Cấu Hình Toàn Cục" subtitle="Site & Contact Settings">
          <p style={{ fontSize: '13px', color: '#4B5563' }}>
            Cấu hình Hotline, Zalo người bán, định mức biểu phí trước bạ và Google Analytics.
          </p>
          <Button variant="outline" size="sm" style={{ marginTop: '12px' }}>
            Cài Đặt
          </Button>
        </Card>
      </div>
    </main>
  );
}
