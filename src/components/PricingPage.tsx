import React from 'react';
import { Check, Zap, Shield, Crown, MessageSquareOff, FileSearch, LineChart, Headphones, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useCredits } from '../hooks/useCredits';
import { useLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function PricingPage() {
  const { credits } = useCredits();
  const { language } = useLanguage();

  const plans = [
    {
      id: 'basic',
      name: language === 'ru' ? 'Базовый' : 'Basic',
      desc: language === 'ru' ? 'Для ознакомления' : 'For introduction',
      price: '0',
      credits: '100',
      features: [
        language === 'ru' ? 'Диагностика ситуации' : 'Situation diagnostics',
        language === 'ru' ? 'Первичный план действий' : 'Initial action plan',
        language === 'ru' ? '100 приветственных кредитов' : '100 welcome credits'
      ],
      icon: <Shield className="w-6 h-6 text-slate-400" />,
      buttonText: language === 'ru' ? 'Текущий план' : 'Current Plan',
      isCurrent: true
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: language === 'ru' ? 'Глубокий анализ' : 'Deep analysis',
      price: '29',
      credits: '1000',
      features: [
        language === 'ru' ? 'Глубокий анализ КИ' : 'Deep credit history analysis',
        language === 'ru' ? 'Анализ всех документов' : 'Document analysis',
        language === 'ru' ? 'Приоритетные сценарии' : 'Priority scenarios',
        language === 'ru' ? 'Мониторинг изменений' : 'Monitoring changes'
      ],
      icon: <Zap className="w-6 h-6 text-primary" />,
      buttonText: language === 'ru' ? 'Выбрать Pro' : 'Choose Pro',
      highlight: true
    },
    {
      id: 'unlimited',
      name: 'Business',
      desc: language === 'ru' ? 'Полное сопровождение' : 'Full support',
      price: '99',
      credits: '∞',
      features: [
        language === 'ru' ? 'Безлимитный AI-чат' : 'Unlimited AI chat',
        language === 'ru' ? 'Помощь эксперта' : 'Expert assistance',
        language === 'ru' ? 'Юридические шаблоны' : 'Legal templates',
        language === 'ru' ? 'Персональный разбор' : 'Personal review'
      ],
      icon: <Crown className="w-6 h-6 text-accent" />,
      buttonText: language === 'ru' ? 'Связаться с нами' : 'Contact Us'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-secondary/20 chat-height scrollbar-hide">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {language === 'ru' ? 'Возможности сервиса' : 'Service Features'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'ru' 
              ? 'Дополнительные инструменты для глубокой работы с кредитной историей.'
              : 'Additional tools for deep work with your credit history.'}
          </p>
        </div>

        {/* Credits Spending Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <MessageSquareOff className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="font-bold text-sm uppercase tracking-widest text-primary">
              {language === 'ru' ? 'Как списываются кредиты' : 'How credits are spent'}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {language === 'ru' 
                ? 'Кредиты списываются за глубокий анализ и отчёты, а не за простые сообщения в чате.' 
                : 'Credits are deducted for deep analysis and reports, not for simple chat messages.'}
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-2xl border shadow-inner">
             <span className="text-xs font-bold text-muted-foreground">{language === 'ru' ? 'ВАШ БАЛАНС' : 'YOUR BALANCE'}</span>
             <span className="text-xl font-black text-primary">{credits ?? '...'}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "relative flex flex-col p-8 bg-card border-2 rounded-3xl transition-all hover:shadow-xl group",
                plan.highlight ? "border-primary shadow-lg shadow-primary/5 scale-105 z-10" : "border-border hover:border-primary/20"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                  {language === 'ru' ? 'Рекомендуем' : 'Recommended'}
                </div>
              )}
              
              <div className="mb-8">
                <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {plan.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{plan.desc}</p>
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-muted-foreground font-medium">/{language === 'ru' ? 'мес' : 'mo'}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.highlight ? "default" : "outline"}
                className={cn(
                  "w-full h-12 rounded-xl font-bold transition-all",
                  plan.isCurrent && "bg-secondary text-muted-foreground border-transparent cursor-default hover:bg-secondary"
                )}
                onClick={() => {
                  if (plan.id === 'unlimited') {
                    toast.info(language === 'ru' ? 'Перенаправляем в поддержку...' : 'Redirecting to support...');
                  } else if (!plan.isCurrent) {
                    toast.info(language === 'ru' ? 'Функция оплаты в демо-режиме отключена' : 'Payment disabled in demo mode');
                  }
                }}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* Demo Footer Info */}
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4 text-amber-800 shadow-sm">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm uppercase tracking-widest">{language === 'ru' ? 'Демо-режим' : 'Demo Mode'}</h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              {language === 'ru' 
                ? 'В данной версии покупка планов невозможна. Вы можете протестировать основной функционал в чате бесплатно.' 
                : 'In this version, purchasing plans is not possible. You can test the core functionality in the chat for free.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
