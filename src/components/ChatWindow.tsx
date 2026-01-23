import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Send, User as UserIcon, Bot, Paperclip, Loader2, Globe, ShieldCheck, Mic, Square, CheckCircle2, AlertCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatWindowProps {
  profile: any;
  updateProfile: (data: any) => Promise<any>;
  isGuestMode?: boolean;
  onLogin?: () => void;
}

export function ChatWindow({ profile, updateProfile, isGuestMode = false, onLogin }: ChatWindowProps) {
  const { messages, isLoading, sendMessage, uploadDocument, initSession, chatState, getDiagnosticQuestion } = useChat(profile, updateProfile, isGuestMode);
  const [localInput, setLocalInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content?: string) => {
    const textToSend = content || localInput;
    if (!textToSend.trim()) return;
    
    // Requirements: certain actions require login in guest mode
    // NOTE: Consent actions are allowed in demo mode to proceed to diagnostic questions
    if (isGuestMode) {
      const lowerText = textToSend.toLowerCase();
      // Removed consent-related actions from login requirement - allow demo flow to proceed
      const loginRequiredActions = [];

      if (loginRequiredActions.some(action => lowerText.includes(action))) {
        toast.info('Для продолжения необходимо войти в систему');
        if (onLogin) onLogin();
        return;
      }
    }
    
    sendMessage(textToSend);
    setLocalInput('');
  };

  const getProgressValue = () => {
    return 100;
  };

  // Diagnostic UI disabled - always in free chat mode
  const currentStepInfo = null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            toast.info(t('analyzing'));
            const { text } = await blink.ai.transcribeAudio({
              audio: base64,
              language: 'ru'
            });
            if (text) {
              setLocalInput(text);
              toast.success(t('voiceInput') + ' success');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Failed to transcribe audio');
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Mic error:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Demo Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-widest">
        <AlertCircle className="h-3 w-3" />
        Демо-версия. Не вводите персональные данные. Анализ и документы — имитация.
      </div>

      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="font-bold text-sm">Финансовый советник</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              Задайте любой вопрос о кредитах и финансах
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </header>

      {/* Progress Bar hidden for free chat mode */}
      <div className="hidden px-6 py-3 bg-secondary/30 border-b">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
          <span>Прогресс анализа</span>
          <span>{getProgressValue()}%</span>
        </div>
        <Progress value={getProgressValue()} className="h-1.5" />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-background"
      >
        {messages.map((m, idx) => {
          const isLastMessage = idx === messages.length - 1;
          // All diagnostic/consent UI disabled - always in free chat mode
          const showDiagnosticOptions = false;
          const showConsentOptions = false;
          const showIntroOptions = false;

          return (
            <div 
              key={m.id || idx}
              className={cn(
                "flex gap-4 max-w-[90%] animate-fade-in",
                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border shadow-sm",
                m.role === 'user' ? "bg-card" : "bg-primary"
              )}>
                {m.role === 'user' ? <UserIcon className="h-4 w-4 text-muted-foreground" /> : <Bot className="text-primary-foreground h-4 w-4" />}
              </div>
              <div className="space-y-3 flex-1">
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  m.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-card border rounded-tl-none text-foreground"
                )}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-xl"
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="font-black">{children}</strong>,
                      code: ({ children }) => <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-xs">{children}</code>
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
                
                {/* Options Chips */}
                {m.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2">
                    {showIntroOptions && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSend('Начать диагностику')}
                        className="rounded-full px-4 font-bold h-9"
                      >
                        Начать диагностику
                      </Button>
                    )}
                    
                    {showConsentOptions && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleSend('Предоставить согласие')}
                          className="rounded-full px-4 font-bold h-9"
                        >
                          Предоставить согласие
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocalInput('')}
                          className="rounded-full px-4 font-bold h-9"
                        >
                          Отмена
                        </Button>
                      </>
                    )}

                    {showDiagnosticOptions && currentStepInfo.options.map((opt: string) => (
                      <Button
                        key={opt}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(opt)}
                        className="rounded-full px-4 hover:bg-primary/5 hover:border-primary/30 transition-all font-medium h-9"
                      >
                        {opt}
                      </Button>
                    ))}

                    {/* Summary UI disabled - always in free chat mode */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-4 max-w-[90%] animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Bot className="text-primary-foreground h-4 w-4" />
            </div>
            <div className="p-4 bg-card border rounded-2xl rounded-tl-none shadow-sm flex-1">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-background shrink-0 shadow-2xl">
        <div className="max-w-4xl mx-auto flex gap-4 items-end">
          <div className="relative flex-1 group">
            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={t('placeholder')}
              rows={1}
              className="w-full min-h-[52px] max-h-32 pr-24 pt-3.5 pb-3 resize-none border-2 rounded-2xl border-primary/10 bg-background focus:border-primary focus:ring-0 focus:outline-none px-4 text-sm transition-all shadow-sm"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              <label className="p-2 hover:bg-primary/10 rounded-xl cursor-pointer transition-colors text-muted-foreground hover:text-primary">
                <Paperclip className="h-5 w-5" />
                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])} />
              </label>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 rounded-xl", isRecording && "text-red-500 bg-red-50 animate-pulse")}
                onClick={() => {
                   toast.info("Запись голоса (демо)...");
                }}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={() => handleSend()}
            disabled={!localInput.trim() || isLoading}
            className="h-[52px] w-[52px] rounded-2xl shrink-0 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-[0.2em] font-bold opacity-60">
          Кредо-Сервис — ваш финансовый навигатор
        </p>
      </div>
    </div>
  );
}
