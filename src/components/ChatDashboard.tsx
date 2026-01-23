import { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import { useProfile } from '../hooks/useProfile';
import { ProfileView } from './ProfileView';
import { DocumentsView } from './DocumentsView';
import { AdminPanel } from './AdminPanel';
import { PricingPage } from './PricingPage';
import { ScenarioSelectionScreen, ScenarioType } from './ScenarioSelectionScreen';
import { ScenarioWizard, ScenarioResult } from './ScenarioWizard';
import { ScenarioSummary } from './ScenarioSummary';

type ActiveTab = 'chat' | 'profile' | 'documents' | 'admin' | 'pricing' | 'scenarios';
type ScenarioView = 'selection' | 'wizard' | 'summary';

interface ChatDashboardProps {
  isGuestMode?: boolean;
  onLogin?: () => void;
  onReturnToHome?: () => void;
}

export function ChatDashboard({ isGuestMode = false, onLogin, onReturnToHome }: ChatDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const { profile, loading, updateProfile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Scenario state
  const [scenarioView, setScenarioView] = useState<ScenarioView>('selection');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await blink.auth.me();
        if (user?.role === 'admin' || user?.email === 'admin@credoserv.ru') {
          setIsAdmin(true);
        }
      } catch (error) {
        // Not authenticated or other error - just keep isAdmin false
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Reset scenario state when switching tabs
  useEffect(() => {
    if (activeTab !== 'scenarios') {
      setScenarioView('selection');
      setSelectedScenario(null);
      setScenarioResult(null);
    }
  }, [activeTab]);

  const handleSelectScenario = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
    setScenarioView('wizard');
  };

  const handleScenarioComplete = (result: ScenarioResult) => {
    setScenarioResult(result);
    setScenarioView('summary');
  };

  const handleBackFromWizard = () => {
    setSelectedScenario(null);
    setScenarioView('selection');
  };

  const handleBackFromSummary = () => {
    setScenarioView('wizard');
  };

  const handleNewScenario = () => {
    setSelectedScenario(null);
    setScenarioResult(null);
    setScenarioView('selection');
  };

  const handleStartChatFromSummary = () => {
    setActiveTab('chat');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const renderScenarioContent = () => {
    switch (scenarioView) {
      case 'selection':
        return (
          <ScenarioSelectionScreen 
            onSelectScenario={handleSelectScenario}
            onBack={() => setActiveTab('chat')}
            isGuestMode={isGuestMode}
            onLogin={onLogin}
          />
        );
      case 'wizard':
        return selectedScenario ? (
          <ScenarioWizard
            scenario={selectedScenario}
            onComplete={handleScenarioComplete}
            onBack={handleBackFromWizard}
            profile={profile}
            isGuestMode={isGuestMode}
            onLogin={onLogin}
          />
        ) : null;
      case 'summary':
        return scenarioResult ? (
          <ScenarioSummary
            result={scenarioResult}
            onBack={handleBackFromSummary}
            onStartChat={handleStartChatFromSummary}
            onNewScenario={handleNewScenario}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin}
        isGuestMode={isGuestMode}
        onLogin={onLogin}
        onReturnToHome={onReturnToHome}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatWindow 
            profile={profile} 
            updateProfile={updateProfile} 
            isGuestMode={isGuestMode}
            onLogin={onLogin}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            profile={profile} 
            updateProfile={updateProfile} 
            onStartChat={() => setActiveTab('chat')} 
            isGuestMode={isGuestMode}
            onLogin={onLogin}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsView 
            isGuestMode={isGuestMode}
            onLogin={onLogin}
          />
        )}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
        {activeTab === 'pricing' && <PricingPage />}
        {activeTab === 'scenarios' && renderScenarioContent()}
      </main>
    </div>
  );
}