import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Camera,
  Loader2,
  RotateCcw,
  SwitchCamera,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useCamera } from "../camera/useCamera";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export function CameraModal({ open, onClose, onCapture }: CameraModalProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.9 });

  // Track if we've started camera for this open session
  const startedRef = useRef(false);

  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      void startCamera();
    }
    if (!open) {
      startedRef.current = false;
      void stopCamera();
    }
  }, [open, startCamera, stopCamera]);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onCapture(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    void stopCamera();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent
        data-ocid="camera.dialog"
        className="max-w-lg p-0 overflow-hidden rounded-2xl gap-0"
      >
        <DialogHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-lg font-semibold">
              Take a Photo
            </DialogTitle>
            <Button
              data-ocid="camera.close_button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative bg-black">
          {/* Video preview */}
          <div className="relative aspect-video bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: isActive ? "block" : "none" }}
            />
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <p className="text-white/70 text-sm">Starting camera...</p>
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 p-6"
              >
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">
                    {error.message}
                  </p>
                  <p className="text-white/50 text-sm">
                    {error.type === "permission"
                      ? "Please allow camera access in your browser settings."
                      : error.type === "not-found"
                        ? "No camera was found on this device."
                        : "Try refreshing the page."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => void startCamera()}
                  className="gap-2 mt-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </motion.div>
            )}

            {/* Not supported state */}
            {!isLoading && isSupported === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-3 p-6">
                <Camera className="w-8 h-8 text-white/50" />
                <p className="text-white/70 text-sm text-center">
                  Camera is not supported on this device or browser.
                </p>
              </div>
            )}

            {/* Camera ready overlay - viewfinder lines */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner guides */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/50 rounded-tl" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/50 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/50 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/50 rounded-br" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-5 px-6 bg-neutral-900">
            {/* Switch camera */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void switchCamera()}
              disabled={!isActive || isLoading}
              className="w-11 h-11 rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              title="Switch camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </Button>

            {/* Capture button */}
            <button
              data-ocid="camera.capture_button"
              onClick={() => void handleCapture()}
              disabled={!isActive || isLoading}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/30 shadow-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
              title="Capture photo"
              type="button"
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-inner" />
            </button>

            {/* Spacer */}
            <div className="w-11" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
