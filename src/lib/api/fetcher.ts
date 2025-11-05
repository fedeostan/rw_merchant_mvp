import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { createClient } from "@/lib/supabase/client";

const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
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


