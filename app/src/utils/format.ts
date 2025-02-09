export function formatNumber(num: number): string {
  if (num >= 1000) {
    return num.toFixed(1);
  }
  return num.toFixed(4);
} 