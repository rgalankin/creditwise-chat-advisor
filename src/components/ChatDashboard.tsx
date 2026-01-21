import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import { useProfile } from '../hooks/useProfile';
import { ProfileView } from './ProfileView';
import { DocumentsView } from './DocumentsView';

export function ChatDashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'documents'>('chat');
  const { profile, loading, updateProfile } = useProfile();

  if (loading) return null;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {activeTab === 'chat' && <ChatWindow profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'profile' && <ProfileView profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'documents' && <DocumentsView />}
      </main>
    </div>
  );
}
