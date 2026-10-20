/**
 * AI Civic Assistant - Lightweight Local Development Server
 * Uses native Node.js HTTP and File System modules (Zero npm dependencies required!)
 * 
 * Usage:
 *   node server.js
 * Then open:
 *   http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Parse clean URL path without query strings
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`<h1>404 Not Found</h1><p>The file <code>${reqUrl}</code> was not found.</p><a href="/">Back to Home</a>`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`<h1>500 Internal Server Error</h1><p>${err.code}</p>`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌱 AI Civic Assistant - PBL Prototype Server Running!`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`📂 Serving:   ${PUBLIC_DIR}`);
  console.log(`⌨️  Press Ctrl + C to stop server`);
  console.log(`=======================================================`);
});
