import { supabase, UserProfile } from '../supabase/supabaseClient';

export class HybridProfileService {
  /**
   * Get user profile from Supabase
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Create new user profile in Supabase
   */
  static async createUserProfile(
    userId: string,
    email: string,
    additionalData?: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const profileData = {
        id: userId,
        email,
        role: 'client' as const,
        is_active: true,
        ...additionalData,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  }

  /**
   * Update user profile in Supabase
   */
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  }

  /**
   * Sync user profile - get existing or create new
   */
  static async syncUserProfile(
    userId: string,
    email: string
  ): Promise<UserProfile | null> {
    try {
      // First try to get existing profile
      let profile = await this.getUserProfile(userId);

      if (!profile) {
        // Create new profile if doesn't exist
        profile = await this.createUserProfile(userId, email);
      }

      return profile;
    } catch (error) {
      console.error('Error in syncUserProfile:', error);
      return null;
    }
  }

  /**
   * Get cached profile from localStorage
   */
  static getCachedProfile(): UserProfile | null {
    try {
      const cached = localStorage.getItem('legality360_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  /**
   * Cache profile to localStorage
   */
  static cacheProfile(profile: UserProfile): void {
    try {
      localStorage.setItem('legality360_user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  }

  /**
   * Clear cached profile
   */
  static clearCachedProfile(): void {
    try {
      localStorage.removeItem('legality360_user_profile');
    } catch (error) {
      console.error('Error clearing cached profile:', error);
    }
  }
}