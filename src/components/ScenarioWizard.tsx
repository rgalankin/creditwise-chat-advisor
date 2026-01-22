import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { ScenarioType } from './ScenarioSelectionScreen';
import { VoiceRecorder } from './VoiceRecorder';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';

interface ScenarioWizardProps {
  scenario: ScenarioType;
  onComplete: (result: ScenarioResult) => void;
  onBack: () => void;
  profile: any;
  isGuestMode?: boolean;
  onLogin?: () => void;
}

interface WizardStep {
  id: string;
  titleRu: string;
  questionRu: string;
  type: 'options' | 'text' | 'voice' | 'mixed';
  optionsRu?: string[];
}

export interface ScenarioResult {
  scenario: ScenarioType;
  answers: Record<string, string>;
  summary: string;
  risks: string[];
  recommendations: string[];
  imageUrl?: string;
}

// Scenario-specific wizard steps
const scenarioSteps: Record<ScenarioType, WizardStep[]> = {
  credit: [
    { id: 'goal', titleRu: 'Цель кредита', questionRu: 'Для чего нужен кредит?', type: 'options', optionsRu: ['Покупка авто', 'Ремонт', 'Медицина', 'Образование', 'Бизнес', 'Другое'] },
    { id: 'amount', titleRu: 'Сумма', questionRu: 'Какая сумма вам нужна?', type: 'options', optionsRu: ['до 100к', '100-300к', '300-500к', '500к-1М', '1М+'] },
    { id: 'income', titleRu: 'Доход', questionRu: 'Ваш ежемесячный доход?', type: 'options', optionsRu: ['до 50к', '50-100к', '100-200к', '200к+'] },
    { id: 'employment', titleRu: 'Занятость', questionRu: 'Ваш тип занятости?', type: 'options', optionsRu: ['Официальная работа', 'ИП/Самозанятый', 'Неофициально', 'Безработный'] },
    { id: 'details', titleRu: 'Детали', questionRu: 'Что ещё важно знать о вашей ситуации?', type: 'mixed' }
  ],
  refinance: [
    { id: 'currentLoans', titleRu: 'Текущие кредиты', questionRu: 'Сколько у вас действующих кредитов?', type: 'options', optionsRu: ['1', '2-3', '4-5', '6+'] },
    { id: 'totalDebt', titleRu: 'Общий долг', questionRu: 'Общая сумма задолженности?', type: 'options', optionsRu: ['до 100к', '100-300к', '300-500к', '500к-1М', '1М+'] },
    { id: 'monthlyPayment', titleRu: 'Платёж', questionRu: 'Текущий ежемесячный платёж?', type: 'options', optionsRu: ['до 10к', '10-30к', '30-50к', '50-100к', '100к+'] },
    { id: 'details', titleRu: 'Детали', questionRu: 'Расскажите подробнее о целях рефинансирования', type: 'mixed' }
  ],
  debtPlan: [
    { id: 'debtType', titleRu: 'Тип долгов', questionRu: 'Какие у вас долги?', type: 'options', optionsRu: ['Кредиты', 'Микрозаймы', 'Кредитные карты', 'Долги физлицам', 'Смешанные'] },
    { id: 'overdue', titleRu: 'Просрочки', questionRu: 'Есть просроченные платежи?', type: 'options', optionsRu: ['Нет', 'До 30 дней', '30-90 дней', '90+ дней'] },
    { id: 'collectors', titleRu: 'Коллекторы', questionRu: 'Звонят коллекторы?', type: 'options', optionsRu: ['Нет', 'Иногда', 'Часто', 'Постоянно'] },
    { id: 'income', titleRu: 'Доход', questionRu: 'Сколько можете выделять на погашение?', type: 'options', optionsRu: ['до 10к', '10-20к', '20-40к', '40к+'] },
    { id: 'priority', titleRu: 'Приоритет', questionRu: 'Что важнее: скорость или комфорт?', type: 'options', optionsRu: ['Погасить быстрее', 'Платить меньше', 'Баланс'] },
    { id: 'details', titleRu: 'Детали', questionRu: 'Что ещё важно учесть?', type: 'mixed' }
  ],
  improveHistory: [
    { id: 'currentScore', titleRu: 'Текущий рейтинг', questionRu: 'Как вы оцениваете свою КИ?', type: 'options', optionsRu: ['Хорошая', 'Средняя', 'Плохая', 'Очень плохая', 'Не знаю'] },
    { id: 'negativeFactors', titleRu: 'Негатив', questionRu: 'Какие негативные факторы есть?', type: 'options', optionsRu: ['Просрочки', 'Много запросов', 'Судебные решения', 'Банкротство', 'Не знаю'] },
    { id: 'goal', titleRu: 'Цель', questionRu: 'Зачем улучшать КИ?', type: 'options', optionsRu: ['Получить кредит', 'Снизить ставку', 'Ипотека', 'Просто улучшить'] },
    { id: 'timeline', titleRu: 'Срок', questionRu: 'За какой срок хотите улучшить?', type: 'options', optionsRu: ['1-3 месяца', '3-6 месяцев', '6-12 месяцев', 'Год+'] },
    { id: 'details', titleRu: 'Детали', questionRu: 'Расскажите подробнее о ситуации', type: 'mixed' }
  ],
  insuranceReturn: [
    { id: 'insuranceType', titleRu: 'Тип страховки', questionRu: 'Какую страховку хотите вернуть?', type: 'options', optionsRu: ['Страхование жизни', 'От потери работы', 'Имущества', 'Другое'] },
    { id: 'when', titleRu: 'Когда оформили', questionRu: 'Когда была оформлена?', type: 'options', optionsRu: ['До 14 дней', '14 дней - 1 мес', '1-6 месяцев', '6+ месяцев'] },
    { id: 'amount', titleRu: 'Сумма', questionRu: 'Сумма страховки?', type: 'options', optionsRu: ['до 10к', '10-30к', '30-50к', '50-100к', '100к+'] },
    { id: 'details', titleRu: 'Детали', questionRu: 'Как была навязана страховка?', type: 'mixed' }
  ],
  bankruptcy: [
    { id: 'totalDebt', titleRu: 'Общий долг', questionRu: 'Общая сумма долгов?', type: 'options', optionsRu: ['до 500к', '500к-1М', '1-3М', '3М+'] },
    { id: 'property', titleRu: 'Имущество', questionRu: 'Есть ли имущество?', type: 'options', optionsRu: ['Нет', 'Авто', 'Недвижимость', 'И то и другое'] },
    { id: 'income', titleRu: 'Доход', questionRu: 'Официальный доход?', type: 'options', optionsRu: ['Нет', 'до 50к', '50-100к', '100к+'] },
    { id: 'previousAttempts', titleRu: 'Попытки', questionRu: 'Пробовали договориться с кредиторами?', type: 'options', optionsRu: ['Нет', 'Да, отказали', 'Да, частично'] },
    { id: 'details', titleRu: 'Детали', questionRu: 'Опишите вашу ситуацию', type: 'mixed' }
  ]
};

const scenarioTitles: Record<ScenarioType, { ru: string }> = {
  credit: { ru: 'Получение кредита' },
  refinance: { ru: 'Рефинансирование' },
  debtPlan: { ru: 'План выхода из долгов' },
  improveHistory: { ru: 'Улучшение кредитной истории' },
  insuranceReturn: { ru: 'Возврат страхования' },
  bankruptcy: { ru: 'Банкротство' }
};

export function ScenarioWizard({ scenario, onComplete, onBack, profile, isGuestMode = false, onLogin }: ScenarioWizardProps) {
  const steps = scenarioSteps[scenario];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentStepData.id]: answer }));
    
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
      setTextInput('');
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleAnswer(textInput.trim());
    }
  };

  const handleVoiceResult = (transcribedText: string) => {
    setTextInput(transcribedText);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const generateResult = useCallback(async () => {
    if (isGuestMode) {
      toast.info('Пожалуйста, войдите в систему, чтобы получить результат анализа');
      if (onLogin) onLogin();
      return;
    }
    setIsGenerating(true);
    
    try {
      const finalAnswers = { ...answers, [currentStepData.id]: textInput || answers[currentStepData.id] };
      
      const prompt = `You are a professional credit advisor. Based on the user's answers for the "${scenarioTitles[scenario].ru}" scenario, generate a comprehensive analysis.

User's jurisdiction: ${profile?.jurisdiction || 'Russia'}
Scenario: ${scenario}
Answers: ${JSON.stringify(finalAnswers)}

Generate a response in Russian with:
1. A concise summary (2-3 sentences)
2. Exactly 3 key risks
3. Exactly 3 actionable recommendations

Format as JSON: { "summary": "...", "risks": ["...", "...", "..."], "recommendations": ["...", "...", "..."] }`;

      const { text } = await blink.ai.generateText({
        messages: [
          { role: 'system', content: 'You are a professional financial advisor. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ]
      });

      // Parse the JSON response
      let parsed;
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch {
        parsed = {
          summary: text,
          risks: [
            'Требуется детальный анализ',
            'Возможны дополнительные расходы',
            'Сроки могут варьироваться'
          ],
          recommendations: [
            'Проконсультируйтесь со специалистом',
            'Соберите необходимые документы',
            'Оцените все варианты'
          ]
        };
      }

      const result: ScenarioResult = {
        scenario,
        answers: finalAnswers,
        summary: parsed.summary,
        risks: parsed.risks,
        recommendations: parsed.recommendations
      };

      onComplete(result);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Ошибка генерации');
    } finally {
      setIsGenerating(false);
    }
  }, [answers, currentStepData, textInput, scenario, profile, onComplete]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h2 className="font-bold text-sm">
              {scenarioTitles[scenario].ru}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              Шаг {currentStep + 1} из {steps.length}
            </p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-3 bg-secondary/30 border-b">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
          <span>{currentStepData.titleRu}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        
        {/* Step indicators */}
        <div className="flex gap-1 mt-3">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                idx < currentStep ? "bg-primary" : idx === currentStep ? "bg-primary/60" : "bg-primary/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Question */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">
              {currentStepData.questionRu}
            </h1>
          </div>

          {/* Options */}
          {(currentStepData.type === 'options' || currentStepData.type === 'mixed') && currentStepData.optionsRu && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {currentStepData.optionsRu.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "p-4 rounded-xl border text-sm font-medium text-left",
                    "transition-all hover:border-primary hover:bg-primary/5 hover:scale-[1.02]",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    answers[currentStepData.id] === option && "border-primary bg-primary/10"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Text/Voice input for mixed type */}
          {(currentStepData.type === 'text' || currentStepData.type === 'mixed' || currentStepData.type === 'voice') && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Или напишите свой вариант..."
                  rows={4}
                  className="w-full p-4 border-2 rounded-xl resize-none focus:border-primary focus:ring-0 focus:outline-none text-sm"
                />
              </div>
              
              {/* Voice Recorder */}
              <div className="flex justify-center">
                <VoiceRecorder onResult={handleVoiceResult} />
              </div>

              {/* Submit button for last step */}
              {isLastStep && (
                <Button
                  onClick={generateResult}
                  disabled={isGenerating || (!textInput.trim() && !answers[currentStepData.id])}
                  className="w-full h-12 rounded-xl font-bold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Анализирую...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Получить результат
                    </>
                  )}
                </Button>
              )}

              {/* Next button for non-last steps with text */}
              {!isLastStep && currentStepData.type !== 'options' && (
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold"
                >
                  Далее
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
