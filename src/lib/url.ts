const HTTP_PREFIX = /^https?:\/\//i;

/** Aceita apenas URLs http(s) bem formadas. Bloqueia javascript:, data:, etc. */
export function isSafeHttpUrl(value: string): boolean {
  const v = value.trim();
  if (!HTTP_PREFIX.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Devolve a URL limpa se for segura; caso contrário, null. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  return isSafeHttpUrl(v) ? v : null;
}
