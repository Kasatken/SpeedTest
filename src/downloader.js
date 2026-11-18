const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Скачивает URL и возвращает размер в байтах и время в мс.
 * Единственное место с сетью.
 *
 * Тело читаем потоком, чтобы не держать файл в памяти.
 * Время считаем до последнего байта, а не до заголовков.
 */
export async function downloadOnce(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const start = performance.now();

  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) {
    throw new Error(`Сервер ответил ${response.status} ${response.statusText}`);
  }

  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length;
  }

  return { bytes, ms: performance.now() - start };
}
