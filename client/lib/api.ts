import { supabase } from './supabase-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export async function getAuthToken(): Promise<string | null> {
  // SSR path: use server-side helper to fetch the token from cookies/session
  if (typeof window === 'undefined') {
    try {
      // Dynamic imports to avoid bundling server-only code in the client bundle
      const { cookies } = await import('next/headers');
      // Use createServerClient from @supabase/ssr as it's more modern and already in use in middleware
      const { createServerClient } = await import('@supabase/ssr');
      
      const cookieStore = await cookies();
      
      const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {
              // Read-only in this context
            },
          },
        }
      );

      const { data: { session }, error } = await supabaseServer.auth.getSession();
      if (error || !session?.access_token) return null;
      return session.access_token;
    } catch (e) {
      console.error('SSR getAuthToken error:', e);
      return null;
    }
  }

  // Client path: use shared client session via cookies
  try {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      return null;
    }
    return session.access_token;
  } catch (e) {
    console.error('Error getting token:', e);
    return null;
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error || data.message,
      };
    }

    return {
      success: true,
      data: data.data ?? data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, { method: 'GET' });
}

export async function post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return makeRequest<T>(endpoint, { method: 'DELETE' });
}

export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  getAuthToken,
};
