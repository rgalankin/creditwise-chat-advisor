import { Button } from './ui/button';
import { MessageSquare, User, FileText, Settings, LogOut, Shield, LayoutDashboard, Globe, Wallet, CreditCard, Info, Sparkles } from 'lucide-react';
import { blink } from '../lib/blink';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { useCredits } from '../hooks/useCredits';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SidebarProps {
  activeTab: 'chat' | 'profile' | 'documents' | 'admin' | 'pricing' | 'scenarios';
  setActiveTab: (tab: 'chat' | 'profile' | 'documents' | 'admin' | 'pricing' | 'scenarios') => void;
  isAdmin?: boolean;
  isGuestMode?: boolean;
  onLogin?: () => void;
  onReturnToHome?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isAdmin, isGuestMode = false, onLogin, onReturnToHome }: SidebarProps) {
  const { language, t } = useLanguage();
  const { credits } = useCredits();
  const displayCredits = isGuestMode ? null : credits;

  const navItems = [
    { id: 'chat', label: 'Начать чат', icon: MessageSquare },
    { id: 'scenarios', label: 'Сценарии', icon: Sparkles },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'documents', label: 'Документы', icon: FileText },
    { id: 'pricing', label: 'Улучшить', icon: CreditCard },
  ];

  return (
    <aside className="w-64 border-r flex flex-col h-screen shrink-0 bg-card shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="p-6">
        <div 
          className="flex items-center gap-3 mb-10 group cursor-pointer" 
          onClick={() => onReturnToHome ? onReturnToHome() : setActiveTab('chat')}
        >
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FendNQpF5nghlJxKVPTu4iQirL503%2Flogo-__e444df85.png?alt=media&token=3dc97fca-5f68-4d47-a4a6-debc1a8860bd" 
              alt="Logo" 
              className="w-7 h-7 object-contain invert" 
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black text-lg tracking-tight">Кредо</span>
            <span className="font-bold text-xs text-primary/80 uppercase tracking-widest">Сервис</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform", activeTab !== item.id && "group-hover:scale-110")} />
              {item.label}
            </button>
          ))}
          
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-6",
                activeTab === 'admin' 
                  ? "bg-secondary text-primary border border-primary/20 shadow-sm" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              {t('admin')}
            </button>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        {/* Credits Widget */}
        {!isGuestMode && (
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 h-12 w-12 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Баланс</span>
            </div>
            <span className="text-sm font-black text-primary">{credits ?? '...'}</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider underline decoration-dotted underline-offset-2">
                    Как списывается?
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card text-foreground border-primary/20 shadow-xl p-3 max-w-[200px]">
                <p className="text-[10px] font-medium leading-relaxed">
                  Кредиты списываются за этапы анализа и отчёты, а не за простые сообщения.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        )}

        <div className="flex gap-2">
          {isGuestMode ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 justify-center gap-2 h-10 rounded-xl font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={onLogin}
            >
              <LogOut className="h-4 w-4 rotate-180" />
              Войти
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-center gap-2 h-10 rounded-xl font-bold text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => blink.auth.logout()}
            >
              <LogOut className="h-4 w-4" />
              Выход
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
