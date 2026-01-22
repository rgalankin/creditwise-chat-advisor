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
      // user_id is the PK, so use get() to fetch by primary key
      const record = await (blink.db as any).userCredits.get(user.id);

      if (!record) {
        // Initialize with 100 free credits - create new record with user_id as PK
        const newRecord = await (blink.db as any).userCredits.create({
          id: user.id, // user_id is the PK, passed as 'id' for SDK
          credits: 100
        });
        setCredits(Number(newRecord.credits));
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
      // user_id is the PK, use update() with user.id as the record ID
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
      // user_id is the PK, use update() with user.id as the record ID
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
