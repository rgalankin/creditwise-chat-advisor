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
        // Initialize with 100 free credits
        await (blink.db as any).userCredits.create({
          userId: user.id,
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
      // Find the record and update it
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });
      if (records && records.length > 0) {
        await (blink.db as any).userCredits.update(records[0].id, {
          credits: newCredits
        });
      }
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
      // Find the record and update it
      const records = await (blink.db as any).userCredits.list({
        where: { userId: user.id },
        limit: 1
      });
      if (records && records.length > 0) {
        await (blink.db as any).userCredits.update(records[0].id, {
          credits: newCredits
        });
      }
      setCredits(newCredits);
      toast.success(`Successfully added ${amount} credits!`);
    } catch (error) {
      console.error('Failed to add credits:', error);
      toast.error('Failed to add credits');
    }
  };

  return { credits, loading, useCredit, addCredits, refreshCredits: fetchCredits };
};
