#!/usr/bin/env node
import { parseCliArgs } from './args.js';
import { downloadOnce } from './downloader.js';
import { runBenchmark } from './benchmark.js';
import { summarize } from './stats.js';
import { formatProgress, formatReport } from './format.js';

// Точка сборки: аргументы -> замер -> вывод
async function main() {
  const { url, count } = parseCliArgs(process.argv.slice(2));

  console.log(`Адрес: ${url}`);
  console.log(`Запросов: ${count} (последовательно)\n`);

  const results = await runBenchmark({
    url,
    count,
    download: downloadOnce,
    onProgress: (i, result) => console.log(formatProgress(i, count, result)),
  });

  console.log(`\n${formatReport(summarize(results))}`);
}

main().catch((error) => {
  console.error(`Ошибка: ${error.message}`);
  process.exitCode = 1;
});
