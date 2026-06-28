/**
 * Wait for async operation to complete
 */
export async function waitForAsync(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises (microtasks)
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Advance Jest timers and flush promises
 */
export async function advanceTimersAndFlush(ms: number): Promise<void> {
  jest.advanceTimersByTime(ms);
  await flushPromises();
}

/**
 * Wait for condition to be true
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition());
    if (result) {
      return;
    }
    await waitForAsync(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await waitForAsync(initialDelay * Math.pow(2, attempt));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
