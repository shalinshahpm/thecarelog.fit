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
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to save medication");
        } catch {
          throw new Error(errorText || "Failed to save medication");
        }
      }
      return res.json();
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
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || "Failed to log medication");
        } catch {
          throw new Error(errorText || "Failed to log medication");
        }
      }
      return res.json();
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