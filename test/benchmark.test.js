import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runBenchmark } from '../src/benchmark.js';

test('запросы идут строго по очереди', async () => {
  const log = [];
  let active = 0;

  const download = async () => {
    active++;
    log.push(`start (параллельно: ${active})`);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active--;
    return { bytes: 10, ms: 5 };
  };

  const results = await runBenchmark({ url: 'http://x', count: 4, download });

  assert.equal(results.length, 4);
  // ни в один момент одновременно не было больше одного запроса
  assert.ok(log.every((line) => line === 'start (параллельно: 1)'));
});

test('вызывает onProgress для каждого запроса', async () => {
  const seen = [];
  await runBenchmark({
    url: 'http://x',
    count: 3,
    download: async () => ({ bytes: 1, ms: 1 }),
    onProgress: (i) => seen.push(i),
  });
  assert.deepEqual(seen, [1, 2, 3]);
});

test('ошибка скачивания прерывает прогон', async () => {
  let calls = 0;
  const download = async () => {
    calls++;
    if (calls === 2) throw new Error('boom');
    return { bytes: 1, ms: 1 };
  };
  await assert.rejects(() => runBenchmark({ url: 'http://x', count: 5, download }), /boom/);
  assert.equal(calls, 2);
});

test('ошибка знает номер запроса и успешные результаты', async () => {
  let calls = 0;
  const download = async () => {
    if (++calls === 3) throw new Error('boom');
    return { bytes: 1, ms: 1 };
  };
  await assert.rejects(
    () => runBenchmark({ url: 'http://x', count: 5, download }),
    (error) => /Запрос 3\/5: boom/.test(error.message) && error.results.length === 2,
  );
});
