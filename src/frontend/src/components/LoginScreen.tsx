import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export function LoginScreen({ onLogin, isLoggingIn }: LoginScreenProps) {
  return (
    <div className="min-h-screen login-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <img
            src="/assets/generated/notebook-bg.dim_1200x800.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Decorative lines suggesting notebook paper */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 31px, oklch(0.62 0.16 55 / 0.06) 31px, oklch(0.62 0.16 55 / 0.06) 32px)",
            backgroundPosition: "0 64px",
          }}
        />
        {/* Left margin line */}
        <div
          className="absolute top-0 bottom-0 left-[20%] w-px opacity-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.62 0.16 55), transparent)",
          }}
        />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-2xl p-8 sm:p-10 note-shadow">
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5"
            >
              <BookOpen className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="font-display text-3xl font-bold text-foreground mb-2 tracking-tight">
                My Notebook
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Your personal cloud notepad. Capture thoughts, ideas, and
                moments — beautifully.
              </p>
            </motion.div>
          </div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            {[
              { icon: "📝", label: "Rich Notes" },
              { icon: "📌", label: "Pin Important" },
              { icon: "🔍", label: "Search Fast" },
              { icon: "📸", label: "Add Images" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 py-2.5"
              >
                <span className="text-base">{feature.icon}</span>
                <span className="text-sm font-medium text-secondary-foreground">
                  {feature.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Login button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              data-ocid="login.primary_button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold rounded-xl gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            Secure, decentralized authentication — no password needed.
          </motion.p>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 mt-6 text-xs text-muted-foreground"
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
