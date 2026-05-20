import { createServer } from 'http';
import { request as httpRequest } from 'http';
import { spawn } from 'child_process';

const PROXY_PORT = parseInt(process.env.PORT || '3000', 10);
const NEXT_PORT = 3002;

const nextProcess = spawn(
  'node_modules/.bin/next',
  ['dev', '-p', String(NEXT_PORT), '-H', '0.0.0.0'],
  {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(NEXT_PORT) },
  }
);

nextProcess.on('exit', (code) => {
  console.log(`Next.js exited with code ${code}`);
  process.exit(code ?? 0);
});

const server = createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${NEXT_PORT}` },
  };

  const proxy = httpRequest(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', () => {
    res.writeHead(502);
    res.end('Next.js is starting up, please refresh in a moment...');
  });

  req.pipe(proxy, { end: true });
});

server.on('upgrade', (req, socket, head) => {
  const options = {
    hostname: '127.0.0.1',
    port: NEXT_PORT,
    path: req.url,
    headers: req.headers,
  };

  const proxyReq = httpRequest(options);
  proxyReq.on('upgrade', (proxyRes, proxySocket) => {
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        Object.keys(proxyRes.headers)
          .map((k) => `${k}: ${proxyRes.headers[k]}`)
          .join('\r\n') +
        '\r\n\r\n'
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxyReq.on('error', () => socket.destroy());
  proxyReq.end();
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(
    `Dev proxy listening on port ${PROXY_PORT} → forwarding to Next.js on ${NEXT_PORT}`
  );
});
