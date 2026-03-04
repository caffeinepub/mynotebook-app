import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useNotes() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotes();
    },
    enabled: !!actor && !actorFetching,
  });

  const createNote = useMutation({
    mutationFn: ({
      title,
      content,
    }: {
      title: string;
      content: string;
    }) => actor!.createNote(title, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const updateNote = useMutation({
    mutationFn: ({
      id,
      title,
      content,
    }: {
      id: string;
      title: string;
      content: string;
    }) => actor!.updateNote(id, title, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => actor!.deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const togglePin = useMutation({
    mutationFn: (id: string) => actor!.togglePin(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const addImage = useMutation({
    mutationFn: ({
      noteId,
      imageUrl,
    }: {
      noteId: string;
      imageUrl: string;
    }) => actor!.addImageToNote(noteId, imageUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const removeImage = useMutation({
    mutationFn: ({
      noteId,
      imageUrl,
    }: {
      noteId: string;
      imageUrl: string;
    }) => actor!.removeImageFromNote(noteId, imageUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const searchNotes = async (term: string) => {
    if (!actor) return [];
    return actor.searchNotes(term);
  };

  // Sort: pinned first, then by updatedAt desc
  const rawNotes = notesQuery.data ?? [];
  const notes = [...rawNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return Number(b.updatedAt - a.updatedAt);
  });

  return {
    notes,
    isLoading: notesQuery.isLoading || actorFetching,
    error: notesQuery.error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    addImage,
    removeImage,
    searchNotes,
    refetch: notesQuery.refetch,
  };
}
