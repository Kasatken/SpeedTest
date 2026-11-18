import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { downloadOnce } from '../src/downloader.js';

const BODY_SIZE = 500_000;
let server;
let baseUrl;

before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/big') {
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      res.end(Buffer.alloc(BODY_SIZE));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('считает полный размер тела и время', async () => {
  const { bytes, ms } = await downloadOnce(`${baseUrl}/big`);
  assert.equal(bytes, BODY_SIZE);
  assert.ok(ms > 0);
});

test('HTTP-ошибка превращается в исключение', async () => {
  await assert.rejects(() => downloadOnce(`${baseUrl}/missing`), /404/);
});

test('таймаут обрывает зависший запрос', async () => {
  const hanging = http.createServer(() => {}); // принимает запрос и молчит
  await new Promise((resolve) => hanging.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${hanging.address().port}`;
  try {
    await assert.rejects(() => downloadOnce(url, { timeoutMs: 100 }));
  } finally {
    hanging.closeAllConnections();
    await new Promise((resolve) => hanging.close(resolve));
  }
});
