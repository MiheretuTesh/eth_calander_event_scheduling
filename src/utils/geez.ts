// ─── Ge'ez (Ethiopic) Numerals ─────────────────────────────────
// Converts Arabic numerals to Ge'ez numerals used in the Ethiopian
// calendar. Handles the ranges this app needs (days 1–30, years up
// to four digits) with correct ፻ (hundred) / ፼ (ten-thousand) marks.

const ONES = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
const TENS = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];

/** Renders a value 0–99 as Ge'ez. */
function pair(n: number): string {
  return TENS[Math.floor(n / 10)] + ONES[n % 10];
}

/**
 * Converts a positive integer to its Ge'ez numeral string.
 * Non-positive or non-integer values are returned as-is (decimal).
 *
 * Examples: 1 → ፩, 17 → ፲፯, 100 → ፻, 2018 → ፳፻፲፰
 */
export function toGeez(num: number): string {
  if (!Number.isInteger(num) || num <= 0) return String(num);

  // Split into base-100 groups, least-significant first.
  const groups: number[] = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 100);
    n = Math.floor(n / 100);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    // A leading "1" before a hundred/ten-thousand mark is implicit (100 = ፻).
    let part = g === 1 && i > 0 ? '' : pair(g);
    if (i > 0) part += i % 2 === 1 ? '፻' : '፼';
    result += part;
  }
  return result;
}
