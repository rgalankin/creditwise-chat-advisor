import { useState, useCallback } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { useCredits } from './useCredits';
import { useLanguage } from '../lib/i18n';

export function useChat(profile: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { useCredit } = useCredits();
  const { t, language } = useLanguage();

  const initSession = useCallback(async () => {
    if (!profile) return;
    try {
      const sessions = await (blink.db as any).chatSessions.list({ 
        where: { userId: profile.userId },
        orderBy: { createdAt: 'desc' },
        limit: 1
      });
      
      let activeSession = sessions[0];
      
      if (!activeSession) {
        activeSession = await (blink.db as any).chatSessions.create({
          userId: profile.userId,
          title: 'Initial Consultation'
        });
        
        const greeting = {
          sessionId: activeSession.id,
          userId: profile.userId,
          role: 'assistant',
          content: language === 'ru' 
            ? "Здравствуйте! Я ваш советник Кредо-Сервис. Я здесь, чтобы помочь вам разобраться в вашей финансовой ситуации. \n\nПрежде чем мы начнем, в какой стране или регионе вы находитесь? Мои рекомендации сильно зависят от местного финансового законодательства."
            : "Hello! I'm your Credo-Service Advisor. I'm here to help you navigate your financial situation. \n\nBefore we begin, what country or region are you located in? My recommendations depend heavily on local financial regulations."
        };
        const createdMsg = await (blink.db as any).chatMessages.create(greeting);
        setMessages([createdMsg]);
      } else {
        const msgs = await (blink.db as any).chatMessages.list({
          where: { sessionId: activeSession.id },
          orderBy: { createdAt: 'asc' }
        });
        setMessages(msgs);
      }
      setSession(activeSession);
    } catch (error) {
      console.error('Session init error:', error);
    }
  }, [profile, language]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || !profile) return;

    // Credit check
    const hasCredit = await useCredit();
    if (!hasCredit) return;

    const userMsg = {
      sessionId: session.id,
      userId: profile.userId,
      role: 'user',
      content
    };

    setIsLoading(true);
    try {
      const createdUserMsg = await (blink.db as any).chatMessages.create(userMsg);
      setMessages(prev => [...prev, createdUserMsg]);

      const systemPrompt = `You are the Credo-Service Advisor, a world-class, unbiased, and systematic financial intelligence agent.
Your goal is to provide "Wow-effect" analytics and solutions for credit health, debt restructuring, and bankruptcy.

USER CONTEXT:
Jurisdiction: ${profile.jurisdiction || 'Unknown'}
Language: ${language}
Consent: ${Number(profile.hasConsent) > 0 ? 'Granted' : 'Not Granted'}
Profile: ${profile.financialData || 'No data yet'}

PRINCIPLES:
1. BE AN ADVOCATE: You work for the user, not the banks. Find the most favorable paths.
2. JURISDICTION EXPERT: Always provide advice strictly within the context of the user's laws.
3. DATA-DRIVEN: Use the user's documents and data for pinpoint accuracy.
4. HONEST & SYSTEMIC: If a situation is difficult, be honest but provide a step-by-step recovery plan.
5. NO BROKERS: You are an independent AI, not a broker trying to sell a service.

Respond in ${language === 'ru' ? 'Russian' : 'English'}. 
If jurisdiction is unknown, emphasize that your precision depends on knowing the country.`;

      let fullResponse = '';
      const botMsgId = `msg_a_${Date.now()}`;
      
      // Temporary message for streaming
      const tempBotMsg = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        isStreaming: true
      };
      setMessages(prev => [...prev, tempBotMsg]);

      await blink.ai.streamText({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content }
        ]
      }, (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, content: fullResponse } : m
        ));
      });

      const finalBotMsg = await (blink.db as any).chatMessages.create({
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: fullResponse
      });

      setMessages(prev => prev.map(m => m.id === botMsgId ? finalBotMsg : m));

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!session || !profile) return;

    toast.info(language === 'ru' ? `Анализ ${file.name}...` : `Analyzing ${file.name}...`);
    try {
      const { publicUrl } = await blink.storage.upload(
        file,
        `docs/${profile.userId}/${Date.now()}_${file.name}`
      );

      const analysisPrompt = `Extract key financial data from this document. Return a JSON object with: 
      - document_type (e.g., invoice, bank_statement, id)
      - extracted_entities (names, amounts, dates)
      - summary (brief overview of the financial state shown)
      
      Document: ${file.name}`;

      const { text } = await blink.ai.generateText({
        messages: [
          { role: 'system', content: 'You are a financial document parser.' },
          { role: 'user', content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image', image: publicUrl }
          ]}
        ]
      });

      await (blink.db as any).userDocuments.create({
        userId: profile.userId,
        name: file.name,
        url: publicUrl,
        extractedData: text
      });

      const botMsgContent = language === 'ru'
        ? `Я проанализировал ваш документ: **${file.name}**. \n\nНа основе извлеченных данных я теперь могу дать более конкретные советы. Хотите просмотреть результаты или продолжить задавать вопросы?`
        : `I've successfully analyzed your document: **${file.name}**. \n\nBased on the data extracted, I can now give more specific advice. Would you like to review the findings or continue with your questions?`;

      const botMsg = await (blink.db as any).chatMessages.create({
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: botMsgContent
      });

      setMessages(prev => [...prev, botMsg]);
      toast.success(language === 'ru' ? 'Документ проанализирован.' : 'Document analyzed.');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'ru' ? 'Ошибка обработки документа.' : 'Failed to process document.');
    }
  };

  return { messages, isLoading, sendMessage, uploadDocument, initSession };
}
