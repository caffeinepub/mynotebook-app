import { WifiOff } from "lucide-react";
import { motion } from "motion/react";

export function OfflineBanner() {
  return (
    <motion.div
      data-ocid="offline.error_state"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -48, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-2.5 px-4 text-sm font-medium shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You're offline. Changes will be saved locally.</span>
    </motion.div>
  );
}
