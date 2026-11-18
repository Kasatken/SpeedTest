import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../src/stats.js';

test('считает среднее время, сумму байт и скорость в Мбит/с', () => {
  // 2 запроса по 1 000 000 байт, 1000 мс и 3000 мс
  // Всего 2 МБ = 16 Мбит за 4 с = 4 Мбит/с
  const summary = summarize([
    { bytes: 1_000_000, ms: 1000 },
    { bytes: 1_000_000, ms: 3000 },
  ]);

  assert.equal(summary.requests, 2);
  assert.equal(summary.totalBytes, 2_000_000);
  assert.equal(summary.avgMs, 2000);
  assert.equal(summary.speedMbps, 4);
});

test('бросает ошибку на пустом списке', () => {
  assert.throws(() => summarize([]), /Нет результатов/);
});

test('нулевое время не даёт деления на ноль', () => {
  assert.equal(summarize([{ bytes: 100, ms: 0 }]).speedMbps, 0);
});
