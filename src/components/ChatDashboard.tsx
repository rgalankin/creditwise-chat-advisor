import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import { useProfile } from '../hooks/useProfile';
import { ProfileView } from './ProfileView';
import { DocumentsView } from './DocumentsView';
import { AdminPanel } from './AdminPanel';
import { PricingPage } from './PricingPage';

export function ChatDashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'documents' | 'admin' | 'pricing'>('chat');
  const { profile, loading, updateProfile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await blink.auth.me();
      if (user?.role === 'admin' || user?.email === 'admin@credoserv.ru') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  if (loading) return null;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'chat' && <ChatWindow profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'profile' && <ProfileView profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'documents' && <DocumentsView />}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
        {activeTab === 'pricing' && <PricingPage />}
      </main>
    </div>
  );
}

import { blink } from '../lib/blink';
