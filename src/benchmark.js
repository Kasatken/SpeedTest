/**
 * Делает `count` запросов строго по очереди.
 * `download` передаётся параметром, поэтому в тестах его можно подменить.
 */
export async function runBenchmark({ url, count, download, onProgress }) {
  const results = [];
  for (let i = 1; i <= count; i++) {
    const result = await download(url);
    results.push(result);
    onProgress?.(i, result);
  }
  return results;
}
