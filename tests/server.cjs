const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(process.env.SITE_ROOT || 'dist');
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function resolveRequest(requestPath) {
  const pathname = decodeURIComponent(new URL(requestPath, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolvedPath = path.resolve(root, relativePath);
  return resolvedPath.startsWith(`${root}${path.sep}`) || resolvedPath === root ? resolvedPath : null;
}

function sendFile(response, filePath, statusCode) {
  const contentType = contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  const requestedFile = resolveRequest(request.url || '/');

  if (!requestedFile) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  fs.stat(requestedFile, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(response, requestedFile, 200);
      return;
    }

    sendFile(response, path.join(root, '404.html'), 404);
  });
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Static test server listening on ${port}\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
