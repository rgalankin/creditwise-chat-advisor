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
      name: 'Базовый',
      desc: 'Для ознакомления',
      price: '0',
      credits: '100',
      features: [
        'Диагностика ситуации',
        'Первичный план действий',
        '100 приветственных кредитов'
      ],
      icon: <Shield className="w-6 h-6 text-slate-400" />,
      buttonText: 'Текущий план',
      isCurrent: true
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'Глубокий анализ',
      price: '29',
      credits: '1000',
      features: [
        'Глубокий анализ КИ',
        'Анализ всех документов',
        'Приоритетные сценарии',
        'Мониторинг изменений'
      ],
      icon: <Zap className="w-6 h-6 text-primary" />,
      buttonText: 'Выбрать Pro',
      highlight: true
    },
    {
      id: 'unlimited',
      name: 'Business',
      desc: 'Полное сопровождение',
      price: '99',
      credits: '∞',
      features: [
        'Безлимитный AI-чат',
        'Помощь эксперта',
        'Юридические шаблоны',
        'Персональный разбор'
      ],
      icon: <Crown className="w-6 h-6 text-accent" />,
      buttonText: 'Связаться с нами'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-secondary/20 chat-height scrollbar-hide">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Возможности сервиса
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Дополнительные инструменты для глубокой работы с кредитной историей.
          </p>
        </div>

        {/* Credits Spending Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <MessageSquareOff className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="font-bold text-sm uppercase tracking-widest text-primary">
              Как списываются кредиты
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Кредиты списываются за глубокий анализ и отчёты, а не за простые сообщения в чате.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-2xl border shadow-inner">
             <span className="text-xs font-bold text-muted-foreground">ВАШ БАЛАНС</span>
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
                  Рекомендуем
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
                  <span className="text-4xl font-black">{plan.price} ₽</span>
                  <span className="text-muted-foreground font-medium">/мес</span>
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
                    toast.info('Перенаправляем в поддержку...');
                  } else if (!plan.isCurrent) {
                    toast.info('Функция оплаты в демо-режиме отключена');
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
            <h4 className="font-bold text-sm uppercase tracking-widest">Демо-режим</h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              В данной версии покупка планов невозможна. Вы можете протестировать основной функционал в чате бесплатно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
