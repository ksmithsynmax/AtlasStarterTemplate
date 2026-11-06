/** Read-only access to SynMax dashboards shared by public link. */
const PUBLIC_API = 'https://api.atlas-prod.synmax.com/public';

export interface PublicDatasetPage<Row> {
  columns: string[];
  data: Row[];
  total_rows: number;
}

/** Rows of one dataset behind a shared dashboard. */
export async function fetchPublicDataset<Row>(
  shareToken: string,
  datasetId: number,
  { limit = 20000, signal }: { limit?: number; signal?: AbortSignal } = {},
): Promise<Row[]> {
  const url = `${PUBLIC_API}/dataset/${datasetId}/data?share_token=${encodeURIComponent(shareToken)}&limit=${limit}`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Dataset ${datasetId} failed to load (${response.status})`);
  const page = (await response.json()) as PublicDatasetPage<Row>;
  return page.data;
}
