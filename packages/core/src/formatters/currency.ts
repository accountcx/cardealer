/**
 * Format số tiền sang định dạng tiền tệ Việt Nam Đồng (VNĐ)
 * @example formatVND(1250000000) => "1.250.000.000 ₫"
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số tiền thành văn bản rút gọn dễ đọc cho người mua xe
 * @example formatVNDShort(1250000000) => "1 tỷ 250 triệu"
 * @example formatVNDShort(650000000) => "650 triệu"
 */
export function formatVNDShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    const ty = Math.floor(amount / 1_000_000_000);
    const trieu = Math.round((amount % 1_000_000_000) / 1_000_000);
    return trieu > 0 ? `${ty} tỷ ${trieu} triệu` : `${ty} tỷ`;
  }
  if (amount >= 1_000_000) {
    const trieu = Math.round(amount / 1_000_000);
    return `${trieu} triệu`;
  }
  return formatVND(amount);
}
