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
      // user_credits uses user_id as the primary key (not id)
      // Use list with filter to fetch by user_id
      const records = await (blink.db as any).userCredits.list({
        filter: { userId: user.id },
        limit: 1
      });

      if (!records || records.length === 0) {
        // Initialize with 100 free credits - use upsert since user_id is PK (no auto id)
        await (blink.db as any).userCredits.upsert({
          userId: user.id, // Maps to user_id column (PK)
          credits: 100
        });
        setCredits(100);
      } else {
        setCredits(Number(records[0].credits));
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
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
      // Use upsert to update by userId (which is the PK)
      await (blink.db as any).userCredits.upsert({
        userId: user.id,
        credits: newCredits
      });
      setCredits(newCredits);
      return true;
    } catch (error) {
      console.error('Failed to use credit:', error);
      return false;
    }
  };

  const addCredits = async (amount: number) => {
    if (!isAuthenticated || !user || credits === null) return;

    try {
      const newCredits = credits + amount;
      // Use upsert to update by userId (which is the PK)
      await (blink.db as any).userCredits.upsert({
        userId: user.id,
        credits: newCredits
      });
      setCredits(newCredits);
      toast.success(`Successfully added ${amount} credits!`);
    } catch (error) {
      console.error('Failed to add credits:', error);
      toast.error('Failed to add credits');
    }
  };

  return { credits, loading, useCredit, addCredits, refreshCredits: fetchCredits };
};
