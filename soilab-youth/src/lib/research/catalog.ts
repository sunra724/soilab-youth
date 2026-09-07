import 'server-only';
import { cache } from 'react';
import { evidenceLibrary, type Evidence } from '@/data/research';
import { sourceEvidence, type ReviewedSource } from './source-core';
import { sourceDb } from './source-store';

export const getSourceCatalog = cache(async (): Promise<{ items: Evidence[]; approved: ReviewedSource[]; available: boolean }> => {
  try {
    const approved: ReviewedSource[] = [];
    for (let offset = 0; ; offset += 500) {
      const rows = await sourceDb<ReviewedSource[]>('youth_policy_sources', `select=*&review_status=eq.approved&order=reviewed_at.desc,id.asc&limit=500&offset=${offset}`);
      approved.push(...rows);
      if (rows.length < 500) break;
    }
    return { items: [...approved.map(sourceEvidence), ...evidenceLibrary], approved, available: true };
  } catch { return { items: evidenceLibrary, approved: [], available: false }; }
});
