import { Button } from './ui/button';
import { MessageSquare, User, FileText, Settings, LogOut, Shield, LayoutDashboard, Globe, Wallet, CreditCard } from 'lucide-react';
import { blink } from '../lib/blink';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { useCredits } from '../hooks/useCredits';

interface SidebarProps {
  activeTab: 'chat' | 'profile' | 'documents' | 'admin' | 'pricing';
  setActiveTab: (tab: 'chat' | 'profile' | 'documents' | 'admin' | 'pricing') => void;
  isAdmin?: boolean;
}

export function Sidebar({ activeTab, setActiveTab, isAdmin }: SidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { credits } = useCredits();

  const navItems = [
    { id: 'chat', label: t('startChat'), icon: MessageSquare },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'documents', label: t('documents'), icon: FileText },
    { id: 'pricing', label: t('upgrade'), icon: CreditCard },
  ];

  return (
    <aside className="w-64 border-r flex flex-col h-screen shrink-0 bg-background">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center p-1.5">
            <img src="https://credoserv.ru/img/48438455.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
          <span className="font-bold text-xl tracking-tight">Кредо-Сервис</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-secondary text-foreground shadow-sm border border-border" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
                  ? "bg-secondary text-primary shadow-sm border border-primary/20" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              {t('admin')}
            </button>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t space-y-4">
        <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('credits')}</span>
          </div>
          <span className="text-sm font-bold">{credits ?? '...'}</span>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-3"
          onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
        >
          <Globe className="h-5 w-5" />
          {language === 'ru' ? 'English' : 'Русский'}
        </Button>

        <button 
          onClick={() => blink.auth.logout()}
          className="flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:text-destructive/80 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
