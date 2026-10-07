export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: init?.cache ?? 'no-store',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new Error(
      'The server is not reachable. Check that the server is running and try again.',
    );
  }
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok)
    throw new Error(body.error ?? 'Could not complete the request.');
  return body;
}
