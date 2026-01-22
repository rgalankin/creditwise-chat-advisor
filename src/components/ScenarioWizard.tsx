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
}

interface WizardStep {
  id: string;
  titleRu: string;
  titleEn: string;
  questionRu: string;
  questionEn: string;
  type: 'options' | 'text' | 'voice' | 'mixed';
  optionsRu?: string[];
  optionsEn?: string[];
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
    { id: 'goal', titleRu: 'Цель кредита', titleEn: 'Loan Purpose', questionRu: 'Для чего нужен кредит?', questionEn: 'What do you need the loan for?', type: 'options', optionsRu: ['Покупка авто', 'Ремонт', 'Медицина', 'Образование', 'Бизнес', 'Другое'], optionsEn: ['Car purchase', 'Renovation', 'Medical', 'Education', 'Business', 'Other'] },
    { id: 'amount', titleRu: 'Сумма', titleEn: 'Amount', questionRu: 'Какая сумма вам нужна?', questionEn: 'What amount do you need?', type: 'options', optionsRu: ['до 100к', '100-300к', '300-500к', '500к-1М', '1М+'], optionsEn: ['up to 100k', '100-300k', '300-500k', '500k-1M', '1M+'] },
    { id: 'income', titleRu: 'Доход', titleEn: 'Income', questionRu: 'Ваш ежемесячный доход?', questionEn: 'Your monthly income?', type: 'options', optionsRu: ['до 50к', '50-100к', '100-200к', '200к+'], optionsEn: ['up to 50k', '50-100k', '100-200k', '200k+'] },
    { id: 'employment', titleRu: 'Занятость', titleEn: 'Employment', questionRu: 'Ваш тип занятости?', questionEn: 'Your employment type?', type: 'options', optionsRu: ['Официальная работа', 'ИП/Самозанятый', 'Неофициально', 'Безработный'], optionsEn: ['Official employment', 'Self-employed', 'Unofficial', 'Unemployed'] },
    { id: 'details', titleRu: 'Детали', titleEn: 'Details', questionRu: 'Что ещё важно знать о вашей ситуации?', questionEn: 'What else is important about your situation?', type: 'mixed' }
  ],
  refinance: [
    { id: 'currentLoans', titleRu: 'Текущие кредиты', titleEn: 'Current Loans', questionRu: 'Сколько у вас действующих кредитов?', questionEn: 'How many active loans do you have?', type: 'options', optionsRu: ['1', '2-3', '4-5', '6+'], optionsEn: ['1', '2-3', '4-5', '6+'] },
    { id: 'totalDebt', titleRu: 'Общий долг', titleEn: 'Total Debt', questionRu: 'Общая сумма задолженности?', questionEn: 'Total debt amount?', type: 'options', optionsRu: ['до 100к', '100-300к', '300-500к', '500к-1М', '1М+'], optionsEn: ['up to 100k', '100-300k', '300-500k', '500k-1M', '1M+'] },
    { id: 'monthlyPayment', titleRu: 'Платёж', titleEn: 'Payment', questionRu: 'Текущий ежемесячный платёж?', questionEn: 'Current monthly payment?', type: 'options', optionsRu: ['до 10к', '10-30к', '30-50к', '50-100к', '100к+'], optionsEn: ['up to 10k', '10-30k', '30-50k', '50-100k', '100k+'] },
    { id: 'details', titleRu: 'Детали', titleEn: 'Details', questionRu: 'Расскажите подробнее о целях рефинансирования', questionEn: 'Tell us more about your refinancing goals', type: 'mixed' }
  ],
  debtPlan: [
    { id: 'debtType', titleRu: 'Тип долгов', titleEn: 'Debt Type', questionRu: 'Какие у вас долги?', questionEn: 'What debts do you have?', type: 'options', optionsRu: ['Кредиты', 'Микрозаймы', 'Кредитные карты', 'Долги физлицам', 'Смешанные'], optionsEn: ['Loans', 'Microloans', 'Credit cards', 'Personal debts', 'Mixed'] },
    { id: 'overdue', titleRu: 'Просрочки', titleEn: 'Overdue', questionRu: 'Есть просроченные платежи?', questionEn: 'Are there overdue payments?', type: 'options', optionsRu: ['Нет', 'До 30 дней', '30-90 дней', '90+ дней'], optionsEn: ['No', 'Up to 30 days', '30-90 days', '90+ days'] },
    { id: 'collectors', titleRu: 'Коллекторы', titleEn: 'Collectors', questionRu: 'Звонят коллекторы?', questionEn: 'Are collectors calling?', type: 'options', optionsRu: ['Нет', 'Иногда', 'Часто', 'Постоянно'], optionsEn: ['No', 'Sometimes', 'Often', 'Constantly'] },
    { id: 'income', titleRu: 'Доход', titleEn: 'Income', questionRu: 'Сколько можете выделять на погашение?', questionEn: 'How much can you allocate for repayment?', type: 'options', optionsRu: ['до 10к', '10-20к', '20-40к', '40к+'], optionsEn: ['up to 10k', '10-20k', '20-40k', '40k+'] },
    { id: 'priority', titleRu: 'Приоритет', titleEn: 'Priority', questionRu: 'Что важнее: скорость или комфорт?', questionEn: 'What matters more: speed or comfort?', type: 'options', optionsRu: ['Погасить быстрее', 'Платить меньше', 'Баланс'], optionsEn: ['Pay off faster', 'Pay less', 'Balance'] },
    { id: 'details', titleRu: 'Детали', titleEn: 'Details', questionRu: 'Что ещё важно учесть?', questionEn: 'What else is important?', type: 'mixed' }
  ],
  improveHistory: [
    { id: 'currentScore', titleRu: 'Текущий рейтинг', titleEn: 'Current Score', questionRu: 'Как вы оцениваете свою КИ?', questionEn: 'How do you rate your credit history?', type: 'options', optionsRu: ['Хорошая', 'Средняя', 'Плохая', 'Очень плохая', 'Не знаю'], optionsEn: ['Good', 'Average', 'Bad', 'Very bad', "Don't know"] },
    { id: 'negativeFactors', titleRu: 'Негатив', titleEn: 'Negatives', questionRu: 'Какие негативные факторы есть?', questionEn: 'What negative factors are there?', type: 'options', optionsRu: ['Просрочки', 'Много запросов', 'Судебные решения', 'Банкротство', 'Не знаю'], optionsEn: ['Delinquencies', 'Many inquiries', 'Court decisions', 'Bankruptcy', "Don't know"] },
    { id: 'goal', titleRu: 'Цель', titleEn: 'Goal', questionRu: 'Зачем улучшать КИ?', questionEn: 'Why improve credit history?', type: 'options', optionsRu: ['Получить кредит', 'Снизить ставку', 'Ипотека', 'Просто улучшить'], optionsEn: ['Get a loan', 'Lower rate', 'Mortgage', 'Just improve'] },
    { id: 'timeline', titleRu: 'Срок', titleEn: 'Timeline', questionRu: 'За какой срок хотите улучшить?', questionEn: 'In what timeframe?', type: 'options', optionsRu: ['1-3 месяца', '3-6 месяцев', '6-12 месяцев', 'Год+'], optionsEn: ['1-3 months', '3-6 months', '6-12 months', 'Year+'] },
    { id: 'details', titleRu: 'Детали', titleEn: 'Details', questionRu: 'Расскажите подробнее о ситуации', questionEn: 'Tell us more about your situation', type: 'mixed' }
  ],
  insuranceReturn: [
    { id: 'insuranceType', titleRu: 'Тип страховки', titleEn: 'Insurance Type', questionRu: 'Какую страховку хотите вернуть?', questionEn: 'What insurance do you want to return?', type: 'options', optionsRu: ['Страхование жизни', 'От потери работы', 'Имущества', 'Другое'], optionsEn: ['Life insurance', 'Job loss', 'Property', 'Other'] },
    { id: 'when', titleRu: 'Когда оформили', titleEn: 'When', questionRu: 'Когда была оформлена?', questionEn: 'When was it issued?', type: 'options', optionsRu: ['До 14 дней', '14 дней - 1 мес', '1-6 месяцев', '6+ месяцев'], optionsEn: ['Up to 14 days', '14 days - 1 mo', '1-6 months', '6+ months'] },
    { id: 'amount', titleRu: 'Сумма', titleEn: 'Amount', questionRu: 'Сумма страховки?', questionEn: 'Insurance amount?', type: 'options', optionsRu: ['до 10к', '10-30к', '30-50к', '50-100к', '100к+'], optionsEn: ['up to 10k', '10-30k', '30-50k', '50-100k', '100k+'] },
    { id: 'details', titleRu: 'Детали', titleEn: 'Details', questionRu: 'Как была навязана страховка?', questionEn: 'How was the insurance imposed?', type: 'mixed' }
  ],
  bankruptcy: [
    { id: 'totalDebt', titleRu: 'Общий долг', titleEn: 'Total Debt', questionRu: 'Общая сумма долгов?', questionEn: 'Total debt amount?', type: 'options', optionsRu: ['до 500к', '500к-1М', '1-3М', '3М+'], optionsEn: ['up to 500k', '500k-1M', '1-3M', '3M+'] },
    { id: 'property', titleRu: 'Имущество', titleEn: 'Property', questionRu: 'Есть ли имущество?', questionEn: 'Do you have property?', type: 'options', optionsRu: ['Нет', 'Авто', 'Недвижимость', 'И то и другое'], optionsEn: ['No', 'Car', 'Real estate', 'Both'] },
    { id: 'income', titleRu: 'Доход', titleEn: 'Income', questionRu: 'Официальный доход?', questionEn: 'Official income?', type: 'options', optionsRu: ['Нет', 'до 50к', '50-100к', '100к+'], optionsEn: ['No', 'up to 50k', '50-100k', '100k+'] },
    { id: 'previousAttempts', titleRu: 'Попытки', titleEn: 'Attempts', questionRu: 'Пробовали договориться с кредиторами?', questionEn: 'Tried to negotiate with creditors?', type: 'options', optionsRu: ['Нет', 'Да, отказали', 'Да, частично'], optionsEn: ['No', 'Yes, refused', 'Yes, partially'] },
    { id: 'details', titleRu: 'Детали', titleEn: 'Details', questionRu: 'Опишите вашу ситуацию', questionEn: 'Describe your situation', type: 'mixed' }
  ]
};

const scenarioTitles: Record<ScenarioType, { ru: string; en: string }> = {
  credit: { ru: 'Получение кредита', en: 'Get a Loan' },
  refinance: { ru: 'Рефинансирование', en: 'Refinancing' },
  debtPlan: { ru: 'План выхода из долгов', en: 'Debt Recovery Plan' },
  improveHistory: { ru: 'Улучшение кредитной истории', en: 'Improve Credit History' },
  insuranceReturn: { ru: 'Возврат страхования', en: 'Insurance Return' },
  bankruptcy: { ru: 'Банкротство', en: 'Bankruptcy' }
};

export function ScenarioWizard({ scenario, onComplete, onBack, profile }: ScenarioWizardProps) {
  const { language } = useLanguage();
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
    setIsGenerating(true);
    
    try {
      const finalAnswers = { ...answers, [currentStepData.id]: textInput || answers[currentStepData.id] };
      
      const prompt = `You are a professional credit advisor. Based on the user's answers for the "${scenarioTitles[scenario][language === 'ru' ? 'ru' : 'en']}" scenario, generate a comprehensive analysis.

User's jurisdiction: ${profile?.jurisdiction || 'Russia'}
Scenario: ${scenario}
Answers: ${JSON.stringify(finalAnswers)}

Generate a response in ${language === 'ru' ? 'Russian' : 'English'} with:
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
            language === 'ru' ? 'Требуется детальный анализ' : 'Detailed analysis required',
            language === 'ru' ? 'Возможны дополнительные расходы' : 'Additional costs possible',
            language === 'ru' ? 'Сроки могут варьироваться' : 'Timelines may vary'
          ],
          recommendations: [
            language === 'ru' ? 'Проконсультируйтесь со специалистом' : 'Consult with a specialist',
            language === 'ru' ? 'Соберите необходимые документы' : 'Gather necessary documents',
            language === 'ru' ? 'Оцените все варианты' : 'Evaluate all options'
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
      toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  }, [answers, currentStepData, textInput, scenario, profile, language, onComplete]);

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
              {scenarioTitles[scenario][language === 'ru' ? 'ru' : 'en']}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              {language === 'ru' ? `Шаг ${currentStep + 1} из ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
            </p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-3 bg-secondary/30 border-b">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
          <span>{language === 'ru' ? currentStepData.titleRu : currentStepData.titleEn}</span>
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
              {language === 'ru' ? currentStepData.questionRu : currentStepData.questionEn}
            </h1>
          </div>

          {/* Options */}
          {(currentStepData.type === 'options' || currentStepData.type === 'mixed') && currentStepData.optionsRu && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(language === 'ru' ? currentStepData.optionsRu : currentStepData.optionsEn)?.map((option) => (
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
                  placeholder={language === 'ru' ? 'Или напишите свой вариант...' : 'Or write your answer...'}
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
                      {language === 'ru' ? 'Анализирую...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {language === 'ru' ? 'Получить результат' : 'Get Result'}
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
                  {language === 'ru' ? 'Далее' : 'Next'}
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
