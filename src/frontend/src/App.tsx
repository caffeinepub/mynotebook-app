import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence } from "motion/react";
import { LoginScreen } from "./components/LoginScreen";
import { NotesPage } from "./components/NotesPage";
import { OfflineBanner } from "./components/OfflineBanner";
import { ProfileSetup } from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useTheme } from "./hooks/useTheme";
import { useCallerUserProfile } from "./hooks/useUserProfile";

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  const principal = identity?.getPrincipal().toString() ?? null;
  const isAuthenticated =
    principal !== null && !identity?.getPrincipal().isAnonymous();

  const {
    userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    saveProfile,
  } = useCallerUserProfile();

  // Show profile setup modal when authenticated + profile loaded + no profile yet
  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleSaveProfile = async (name: string) => {
    await saveProfile.mutateAsync({ name });
  };

  // Show loading while initializing auth
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && <OfflineBanner key="offline-banner" />}
      </AnimatePresence>

      {/* Main app */}
      <div className={isOnline ? "" : "pt-10"}>
        <AnimatePresence mode="wait">
          {isAuthenticated && principal ? (
            <NotesPage
              key="notes"
              principal={principal}
              userName={userProfile?.name ?? null}
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={clear}
            />
          ) : (
            <LoginScreen
              key="login"
              onLogin={login}
              isLoggingIn={isLoggingIn}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Profile setup modal */}
      <ProfileSetup
        open={showProfileSetup}
        onSave={handleSaveProfile}
        isSaving={saveProfile.isPending}
      />

      <Toaster position="bottom-right" richColors />
    </>
  );
}
