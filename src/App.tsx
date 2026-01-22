import { useState, useEffect } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { LandingPage } from './components/LandingPage';
import { ChatDashboard } from './components/ChatDashboard';
import { Spinner } from './components/ui/spinner';
import { blink } from './lib/blink';

const GUEST_SESSION_KEY = 'creditwise_guest_session';

export default function App() {
  const { isAuthenticated, isLoading } = useBlinkAuth();
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Check for existing guest session on mount
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const hasGuestSession = sessionStorage.getItem(GUEST_SESSION_KEY);
      if (hasGuestSession) {
        setIsGuestMode(true);
      }
    }
    // If user is authenticated, clear guest mode
    if (isAuthenticated && isGuestMode) {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      setIsGuestMode(false);
    }
  }, [isLoading, isAuthenticated, isGuestMode]);

  const handleStartDiagnostic = () => {
    // Start guest session - store minimal data
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({
      startedAt: new Date().toISOString(),
      messages: [],
      chatState: 'INTRO',
      diagnosticData: {}
    }));
    setIsGuestMode(true);
  };

  const handleLogin = () => {
    blink.auth.login(window.location.href);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  // Show dashboard if authenticated OR in guest mode
  if (isAuthenticated || isGuestMode) {
    return <ChatDashboard isGuestMode={isGuestMode && !isAuthenticated} onLogin={handleLogin} />;
  }

  return (
    <LandingPage
      onLogin={handleLogin}
      onStartDiagnostic={handleStartDiagnostic}
    />
  );
}
