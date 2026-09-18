import http from 'node:http';
import { calculateRollingCost } from '@cardealer/core';
import { db } from '@cardealer/database';

const PORT = Number(process.env.API_PORT) || 4000;

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  // Route 1: Healthcheck
  if (url.pathname === '/api/health' && req.method === 'GET') {
    const dbStatus = await db.healthCheck();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'cardealer-api',
        timestamp: new Date().toISOString(),
        database: dbStatus,
      }),
    );
    return;
  }

  // Route 2: Sample Rolling Cost Calculator API
  if (url.pathname === '/api/quote/calculate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const result = calculateRollingCost({
          giaXe: Number(payload.giaXe) || 700_000_000,
          tinhThanhCode: payload.tinhThanhCode || 'nghe_an',
          soChoNgoi: Number(payload.soChoNgoi) || 5,
          hasBaoHiemThanVo: payload.hasBaoHiemThanVo ?? true,
          hasPhiDichVu: payload.hasPhiDichVu ?? true,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: result }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid Request Body';
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: message }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 [Backend API] Server running on http://localhost:${PORT}`);
  console.log(`📡 [Backend API] Healthcheck available at http://localhost:${PORT}/api/health`);
});
