'use client';

import React, { useState, useEffect } from 'react';

export interface CountdownTimerProps {
  targetDate: string; // ISO string GMT+7, vd: "2026-10-31T23:59:59+07:00"
  urgencyText?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

// 🧠 Mental Model: Client Island đếm ngược thời gian thực an toàn múi giờ Việt Nam (GMT+7).
// Áp dụng cờ isMounted để triệt tiêu 100% lỗi Hydration Mismatch giữa Server UTC và Client GMT+7 (Kiểm toán R2).
// Đồng thời xử lý cleanup clearInterval chặt chẽ trong useEffect để chống rò rỉ bộ nhớ (Kiểm toán R11).
export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  urgencyText = 'Ưu đãi tháng vàng chỉ còn:',
}) => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    setMounted(true);

    function calculateTimeLeft(): TimeLeft {
      const targetTime = new Date(targetDate).getTime();
      const now = Date.now();
      const difference = targetTime - now;

      if (isNaN(targetTime) || difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    }

    // Khởi chạy ngay lập tức khi mount
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Placeholder trước khi mount trên Client để giữ layout không bị nhảy (CLS = 0)
  if (!mounted) {
    return (
      <div className="space-y-2.5 min-h-[76px]" aria-label="Bộ đếm ngược ưu đãi">
        <p className="text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {urgencyText}
        </p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
          {['NGÀY', 'GIỜ', 'PHÚT', 'GIÂY'].map((unit) => (
            <div key={unit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 sm:p-3 text-center shadow-xl">
              <span className="block text-xl sm:text-2xl font-black font-mono text-white">--</span>
              <span className="block text-xs font-bold text-gray-300 tracking-wider mt-1 uppercase">{unit}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs sm:text-sm font-semibold shadow-lg">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span>Ưu đãi đặc biệt trong tháng đang tiếp diễn — Đăng ký nhận giá tốt ngay!</span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  const timeUnits = [
    { label: 'NGÀY', value: pad(timeLeft.days) },
    { label: 'GIỜ', value: pad(timeLeft.hours) },
    { label: 'PHÚT', value: pad(timeLeft.minutes) },
    { label: 'GIÂY', value: pad(timeLeft.seconds) },
  ];

  return (
    <div className="space-y-2.5" aria-label="Bộ đếm ngược ưu đãi">
      <p className="text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-2 drop-shadow">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
        {urgencyText}
      </p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm">
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-2.5 sm:p-3 text-center shadow-xl ring-1 ring-white/10 transition-transform hover:scale-105"
          >
            <span className="block text-xl sm:text-2xl font-black font-mono text-white tracking-tight drop-shadow">
              {unit.value}
            </span>
            <span className="block text-xs font-bold text-gray-300 tracking-wider mt-1 uppercase">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
