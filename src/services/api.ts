import type {
  Parcel,
  AuditBlock,
  AuditVerificationResult,
  SystemStats,
} from '../types/index.ts';

export async function fetchStats(tolerance = 5): Promise<SystemStats> {
  const res = await fetch(`/api/stats?tolerance=${tolerance}`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchParcels(tolerance = 5): Promise<(Parcel & {
  areaDiffPercent: number;
  reasons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  effectiveStatus: 'Clean' | 'Review' | 'Verified' | 'Rejected';
})[]> {
  const res = await fetch(`/api/parcels?tolerance=${tolerance}`);
  if (!res.ok) throw new Error('Failed to fetch parcels');
  return res.json();
}

export async function fetchParcel(id: string, tolerance = 5) {
  const res = await fetch(`/api/parcels/${encodeURIComponent(id)}?tolerance=${tolerance}`);
  if (!res.ok) throw new Error(`Failed to fetch Khasra ${id}`);
  return res.json();
}

export async function updateParcelField(
  id: string,
  fieldName: string,
  newValue: string,
  officer = 'Revenue Officer'
) {
  const res = await fetch(`/api/parcels/${encodeURIComponent(id)}/field`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fieldName, newValue, officer }),
  });
  if (!res.ok) throw new Error('Failed to update field');
  return res.json();
}

export async function submitDecision(
  id: string,
  decision: 'Verified' | 'Rejected' | 'Pending',
  remarks = '',
  officer = 'Revenue Officer (Tehsil Kharsia)'
) {
  const res = await fetch(`/api/parcels/${encodeURIComponent(id)}/decision`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, remarks, officer }),
  });
  if (!res.ok) throw new Error('Failed to record decision');
  return res.json();
}

export async function analyzeDocument(
  imageBase64?: string,
  mimeType?: string,
  documentHint?: string
) {
  const res = await fetch('/api/ocr/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, documentHint }),
  });
  if (!res.ok) throw new Error('OCR analysis failed');
  return res.json();
}

export async function fetchDiscrepancyAdvisory(parcelData: any) {
  const res = await fetch('/api/ai/explain-discrepancy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parcelData),
  });
  if (!res.ok) throw new Error('Failed to fetch advisory');
  return res.json();
}

export async function fetchAuditTrail(): Promise<AuditBlock[]> {
  const res = await fetch('/api/audit');
  if (!res.ok) throw new Error('Failed to fetch audit ledger');
  return res.json();
}

export async function verifyAuditChain(): Promise<AuditVerificationResult> {
  const res = await fetch('/api/audit/verify', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to verify chain integrity');
  return res.json();
}

export async function tamperAuditBlock(index = 1): Promise<{ success: boolean; isTampered: boolean; message: string }> {
  const res = await fetch('/api/audit/tamper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index }),
  });
  if (!res.ok) throw new Error('Failed to toggle tamper demo');
  return res.json();
}

export async function resetLedger(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/audit/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset ledger');
  return res.json();
}
