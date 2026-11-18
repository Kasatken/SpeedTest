export class BenchmarkError extends Error {
  constructor(index, count, cause, results) {
    super(`Запрос ${index}/${count}: ${cause.message}`, { cause });
    this.name = 'BenchmarkError';
    this.results = results;
  }
}

// Запросы строго по очереди; download передаётся параметром для тестов
export async function runBenchmark({ url, count, download, onProgress }) {
  const results = [];
  for (let i = 1; i <= count; i++) {
    let result;
    try {
      result = await download(url);
    } catch (error) {
      throw new BenchmarkError(i, count, error, results);
    }
    results.push(result);
    onProgress?.(i, result);
  }
  return results;
}
