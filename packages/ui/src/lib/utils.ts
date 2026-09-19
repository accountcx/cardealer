import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 🧠 Mental Model: Canonical cn() helper cho Shadcn UI
// Kết hợp clsx linh hoạt class ngữ cảnh và tailwind-merge xử lý xung đột class Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
