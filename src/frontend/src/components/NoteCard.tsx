import { Button } from "@/components/ui/button";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { Note } from "../types/note";

interface NoteCardProps {
  note: Note;
  index: number;
  onPin: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(timestamp: bigint): string {
  // IC timestamps are in nanoseconds; convert to milliseconds
  const dateMs = Number(timestamp) / 1_000_000;
  const date = new Date(dateMs);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function NoteCard({
  note,
  index,
  onPin,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const ocidIndex = index + 1;

  return (
    <motion.div
      data-ocid={`note.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      layout
      className={`masonry-item group relative bg-card rounded-2xl border border-border note-shadow paper-texture cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-note ${
        note.pinned ? "pinned-note" : ""
      }`}
      onClick={onEdit}
    >
      {/* Pinned indicator */}
      {note.pinned && (
        <div className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
          <Pin className="w-3 h-3 text-primary-foreground fill-current" />
        </div>
      )}

      <div className="p-4 pb-3">
        {/* Image preview */}
        {note.imageUrls.length > 0 && (
          <div className="mb-3 -mx-4 -mt-4 rounded-t-2xl overflow-hidden">
            <img
              src={note.imageUrls[0]}
              alt="Note attachment"
              className="w-full h-36 object-cover"
              loading="lazy"
            />
            {note.imageUrls.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                +{note.imageUrls.length - 1}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        {note.title && (
          <h3 className="font-display font-semibold text-foreground text-base leading-snug mb-1.5 line-clamp-2">
            {note.title}
          </h3>
        )}

        {/* Content */}
        {note.content && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        )}

        {/* Date */}
        <p className="text-xs text-muted-foreground/70 mt-2.5">
          {formatDate(note.updatedAt)}
        </p>
      </div>

      {/* Action bar (visible on hover) */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: action buttons inside handle keyboard themselves */}
      <div
        className="flex items-center gap-1 px-3 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          data-ocid={`note.pin_toggle.${ocidIndex}`}
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-primary"
          onClick={onPin}
          title={note.pinned ? "Unpin" : "Pin"}
        >
          {note.pinned ? (
            <PinOff className="w-3.5 h-3.5" />
          ) : (
            <Pin className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          data-ocid={`note.edit_button.${ocidIndex}`}
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          title="Edit note"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          data-ocid={`note.delete_button.${ocidIndex}`}
          variant="ghost"
          size="icon"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          title="Delete note"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
