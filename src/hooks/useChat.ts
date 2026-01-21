import { useState, useCallback } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';

export function useChat(profile: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  const initSession = useCallback(async () => {
    if (!profile) return;
    try {
      const sessions = await blink.db.chatSessions.list({ 
        where: { userId: profile.userId },
        orderBy: { createdAt: 'desc' },
        limit: 1
      });
      
      let activeSession = sessions[0];
      
      if (!activeSession) {
        activeSession = await blink.db.chatSessions.create({
          id: `session_${Date.now()}`,
          userId: profile.userId,
          title: 'Initial Consultation'
        });
        
        const greeting = {
          id: `msg_greet_${Date.now()}`,
          sessionId: activeSession.id,
          userId: profile.userId,
          role: 'assistant',
          content: "Hello! I'm your CreditWise Advisor. I'm here to help you navigate your financial situation with complete autonomy. \n\nBefore we begin, what country or region are you located in? My recommendations depend heavily on local financial regulations."
        };
        await blink.db.chatMessages.create(greeting);
        setMessages([greeting]);
      } else {
        const msgs = await blink.db.chatMessages.list({
          where: { sessionId: activeSession.id },
          orderBy: { createdAt: 'asc' }
        });
        setMessages(msgs);
      }
      setSession(activeSession);
    } catch (error) {
      console.error('Session init error:', error);
    }
  }, [profile]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session || !profile) return;

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sessionId: session.id,
      userId: profile.userId,
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await blink.db.chatMessages.create(userMsg);

      const systemPrompt = `You are the CreditWise Advisor, an intelligent, unbiased, and systematic credit/financial advisor.
Your goal is to help users understand their financial situation (loans, debts, credit) and find potential solutions.

CONTEXT:
User Jurisdiction: ${profile.jurisdiction || 'Unknown'}
User Consent: ${Number(profile.hasConsent) > 0 ? 'Granted' : 'Not Granted'}
Financial Profile: ${profile.financialData || 'No data yet'}

PRINCIPLES:
1. UNBIASED: You don't sell bank services. You give neutral advice.
2. JURISDICTION AWARE: If jurisdiction is unknown, your first priority is to clarify it.
3. CLEAR: Explain complex financial terms simply.
4. SOLUTION ORIENTED: Find ways out of debt (restructuring, bankruptcy, refinancing).
5. DATA PRIVACY: Acknowledge that data is processed only with consent.

If the user mentions their country (e.g., "I'm in the USA", "I am from Germany"), acknowledge it and say "Jurisdiction Updated". This helps the system track state.`;

      const { text } = await blink.ai.generateText({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content }
        ]
      });

      const botMsg = {
        id: `msg_a_${Date.now()}`,
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: text
      };

      await blink.db.chatMessages.create(botMsg);
      setMessages(prev => [...prev, botMsg]);

      // Detect jurisdiction change in AI response or user message
      if (text.toLowerCase().includes('jurisdiction updated') || content.toLowerCase().match(/(i'm in|i am from|i am in|location is) ([a-zA-Z\s]+)/)) {
         // Potential for automated update here, but we'll stick to explicit profile updates for safety in MVP
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    if (!session || !profile) return;

    toast.info(`Analyzing ${file.name}...`);
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

      await blink.db.userDocuments.create({
        id: `doc_${Date.now()}`,
        userId: profile.userId,
        name: file.name,
        url: publicUrl,
        extractedData: text
      });

      const botMsg = {
        id: `msg_sys_${Date.now()}`,
        sessionId: session.id,
        userId: profile.userId,
        role: 'assistant',
        content: `I've successfully analyzed your document: **${file.name}**. \n\nBased on the data extracted, I can now give more specific advice. Would you like to review the findings or continue with your questions?`
      };
      await blink.db.chatMessages.create(botMsg);
      setMessages(prev => [...prev, botMsg]);
      toast.success('Document analyzed.');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process document.');
    }
  };

  return { messages, isLoading, sendMessage, uploadDocument, initSession };
}
