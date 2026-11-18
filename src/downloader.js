export const DEFAULT_TIMEOUT_MS = 30_000;

// Качает URL потоком. Таймаут срабатывает, только если данные не идут timeoutMs
export async function downloadOnce(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const start = performance.now();
  const controller = new AbortController();

  let timer;
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(
      () => controller.abort(new Error(`Таймаут: нет данных ${timeoutMs} мс`)),
      timeoutMs,
    );
  };

  resetTimer();
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Сервер ответил ${response.status} ${response.statusText}`);
    }

    let bytes = 0;
    for await (const chunk of response.body) {
      bytes += chunk.length;
      resetTimer();
    }

    return { bytes, ms: performance.now() - start };
  } catch (error) {
    throw withCause(error);
  } finally {
    clearTimeout(timer);
  }
}

// fetch прячет причину в error.cause
function withCause(error) {
  const cause = error.cause?.code ?? error.cause?.message;
  return cause ? new Error(`${error.message} (${cause})`) : error;
}
