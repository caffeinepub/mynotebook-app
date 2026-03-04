import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, LogOut, Plus, Search, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNotes } from "../hooks/useNotes";
import type { Note } from "../types/note";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";
import { ThemeToggle } from "./ThemeToggle";

interface NotesPageProps {
  principal: string;
  userName: string | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function NotesPage({
  principal,
  userName,
  theme,
  onToggleTheme,
  onLogout,
}: NotesPageProps) {
  const {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    addImage,
    removeImage,
  } = useNotes();

  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Client-side filter for fast search UX
  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notes, search]);

  const handleOpenNew = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSave = async ({
    title,
    content,
    newImages,
    removedImages,
  }: {
    title: string;
    content: string;
    newImages: string[];
    removedImages: string[];
  }) => {
    setIsSaving(true);
    try {
      if (editingNote) {
        // Update existing note
        const updatedNote = await updateNote.mutateAsync({
          id: editingNote.id,
          title,
          content,
        });

        // Remove images that were deleted
        for (const url of removedImages) {
          await removeImage.mutateAsync({
            noteId: updatedNote.id,
            imageUrl: url,
          });
        }

        // Add new images
        for (const imageUrl of newImages) {
          await addImage.mutateAsync({
            noteId: updatedNote.id,
            imageUrl,
          });
        }

        toast.success("Note updated");
      } else {
        // Create new note
        const createdNote = await createNote.mutateAsync({ title, content });

        // Add images to the newly created note
        for (const imageUrl of newImages) {
          await addImage.mutateAsync({
            noteId: createdNote.id,
            imageUrl,
          });
        }

        toast.success("Note created");
      }

      setEditorOpen(false);
      setEditingNote(null);
    } catch {
      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (note: Note) => {
    setDeleteTarget(note);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNote.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await togglePin.mutateAsync(noteId);
    } catch {
      toast.error("Failed to update pin.");
    }
  };

  // Display name: user's name, or short principal as fallback
  const shortPrincipal = `${principal.slice(0, 5)}...${principal.slice(-3)}`;
  const displayName = userName ?? shortPrincipal;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-auto">
            <BookOpen className="w-5 h-5 text-primary shrink-0" />
            <span className="font-display font-bold text-foreground text-base hidden sm:block">
              My Notebook
            </span>
          </div>

          {/* User display */}
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-full px-3 py-1.5">
            <User className="w-3 h-3 text-primary/80" />
            <span className={userName ? "" : "font-mono"}>{displayName}</span>
          </span>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <Button
            data-ocid="header.logout_button"
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 h-9 rounded-xl text-muted-foreground hover:text-foreground px-3"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Sign out</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="notes.search_input"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-11 rounded-xl bg-secondary/60 border-transparent focus-visible:border-ring focus-visible:bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div data-ocid="notes.loading_state" className="masonry-grid">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="masonry-item bg-card rounded-2xl border border-border p-4 space-y-3"
              >
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
                <Skeleton className="h-3 w-1/4 rounded-lg mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            data-ocid="notes.error_state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-3xl mb-3">⚠️</p>
            <p className="font-semibold text-foreground mb-1">
              Failed to load notes
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              There was a problem connecting to the backend.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="rounded-xl"
            >
              Retry
            </Button>
          </motion.div>
        )}

        {/* Notes section */}
        {!isLoading && !error && (
          <>
            {/* Notes section header */}
            {notes.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display font-semibold text-foreground text-base">
                    {search ? "Search Results" : "All Notes"}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {filteredNotes.length}
                    {search ? ` of ${notes.length}` : ""}
                  </span>
                </div>
                {notes.some((n) => n.pinned) && !search && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary/70" />
                    {notes.filter((n) => n.pinned).length} pinned
                  </span>
                )}
              </div>
            )}

            {/* Notes grid or empty state */}
            <AnimatePresence mode="popLayout">
              {filteredNotes.length > 0 ? (
                <div data-ocid="notes.list" className="masonry-grid">
                  {filteredNotes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      onPin={() => handleTogglePin(note.id)}
                      onEdit={() => handleOpenEdit(note)}
                      onDelete={() => handleDeleteRequest(note)}
                    />
                  ))}
                </div>
              ) : search ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-semibold text-foreground mb-1">
                    No results found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try a different search term
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  data-ocid="notes.empty_state"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center py-20"
                >
                  <motion.div
                    initial={{ scale: 0.8, rotate: -5 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="inline-block mb-5"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                      <BookOpen className="w-9 h-9 text-primary" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      Your notebook is empty
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                      Tap the{" "}
                      <span className="text-primary font-semibold">+</span>{" "}
                      button to create your first note. Capture thoughts, ideas,
                      and moments.
                    </p>
                    <Button
                      onClick={handleOpenNew}
                      className="gap-2 rounded-xl h-10"
                    >
                      <Plus className="w-4 h-4" />
                      Write your first note
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        data-ocid="notes.fab_button"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleOpenNew}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground fab-shadow flex items-center justify-center z-40"
        aria-label="Create new note"
        type="button"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Note Editor */}
      <NoteEditor
        open={editorOpen}
        note={editingNote}
        onSave={handleSave}
        onClose={() => {
          setEditorOpen(false);
          setEditingNote(null);
        }}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        noteTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
