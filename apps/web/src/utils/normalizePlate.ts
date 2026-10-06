export function normalizePlate(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = cleaned.match(/^([A-Z]{1,3})(\d{1,4})([A-Z]{0,2})$/);
  if (!match) return raw.toUpperCase().trim();
  const [, prefix, number, suffix] = match;
  return `${prefix} ${number}${suffix ? ' ' + suffix : ''}`;
}
