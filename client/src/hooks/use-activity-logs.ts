
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActivityLog } from "@db/schema";

export function useActivityLogs() {
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
  });

  const addLog = useMutation({
    mutationFn: async (newLog: { type: string; value: number; duration?: number; notes?: string }) => {
      const res = await fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newLog),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
    },
  });

  return {
    logs,
    isLoading,
    addLog: addLog.mutateAsync,
  };
}
