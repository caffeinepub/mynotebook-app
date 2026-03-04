import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Camera, CheckCircle, Image, Loader2, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import type { Note } from "../types/note";
import { CameraModal } from "./CameraModal";

interface NoteEditorProps {
  open: boolean;
  note: Note | null; // null = creating new
  onSave: (data: {
    title: string;
    content: string;
    newImages: string[];
    removedImages: string[];
  }) => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
}

interface UploadItem {
  id: string;
  progress: number;
  preview: string | null;
  done: boolean;
  dataUrl: string | null;
}

export function NoteEditor({
  open,
  note,
  onSave,
  onClose,
  isSaving = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  // Track existing images and which ones have been removed
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    note?.imageUrls ?? [],
  );
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  // New images queued for upload
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with note prop when opening
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setExistingImageUrls(note?.imageUrls ?? []);
      setRemovedImages([]);
      setNewImages([]);
      setUploads([]);
    }
    if (!isOpen) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (
      !title.trim() &&
      !content.trim() &&
      existingImageUrls.length === 0 &&
      newImages.length === 0
    )
      return;
    await onSave({
      title: title.trim(),
      content: content.trim(),
      newImages,
      removedImages,
    });
  };

  const simulateUpload = useCallback((id: string, dataUrl: string) => {
    // Simulate upload progress for UX feedback
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id
              ? { ...u, progress: 100, done: true, preview: dataUrl }
              : u,
          ),
        );
        // After "upload" completes, add to newImages
        setNewImages((prev) => [...prev, dataUrl]);
        // Remove from uploads after short delay
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.id !== id));
        }, 1000);
      } else {
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress } : u)),
        );
      }
    }, 150);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      const id = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setUploads((prev) => [
        ...prev,
        { id, progress: 0, preview: null, done: false, dataUrl: null },
      ]);

      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        if (dataUrl) {
          simulateUpload(id, dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    const id = `upload_${Date.now()}_cam`;
    setUploads((prev) => [
      ...prev,
      { id, progress: 0, preview: null, done: false, dataUrl: null },
    ]);
    simulateUpload(id, dataUrl);
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const removeNewImage = (url: string) => {
    setNewImages((prev) => prev.filter((u) => u !== url));
  };

  const allImages = [...existingImageUrls, ...newImages];
  const hasContent =
    title.trim() ||
    content.trim() ||
    existingImageUrls.length > 0 ||
    newImages.length > 0;
  const uploadsInProgress = uploads.some((u) => !u.done);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          data-ocid="editor.dialog"
          className="max-w-lg rounded-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col"
        >
          <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-lg font-semibold">
                {note ? "Edit Note" : "New Note"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 rounded-lg"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Title input */}
            <Input
              data-ocid="editor.input"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-display text-lg font-semibold border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 bg-transparent h-auto pb-2 placeholder:text-muted-foreground/50"
            />

            {/* Content textarea */}
            <Textarea
              data-ocid="editor.textarea"
              placeholder="Write your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[160px] resize-none border-0 rounded-none px-0 focus-visible:ring-0 bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50"
            />

            {/* Images section */}
            <div className="space-y-3">
              {/* All images (existing + new) */}
              <AnimatePresence>
                {allImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {existingImageUrls.map((url, i) => (
                      <motion.div
                        key={`existing-${url}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative aspect-square rounded-xl overflow-hidden group bg-muted"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </motion.div>
                    ))}
                    {newImages.map((url, i) => (
                      <motion.div
                        key={`new-${url.slice(0, 30)}-${i}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          delay: (existingImageUrls.length + i) * 0.05,
                        }}
                        className="relative aspect-square rounded-xl overflow-hidden group bg-muted"
                      >
                        <img
                          src={url}
                          alt={`New attachment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(url)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload progress items */}
              <AnimatePresence>
                {uploads.map((upload) => (
                  <motion.div
                    key={upload.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {upload.preview && (
                        <img
                          src={upload.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-muted-foreground truncate flex-1">
                          {upload.done ? "Upload complete" : "Uploading..."}
                        </span>
                        {upload.done ? (
                          <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        ) : (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <Progress value={upload.progress} className="h-1" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upload buttons */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  data-ocid="editor.upload_button"
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl flex-1 h-9 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                >
                  <Image className="w-3.5 h-3.5" />
                  From Gallery
                </Button>
                <Button
                  data-ocid="editor.camera_button"
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl flex-1 h-9 text-xs"
                  onClick={() => setCameraOpen(true)}
                  disabled={isSaving}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-5 py-4 border-t border-border gap-2 sm:gap-2 shrink-0">
            <Button
              data-ocid="editor.cancel_button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none rounded-xl h-10"
            >
              Cancel
            </Button>
            <Button
              data-ocid="editor.save_button"
              onClick={handleSave}
              disabled={!hasContent || uploadsInProgress || isSaving}
              className="flex-1 sm:flex-none rounded-xl h-10 font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : note ? (
                "Save Changes"
              ) : (
                "Create Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
}
