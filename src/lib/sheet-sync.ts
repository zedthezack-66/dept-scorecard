import * as XLSX from 'xlsx';
import type { AgentData } from './data';
import { parseCollectionsCsv } from './csv-utils';

const STORAGE_KEY = 'dash_sheet_sync_urls';

export interface SheetSyncUrls {
  agents?: string;
}

export function getSyncUrls(): SheetSyncUrls {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSyncUrls(urls: SheetSyncUrls) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

/**
 * Normalize a Google Sheets share/edit URL to a CSV export URL.
 * Leaves other URLs (xlsx, csv, direct download) untouched.
 */
export function normalizeSheetUrl(url: string): string {
  const trimmed = url.trim();
  const gsMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
  if (gsMatch) {
    const id = gsMatch[1];
    const gidMatch = trimmed.match(/[?#&]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  }
  return trimmed;
}

/**
 * Fetch a spreadsheet URL (CSV or XLSX) and return CSV text.
 * Supports Google Sheets share URLs and direct Excel download URLs.
 */
export async function fetchSheetAsCsv(url: string): Promise<string> {
  const normalized = normalizeSheetUrl(url);
  const res = await fetch(normalized);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}). Ensure the sheet is public / anyone-with-link.`);

  const contentType = res.headers.get('content-type') || '';
  const lower = normalized.toLowerCase();
  const looksXlsx =
    lower.includes('.xlsx') ||
    contentType.includes('spreadsheetml') ||
    contentType.includes('officedocument');

  if (looksXlsx) {
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const first = wb.SheetNames[0];
    return XLSX.utils.sheet_to_csv(wb.Sheets[first]);
  }
  return await res.text();
}

/** Refresh agents from configured URL, returning parsed rows. */
export async function refreshAgentsFromSheet(url: string): Promise<AgentData[]> {
  const csv = await fetchSheetAsCsv(url);
  const agents = parseCollectionsCsv(csv);
  if (agents.length === 0) throw new Error('No agent rows found in sheet.');
  return agents;
}
