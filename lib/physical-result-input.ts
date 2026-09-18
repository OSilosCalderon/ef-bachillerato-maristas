/** Keep the editable text intact; convert only for validation and persistence. */
export function parsePhysicalResult(raw: string): number | undefined {
  const text = raw.trim();
  if (!/^(?:[0-9]+(?:[.,][0-9]*)?|[.,][0-9]+)$/.test(text)) return undefined;
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}
