const BANNED_WORDS = [
  // English — profanity / sexual
  "fuck",
  "fuk",
  "fck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "cock",
  "pussy",
  "cunt",
  "whore",
  "slut",
  "bastard",
  "penis",
  "vagina",
  "porn",
  "hentai",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "rape",
  "kill yourself",
  "kys",
  // Romanized
  "chinko",
  "manko",
  "oppai",
  "ecchi",
  "etchi",
  // Japanese — kana / kanji
  "くそ",
  "クソ",
  "糞",
  "うんこ",
  "ウンコ",
  "ちんこ",
  "チンコ",
  "ちんぽ",
  "チンポ",
  "まんこ",
  "マンコ",
  "おっぱい",
  "オッパイ",
  "セックス",
  "せっくす",
  "エロ",
  "えろ",
  "淫",
  "殺す",
  "殺せ",
  "死ね",
  "氏ね",
  "しね",
  "シネ",
  "自殺",
  "レイプ",
  // Hate / slurs
  "支那",
  "土人",
] as const;

/** Short or ambiguous terms: block only when the whole name matches. */
const EXACT_MATCH_WORDS = new Set(["sex", "sexy", "ass", "kys", "エロ", "えろ"]);

function normalizeForBanCheck(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/[@$]/g, "s")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function matchesBannedWord(normalized: string, banned: string): boolean {
  if (!banned) return false;
  if (EXACT_MATCH_WORDS.has(banned)) {
    return normalized === banned;
  }
  return normalized.includes(banned);
}

export function containsBannedPlayerName(value: string): boolean {
  const normalized = normalizeForBanCheck(value);
  if (!normalized) return false;

  return BANNED_WORDS.some((word) =>
    matchesBannedWord(normalized, normalizeForBanCheck(word))
  );
}

export const BANNED_PLAYER_NAME_MESSAGE = "この名前は使用できません";
