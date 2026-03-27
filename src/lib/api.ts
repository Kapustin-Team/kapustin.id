export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      signal: options.signal ?? AbortSignal.timeout(15_000),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      return {
        error: data?.error_description || data?.message || data?.error || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    method: 'GET',
    ...options,
  });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    method: 'DELETE',
  });
}

export async function apiUpload<T>(path: string, file: File): Promise<ApiResponse<T>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      signal: AbortSignal.timeout(30_000),
      // Do NOT set Content-Type — browser sets it with boundary for multipart
    });

    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      return {
        error: data?.error_description || data?.message || data?.error || `Upload failed with status ${response.status}`,
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Upload error',
      status: 0,
    };
  }
}
