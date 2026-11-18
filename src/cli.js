#!/usr/bin/env node
import { parseCliArgs } from './args.js';
import { downloadOnce } from './downloader.js';
import { runBenchmark, BenchmarkError } from './benchmark.js';
import { summarize } from './stats.js';
import { formatProgress, formatReport } from './format.js';

// Точка сборки: аргументы -> замер -> вывод
async function main() {
  const { url, count, timeoutMs } = parseCliArgs(process.argv.slice(2));

  console.log(`Адрес: ${url}`);
  console.log(`Запросов: ${count} (последовательно)\n`);

  let results;
  try {
    results = await runBenchmark({
      url,
      count,
      download: (target) => downloadOnce(target, { timeoutMs }),
      onProgress: (i, result) => console.log(formatProgress(i, count, result)),
    });
  } catch (error) {
    // Показываем итог по успешным запросам
    if (error instanceof BenchmarkError && error.results.length > 0) {
      console.log(`\nПрогон прерван, итог по ${error.results.length} успешным:`);
      console.log(formatReport(summarize(error.results)));
    }
    throw error;
  }

  console.log(`\n${formatReport(summarize(results))}`);
}

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
