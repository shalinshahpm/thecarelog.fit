import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { HealthNote, NewHealthNote } from "@db/schema";

export function useHealthNotes() {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<HealthNote[]>({
    queryKey: ["/api/health-notes"],
  });

  const addNote = useMutation({
    mutationFn: async (newNote: { category: string; title: string; content: string }) => {
      console.log('Sending note data:', newNote); // Debug log
      const res = await fetch("/api/health-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newNote),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('Failed to add note:', error); // Debug log
        throw new Error(error);
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