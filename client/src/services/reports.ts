import type {
  ReportPeriodType,
  ReportResponse,
} from '@krishna-atta-chakki/shared/reports';
import { API_URL, apiRequest } from '@/lib/api';

export function fetchReport(
  type: ReportPeriodType,
  value: string,
  summaryOnly = false,
): Promise<ReportResponse> {
  const query = new URLSearchParams(
    type === 'monthly' ? { month: value } : { date: value },
  );
  if (summaryOnly) query.set('summaryOnly', 'true');
  return apiRequest(`/api/reports/${type}?${query.toString()}`);
}
export async function downloadReport(
  type: ReportPeriodType,
  value: string,
): Promise<void> {
  const query = new URLSearchParams({
    type,
    ...(type === 'monthly' ? { month: value } : { date: value }),
  });
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/reports/export?${query.toString()}`);
  } catch {
    throw new Error(
      'The server is not reachable. Check that the server is running and try again.',
    );
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error ?? 'Could not download the Excel report.');
  }
  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `krishna-atta-chakki-${type}-report-${value}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}
