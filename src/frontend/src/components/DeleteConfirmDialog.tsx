import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  noteTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        data-ocid="notes.delete.dialog"
        className="rounded-2xl max-w-sm"
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-destructive" />
            </div>
            <AlertDialogTitle className="font-display text-lg">
              Delete Note
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {noteTitle ? (
              <>
                Delete{" "}
                <span className="font-semibold text-foreground">
                  "{noteTitle}"
                </span>
                ? This action cannot be undone.
              </>
            ) : (
              "Delete this note? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            data-ocid="notes.delete.cancel_button"
            onClick={onCancel}
            className="rounded-xl"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="notes.delete.confirm_button"
            onClick={onConfirm}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
