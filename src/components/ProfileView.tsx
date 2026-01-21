import React from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { User, Globe, Shield, Calendar, CreditCard, Sparkles, AlertCircle, ArrowRight, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { useCredits } from '../hooks/useCredits';

interface ProfileViewProps {
  profile: any;
  updateProfile: (data: any) => Promise<any>;
}

export function ProfileView({ profile, updateProfile }: ProfileViewProps) {
  const { t, language } = useLanguage();
  const { credits } = useCredits();

  const handleJurisdictionChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jurisdiction = formData.get('jurisdiction') as string;
    
    try {
      await updateProfile({ jurisdiction });
      toast.success(language === 'ru' ? 'Регион обновлен' : 'Jurisdiction updated');
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка обновления' : 'Failed to update');
    }
  };

  const toggleConsent = async () => {
    try {
      await updateProfile({ hasConsent: Number(profile.hasConsent) > 0 ? "0" : "1" });
      toast.success(language === 'ru' ? 'Статус согласия изменен' : 'Consent status updated');
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка изменения' : 'Failed to update');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in overflow-y-auto chat-height scrollbar-hide">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {language === 'ru' ? 'Финансовый профиль' : 'Financial Profile'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ru' 
            ? 'Ваша цифровая финансовая личность для персонализированных рекомендаций.'
            : 'Your digital financial identity for personalized recommendations.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {language === 'ru' ? 'Личные данные' : 'Personal Info'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">{language === 'ru' ? 'Имя' : 'Display Name'}</span>
                  <span className="text-sm font-medium">{profile.displayName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">{t('credits')}</span>
                  <span className="text-sm font-bold text-primary">{credits ?? '...'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">{language === 'ru' ? 'Дата регистрации' : 'Joined'}</span>
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
                  <Globe className="h-4 w-4 text-primary" />
                  {language === 'ru' ? 'Юрисдикция' : 'Jurisdiction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJurisdictionChange} className="space-y-4">
                  <select 
                    name="jurisdiction" 
                    defaultValue={profile.jurisdiction || ''}
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="" disabled>{language === 'ru' ? 'Выберите страну/регион' : 'Select your country/region'}</option>
                    <option value="Russia">Россия</option>
                    <option value="USA">United States</option>
                    <option value="EU">European Union</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Other">Other / Global</option>
                  </select>
                  <Button type="submit" size="sm" className="w-full font-bold">
                    {language === 'ru' ? 'Обновить регион' : 'Update Location'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className={cn(
            "border-2 transition-colors shadow-none bg-card",
            Number(profile.hasConsent) > 0 ? "border-emerald-500/20" : "border-amber-500/20"
          )}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Shield className={cn(
                      "h-5 w-5",
                      Number(profile.hasConsent) > 0 ? "text-emerald-500" : "text-amber-500"
                    )} />
                    <h3 className="font-bold">{language === 'ru' ? 'Согласие на обработку данных' : 'Data Processing Consent'}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    {language === 'ru' 
                      ? 'Включите согласие, чтобы разрешить глубокий анализ документов и кредитной истории.'
                      : 'Enable consent to allow deep analysis of documents and credit history.'}
                  </p>
                </div>
                <Button 
                  onClick={toggleConsent}
                  variant={Number(profile.hasConsent) > 0 ? "outline" : "default"}
                  className={cn(
                    "w-full md:w-auto font-bold",
                    Number(profile.hasConsent) > 0 ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" : ""
                  )}
                >
                  {Number(profile.hasConsent) > 0 
                    ? (language === 'ru' ? 'Отозвать' : 'Revoke') 
                    : (language === 'ru' ? 'Предоставить' : 'Grant')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                {language === 'ru' ? 'Финансовое здоровье' : 'Financial Health'}
              </CardTitle>
              <div className="text-[10px] uppercase font-bold text-muted-foreground">{language === 'ru' ? 'Анализ в реальном времени' : 'Real-time Analysis'}</div>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 <Metric label={language === 'ru' ? 'Рейтинг' : 'Score Est.'} value="N/A" />
                 <Metric label={language === 'ru' ? 'Общий долг' : 'Total Debt'} value="$0.00" />
                 <Metric label={language === 'ru' ? 'Доход' : 'Income'} value="$0.00" />
                 <Metric label={language === 'ru' ? 'Риск' : 'Risk'} value={language === 'ru' ? 'Низкий' : 'Low'} color="text-emerald-500" />
               </div>
               
               <div className="p-6 border rounded-2xl bg-secondary/30 border-dashed flex flex-col items-center text-center space-y-3">
                 <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                 <div>
                   <p className="font-bold">{language === 'ru' ? 'Анализ не завершен' : 'Analysis Incomplete'}</p>
                   <p className="text-sm text-muted-foreground">
                     {language === 'ru' 
                       ? 'Завершите диагностический чат или загрузите документы, чтобы увидеть подробные метрики.'
                       : 'Finish your diagnostic chat or upload documents to see detailed metrics.'}
                   </p>
                 </div>
                 <Button variant="outline" size="sm" className="font-bold">{t('startChat')}</Button>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary text-primary-foreground overflow-hidden relative shadow-xl shadow-primary/10">
            <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/5 rotate-12" />
            <CardHeader>
              <CardTitle className="text-lg">{language === 'ru' ? 'Умные сценарии' : 'Smart Scenarios'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-sm opacity-80 leading-relaxed">
                {language === 'ru'
                  ? 'На основе вашего профиля мы генерируем автономные пути для вашего финансового восстановления или улучшения.'
                  : 'Based on your profile, we generate autonomous paths for your financial recovery or improvement.'}
              </p>
              
              <div className="space-y-3 pt-2">
                <ScenarioItem title={language === 'ru' ? 'Консолидация долга' : 'Debt Consolidation'} active={false} />
                <ScenarioItem title={language === 'ru' ? 'Исправление кредита' : 'Credit Repair'} active={false} />
                <ScenarioItem title={language === 'ru' ? 'Проверка на банкротство' : 'Bankruptcy Check'} active={false} />
              </div>

              <Button className="w-full bg-primary-foreground text-primary hover:bg-secondary mt-4 group font-bold">
                {language === 'ru' ? 'Создать сценарии' : 'Generate Scenarios'} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{language === 'ru' ? 'Недавняя активность' : 'Recent Activity'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem label={language === 'ru' ? 'Регистрация' : 'Joined'} time={language === 'ru' ? 'Сегодня' : 'Today'} />
                <ActivityItem label={language === 'ru' ? 'Сессия начата' : 'Session Started'} time={language === 'ru' ? 'Сегодня' : 'Today'} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color = "text-foreground" }: any) {
  return (
    <div className="p-4 bg-secondary/30 rounded-xl border space-y-1">
      <span className="text-[10px] uppercase font-bold text-muted-foreground">{label}</span>
      <div className={cn("text-2xl font-bold", color)}>{value}</div>
    </div>
  );
}

function ScenarioItem({ title, active }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border",
      active ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-primary-foreground/5 border-primary-foreground/10 opacity-50"
    )}>
      <span className="text-sm font-medium">{title}</span>
      <div className="h-2 w-2 rounded-full bg-primary-foreground/50" />
    </div>
  );
}

function ActivityItem({ label, time }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground/50">{time}</span>
    </div>
  );
}
