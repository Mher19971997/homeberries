const KEY = 'recently_viewed';
const MAX = 20;

export function addRecentlyViewed(uuid: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(KEY);
    const list: string[] = stored ? JSON.parse(stored) : [];
    const filtered = list.filter((id) => id !== uuid);
    filtered.unshift(uuid);
    localStorage.setItem(KEY, JSON.stringify(filtered.slice(0, MAX)));
  } catch {}
}

export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
