import { useState, useEffect } from 'react';
import { blink } from '../lib/blink';

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // blink.auth.me() throws BlinkAuthError when not authenticated
      // We need to catch that and treat it as guest mode
      let user = null;
      try {
        user = await blink.auth.me();
      } catch (authError: any) {
        // BlinkAuthError with code INVALID_CREDENTIALS means not authenticated
        // This is expected behavior for guests - not an error
        if (authError?.code === 'INVALID_CREDENTIALS' || authError?.message?.includes('Not authenticated')) {
          user = null;
        } else {
          // Re-throw unexpected errors
          throw authError;
        }
      }
      
      if (!user) {
        // Set guest profile
        setProfile({
          displayName: 'Guest',
          jurisdiction: 'Russia',
          hasConsent: "0",
          financialData: null,
          createdAt: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      let userProfile = await blink.db.userProfiles.get(user.id);
      
      if (!userProfile) {
        // Create initial profile if it doesn't exist
        userProfile = await blink.db.userProfiles.create({
          id: user.id,
          userId: user.id,
          displayName: user.displayName || 'User',
          hasConsent: "0"
        });
      }
      
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // On any error, fall back to guest profile
      setProfile({
        displayName: 'Guest',
        jurisdiction: 'Russia',
        hasConsent: "0",
        financialData: null,
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    if (!profile || profile.displayName === 'Guest') return;
    try {
      const updated = await blink.db.userProfiles.update(profile.id, data);
      setProfile(updated);
      return updated;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, updateProfile, refreshProfile: fetchProfile };
}
