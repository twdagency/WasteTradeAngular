/** Normalise for case- and whitespace-insensitive company name comparison. */
export function normalizeCompanyNameForComparison(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function companyNamesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeCompanyNameForComparison(a) === normalizeCompanyNameForComparison(b);
}
