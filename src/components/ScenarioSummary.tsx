import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { ScenarioResult } from './ScenarioWizard';
import { ScenarioType } from './ScenarioSelectionScreen';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  Download,
  Share2,
  MessageSquare,
  RefreshCw,
  CreditCard,
  TrendingUp,
  Shield,
  Undo2,
  Scale,
  Sparkles
} from 'lucide-react';

interface ScenarioSummaryProps {
  result: ScenarioResult;
  onBack: () => void;
  onStartChat: () => void;
  onNewScenario: () => void;
}

const scenarioIcons: Record<ScenarioType, React.ElementType> = {
  credit: CreditCard,
  refinance: RefreshCw,
  debtPlan: TrendingUp,
  improveHistory: Shield,
  insuranceReturn: Undo2,
  bankruptcy: Scale
};

const scenarioColors: Record<ScenarioType, string> = {
  credit: 'from-emerald-500 to-emerald-600',
  refinance: 'from-blue-500 to-blue-600',
  debtPlan: 'from-amber-500 to-amber-600',
  improveHistory: 'from-violet-500 to-violet-600',
  insuranceReturn: 'from-rose-500 to-rose-600',
  bankruptcy: 'from-slate-600 to-slate-700'
};

const scenarioTitles: Record<ScenarioType, { ru: string }> = {
  credit: { ru: 'Получение кредита' },
  refinance: { ru: 'Рефинансирование' },
  debtPlan: { ru: 'План выхода из долгов' },
  improveHistory: { ru: 'Улучшение КИ' },
  insuranceReturn: { ru: 'Возврат страхования' },
  bankruptcy: { ru: 'Банкротство' }
};

export function ScenarioSummary({ result, onBack, onStartChat, onNewScenario }: ScenarioSummaryProps) {
  const Icon = scenarioIcons[result.scenario];
  const colorGradient = scenarioColors[result.scenario];
  const title = scenarioTitles[result.scenario].ru;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Кредо-Сервис: ${title}`,
          text: result.summary,
          url: window.location.href
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with gradient */}
      <div className={cn("bg-gradient-to-r text-white", colorGradient)}>
        <header className="h-16 flex items-center justify-between px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Hero section */}
        <div className="px-6 pb-8 pt-2 text-center">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold mb-1">{title}</h1>
          <p className="text-white/70 text-sm">
            Анализ завершён
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mt-4">
        <div className="max-w-2xl mx-auto px-6 pb-6">
          {/* Summary Card */}
          <div className="bg-card rounded-2xl border shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-primary">
                Итоговая оценка
              </h2>
            </div>
            <div className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.summary}
              </ReactMarkdown>
            </div>
          </div>

          {/* Risks Section */}
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/30 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-red-600 dark:text-red-400">
                Ключевые риски
              </h2>
            </div>
            <ul className="space-y-3">
              {result.risks.map((risk, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="h-5 w-5 bg-red-200 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-red-700 dark:text-red-300">
                    {idx + 1}
                  </span>
                  <span className="text-red-800 dark:text-red-200">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations Section */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Рекомендации
              </h2>
            </div>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-800 dark:text-emerald-200">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="space-y-3">
            <Button 
              onClick={onStartChat}
              className="w-full h-12 rounded-xl font-bold shadow-lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Обсудить с советником
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={onNewScenario}
                className="h-11 rounded-xl font-bold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Другой сценарий
              </Button>
              <Button 
                variant="outline"
                className="h-11 rounded-xl font-bold"
                disabled
              >
                <Download className="h-4 w-4 mr-2" />
                Скачать PDF
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase tracking-widest">
            Информация носит рекомендательный характер и не является офертой
          </p>
        </div>
      </div>
    </div>
  );
}
