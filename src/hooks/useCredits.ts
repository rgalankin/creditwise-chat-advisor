import { useState, useEffect, useCallback, useRef } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';

export const useCredits = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useBlinkAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchCredits = useCallback(async () => {
    // Don't fetch if auth is still loading, user is not authenticated, or already fetching
    if (authLoading || !isAuthenticated || !user || fetchingRef.current) {
      if (!isAuthenticated && !authLoading) {
        // User is logged out - reset credits state
        setCredits(null);
        setLoading(false);
      }
      return;
    }

    fetchingRef.current = true;
    
    try {
      // Double-check we're still mounted and authenticated (using real-time auth state)
      if (!isMountedRef.current || !blink.auth.isAuthenticated()) {
        return;
      }

      // Fetch credits record by user_id
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });

      // Check if still mounted and authenticated after async operation
      if (!isMountedRef.current || !blink.auth.isAuthenticated()) return;

      if (!records || records.length === 0) {
        // Initialize with 100 free credits using upsert to avoid race conditions
        try {
          if (!isMountedRef.current || !blink.auth.isAuthenticated()) return;
          
          await (blink.db as any).userCredits.upsert({
            userId: user.id,
            credits: 100
          });
          if (isMountedRef.current && blink.auth.isAuthenticated()) setCredits(100);
        } catch (upsertError: any) {
          // Silently handle errors during logout transition
          if (!isMountedRef.current || !blink.auth.isAuthenticated()) return;
          
          console.warn('Credits upsert failed, trying to fetch existing record:', upsertError);
          // If upsert also fails, try fetching again (record may exist now)
          try {
            const retryRecords = await (blink.db as any).userCredits.list({
              where: { userId: user.id },
              limit: 1
            });
            if (isMountedRef.current && blink.auth.isAuthenticated() && retryRecords && retryRecords.length > 0) {
              setCredits(Number(retryRecords[0].credits));
            } else if (isMountedRef.current && blink.auth.isAuthenticated()) {
              // If still no record, set default credits
              setCredits(100);
            }
          } catch (retryError: any) {
            // Silently ignore errors during logout transition
            if (!isMountedRef.current || !blink.auth.isAuthenticated()) return;
            console.warn('Credits fetch retry failed, using default:', retryError);
            if (isMountedRef.current) setCredits(100);
          }
        }
      } else {
        if (isMountedRef.current && blink.auth.isAuthenticated()) setCredits(Number(records[0].credits));
      }
    } catch (error: any) {
      // Silently ignore errors during logout transition or when unmounted
      if (!isMountedRef.current || !blink.auth.isAuthenticated()) return;
      
      console.error('Failed to fetch credits:', error);
      // On network errors, set default credits to avoid blocking the UI
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        console.warn('Network error fetching credits, using default value');
        if (isMountedRef.current && blink.auth.isAuthenticated()) setCredits(100);
      }
    } finally {
      fetchingRef.current = false;
      if (isMountedRef.current) setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCredits();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCredits]);

  const useCredit = async () => {
    // Additional guard to prevent operations during logout
    if (!isAuthenticated || !user || credits === null || !isMountedRef.current) return false;

    if (credits <= 0) {
      toast.error('Insufficient credits. Please upgrade your plan.');
      return false;
    }

    try {
      // Check auth state before making request
      if (!isAuthenticated || !isMountedRef.current) return false;
      
      const newCredits = credits - 1;
      // Find the record and update it
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });
      
      // Check if still valid after async operation
      if (!isMountedRef.current || !isAuthenticated) return false;
      
      if (records && records.length > 0) {
        await (blink.db as any).userCredits.update(records[0].id, {
          credits: newCredits
        });
        if (isMountedRef.current) setCredits(newCredits);
        return true;
      } else {
        console.warn('No credits record found for user');
        return false;
      }
    } catch (error: any) {
      // Silently ignore if logged out or unmounted
      if (!isMountedRef.current || !isAuthenticated) return false;
      
      console.error('Failed to use credit:', error);
      // On network errors, still decrement locally for better UX
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        console.warn('Network error, decrementing credits locally');
        if (isMountedRef.current) setCredits(credits - 1);
        return true;
      }
      return false;
    }
  };

  const addCredits = async (amount: number) => {
    // Additional guard to prevent operations during logout
    if (!isAuthenticated || !user || credits === null || !isMountedRef.current) return;

    try {
      // Check auth state before making request
      if (!isAuthenticated || !isMountedRef.current) return;
      
      const newCredits = credits + amount;
      // Find the record and update it
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });
      
      // Check if still valid after async operation
      if (!isMountedRef.current || !isAuthenticated) return;
      
      if (records && records.length > 0) {
        await (blink.db as any).userCredits.update(records[0].id, {
          credits: newCredits
        });
        if (isMountedRef.current) {
          setCredits(newCredits);
          toast.success(`Successfully added ${amount} credits!`);
        }
      } else {
        console.warn('No credits record found for user, cannot add credits');
        if (isMountedRef.current) toast.error('Failed to add credits - no credits record found');
      }
    } catch (error: any) {
      // Silently ignore if logged out or unmounted
      if (!isMountedRef.current || !isAuthenticated) return;
      
      console.error('Failed to add credits:', error);
      // On network errors, still update locally for better UX
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        console.warn('Network error, updating credits locally');
        if (isMountedRef.current) {
          setCredits(credits + amount);
          toast.success(`Credits added locally (${amount}) - sync may be delayed`);
        }
      } else {
        if (isMountedRef.current) toast.error('Failed to add credits');
      }
    }
  };

  return { credits, loading, useCredit, addCredits, refreshCredits: fetchCredits };
};
