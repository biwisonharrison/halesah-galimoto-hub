/**
 * Normalizes Malawian phone numbers to E.164 (+265XXXXXXXXX).
 * Accepts local format (0991234567), bare international (265991234567),
 * or already-normalized (+265991234567). Returns null if it doesn't look
 * like a valid Malawian mobile number.
 */
export function normalizeMalawiPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");

  let national: string | null = null;
  if (digits.length === 10 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith("265")) {
    national = digits.slice(3);
  } else if (digits.length === 9) {
    national = digits;
  }

  if (!national || national.length !== 9) return null;
  return `+265${national}`;
}
