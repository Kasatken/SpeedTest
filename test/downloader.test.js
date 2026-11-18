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

test('медленная, но живая загрузка не обрывается таймаутом', async () => {
  const slow = http.createServer((req, res) => {
    res.writeHead(200);
    let sent = 0;
    const timer = setInterval(() => {
      res.write(Buffer.alloc(10));
      if (++sent === 10) {
        clearInterval(timer);
        res.end();
      }
    }, 50);
  });
  await new Promise((resolve) => slow.listen(0, '127.0.0.1', resolve));
  try {
    const { bytes } = await downloadOnce(`http://127.0.0.1:${slow.address().port}`, { timeoutMs: 200 });
    assert.equal(bytes, 100);
  } finally {
    await new Promise((resolve) => slow.close(resolve));
  }
});

test('в ошибке сети есть причина', async () => {
  const closed = http.createServer();
  await new Promise((resolve) => closed.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${closed.address().port}`;
  await new Promise((resolve) => closed.close(resolve));
  await assert.rejects(() => downloadOnce(url), /ECONNREFUSED/);
});

test('таймаут обрывает зависший запрос', async () => {
  const hanging = http.createServer(() => {});
  await new Promise((resolve) => hanging.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${hanging.address().port}`;
  try {
    await assert.rejects(() => downloadOnce(url, { timeoutMs: 100 }));
  } finally {
    hanging.closeAllConnections();
    await new Promise((resolve) => hanging.close(resolve));
  }
});
