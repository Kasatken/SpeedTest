import { parseArgs } from 'node:util';

export const DEFAULT_COUNT = 10;

// Разбирает и проверяет аргументы. Ничего не печатает, при ошибке бросает исключение.
export function parseCliArgs(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { count: { type: 'string', short: 'n' } },
  });

  const [rawUrl] = positionals;
  if (!rawUrl) {
    throw new Error('Не указан адрес. Пример: node src/cli.js https://example.com/big.jpg');
  }

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Некорректный адрес: ${rawUrl}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Поддерживаются только http:// и https://');
  }

  const count = values.count === undefined ? DEFAULT_COUNT : Number(values.count);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('--count должно быть целым числом >= 1');
  }

  return { url: url.href, count };
}
