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
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to save health metrics");
        } catch {
          throw new Error(errorText || "Failed to save health metrics");
        }
      }
      return res.json();
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
