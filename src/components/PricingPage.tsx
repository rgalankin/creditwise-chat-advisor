import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { useCredits } from '../hooks/useCredits';
import { useLanguage } from '../lib/i18n';

export function PricingPage() {
  const { addCredits, credits } = useCredits();
  const { t, language } = useLanguage();

  const plans = [
    {
      name: language === 'ru' ? 'Базовый' : 'Basic',
      price: '0',
      credits: '100',
      features: [
        language === 'ru' ? '100 бесплатных кредитов' : '100 free credits',
        language === 'ru' ? 'Базовый финансовый анализ' : 'Basic financial analysis',
        language === 'ru' ? 'Поддержка в чате' : 'Chat support'
      ],
      icon: <Shield className="w-6 h-6 text-slate-400" />,
      buttonText: language === 'ru' ? 'Текущий план' : 'Current Plan',
      isCurrent: true
    },
    {
      name: 'Pro',
      price: '20',
      credits: '1000',
      features: [
        language === 'ru' ? '1000 кредитов в месяц' : '1000 credits per month',
        language === 'ru' ? 'Глубокий анализ документов' : 'Deep document analysis',
        language === 'ru' ? 'Приоритетные ответы AI' : 'Priority AI responses',
        language === 'ru' ? 'Экспорт отчетов' : 'Export reports'
      ],
      icon: <Zap className="w-6 h-6 text-primary" />,
      buttonText: language === 'ru' ? 'Выбрать Pro' : 'Choose Pro',
      highlight: true
    },
    {
      name: 'Unlimited',
      price: '50',
      credits: '∞',
      features: [
        language === 'ru' ? 'Безлимитные кредиты' : 'Unlimited credits',
        language === 'ru' ? 'Персональный менеджер' : 'Personal manager',
        language === 'ru' ? 'Все будущие обновления' : 'All future updates',
        language === 'ru' ? 'Юридическая поддержка' : 'Legal support'
      ],
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      buttonText: language === 'ru' ? 'Стать Unlimited' : 'Go Unlimited'
    }
  ];

  const handlePurchase = (plan: any) => {
    if (plan.isCurrent) return;
    // In a real app, this would trigger Stripe Checkout
    // For MVP, we'll just add credits directly if it's a mock purchase
    if (plan.name === 'Pro') addCredits(1000);
    else if (plan.name === 'Unlimited') addCredits(10000); // Representing unlimited for now
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {language === 'ru' ? 'Выберите подходящий план' : 'Choose your plan'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === 'ru' 
              ? 'Получите больше возможностей для управления вашим кредитным здоровьем с нашими премиум-пакетами.'
              : 'Unlock more features to manage your credit health with our premium packages.'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm font-medium">{t('credits')}:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
              {credits ?? '...'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={cn(
                "relative flex flex-col p-8 bg-card border rounded-3xl shadow-sm transition-all hover:shadow-md",
                plan.highlight ? "border-primary ring-1 ring-primary" : "border-border"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                  {language === 'ru' ? 'Популярный' : 'Popular'}
                </div>
              )}
              
              <div className="mb-8">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{language === 'ru' ? 'мес' : 'mo'}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.highlight ? "default" : "outline"}
                className={cn(
                  "w-full h-12 rounded-xl font-bold",
                  plan.isCurrent && "opacity-50 cursor-default"
                )}
                onClick={() => handlePurchase(plan)}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-3xl p-8 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {language === 'ru' ? 'Нужен индивидуальный подход?' : 'Need a custom approach?'}
            </h2>
            <p className="opacity-80">
              {language === 'ru' 
                ? 'Для корпоративных клиентов и партнеров мы предлагаем особые условия.'
                : 'For corporate clients and partners, we offer special terms.'}
            </p>
          </div>
          <Button variant="secondary" className="h-12 px-8 font-bold whitespace-nowrap">
            {language === 'ru' ? 'Связаться с нами' : 'Contact Us'}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
