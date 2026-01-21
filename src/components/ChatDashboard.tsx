import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import { useProfile } from '../hooks/useProfile';
import { ProfileView } from './ProfileView';
import { DocumentsView } from './DocumentsView';
import { AdminPanel } from './AdminPanel';

export function ChatDashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'documents' | 'admin'>('chat');
  const { profile, loading, updateProfile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await blink.auth.me();
      if (user?.role === 'admin' || user?.email === 'admin@creditwise.ai') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  if (loading) return null;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab as any} 
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'chat' && <ChatWindow profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'profile' && <ProfileView profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'documents' && <DocumentsView />}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>
    </div>
  );
}

import { blink } from '../lib/blink';
