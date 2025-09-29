import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = "http://192.168.68.50:3000";

export async function apiRequest<T>(
  url: string,
  data?: any
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

const fetchFn: QueryFunction = async ({ queryKey }) => {
  const [url, data] = queryKey as [string, any?];
  return apiRequest(url, data);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: fetchFn,
    },
  },
});
