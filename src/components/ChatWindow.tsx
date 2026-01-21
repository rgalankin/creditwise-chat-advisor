import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Send, User as UserIcon, Bot, Paperclip, Loader2, Globe, ShieldCheck, Mic, Square } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/i18n';
import { blink } from '../lib/blink';
import { toast } from 'sonner';

interface ChatWindowProps {
  profile: any;
  updateProfile: (data: any) => Promise<any>;
}

export function ChatWindow({ profile, updateProfile }: ChatWindowProps) {
  const { messages, isLoading, sendMessage, uploadDocument, initSession } = useChat(profile);
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

  const handleSend = () => {
    if (!localInput.trim()) return;
    sendMessage(localInput);
    setLocalInput('');
  };

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
              language: language === 'ru' ? 'ru' : 'en'
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
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <h2 className="font-bold">{t('appName')}</h2>
          {profile.jurisdiction ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary rounded-md text-xs font-medium text-muted-foreground">
              <Globe className="h-3 w-3" />
              {profile.jurisdiction}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md text-xs font-medium text-amber-600 border border-amber-100 dark:border-amber-900/30">
              <Globe className="h-3 w-3" />
              {language === 'ru' ? 'Регион не указан' : 'Location pending'}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {Number(profile.hasConsent) > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="h-3 w-3" />
              {language === 'ru' ? 'Согласие получено' : 'Consent Active'}
            </div>
          ) : (
             <Button variant="outline" size="sm" className="text-xs h-8">
               {language === 'ru' ? 'Управление согласием' : 'Manage Consent'}
             </Button>
          )}
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-background"
      >
        {messages.map((m) => (
          <div 
            key={m.id}
            className={cn(
              "flex gap-4 max-w-[85%] animate-fade-in",
              m.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border shadow-sm",
              m.role === 'user' ? "bg-card" : "bg-primary"
            )}>
              {m.role === 'user' ? <UserIcon className="h-4 w-4 text-muted-foreground" /> : <Bot className="text-primary-foreground h-4 w-4" />}
            </div>
            <div className={cn(
              "space-y-1 p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-card border rounded-tl-none text-foreground"
            )}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%] animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Bot className="text-primary-foreground h-4 w-4" />
            </div>
            <div className="p-4 bg-card border rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-background shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4 items-end">
          <div className="relative flex-1">
            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={t('placeholder')}
              rows={1}
              className="w-full min-h-[52px] max-h-32 pr-24 pt-3.5 pb-3 resize-none border rounded-xl border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none px-4 text-sm transition-all"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isRecording && "text-red-500 animate-pulse")}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
              </Button>
              <label className="p-1.5 hover:bg-secondary rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground">
                <Paperclip className="h-5 w-5" />
                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])} />
              </label>
            </div>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!localInput.trim() || isLoading}
            className="h-[52px] w-[52px] rounded-xl shrink-0 shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-medium">
          {t('appName')} {language === 'ru' ? 'предоставляет общие финансовые рекомендации.' : 'provides general financial guidance.'}
        </p>
      </div>
    </div>
  );
}
