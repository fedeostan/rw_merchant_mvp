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
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
};

export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const token = await getAuthToken();

  const promise = axios({
    ...config,
    ...options,
    baseURL: getBaseURL(),
    headers: {
      ...config.headers,
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;


