import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useState } from "react";

interface ProfileSetupProps {
  open: boolean;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
}

export function ProfileSetup({ open, onSave, isSaving }: ProfileSetupProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSave(trimmed);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        data-ocid="profile.dialog"
        className="max-w-sm rounded-2xl"
        // Prevent closing by clicking outside or pressing Escape
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-display text-xl font-bold">
              Welcome!
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            Before you start, tell us your name. This helps personalize your
            notebook experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-sm font-medium">
              Your name
            </Label>
            <Input
              id="profile-name"
              data-ocid="profile.input"
              placeholder="e.g. Arjun Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={isSaving}
              className="rounded-xl h-11"
            />
          </div>

          <DialogFooter>
            <Button
              data-ocid="profile.submit_button"
              type="submit"
              disabled={!name.trim() || isSaving}
              className="w-full rounded-xl h-10 font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
