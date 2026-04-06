export function formatTotal(totalAmount: string, currency: string | null): string {
  const amount = Number(totalAmount);
  if (!Number.isFinite(amount)) return totalAmount;
  if (!currency) return amount.toFixed(2);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
