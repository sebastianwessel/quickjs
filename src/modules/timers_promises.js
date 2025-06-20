export default `
export const setTimeout = (delay, value, options) => new Promise((resolve, reject) => {
  const id = globalThis.setTimeout(() => resolve(value), delay);
  if (options && options.signal) {
    const abortHandler = () => {
      globalThis.clearTimeout(id);
      reject(options.signal.reason ?? new Error('AbortError'));
    };
    if (options.signal.aborted) {
      abortHandler();
      return;
    }
    options.signal.addEventListener('abort', abortHandler, { once: true });
  }
});

export const setImmediate = (value, options) => new Promise((resolve, reject) => {
  const id = globalThis.setTimeout(() => resolve(value), 0);
  if (options && options.signal) {
    const abortHandler = () => {
      globalThis.clearTimeout(id);
      reject(options.signal.reason ?? new Error('AbortError'));
    };
    if (options.signal.aborted) {
      abortHandler();
      return;
    }
    options.signal.addEventListener('abort', abortHandler, { once: true });
  }
});

export async function* setInterval(delay, value) {
  while (true) {
    await new Promise((resolve) => globalThis.setTimeout(resolve, delay));
    yield value;
  }
}

export default { setTimeout, setImmediate, setInterval }
`
