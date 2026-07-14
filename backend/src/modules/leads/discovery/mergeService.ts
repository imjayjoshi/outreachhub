export interface RawLead {
  name: string;
  website: string;
  source: string;
}

/**
 * Merges multiple source arrays by domain (unique key).
 * If the same domain appears in multiple sources, the source labels are combined
 * e.g. "duckduckgo+clutch".
 */
export function mergeSources(...sourceLists: RawLead[][]): RawLead[] {
  const seen = new Map<string, RawLead>();

  for (const list of sourceLists) {
    for (const lead of list) {
      const key = lead.website.toLowerCase().trim();
      if (!key) continue;

      if (!seen.has(key)) {
        seen.set(key, { ...lead, website: key });
      } else {
        const existing = seen.get(key)!;
        if (!existing.source.includes(lead.source)) {
          existing.source = `${existing.source}+${lead.source}`;
        }
      }
    }
  }

  return Array.from(seen.values());
}
