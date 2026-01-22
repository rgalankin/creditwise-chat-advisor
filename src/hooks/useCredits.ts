import { useState, useEffect, useCallback } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';

export const useCredits = () => {
  const { user, isAuthenticated } = useBlinkAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch credits record by user_id
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });

      if (!records || records.length === 0) {
        // Initialize with 100 free credits using upsert to avoid race conditions
        try {
          await (blink.db as any).userCredits.upsert({
            userId: user.id,
            credits: 100
          });
          setCredits(100);
        } catch (upsertError: any) {
          console.warn('Credits upsert failed, trying to fetch existing record:', upsertError);
          // If upsert also fails, try fetching again (record may exist now)
          try {
            const retryRecords = await (blink.db as any).userCredits.list({
              where: { userId: user.id },
              limit: 1
            });
            if (retryRecords && retryRecords.length > 0) {
              setCredits(Number(retryRecords[0].credits));
            } else {
              // If still no record, set default credits
              setCredits(100);
            }
          } catch (retryError: any) {
            console.warn('Credits fetch retry failed, using default:', retryError);
            setCredits(100);
          }
        }
      } else {
        setCredits(Number(records[0].credits));
      }
    } catch (error: any) {
      console.error('Failed to fetch credits:', error);
      // On network errors, set default credits to avoid blocking the UI
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        console.warn('Network error fetching credits, using default value');
        setCredits(100);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const useCredit = async () => {
    if (!isAuthenticated || !user || credits === null) return false;

    if (credits <= 0) {
      toast.error('Insufficient credits. Please upgrade your plan.');
      return false;
    }

    try {
      const newCredits = credits - 1;
      // Find the record and update it
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });
      if (records && records.length > 0) {
        await (blink.db as any).userCredits.update(records[0].id, {
          credits: newCredits
        });
        setCredits(newCredits);
        return true;
      } else {
        console.warn('No credits record found for user');
        return false;
      }
    } catch (error: any) {
      console.error('Failed to use credit:', error);
      // On network errors, still decrement locally for better UX
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        console.warn('Network error, decrementing credits locally');
        setCredits(credits - 1);
        return true;
      }
      return false;
    }
  };

  const addCredits = async (amount: number) => {
    if (!isAuthenticated || !user || credits === null) return;

    try {
      const newCredits = credits + amount;
      // Find the record and update it
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });
      if (records && records.length > 0) {
        await (blink.db as any).userCredits.update(records[0].id, {
          credits: newCredits
        });
        setCredits(newCredits);
        toast.success(`Successfully added ${amount} credits!`);
      } else {
        console.warn('No credits record found for user, cannot add credits');
        toast.error('Failed to add credits - no credits record found');
      }
    } catch (error: any) {
      console.error('Failed to add credits:', error);
      // On network errors, still update locally for better UX
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        console.warn('Network error, updating credits locally');
        setCredits(credits + amount);
        toast.success(`Credits added locally (${amount}) - sync may be delayed`);
      } else {
        toast.error('Failed to add credits');
      }
    }
  };

  return { credits, loading, useCredit, addCredits, refreshCredits: fetchCredits };
};
