import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Users, MessageSquare, FileText, Activity, ArrowUpRight, Search } from 'lucide-react';
import { blink } from '../lib/blink';
import { Input } from './ui/input';
import { useLanguage } from '../lib/i18n';

export function AdminPanel() {
  const [stats, setStats] = useState({
    users: 0,
    chats: 0,
    docs: 0,
    active: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const usersCount = await (blink.db as any).userProfiles.count();
      const chatsCount = await (blink.db as any).chatSessions.count();
      const docsCount = await (blink.db as any).userDocuments.count();
      
      setStats({
        users: usersCount,
        chats: chatsCount,
        docs: docsCount,
        active: Math.floor(usersCount * 0.7)
      });

      const users = await (blink.db as any).userProfiles.list({
        orderBy: { createdAt: 'desc' },
        limit: 5
      });
      setRecentUsers(users);
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in overflow-y-auto chat-height scrollbar-hide">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Панель управления
          </h1>
          <p className="text-muted-foreground">
            Обзор активности платформы и статусов пользователей.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск пользователей..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Пользователи" value={stats.users} icon={Users} trend="+12%" />
        <StatCard title="Консультации" value={stats.chats} icon={MessageSquare} trend="+5%" />
        <StatCard title="Документы" value={stats.docs} icon={FileText} trend="+18%" />
        <StatCard title="Удержание" value="84%" icon={Activity} trend="+2%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Недавние пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground">
                      {user.displayName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.jurisdiction || 'No Jurisdiction'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Активен
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Состояние системы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <HealthItem label="AI Response Time" value="1.2s" status="Optimal" />
            <HealthItem label="OCR Success Rate" value="98.5%" status="Excellent" />
            <HealthItem label="DB Load" value="14%" status="Low" />
            <div className="pt-4 border-t border-border/50">
               <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-widest">
                 Охват юрисдикций
               </p>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-secondary rounded text-[10px] font-bold">Russia</span>
                 <span className="px-2 py-1 bg-secondary rounded text-[10px] font-bold">USA</span>
                 <span className="px-2 py-1 bg-secondary rounded text-[10px] font-bold">EU</span>
                 <span className="px-2 py-1 bg-secondary rounded text-[10px] font-bold">UK</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="text-3xl font-bold">{value}</div>
          </div>
          <div className="p-2 bg-secondary rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 w-fit px-2 py-0.5 rounded">
          <ArrowUpRight className="h-3 w-3" />
          {trend}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, value, status }: any) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
