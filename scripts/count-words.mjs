/**
 * Spelled-out counts for prose that opens a sentence. check.mjs also uses the keys to find
 * stale numbers, so a count the project has ever stated belongs here.
 */
export const WORDS = {
  30: 'Thirty', 34: 'Thirty-four', 35: 'Thirty-five', 37: 'Thirty-seven',
  42: 'Forty-two', 48: 'Forty-eight',
};

export function countWord(n) {
  if (!WORDS[n]) throw new Error(`no word for ${n} in scripts/count-words.mjs; add it`);
  return WORDS[n];
}
