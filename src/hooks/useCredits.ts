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
      // Fetch credits record by user_id (the table uses user_id as PK)
      const record = await (blink.db as any).userCredits.get(user.id);

      if (!record) {
        // Initialize with 100 free credits - create new record
        await (blink.db as any).userCredits.create({
          id: user.id, // Use id field which maps to user_id PK
          credits: 100
        });
        setCredits(100);
      } else {
        setCredits(Number(record.credits));
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
      // Update credits using the user.id as the record ID
      await (blink.db as any).userCredits.update(user.id, {
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
      // Update credits using the user.id as the record ID
      await (blink.db as any).userCredits.update(user.id, {
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
