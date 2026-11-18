// 1 МБ = 1 млн байт, чтобы единицы совпадали с Мбит/с
export function formatMegabytes(bytes) {
  return `${(bytes / 1_000_000).toFixed(2)} МБ`;
}

// Строка прогресса для одного запроса
export function formatProgress(index, count, { bytes, ms }) {
  return `[${index}/${count}] ${formatMegabytes(bytes)} за ${ms.toFixed(0)} мс`;
}

// Итоговый отчёт
export function formatReport(summary) {
  return [
    '--- Итог ---',
    `Запросов:               ${summary.requests}`,
    `Среднее время запроса:  ${summary.avgMs.toFixed(0)} мс`,
    `Скачано всего:          ${formatMegabytes(summary.totalBytes)}`,
    `Скорость скачивания:    ${summary.speedMbps.toFixed(2)} Мбит/с`,
  ].join('\n');
}
