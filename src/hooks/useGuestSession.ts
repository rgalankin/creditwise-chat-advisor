import { useState, useEffect, useCallback } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { blink } from '../lib/blink';

export interface GuestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: string;
}

export interface GuestProfile {
  id: string;
  displayName: string;
  jurisdiction?: string;
  hasConsent: string;
  financialData?: string;
  createdAt: string;
}

interface GuestSessionData {
  messages: GuestMessage[];
  profile: GuestProfile;
  chatState: string;
  diagnosticData: Record<string, any>;
}

const GUEST_SESSION_KEY = 'creditwise_guest_session';

function createGuestProfile(): GuestProfile {
  return {
    id: `guest_${Date.now()}`,
    displayName: 'Гость',
    hasConsent: '0',
    createdAt: new Date().toISOString()
  };
}

function getGuestSession(): GuestSessionData | null {
  try {
    const data = sessionStorage.getItem(GUEST_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveGuestSession(data: GuestSessionData): void {
  try {
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save guest session:', e);
  }
}

function clearGuestSession(): void {
  sessionStorage.removeItem(GUEST_SESSION_KEY);
}

export function useGuestSession() {
  const { isAuthenticated, isLoading: authLoading } = useBlinkAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestData, setGuestData] = useState<GuestSessionData | null>(null);

  // Initialize guest session from sessionStorage
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const existing = getGuestSession();
      if (existing) {
        setGuestData(existing);
        setIsGuestMode(true);
      }
    }
  }, [authLoading, isAuthenticated]);

  // Start guest session
  const startGuestSession = useCallback(() => {
    const newSession: GuestSessionData = {
      messages: [],
      profile: createGuestProfile(),
      chatState: 'INTRO',
      diagnosticData: {}
    };
    saveGuestSession(newSession);
    setGuestData(newSession);
    setIsGuestMode(true);
    return newSession;
  }, []);

  // Update guest messages
  const updateGuestMessages = useCallback((messages: GuestMessage[]) => {
    setGuestData(prev => {
      if (!prev) return null;
      const updated = { ...prev, messages };
      saveGuestSession(updated);
      return updated;
    });
  }, []);

  // Add guest message
  const addGuestMessage = useCallback((message: Omit<GuestMessage, 'id' | 'createdAt'>) => {
    const newMessage: GuestMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    setGuestData(prev => {
      if (!prev) return null;
      const updated = { ...prev, messages: [...prev.messages, newMessage] };
      saveGuestSession(updated);
      return updated;
    });
    
    return newMessage;
  }, []);

  // Update guest profile
  const updateGuestProfile = useCallback((data: Partial<GuestProfile>) => {
    setGuestData(prev => {
      if (!prev) return null;
      const updated = { ...prev, profile: { ...prev.profile, ...data } };
      saveGuestSession(updated);
      return updated;
    });
  }, []);

  // Update chat state
  const updateGuestChatState = useCallback((chatState: string, diagnosticData?: Record<string, any>) => {
    setGuestData(prev => {
      if (!prev) return null;
      const updated = { 
        ...prev, 
        chatState, 
        diagnosticData: diagnosticData || prev.diagnosticData 
      };
      saveGuestSession(updated);
      return updated;
    });
  }, []);

  // End guest session (when user logs in)
  const endGuestSession = useCallback(() => {
    clearGuestSession();
    setGuestData(null);
    setIsGuestMode(false);
  }, []);

  // Prompt user to login
  const promptLogin = useCallback(() => {
    blink.auth.login(window.location.href);
  }, []);

  return {
    isGuestMode,
    isAuthenticated,
    guestData,
    startGuestSession,
    updateGuestMessages,
    addGuestMessage,
    updateGuestProfile,
    updateGuestChatState,
    endGuestSession,
    promptLogin
  };
}
