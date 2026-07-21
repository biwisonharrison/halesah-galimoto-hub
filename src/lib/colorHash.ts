export const CAR_GRADIENTS = [
  "from-brand-600 to-brand-900",
  "from-ink to-brand-700",
  "from-amber-500 to-ink",
  "from-brand-500 to-ink",
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function gradientForSeed(seed: string): string {
  return CAR_GRADIENTS[hashString(seed) % CAR_GRADIENTS.length];
}
