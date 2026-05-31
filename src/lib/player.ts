export const PLAYER_NAME_STORAGE_KEY = "dot-click-player-name";

export const PLAYER_NAME_MIN = 2;
export const PLAYER_NAME_MAX = 16;

export function normalizePlayerName(value: string): string {
  return value.trim();
}

export function validatePlayerName(value: string): string | null {
  const name = normalizePlayerName(value);
  if (name.length < PLAYER_NAME_MIN) {
    return `名前は${PLAYER_NAME_MIN}文字以上で入力してください`;
  }
  if (name.length > PLAYER_NAME_MAX) {
    return `名前は${PLAYER_NAME_MAX}文字以内で入力してください`;
  }
  return null;
}

export function readStoredPlayerName(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? "";
}

export function writeStoredPlayerName(name: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PLAYER_NAME_STORAGE_KEY, name);
}
