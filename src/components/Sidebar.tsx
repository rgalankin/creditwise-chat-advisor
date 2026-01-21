import { Button } from './ui/button';
import { MessageSquare, User, FileText, Settings, LogOut, Shield, LayoutDashboard } from 'lucide-react';
import { blink } from '../lib/blink';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: 'chat' | 'profile' | 'documents' | 'admin';
  setActiveTab: (tab: 'chat' | 'profile' | 'documents' | 'admin') => void;
  isAdmin?: boolean;
}

export function Sidebar({ activeTab, setActiveTab, isAdmin }: SidebarProps) {
  const navItems = [
    { id: 'chat', label: 'Advisor', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <aside className="w-64 border-r flex flex-col h-screen shrink-0 bg-slate-50/50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">CreditWise</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
          
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-4",
                activeTab === 'admin' 
                  ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              Admin Panel
            </button>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t space-y-4">
        <button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 w-full transition-colors">
          <Settings className="h-5 w-5" />
          Settings
        </button>
        <button 
          onClick={() => blink.auth.logout()}
          className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-700 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
