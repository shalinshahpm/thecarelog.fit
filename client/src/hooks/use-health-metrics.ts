import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HealthMetric, NewHealthMetric } from "@db/schema";

export function useHealthMetrics() {
  const queryClient = useQueryClient();

  const { data: metrics = [], isLoading } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics"],
  });

  const addMetric = useMutation({
    mutationFn: async (newMetric: Omit<NewHealthMetric, "userId">) => {
      const res = await fetch("/api/health-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newMetric),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      }
      throw new Error("Server returned invalid response format");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-metrics"] });
    },
  });

  return {
    metrics,
    isLoading,
    addMetric: addMetric.mutateAsync,
  };
}
