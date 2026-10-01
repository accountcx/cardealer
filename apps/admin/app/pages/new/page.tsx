'use client';

// WHY: Explicit Route cho /pages/new tái sử dụng PageEditorPage từ [id]/page.
// Đảm bảo router Next.js map chính xác URL /pages/new theo chuẩn App Router.
export { default } from '../[id]/page';
