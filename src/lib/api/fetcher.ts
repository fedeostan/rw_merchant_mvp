import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { createClient } from "@/lib/supabase/client";

// Token cache to avoid async calls on every request
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    console.log("[getAuthToken] Using cached token");
    return cachedToken;
  }

  // Fetch fresh token
  try {
    console.log("[getAuthToken] Fetching fresh token from Supabase");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    cachedToken = session?.access_token || null;
    // Cache for 55 minutes (tokens typically expire in 1 hour)
    tokenExpiry = Date.now() + (55 * 60 * 1000);
    console.log("[getAuthToken] Token cached, expires in 55 minutes");
    return cachedToken;
  } catch (error) {
    console.error("[getAuthToken] Failed to fetch token:", error);
    return null;
  }
};

const getBaseURL = (): string => {
  // For browser environments, use absolute URL for MSW compatibility
  // MSW requires absolute URLs to properly intercept requests
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }

  // Fallback for SSR or when window is not available
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
};

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const token = await getAuthToken();
  const baseURL = getBaseURL();

  console.log("[customInstance] Making request:", {
    url: config.url,
    method: config.method,
    baseURL,
    hasToken: !!token,
  });

  const promise = axios({
    ...config,
    ...options,
    baseURL,
    headers: {
      ...config.headers,
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => {
    console.log("[customInstance] Success:", config.url, data);
    return data;
  }).catch((error) => {
    // Don't log cancellation errors - they're normal when components unmount
    if (axios.isCancel(error)) {
      console.log("[customInstance] Request cancelled:", config.url);
      throw error;
    }

    console.error("[customInstance] Error:", config.url, error.message, error.response?.data);
    throw error;
  });

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;


