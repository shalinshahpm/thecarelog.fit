import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HealthNote, NewHealthNote } from "@db/schema";

export function useHealthNotes() {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<HealthNote[]>({
    queryKey: ["/api/health-notes"],
  });

  const addNote = useMutation({
    mutationFn: async (newNote: Omit<NewHealthNote, "userId" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/health-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newNote),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-notes"] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...data }: Partial<HealthNote> & { id: number }) => {
      const res = await fetch(`/api/health-notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-notes"] });
    },
  });

  return {
    notes,
    isLoading,
    addNote: addNote.mutateAsync,
    updateNote: updateNote.mutateAsync,
  };
}
