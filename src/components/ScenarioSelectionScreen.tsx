import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { 
  CreditCard, 
  RefreshCw, 
  TrendingUp, 
  Shield, 
  Undo2, 
  Scale,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export type ScenarioType = 
  | 'credit' 
  | 'refinance' 
  | 'debtPlan' 
  | 'improveHistory' 
  | 'insuranceReturn' 
  | 'bankruptcy';

interface ScenarioSelectionScreenProps {
  onSelectScenario: (scenario: ScenarioType) => void;
  onBack?: () => void;
}

interface ScenarioCard {
  id: ScenarioType;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  icon: React.ElementType;
  color: string;
  steps: number;
}

const scenarios: ScenarioCard[] = [
  {
    id: 'credit',
    titleRu: 'Получение кредита',
    titleEn: 'Get a Loan',
    descRu: 'Подбор оптимального предложения под вашу ситуацию',
    descEn: 'Find the best offer for your situation',
    icon: CreditCard,
    color: 'bg-emerald-500',
    steps: 5
  },
  {
    id: 'refinance',
    titleRu: 'Рефинансирование',
    titleEn: 'Refinancing',
    descRu: 'Снижение ставки и ежемесячного платежа',
    descEn: 'Lower your rate and monthly payment',
    icon: RefreshCw,
    color: 'bg-blue-500',
    steps: 4
  },
  {
    id: 'debtPlan',
    titleRu: 'План выхода из долгов',
    titleEn: 'Debt Recovery Plan',
    descRu: 'Пошаговая стратегия погашения задолженностей',
    descEn: 'Step-by-step debt repayment strategy',
    icon: TrendingUp,
    color: 'bg-amber-500',
    steps: 6
  },
  {
    id: 'improveHistory',
    titleRu: 'Улучшение КИ',
    titleEn: 'Improve Credit',
    descRu: 'Восстановление кредитной истории',
    descEn: 'Credit history restoration',
    icon: Shield,
    color: 'bg-violet-500',
    steps: 5
  },
  {
    id: 'insuranceReturn',
    titleRu: 'Возврат страхования',
    titleEn: 'Insurance Return',
    descRu: 'Возврат навязанных страховок',
    descEn: 'Return of imposed insurance',
    icon: Undo2,
    color: 'bg-rose-500',
    steps: 4
  },
  {
    id: 'bankruptcy',
    titleRu: 'Банкротство',
    titleEn: 'Bankruptcy',
    descRu: 'Проверка возможности и процедура',
    descEn: 'Eligibility check and procedure',
    icon: Scale,
    color: 'bg-slate-600',
    steps: 5
  }
];

export function ScenarioSelectionScreen({ onSelectScenario, onBack }: ScenarioSelectionScreenProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-sm">
              {language === 'ru' ? 'Выберите сценарий' : 'Select a Scenario'}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              {language === 'ru' ? 'Мастер финансовых решений' : 'Financial Solutions Wizard'}
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            {language === 'ru' ? 'Назад' : 'Back'}
          </Button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ru' 
                ? 'Какую задачу хотите решить?' 
                : 'What task do you want to solve?'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {language === 'ru' 
                ? 'Выберите сценарий и пройдите пошаговый мастер для получения персональных рекомендаций' 
                : 'Select a scenario and go through the step-by-step wizard for personalized recommendations'}
            </p>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, idx) => {
              const Icon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => onSelectScenario(scenario.id)}
                  className={cn(
                    "group relative p-6 rounded-2xl border bg-card text-left",
                    "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/30",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Icon */}
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center mb-4",
                    "transition-transform group-hover:scale-110",
                    scenario.color
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
                    {language === 'ru' ? scenario.titleRu : scenario.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {language === 'ru' ? scenario.descRu : scenario.descEn}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {scenario.steps} {language === 'ru' ? 'шагов' : 'steps'}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10",
                    "bg-gradient-to-br from-primary/5 to-transparent"
                  )} />
                </button>
              );
            })}
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            {language === 'ru' 
              ? 'Не уверены? Начните с диагностики в чате — мы поможем определить оптимальный сценарий.' 
              : "Not sure? Start with diagnostics in chat — we'll help determine the optimal scenario."}
          </p>
        </div>
      </div>
    </div>
  );
}
