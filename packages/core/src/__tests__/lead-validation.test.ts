import { describe, it, expect } from 'vitest';
import { CreateLeadSchema } from '@cardealer/types';

describe('CreateLeadSchema validation', () => {
  it('should accept standard Báo Giá lead', () => {
    const res = CreateLeadSchema.safeParse({
      fullName: 'Nguyen Van A',
      phone: '0981234567',
      leadType: 'Báo Giá',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.phone).toBe('0981234567');
      expect(res.data.leadType).toBe('Báo Giá');
    }
  });

  it('should accept Báo Giá Nhanh and Báo Giá Lăn Bánh variants', () => {
    const res1 = CreateLeadSchema.safeParse({
      fullName: 'Nguyen Van B',
      phone: '0981234567',
      leadType: 'Báo Giá Nhanh',
    });
    expect(res1.success).toBe(true);

    const res2 = CreateLeadSchema.safeParse({
      fullName: 'Nguyen Van C',
      phone: '0981234567',
      leadType: 'Báo Giá Lăn Bánh',
    });
    expect(res2.success).toBe(true);
  });

  it('should normalize +84 phone numbers into 10-digit format', () => {
    const res = CreateLeadSchema.safeParse({
      fullName: 'Tran Thi D',
      phone: '+84981234567',
      leadType: 'Giá Lăn Bánh',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.phone).toBe('0981234567');
    }
  });

  it('should normalize phone numbers with spaces or periods', () => {
    const res = CreateLeadSchema.safeParse({
      fullName: 'Le Van E',
      phone: '098.123.4567',
      leadType: 'Dự Toán Trả Góp',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.phone).toBe('0981234567');
    }
  });

  it('should reject invalid or dummy phone numbers', () => {
    const res1 = CreateLeadSchema.safeParse({
      fullName: 'Fail User',
      phone: '0123456789', // Not a valid VN prefix
      leadType: 'Báo Giá',
    });
    expect(res1.success).toBe(false);

    const res2 = CreateLeadSchema.safeParse({
      fullName: 'Dummy User',
      phone: '0900000000', // In dummy blacklist
      leadType: 'Báo Giá',
    });
    expect(res2.success).toBe(false);
  });
});
