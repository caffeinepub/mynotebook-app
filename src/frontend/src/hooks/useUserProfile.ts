import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  const saveProfile = useMutation({
    mutationFn: (profile: UserProfile) => actor!.saveCallerUserProfile(profile),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });

  return {
    userProfile: profileQuery.data ?? null,
    isLoading: actorFetching || profileQuery.isLoading,
    isFetched: !!actor && profileQuery.isFetched,
    error: profileQuery.error,
    saveProfile,
  };
}
