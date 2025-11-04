import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("session");
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.accessToken || null;
  } catch {
    return null;
  }
};

const getBaseURL = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
};

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const token = getAuthToken();

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

