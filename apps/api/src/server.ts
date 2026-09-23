import http from 'node:http';
import { checkDatabaseHealth } from '@cardealer/database';
import { handleAuthRoutes } from './routes/auth';
import { handleCatalogRoutes } from './routes/catalog';
import { handleLeadRoutes } from './routes/leads';
import { handleAdminRoutes } from './routes/admin';

// 🧠 Mental Model: Micro REST API Server & Central Dispatcher.
// Thiết kế theo chuẩn Router Delegation Pattern, phân tách routes thành các module con (< 100 dòng mỗi file).
// Áp dụng bảo vệ Logging Sanitization (CWE-117) và Zero Hardcode thông qua biến môi trường API_PORT.

const PORT = Number(process.env.API_PORT) || 4000;

const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3002');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost:4000'}`);

  // Phòng thủ: Khử duplicate prefix /api/api nếu client hoặc proxy gửi lặp
  if (url.pathname.startsWith('/api/api/')) {
    url.pathname = url.pathname.replace(/^\/api\/api\//, '/api/');
  }

  // Chuẩn hóa: Loại bỏ trailing slash nếu pathname dài hơn 1 ký tự
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  // An toàn Logging: Khử ký tự \r\n chống Log Injection (CWE-117), không log Auth Token/PII (CWE-200)
  const safeMethod = (req.method || 'GET').replace(/[\r\n]/g, '');
  const safePath = url.pathname.replace(/[\r\n]/g, '');
  console.log(`[API] ${safeMethod} ${safePath}`);

  // Helper response
  const sendJson = (statusCode: number, data: unknown, headers: Record<string, string> = {}) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify(data));
  };

  // Helper đọc body
  const readBody = async (): Promise<Record<string, unknown>> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  // 1. Healthcheck Endpoint
  if (url.pathname === '/api/health' && req.method === 'GET') {
    const dbHealth = await checkDatabaseHealth();
    sendJson(200, {
      status: 'ok',
      service: 'cardealer-api',
      version: '1.0.0',
      database: dbHealth.ok ? 'connected' : 'disconnected',
      databaseMessage: dbHealth.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 2. Auth Routes
  if (await handleAuthRoutes(req, res, url, readBody, sendJson)) return;

  // 3. Catalog Routes
  if (await handleCatalogRoutes(req, res, url, sendJson)) return;

  // 3.5. Public Lead Routes (POST /api/leads)
  if (await handleLeadRoutes(req, res, url, readBody, sendJson)) return;

  // 4. Admin Protected Routes
  if (await handleAdminRoutes(req, res, url, readBody, sendJson)) return;

  // Fallback 404
  sendJson(404, {
    success: false,
    error: { code: 'NOT_FOUND', message: `Route không tồn tại: ${safePath}` },
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 [CarDealer API] Server đang chạy tại http://localhost:${PORT}`);
    try {
      const health = await checkDatabaseHealth();
      if (health.ok) {
        console.log('✅ [CarDealer API] Kết nối Database thành công và sẵn sàng phục vụ!');
      } else {
        console.warn('⚠️ [CarDealer API] Không thể kết nối tới Database:', health.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('💥 [CarDealer API] Lỗi kiểm tra kết nối DB:', msg);
    }
  });
}

export default server;
