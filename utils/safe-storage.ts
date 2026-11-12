// localStorage throws (SecurityError) when site data is blocked; fall back to
// an in-memory map so callers never crash the page.
const memory = new Map<string, string>();

export function getItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export function setItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}
