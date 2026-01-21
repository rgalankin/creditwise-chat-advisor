import React from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { User, Globe, Shield, Calendar, CreditCard, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface ProfileViewProps {
  profile: any;
  updateProfile: (data: any) => Promise<any>;
}

export function ProfileView({ profile, updateProfile }: ProfileViewProps) {
  const handleJurisdictionChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jurisdiction = formData.get('jurisdiction') as string;
    
    try {
      await updateProfile({ jurisdiction });
      toast.success('Jurisdiction updated successfully');
    } catch (error) {
      toast.error('Failed to update jurisdiction');
    }
  };

  const toggleConsent = async () => {
    try {
      await updateProfile({ hasConsent: Number(profile.hasConsent) > 0 ? "0" : "1" });
      toast.success('Consent status updated');
    } catch (error) {
      toast.error('Failed to update consent');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in overflow-y-auto chat-height scrollbar-hide">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Financial Profile</h1>
        <p className="text-slate-500">Your digital financial identity for personalized recommendations.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-slate-500">Display Name</span>
                  <span className="text-sm font-medium">{profile.displayName}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">Joined</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Jurisdiction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJurisdictionChange} className="space-y-4">
                  <select 
                    name="jurisdiction" 
                    defaultValue={profile.jurisdiction || ''}
                    className="w-full h-10 px-3 rounded-md border text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="" disabled>Select your country/region</option>
                    <option value="USA">United States</option>
                    <option value="EU">European Union</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CIS">CIS Region</option>
                    <option value="Other">Other / Global</option>
                  </select>
                  <Button type="submit" size="sm" className="w-full">Update Location</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className={cn(
            "border-2 transition-colors shadow-none",
            Number(profile.hasConsent) > 0 ? "border-emerald-100 bg-emerald-50/20" : "border-amber-100 bg-amber-50/20"
          )}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Shield className={cn(
                      "h-5 w-5",
                      Number(profile.hasConsent) > 0 ? "text-emerald-600" : "text-amber-600"
                    )} />
                    <h3 className="font-bold">Data Processing Consent</h3>
                  </div>
                  <p className="text-sm text-slate-600 max-w-lg">
                    Enable consent to allow deep analysis of documents and credit history.
                  </p>
                </div>
                <Button 
                  onClick={toggleConsent}
                  variant={Number(profile.hasConsent) > 0 ? "outline" : "default"}
                  className={cn(
                    "w-full md:w-auto",
                    Number(profile.hasConsent) > 0 ? "border-emerald-200 text-emerald-700 hover:bg-emerald-100" : ""
                  )}
                >
                  {Number(profile.hasConsent) > 0 ? 'Revoke' : 'Grant'} Consent
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Financial Health
              </CardTitle>
              <div className="text-[10px] uppercase font-bold text-slate-400">Real-time Analysis</div>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 <Metric label="Score Est." value="N/A" />
                 <Metric label="Total Debt" value="$0.00" />
                 <Metric label="Income" value="$0.00" />
                 <Metric label="Risk" value="Low" color="text-emerald-500" />
               </div>
               
               <div className="p-6 border rounded-2xl bg-slate-50 border-dashed flex flex-col items-center text-center space-y-3">
                 <AlertCircle className="h-8 w-8 text-slate-300" />
                 <div>
                   <p className="font-bold text-slate-900">Analysis Incomplete</p>
                   <p className="text-sm text-slate-500">Finish your diagnostic chat or upload documents to see detailed metrics.</p>
                 </div>
                 <Button variant="outline" size="sm">Start Diagnostic</Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-900 bg-slate-900 text-white overflow-hidden relative">
            <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/5 rotate-12" />
            <CardHeader>
              <CardTitle className="text-lg">Smart Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-sm text-slate-300 leading-relaxed">
                Based on your profile, we generate autonomous paths for your financial recovery or improvement.
              </p>
              
              <div className="space-y-3 pt-2">
                <ScenarioItem title="Debt Consolidation" active={false} />
                <ScenarioItem title="Credit Repair" active={false} />
                <ScenarioItem title="Bankruptcy Check" active={false} />
              </div>

              <Button className="w-full bg-white text-black hover:bg-slate-100 mt-4 group">
                Generate Scenarios <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem label="Joined CreditWise" time="Today" />
                <ActivityItem label="Session Started" time="Today" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color = "text-black" }: any) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border space-y-1">
      <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
      <div className={cn("text-2xl font-bold", color)}>{value}</div>
    </div>
  );
}

function ScenarioItem({ title, active }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      active ? "bg-white/10 border-white/20" : "bg-white/5 border-white/10 opacity-50"
    )}>
      <span className="text-sm font-medium">{title}</span>
      <div className="h-2 w-2 rounded-full bg-slate-500" />
    </div>
  );
}

function ActivityItem({ label, time }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
  );
}
