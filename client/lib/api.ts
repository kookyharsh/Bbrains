import { supabase } from './supabase-client';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
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
    
    // getSession() is fast but can be stale if the tab has been open a while
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // If we have a session but it might be stale, or if getSession fails, 
    // try getUser() which forces a fresh check and refresh if possible.
    if (sessionError || !session?.access_token) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;
      
      // Re-fetch session after getUser() has potentially refreshed it
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      return refreshedSession?.access_token || null;
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

    // Handle standardized response structure { success, data, message, pagination }
    return {
      ...data,
      success: true,
      data: (data.data !== undefined ? data.data : data) as T,
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
