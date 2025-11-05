import { useQuery } from "@tanstack/react-query";
import { customInstance } from "@/lib/api/fetcher";

interface MneePrice {
  price: number;
  currency: string;
  change24h: number;
  lastUpdated: string;
}

/**
 * Fetches the current MNEE price
 */
const fetchMneePrice = async (): Promise<MneePrice> => {
  return customInstance<MneePrice>({
    url: "/mnee/price",
    method: "GET",
  });
};

/**
 * Custom hook to fetch MNEE price
 * Uses React Query for caching and automatic refetching
 */
export function useMneePrice() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/mnee/price"],
    queryFn: fetchMneePrice,
  });

  return {
    price: data,
    isLoading,
    error,
    refresh: refetch,
  };
}
