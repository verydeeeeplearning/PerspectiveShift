export const SHARE_CARD_TYPES = ["ALIAS", "THOUGHT_MAP", "MISPERCEPTION"] as const;

export type ShareCardType = (typeof SHARE_CARD_TYPES)[number];

export function isValidShareCardType(value: string): value is ShareCardType {
  return SHARE_CARD_TYPES.includes(value as ShareCardType);
}
