import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Medication, NewMedication, MedicationLog, NewMedicationLog } from "@db/schema";

export function useMedications() {
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: medicationLogs = [] } = useQuery<MedicationLog[]>({
    queryKey: ["/api/medications/logs"],
  });

  const addMedication = useMutation({
    mutationFn: async (newMedication: Omit<NewMedication, "userId">) => {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newMedication),
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
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
  });

  const logMedication = useMutation({
    mutationFn: async (newLog: Omit<NewMedicationLog, "userId" | "takenAt">) => {
      const res = await fetch("/api/medications/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newLog),
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
      queryClient.invalidateQueries({ queryKey: ["/api/medications/logs"] });
    },
  });

  return {
    medications,
    medicationLogs,
    isLoading,
    addMedication: addMedication.mutateAsync,
    logMedication: logMedication.mutateAsync,
  };
}