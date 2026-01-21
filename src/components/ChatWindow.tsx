import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Send, User as UserIcon, Bot, Paperclip, Loader2, Globe, ShieldCheck } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { cn } from '../lib/utils';

interface ChatWindowProps {
  profile: any;
  updateProfile: (data: any) => Promise<any>;
}

export function ChatWindow({ profile, updateProfile }: ChatWindowProps) {
  const { messages, isLoading, sendMessage, uploadDocument, initSession } = useChat(profile);
  const [localInput, setLocalInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <h2 className="font-bold">Chat Advisor</h2>
          {profile.jurisdiction ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
              <Globe className="h-3 w-3" />
              {profile.jurisdiction}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-md text-xs font-medium text-amber-600 border border-amber-100">
              <Globe className="h-3 w-3" />
              Location pending
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {Number(profile.hasConsent) > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="h-3 w-3" />
              Consent Active
            </div>
          ) : (
             <Button variant="ghost" size="sm" className="text-xs h-8">
               Manage Consent
             </Button>
          )}
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/20"
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
              m.role === 'user' ? "bg-white" : "bg-black"
            )}>
              {m.role === 'user' ? <UserIcon className="h-4 w-4 text-slate-600" /> : <Bot className="text-white h-4 w-4" />}
            </div>
            <div className={cn(
              "space-y-1 p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === 'user' 
                ? "bg-slate-900 text-white rounded-tr-none" 
                : "bg-white border rounded-tl-none text-slate-800"
            )}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%] animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center shrink-0">
              <Bot className="text-white h-4 w-4" />
            </div>
            <div className="p-4 bg-white border rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t bg-white shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4 items-end">
          <div className="relative flex-1">
            <textarea
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Type your message..."
              rows={1}
              className="w-full min-h-[52px] max-h-32 pr-12 pt-3.5 pb-3 resize-none border rounded-xl border-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none px-4 text-sm transition-all"
            />
            <label className="absolute right-3 bottom-3 p-1.5 hover:bg-slate-100 rounded-md cursor-pointer transition-colors text-slate-400 hover:text-slate-600">
              <Paperclip className="h-5 w-5" />
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0])} />
            </label>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!localInput.trim() || isLoading}
            className="h-[52px] w-[52px] rounded-xl shrink-0 shadow-lg shadow-slate-200"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest font-medium">
          CreditWise Advisor provides general financial guidance.
        </p>
      </div>
    </div>
  );
}
