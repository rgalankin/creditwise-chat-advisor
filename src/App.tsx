import { useBlinkAuth } from '@blinkdotnew/react';
import { LandingPage } from './components/LandingPage';
import { ChatDashboard } from './components/ChatDashboard';
import { Spinner } from './components/ui/spinner';
import { blink } from './lib/blink';

export default function App() {
  const { isAuthenticated, isLoading } = useBlinkAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={() => blink.auth.login(window.location.href)} />;
  }

  return <ChatDashboard />;
}
