import { describe, it, expect } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS } from '@cardealer/types';
import {
  generateLeadNotificationHtml,
  formatLeadCurrency,
  buildLeadNotificationSubject,
  type LeadEmailPayload,
} from '../email/lead-notification';

describe('US-01: Lead Management RBAC Permissions', () => {
  it('should allow admin to delete leads', () => {
    expect(hasPermission('admin', 'leads:delete')).toBe(true);
    expect(ROLE_PERMISSIONS.admin).toContain('leads:delete');
  });

  it('should allow manager to delete leads', () => {
    expect(hasPermission('manager', 'leads:delete')).toBe(true);
    expect(ROLE_PERMISSIONS.manager).toContain('leads:delete');
  });

  it('should strictly FORBID sales from deleting leads', () => {
    expect(hasPermission('sales', 'leads:delete')).toBe(false);
    expect(ROLE_PERMISSIONS.sales).not.toContain('leads:delete');
  });

  it('should strictly FORBID editor from deleting leads', () => {
    expect(hasPermission('editor', 'leads:delete')).toBe(false);
    expect(ROLE_PERMISSIONS.editor).not.toContain('leads:delete');
  });

  it('should keep read/write permissions intact across all authorized roles', () => {
    expect(hasPermission('admin', 'leads:read')).toBe(true);
    expect(hasPermission('admin', 'leads:write')).toBe(true);
    expect(hasPermission('manager', 'leads:read')).toBe(true);
    expect(hasPermission('manager', 'leads:write')).toBe(true);
    expect(hasPermission('sales', 'leads:read')).toBe(true);
    expect(hasPermission('sales', 'leads:write')).toBe(true);
    expect(hasPermission('editor', 'leads:read')).toBe(true);
    expect(hasPermission('editor', 'leads:write')).toBe(false);
  });
});

describe('US-02: Lead Notification Email Template & Sanitization', () => {
  const mockLead: LeadEmailPayload = {
    id: 'lead-test-uuid-12345',
    fullName: 'Nguyễn Văn An',
    phone: '0981234567',
    province: 'Nghệ An',
    carModel: 'Hyundai Santa Fe',
    carVersion: '2.5 Xăng Cao Cấp',
    estimatedTotal: 1250000000,
    leadType: 'Báo Giá Lăn Bánh',
    preferredTime: 'Buổi chiều sau 14h',
    notes: 'Khách cần nhận xe trong tháng 11',
    createdAt: new Date('2026-10-18T10:00:00Z'),
  };

  it('should generate valid responsive HTML containing all lead details', () => {
    const html = generateLeadNotificationHtml(mockLead, 'https://cms.xehyundaivinh.com');

    expect(html).toContain('Nguyễn Văn An');
    expect(html).toContain('0981234567');
    expect(html).toContain('tel:0981234567');
    expect(html).toContain('Nghệ An');
    expect(html).toContain('Hyundai Santa Fe (2.5 Xăng Cao Cấp)');
    expect(html).toContain('Báo Giá Lăn Bánh');
    expect(html).toContain('Buổi chiều sau 14h');
    expect(html).toContain('Khách cần nhận xe trong tháng 11');
    expect(html).toContain('https://cms.xehyundaivinh.com/leads?highlight=lead-test-uuid-12345');
  });

  it('should sanitize and escape dangerous HTML tags and XSS vectors in user inputs', () => {
    const dangerousLead: LeadEmailPayload = {
      id: 'lead-xss-999',
      fullName: '<script>alert("XSS")</script>',
      phone: '0981234567',
      province: '<img src=x onerror=alert(1)>',
      carModel: 'Santa Fe"><script>',
      notes: '<a href="javascript:stealCookie()">Click me</a>',
    };

    const html = generateLeadNotificationHtml(dangerousLead);

    expect(html).not.toContain('<script>alert("XSS")</script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<a href="javascript:');
    expect(html).toContain('&lt;a href=&quot;javascript:stealCookie()&quot;&gt;');
  });

  it('should handle optional/missing fields gracefully with user-friendly fallbacks', () => {
    const minimalLead: LeadEmailPayload = {
      id: 'lead-min-001',
      fullName: '',
      phone: '0912345678',
    };

    const html = generateLeadNotificationHtml(minimalLead);

    expect(html).toContain('Khách hàng');
    expect(html).toContain('0912345678');
    expect(html).toContain('Chưa cập nhật');
    expect(html).toContain('Chưa chọn mẫu xe');
    expect(html).toContain('Chưa có dự toán');
    expect(html).toContain('Không có ghi chú thêm');
  });

  it('should format currency correctly with VND formatting', () => {
    expect(formatLeadCurrency(1250000000)).toMatch(/1\.250\.000\.000/);
    expect(formatLeadCurrency(null)).toBe('Chưa có dự toán');
    expect(formatLeadCurrency(undefined)).toBe('Chưa có dự toán');
    expect(formatLeadCurrency(0)).toBe('Chưa có dự toán');
    expect(formatLeadCurrency(-5000)).toBe('Chưa có dự toán');
  });

  it('should build clear and informative notification email subjects for CRM', () => {
    const subject1 = buildLeadNotificationSubject(mockLead);
    expect(subject1).toBe('[HYUNDAI VINH CRM] 🚗 Khách mới: Nguyễn Văn An - Hyundai Santa Fe (0981234567)');

    const subject2 = buildLeadNotificationSubject({
      id: 'min-1',
      fullName: '',
      phone: '0912345678',
    });
    expect(subject2).toBe('[HYUNDAI VINH CRM] 🚗 Khách mới: Khách hàng - Hyundai (0912345678)');
  });
});

