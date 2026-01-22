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
import { toast } from 'sonner';

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
  isGuestMode?: boolean;
  onLogin?: () => void;
}

interface ScenarioCard {
  id: ScenarioType;
  titleRu: string;
  descRu: string;
  icon: React.ElementType;
  color: string;
  steps: number;
}

const scenarios: ScenarioCard[] = [
  {
    id: 'credit',
    titleRu: 'Получение кредита',
    descRu: 'Подбор оптимального предложения под вашу ситуацию',
    icon: CreditCard,
    color: 'bg-emerald-500',
    steps: 5
  },
  {
    id: 'refinance',
    titleRu: 'Рефинансирование',
    descRu: 'Снижение ставки и ежемесячного платежа',
    icon: RefreshCw,
    color: 'bg-blue-500',
    steps: 4
  },
  {
    id: 'debtPlan',
    titleRu: 'План выхода из долгов',
    descRu: 'Пошаговая стратегия погашения задолженностей',
    icon: TrendingUp,
    color: 'bg-amber-500',
    steps: 6
  },
  {
    id: 'improveHistory',
    titleRu: 'Улучшение КИ',
    descRu: 'Восстановление кредитной истории',
    icon: Shield,
    color: 'bg-violet-500',
    steps: 5
  },
  {
    id: 'insuranceReturn',
    titleRu: 'Возврат страхования',
    descRu: 'Возврат навязанных страховок',
    icon: Undo2,
    color: 'bg-rose-500',
    steps: 4
  },
  {
    id: 'bankruptcy',
    titleRu: 'Банкротство',
    descRu: 'Проверка возможности и процедура',
    icon: Scale,
    color: 'bg-slate-600',
    steps: 5
  }
];

export function ScenarioSelectionScreen({ onSelectScenario, onBack, isGuestMode = false, onLogin }: ScenarioSelectionScreenProps) {
  const handleSelect = (id: ScenarioType) => {
    if (isGuestMode) {
      toast.info('Пожалуйста, войдите в систему для использования сценариев');
      if (onLogin) onLogin();
      return;
    }
    onSelectScenario(id);
  };

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
              Выберите сценарий
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              Мастер финансовых решений
            </p>
          </div>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            Назад
          </Button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              Какую задачу хотите решить?
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Выберите сценарий и пройдите пошаговый мастер для получения персональных рекомендаций
            </p>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, idx) => {
              const Icon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelect(scenario.id)}
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
                    {scenario.titleRu}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {scenario.descRu}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {scenario.steps} шагов
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
            Не уверены? Начните с диагностики в чате — мы поможем определить оптимальный сценарий.
          </p>
        </div>
      </div>
    </div>
  );
}