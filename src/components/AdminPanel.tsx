import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Users, MessageSquare, FileText, Activity, ArrowUpRight, Search } from 'lucide-react';
import { blink } from '../lib/blink';
import { Input } from './ui/input';

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
      const usersCount = await blink.db.userProfiles.count();
      const chatsCount = await blink.db.chatSessions.count();
      const docsCount = await blink.db.userDocuments.count();
      
      setStats({
        users: usersCount,
        chats: chatsCount,
        docs: docsCount,
        active: Math.floor(usersCount * 0.7) // Mock active count
      });

      const users = await blink.db.userProfiles.list({
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500">Overview of platform activity and user statuses.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search users..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} trend="+12%" />
        <StatCard title="Active Consultations" value={stats.chats} icon={MessageSquare} trend="+5%" />
        <StatCard title="Processed Docs" value={stats.docs} icon={FileText} trend="+18%" />
        <StatCard title="Retention Rate" value="84%" icon={Activity} trend="+2%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                      {user.displayName?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.displayName}</p>
                      <p className="text-xs text-slate-500">{user.jurisdiction || 'No Jurisdiction'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <HealthItem label="AI Response Time" value="1.2s" status="Optimal" />
            <HealthItem label="OCR Success Rate" value="98.5%" status="Excellent" />
            <HealthItem label="DB Load" value="14%" status="Low" />
            <div className="pt-4 border-t">
               <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-widest">Jurisdiction Coverage</p>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">USA</span>
                 <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">EU</span>
                 <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">UK</span>
                 <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">CIS</span>
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
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <div className="text-3xl font-bold">{value}</div>
          </div>
          <div className="p-2 bg-slate-100 rounded-lg">
            <Icon className="h-5 w-5 text-slate-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded">
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
        <p className="text-xs text-slate-400">{status}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
