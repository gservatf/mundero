import { useState, useEffect, useCallback } from "react";
import { profileService, UserProfile } from "../services/profileService";
import { useAuth } from "../../../hooks/useAuth";

interface UseProfileState {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface UseProfileReturn extends UseProfileState {
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  createProfile: (initialData: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  profileExists: boolean;
}

export const useProfile = (): UseProfileReturn => {
  const { user } = useAuth();
  const [state, setState] = useState<UseProfileState>({
    userProfile: null,
    loading: false,
    error: null,
  });
  const [profileExists, setProfileExists] = useState(false);

  // Update loading state
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Update error state
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Update profile data
  const setProfile = useCallback((userProfile: UserProfile | null) => {
    setState((prev) => ({ ...prev, userProfile }));
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<void> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Updating profile via hook...", { uid: user.id, data });
        await profileService.updateUserProfile(user.id, data);

        console.log("✅ Profile updated successfully via hook");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update profile";
        console.error("❌ Error updating profile via hook:", error);
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, setLoading, setError],
  );

  // Create profile
  const createProfile = useCallback(
    async (initialData: Partial<UserProfile>): Promise<void> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🆕 Creating profile via hook...", {
          uid: user.id,
          initialData,
        });

        const profileData = {
          email: user.email || "",
          displayName: user.display_name || (user as any).full_name || "",
          photoURL: user.photo_url || (user as any).avatar_url || "",
          ...initialData,
        };

        await profileService.createUserProfile(user.id, profileData);
        setProfileExists(true);

        console.log("✅ Profile created successfully via hook");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create profile";
        console.error("❌ Error creating profile via hook:", error);
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, setError],
  );

  // Refresh profile manually
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Refreshing profile via hook...", { uid: user.id });
      const profile = await profileService.getUserProfile(user.id);
      setProfile(profile);
      setProfileExists(!!profile);

      console.log("✅ Profile refreshed successfully via hook");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh profile";
      console.error("❌ Error refreshing profile via hook:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, setLoading, setError, setProfile]);

  // Setup real-time listener
  useEffect(() => {
    if (!user?.id) {
      setState({
        userProfile: null,
        loading: false,
        error: null,
      });
      setProfileExists(false);
      return;
    }

    console.log("👂 Setting up profile listener via hook...", { uid: user.id });
    setLoading(true);
    setError(null);

    // Setup real-time listener
    const unsubscribe = profileService.listenToUserProfile(
      user.id,
      (profile) => {
        console.log(
          "🔄 Profile updated via listener:",
          profile ? "Profile found" : "Profile not found",
        );
        setProfile(profile);
        setProfileExists(!!profile);
        setLoading(false);
      },
    );

    // Check if profile exists on mount
    profileService
      .profileExists(user.id)
      .then((exists) => {
        setProfileExists(exists);
        if (!exists) {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("❌ Error checking profile existence:", error);
        setError("Failed to check profile existence");
        setLoading(false);
      });

    // Cleanup listener on unmount
    return () => {
      console.log("🧹 Cleaning up profile listener...");
      unsubscribe();
    };
  }, [user?.id, setLoading, setError, setProfile]);

  return {
    userProfile: state.userProfile,
    loading: state.loading,
    error: state.error,
    updateProfile,
    createProfile,
    refreshProfile,
    profileExists,
  };
};
