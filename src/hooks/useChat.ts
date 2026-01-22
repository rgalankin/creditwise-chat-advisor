import { useState, useCallback, useEffect, useRef } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { useCredits } from './useCredits';
import { useLanguage } from '../lib/i18n';
import { chatApi, isN8nMode, initChatMode, ChatResponse } from '../lib/chatApi';

const GUEST_SESSION_KEY = 'creditwise_guest_session';

export type ChatState = 
  | 'INTRO' 
  | 'CONSENT' 
  | 'JURISDICTION' 
  | 'DIAGNOSTIC_1' 
  | 'DIAGNOSTIC_2' 
  | 'DIAGNOSTIC_3' 
  | 'DIAGNOSTIC_4' 
  | 'DIAGNOSTIC_5' 
  | 'DIAGNOSTIC_6' 
  | 'DIAGNOSTIC_7' 
  | 'SUMMARY' 
  | 'SCENARIOS' 
  | 'SCENARIO_RUN' 
  | 'CHAT';

export function useChat(profile: any, updateProfile: (data: any) => Promise<any>, isGuestMode = false) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [chatState, setChatState] = useState<ChatState>('INTRO');
  const [diagnosticData, setDiagnosticData] = useState<any>({});
  const [apiMode, setApiMode] = useState<'local' | 'n8n' | 'checking'>('checking');
  const modeCheckedRef = useRef(false);
  const { useCredit } = useCredits();
  const { t, language } = useLanguage();

  // Проверить режим работы (n8n или локальный) при монтировании
  useEffect(() => {
    if (modeCheckedRef.current) return;
    modeCheckedRef.current = true;
    
    initChatMode().then(() => {
      setApiMode(isN8nMode ? 'n8n' : 'local');
      console.log(`[useChat] Mode initialized: ${isN8nMode ? 'n8n' : 'local'}`);
    }).catch(() => {
      setApiMode('local');
    });
  }, []);

  const getInitialMessage = useCallback((state: ChatState) => {
    if (language === 'ru') {
      switch (state) {
        case 'INTRO':
          return "Я помогу разобраться в вашей кредитной ситуации и предложу безопасный план действий. \n\nЭто займёт **5–7 минут**, документы не нужны на старте. \n\nВ демо-режиме **не вводите персональные данные**.";
        case 'CONSENT':
          return "Чтобы продолжить, необходимо согласие на обработку данных. Информация используется только для подготовки рекомендаций.";
        case 'JURISDICTION':
          return "В какой стране вы находитесь? Рекомендации зависят от местных правил.";
        default:
          return "";
      }
    } else {
      switch (state) {
        case 'INTRO':
          return "I will help you understand your credit situation and suggest a safe course of action. \n\nIt will take **5–7 minutes**, documents are not needed at the start. \n\nIn demo mode, **do not enter personal data**.";
        case 'CONSENT':
          return "To continue, consent to data processing is required. Information is used only for preparing recommendations.";
        case 'JURISDICTION':
          return "What country are you in? Recommendations depend on local rules.";
        default:
          return "";
      }
    }
  }, [language]);

  const initSession = useCallback(async () => {
    if (!profile && !isGuestMode) return;
    
    if (isGuestMode) {
      const guestSession = sessionStorage.getItem(GUEST_SESSION_KEY);
      if (guestSession) {
        const data = JSON.parse(guestSession);
        setMessages(data.messages || []);
        setChatState(data.chatState || 'INTRO');
        setDiagnosticData(data.diagnosticData || {});
        setSession({ id: 'guest_session' });
        
        if (!data.messages || data.messages.length === 0) {
          const greeting = {
            id: `msg_guest_${Date.now()}`,
            role: 'assistant',
            content: getInitialMessage('INTRO'),
            createdAt: new Date().toISOString()
          };
          setMessages([greeting]);
          sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({
            ...data,
            messages: [greeting]
          }));
        }
      }
      return;
    }

    try {
      const sessions = await (blink.db as any).chatSessions.list({ 
        where: { userId: profile?.userId },
        orderBy: { createdAt: 'desc' },
        limit: 1
      });
      
      let activeSession = sessions[0];
      
      if (!activeSession) {
        activeSession = await (blink.db as any).chatSessions.create({
          userId: profile?.userId,
          title: language === 'ru' ? 'Первичная диагностика' : 'Initial Diagnostic'
        });
        
        const greeting = {
          sessionId: activeSession.id,
          userId: profile?.userId,
          role: 'assistant',
          content: getInitialMessage('INTRO'),
          metadata: JSON.stringify({ state: 'INTRO' })
        };
        const createdMsg = await (blink.db as any).chatMessages.create(greeting);
        setMessages([createdMsg]);
        setChatState('INTRO');
      } else {
        const msgs = await (blink.db as any).chatMessages.list({
          where: { sessionId: activeSession.id },
          orderBy: { createdAt: 'asc' }
        });
        setMessages(msgs);
        
        // Restore state from last message or session
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg?.metadata) {
          const meta = JSON.parse(lastMsg.metadata);
          if (meta.state) setChatState(meta.state);
          if (meta.diagnosticData) setDiagnosticData(meta.diagnosticData);
        }
      }
      setSession(activeSession);
    } catch (error) {
      console.error('Session init error:', error);
    }
  }, [profile, language, getInitialMessage, isGuestMode]);

  const getDiagnosticQuestion = (step: number) => {
    if (language === 'ru') {
      switch (step) {
        case 1: return { q: "Что вам сейчас важнее всего?", options: ["Получить кредит", "Рефинансировать", "Выйти из долгов", "Улучшить кредитную историю", "Вернуть страховку", "Проверить банкротство"] };
        case 2: return { q: "У вас сейчас есть действующие кредиты или долги?", options: ["Да, есть", "Нет", "Не уверен(а)"] };
        case 3: return { q: "Есть просрочки по платежам?", options: ["Нет", "Да, до 30 дней", "Да, 30–90 дней", "Да, больше 90 дней", "Не знаю"] };
        case 4: return { q: "Какой у вас примерно ежемесячный доход?", options: ["0–50k", "50–100k", "100–200k", "200k+", "Нестабильный"] };
        case 5: return { q: "Сколько в месяц уходит на платежи по кредитам?", options: ["0", "до 10k", "10–30k", "30–70k", "70k+", "Не знаю"] };
        case 6: return { q: "Как вы оцениваете свою кредитную историю?", options: ["Хорошая", "Средняя", "Плохая", "Не знаю"] };
        case 7: return { q: "Насколько срочно нужно решение?", options: ["Сегодня/завтра", "В течение недели", "В течение месяца", "Пока просто хочу понять варианты"] };
        default: return { q: "", options: [] };
      }
    } else {
      switch (step) {
        case 1: return { q: "What is most important to you right now?", options: ["Get a loan", "Refinance", "Get out of debt", "Improve credit history", "Return insurance", "Check bankruptcy"] };
        case 2: return { q: "Do you currently have active loans or debts?", options: ["Yes, I have", "No", "Not sure"] };
        case 3: return { q: "Are there any payment delays?", options: ["No", "Yes, up to 30 days", "Yes, 30–90 days", "Yes, more than 90 days", "Don't know"] };
        case 4: return { q: "What is your approximate monthly income?", options: ["0–50k", "50–100k", "100–200k", "200k+", "Unstable"] };
        case 5: return { q: "How much per month goes to loan payments?", options: ["0", "up to 10k", "10–30k", "30–70k", "70k+", "Don't know"] };
        case 6: return { q: "How do you rate your credit history?", options: ["Good", "Average", "Bad", "Don't know"] };
        case 7: return { q: "How urgent is the solution needed?", options: ["Today/tomorrow", "Within a week", "Within a month", "Just want to understand options"] };
        default: return { q: "", options: [] };
      }
    }
  };

  const moveToState = async (nextState: ChatState, assistantResponse: string, updatedDiagData?: any) => {
    if ((!session || !profile) && !isGuestMode) return;
    
    setIsLoading(true);
    try {
      const meta = { state: nextState, diagnosticData: updatedDiagData || diagnosticData };
      const content = assistantResponse;
      
      if (isGuestMode) {
        const botMsg = {
          id: `msg_guest_${Date.now()}`,
          role: 'assistant',
          content,
          metadata: JSON.stringify(meta),
          createdAt: new Date().toISOString()
        };
        const updatedMessages = [...messages, botMsg];
        setMessages(updatedMessages);
        setChatState(nextState);
        if (updatedDiagData) setDiagnosticData(updatedDiagData);
        
        const guestData = JSON.parse(sessionStorage.getItem(GUEST_SESSION_KEY) || '{}');
        sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({
          ...guestData,
          messages: updatedMessages,
          chatState: nextState,
          diagnosticData: updatedDiagData || diagnosticData
        }));
        return;
      }

      const botMsg = await (blink.db as any).chatMessages.create({
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: assistantResponse,
        metadata: JSON.stringify(meta)
      });
      setMessages(prev => [...prev, botMsg]);
      setChatState(nextState);
      if (updatedDiagData) setDiagnosticData(updatedDiagData);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработать ответ от n8n API
   * Сохраняет сообщение в БД и обновляет состояние
   */
  const handleN8nResponse = async (response: ChatResponse) => {
    if (!session || !profile) return;
    
    // Обновить состояние FSM
    if (response.state) {
      setChatState(response.state as ChatState);
    }
    
    // Обновить данные диагностики если есть
    if (response.meta?.diagnosticData) {
      setDiagnosticData(response.meta.diagnosticData);
    }
    
    // Обновить профиль если есть данные
    if (response.meta?.profileData) {
      await updateProfile(response.meta.profileData);
    }
    
    // Сохранить сообщение в БД
    const meta = {
      state: response.state,
      diagnosticData: response.meta?.diagnosticData || diagnosticData,
      ui: response.ui,
      fromN8n: true
    };
    
    const botMsg = await (blink.db as any).chatMessages.create({
      sessionId: session.id,
      userId: profile.userId,
      role: 'assistant',
      content: response.text,
      metadata: JSON.stringify(meta)
    });
    
    setMessages(prev => [...prev, botMsg]);
  };

  /**
   * Отправить сообщение через n8n API
   */
  const sendMessageViaN8n = async (content: string) => {
    if (!session || !profile) return;
    
    setIsLoading(true);
    try {
      const response = await chatApi.sendMessage({
        sessionId: session.id,
        content,
        language: language as 'ru' | 'en'
      });
      
      // Если fallback mode - использовать локальную логику
      if (response.meta?.event?.type === 'fallback_mode') {
        console.log('[useChat] Fallback to local mode');
        setApiMode('local');
        await sendMessageLocal(content);
        return;
      }
      
      await handleN8nResponse(response);
    } catch (error) {
      console.error('[useChat] n8n error:', error);
      toast.error(language === 'ru' ? 'Ошибка соединения. Попробуйте ещё раз.' : 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Отправить действие через n8n API (для кнопок)
   */
  const sendAction = async (action: string, payload?: Record<string, any>) => {
    if (!session || !profile) return;
    
    // В локальном режиме - обработать локально
    if (apiMode === 'local') {
      // Конвертировать action в sendMessage
      const actionContent = payload?.answer || payload?.jurisdiction || action;
      await sendMessage(actionContent);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await chatApi.sendAction({
        sessionId: session.id,
        action: action as any,
        language: language as 'ru' | 'en',
        payload
      });
      
      if (response.meta?.event?.type === 'fallback_mode') {
        setApiMode('local');
        const actionContent = payload?.answer || payload?.jurisdiction || action;
        await sendMessageLocal(actionContent);
        return;
      }
      
      await handleN8nResponse(response);
    } catch (error) {
      console.error('[useChat] Action error:', error);
      toast.error(language === 'ru' ? 'Ошибка. Попробуйте ещё раз.' : 'Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Локальная обработка сообщения (fallback режим)
   * Примечание: сообщение пользователя уже сохранено в sendMessage()
   */
  const sendMessageLocal = async (content: string) => {
    if (!content.trim() || !session || !profile) return;

    // Prohibited keywords
    const prohibitedKeywords = ['гарантируй', 'подделать', 'обойти закон', 'guarantee', 'forge', 'bypass law'];
    if (prohibitedKeywords.some(k => content.toLowerCase().includes(k))) {
      const botMsg = await (blink.db as any).chatMessages.create({
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: language === 'ru' 
          ? "Я не могу помогать с такими действиями. Могу предложить легальные и безопасные варианты." 
          : "I cannot assist with such actions. I can suggest legal and safe options.",
        metadata: JSON.stringify({ state: chatState, diagnosticData })
      });
      setMessages(prev => [...prev, botMsg]);
      return;
    }

    // FSM Logic
    if (chatState === 'INTRO') {
      await moveToState('CONSENT', getInitialMessage('CONSENT'));
    } else if (chatState === 'CONSENT') {
      if (content.toLowerCase().includes('согласен') || content.toLowerCase().includes('да') || content.toLowerCase().includes('agree') || content.toLowerCase().includes('yes')) {
        await updateProfile({ hasConsent: 1 });
        await moveToState('JURISDICTION', getInitialMessage('JURISDICTION'));
      } else {
        await moveToState('INTRO', "Для продолжения необходимо ваше согласие.");
      }
    } else if (chatState === 'JURISDICTION') {
      await updateProfile({ jurisdiction: content });
      const qObj = getDiagnosticQuestion(1);
      await moveToState('DIAGNOSTIC_1', qObj.q);
    } else if (chatState.startsWith('DIAGNOSTIC_')) {
      const currentStep = parseInt(chatState.split('_')[1]);
      const nextStep = currentStep + 1;
      const updatedData = { ...diagnosticData, [`step_${currentStep}`]: content };
      
      if (nextStep <= 7) {
        const qObj = getDiagnosticQuestion(nextStep);
        await moveToState(`DIAGNOSTIC_${nextStep}` as ChatState, qObj.q, updatedData);
      } else {
        // Generate Summary via AI
        setIsLoading(true);
        try {
          const summaryPrompt = `Based on these diagnostic answers, generate a concise financial situation summary, risks (3 points), and first steps (3 points).
          
          Answers: ${JSON.stringify(updatedData)}
          Jurisdiction: ${profile?.jurisdiction || 'Unknown'}
          
          Format it professionally as the Credo-Service Advisor.`;
          
          const { text } = await blink.ai.generateText({
            messages: [
              { role: 'system', content: 'You are a credit advisor. Be professional and supportive.' },
              { role: 'user', content: summaryPrompt }
            ]
          });
          
          await updateProfile({ financialData: JSON.stringify(updatedData) });
          await moveToState('SUMMARY', text, updatedData);
        } catch (error) {
          console.error('Summary error:', error);
          await moveToState('SUMMARY', language === 'ru' ? 'Диагностика завершена. Вот краткий итог по вашей ситуации...' : 'Diagnostic complete. Here is a summary of your situation...', updatedData);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Free chat or AI response
      const hasCredit = await useCredit();
      if (!hasCredit) return;

      setIsLoading(true);
      try {
        const systemPrompt = `You are the Credo-Service Advisor.
        User Context: ${profile?.jurisdiction || 'Unknown'}, Financial Data: ${JSON.stringify(diagnosticData)}.
        Respond as a professional, unbiased advisor.`;

        let fullResponse = '';
        const botMsgId = `msg_a_${Date.now()}`;
        
        setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '', isStreaming: true }]);

        await blink.ai.streamText({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ]
        }, (chunk) => {
          fullResponse += chunk;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: fullResponse } : m));
        });

        const finalBotMsg = await (blink.db as any).chatMessages.create({
          sessionId: session.id,
          userId: profile?.userId,
          role: 'assistant',
          content: fullResponse,
          metadata: JSON.stringify({ state: chatState, diagnosticData })
        });

        setMessages(prev => prev.map(m => m.id === botMsgId ? finalBotMsg : m));
      } catch (error) {
        console.error('Chat error:', error);
        toast.error('Connection issue.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Главная функция отправки сообщения
   * Выбирает между n8n API и локальной логикой
   */
  const sendMessage = async (content: string) => {
    if ((!content.trim() || !session || !profile) && !isGuestMode) return;
    
    // Demo Guardrails: PII Check (перед сохранением)
    const piiRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+?\d{10,15})|(\d{4}\s\d{6})|(\d{10})/g;
    if (piiRegex.test(content)) {
      toast.warning(language === 'ru' ? "В демо-версии не вводите персональные данные." : "In demo mode, do not enter personal data.");
      return;
    }
    
    if (isGuestMode) {
      const userMsg = {
        id: `msg_guest_u_${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString()
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      
      const guestData = JSON.parse(sessionStorage.getItem(GUEST_SESSION_KEY) || '{}');
      sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify({
        ...guestData,
        messages: updatedMessages
      }));

      // Выбрать режим обработки
      if (apiMode === 'n8n') {
        // ... handled in sendMessageViaN8n
      } else {
        await sendMessageLocal(content);
      }
      return;
    }

    // Сохранить сообщение пользователя
    const userMsg = await (blink.db as any).chatMessages.create({
      sessionId: session.id,
      userId: profile.userId,
      role: 'user',
      content
    });
    setMessages(prev => [...prev, userMsg]);
    
    // Выбрать режим обработки
    if (apiMode === 'n8n') {
      await sendMessageViaN8n(content);
    } else {
      await sendMessageLocal(content);
    }
  };

  const uploadDocument = async (file: File) => {
    // ... same as before but update state/metadata if needed
    if (!session || !profile) return;
    toast.info(language === 'ru' ? `Анализ ${file.name}...` : `Analyzing ${file.name}...`);
    try {
      const { publicUrl } = await blink.storage.upload(file, `docs/${profile?.userId || 'guest'}/${Date.now()}_${file.name}`);
      const analysisPrompt = `Extract key financial data from this document. Document: ${file.name}`;
      const { text } = await blink.ai.generateText({
        messages: [
          { role: 'system', content: 'You are a financial document parser.' },
          { role: 'user', content: [{ type: 'text', text: analysisPrompt }, { type: 'image', image: publicUrl }]}
        ]
      });
      await (blink.db as any).userDocuments.create({ userId: profile?.userId, name: file.name, url: publicUrl, extractedData: text });
      const botMsg = await (blink.db as any).chatMessages.create({
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: language === 'ru' ? `Документ **${file.name}** проанализирован.` : `Document **${file.name}** analyzed.`,
        metadata: JSON.stringify({ state: chatState, diagnosticData })
      });
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      toast.error('Failed to process document.');
    }
  };

  return { 
    messages, 
    isLoading, 
    sendMessage,
    sendAction, // Новый метод для кнопок (n8n actions)
    uploadDocument, 
    initSession, 
    chatState, 
    diagnosticData, 
    getDiagnosticQuestion,
    apiMode // Режим работы (local/n8n/checking)
  };
}
