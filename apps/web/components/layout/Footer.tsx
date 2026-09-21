import React from 'react';
import Link from 'next/link';
import { PhoneCall, Mail, MapPin, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import type { ContactSettings, FooterSettings } from '@cardealer/types';
import { sanitizePhoneNumber, FooterSettingsSchema } from '@cardealer/types';

export interface FooterProps {
  contact: ContactSettings;
  footer?: FooterSettings;
}

// 🧠 Mental Model: Chân trang chuẩn Đại lý 3S Hyundai Vinh phục vụ cả trải nghiệm khách hàng lẫn Google Local SEO.
// 1. Phân chia 4 phân khu cấu hình động 100% từ Admin CMS qua FooterSettings:
//    - Cột 1: Thông tin Showroom 3S & Hotline
//    - Cột 2: Danh mục dòng xe nổi bật
//    - Cột 3: Công cụ & Dịch vụ hậu mãi
//    - Cột 4: Bản đồ Showroom & Mạng xã hội
// 2. Chống XSS từ mã nhúng Google Maps bằng cách chỉ nhận URL hợp lệ hoặc iframe sandbox an toàn.
export const Footer = ({ contact, footer }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const cleanHotline = sanitizePhoneNumber(contact.hotlineKinhDoanh);
  const cfg = footer || FooterSettingsSchema.parse({});
  const mapEmbedUrl = cfg.googleMapEmbed || contact.googleMapEmbed;

  return (
    <footer className="w-full bg-slate-950 text-slate-400 text-sm border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pb-20 lg:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-slate-800">
          {/* Cột 1: Thông tin Showroom 3S */}
          <div className="space-y-4">
            <div className="flex items-baseline">
              <span className="text-xl font-black text-white">XE HYUNDAI</span>
              <span className="text-xl font-black text-[#0072CE] ml-1.5">VINH</span>
            </div>
            {(contact.showroomName || cfg.column1Description) && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {[contact.showroomName, cfg.column1Description].filter(Boolean).join(' — ')}
              </p>
            )}

            <div className="space-y-2.5 text-xs">
              {contact.diaChi && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#0072CE] flex-shrink-0 mt-0.5" />
                  <span>{contact.diaChi}</span>
                </div>
              )}
              {contact.hotlineKinhDoanh && (
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Hotline Bán Hàng: <strong className="text-white">{contact.hotlineKinhDoanh}</strong>
                  </span>
                </div>
              )}
              {contact.workingHours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Giờ Làm Việc: {contact.workingHours}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>{contact.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cột 2: Dòng xe nổi bật (Cấu hình động từ Admin) */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              {cfg.column2Title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {cfg.column2Links.map((link) => (
                <li key={link.id || link.label}>
                  <Link
                    href={link.url}
                    className="hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE] group-hover:scale-125 transition-transform" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#0072CE]/20 text-[#0072CE] rounded">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Công cụ & Hậu mãi (Cấu hình động từ Admin) */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              {cfg.column3Title}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {cfg.column3Links.map((link) => (
                <li key={link.id || link.label}>
                  <Link
                    href={link.url}
                    className="hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#0072CE] transition-colors" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Bản đồ Showroom & Mạng xã hội */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              {cfg.column4Title}
            </h4>
            
            {/* Google Maps Embed hoặc Link bản đồ */}
            {mapEmbedUrl ? (
              <div className="w-full h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                <iframe
                  src={mapEmbedUrl}
                  title="Vị trí Showroom Xe Hyundai Vinh"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ) : (
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#0072CE] text-xs text-slate-300 hover:text-white transition-all group"
              >
                <MapPin className="w-4 h-4 text-[#0072CE] group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Mở Google Maps chỉ đường</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-500" />
              </a>
            )}

            {/* Social Links (Icon-only buttons with tooltips & brand hover effects) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {contact.socialMedia.facebookUrl && (
                <a
                  href={contact.socialMedia.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Fanpage Facebook"
                  title="Theo dõi Fanpage Facebook"
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-[#1877F2] border border-slate-800 hover:border-[#1877F2] text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm group"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {contact.socialMedia.tiktokUrl && (
                <a
                  href={contact.socialMedia.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kênh TikTok"
                  title="Theo dõi Kênh TikTok"
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-black border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm group"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.29-.02 2.47-.76 2.99-1.94.3-.64.44-1.35.43-2.07.03-4.38.01-8.77.02-13.15z"/>
                  </svg>
                </a>
              )}
              {contact.socialMedia.youtubeUrl && (
                <a
                  href={contact.socialMedia.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kênh YouTube"
                  title="Đăng ký Kênh YouTube"
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-[#FF0000] border border-slate-800 hover:border-[#FF0000] text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm group"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {contact.socialMedia.zaloUrl && (
                <a
                  href={contact.socialMedia.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo OA"
                  title="Nhắn tin Zalo OA"
                  className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-[#0068FF] border border-slate-800 hover:border-[#0068FF] text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-center hover:scale-110 shadow-sm group font-black text-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 4.966 0 11.092c0 3.497 1.777 6.61 4.545 8.657V24l4.137-2.274c1.05.29 2.164.448 3.318.448 6.627 0 12-4.966 12-11.092C24 4.966 18.627 0 12 0zm-1.89 15.347H6.288v-1.637l2.138-2.613H6.425V9.6h3.685v1.637l-2.138 2.613h2.138v1.497zm2.464 0h-1.508V9.6h1.508v5.747zm5.138 0h-1.508v-2.31h-1.74v2.31h-1.508V9.6h1.508v2.01h1.74V9.6h1.508v5.747z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Chân trang pháp lý & Copyright (Dành khoảng đệm an toàn bên phải cho Widget Chat) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 sm:pr-28 lg:pr-36">
          <div className="space-y-1 text-center sm:text-left">
            {(contact.legal?.businessName || contact.legal?.businessLicense) && (
              <div>
                {[contact.legal.businessName, contact.legal.businessLicense]
                  .filter(Boolean)
                  .join(' — ')}
              </div>
            )}
            {contact.legal?.copyrightText && (
              <div>{contact.legal.copyrightText.replace('{year}', String(currentYear))}</div>
            )}
          </div>

          {cfg.showCertifiedBadge && (
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{cfg.certifiedBadgeText}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
