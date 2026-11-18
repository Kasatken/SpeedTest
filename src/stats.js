/**
 * Считает итоги: среднее время и скорость в Мбит/с.
 * Скорость = все байты / всё время, а не среднее скоростей запросов:
 * так быстрые и медленные запросы учитываются честно.
 */
export function summarize(results) {
  if (results.length === 0) {
    throw new Error('Нет результатов для подсчёта');
  }

  const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);
  const totalMs = results.reduce((sum, r) => sum + r.ms, 0);
  const avgMs = totalMs / results.length;
  const speedMbps = totalMs === 0 ? 0 : (totalBytes * 8) / (totalMs / 1000) / 1_000_000;

  return { requests: results.length, totalBytes, totalMs, avgMs, speedMbps };
}
