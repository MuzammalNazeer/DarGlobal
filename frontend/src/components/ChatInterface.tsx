import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, Building2, ExternalLink, Bot, User, Trash2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Message, PropertyCitation } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  sourceFilter: string;
  setSourceFilter: (filter: string) => void;
  selectedModel?: string;
}

const SUGGESTED_PROMPTS = [
  {
    title: "DG1 Dubai Canal",
    desc: "DarGlobal's signature tower designed by Gensler",
    query: "Tell me about DG1 by DarGlobal on the Dubai Canal, including prices, specifications, and architecture."
  },
  {
    title: "Saudi Luxury Villas",
    desc: "Wasalt listings in Riyadh & Jeddah",
    query: "What luxury villas and modern houses are available in Riyadh and Jeddah on Wasalt with prices in SAR?"
  },
  {
    title: "Branded Residences",
    desc: "Lamborghini, Pagani, Elie Saab & Missoni",
    query: "Compare the branded luxury residences by DarGlobal: Tierra Viva (Lamborghini), DaVinci (Pagani), and Les Vagues (Elie Saab)."
  },
  {
    title: "AIDA Oman & Trump",
    desc: "Golf club cliff villas with Golden Visa",
    query: "What are the investment benefits, Golden Visa eligibility, and features of Trump Villas at AIDA Oman?"
  }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClearHistory,
  sourceFilter,
  setSourceFilter,
  selectedModel
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <div className="py-8 max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-dargold-400/20 to-dargold-600/10 border border-dargold-400/30 text-dargold-400 shadow-xl shadow-dargold-500/10">
              <Building2 className="w-12 h-12" />
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                DarGlobal <span className="text-dargold-400">×</span> Wasalt Real Estate AI
              </h1>
              <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Explore international luxury trophy developments by <strong className="text-dargold-300">DarGlobal</strong> and verified Saudi Arabian properties from <strong className="text-emerald-400">Wasalt</strong> powered by live RAG intelligence and OpenRouter.
              </p>
            </div>

            {/* Quick Filter Selection */}
            <div className="flex items-center justify-center space-x-2 text-xs">
              <span className="text-slate-400">Knowledge Scope:</span>
              {(['ALL', 'DarGlobal', 'Wasalt'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSourceFilter(mode)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    sourceFilter === mode
                      ? 'bg-dargold-400 text-navy-950 border-dargold-400 font-semibold shadow-sm'
                      : 'bg-navy-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {mode === 'ALL' ? 'All Developments' : mode === 'DarGlobal' ? 'DarGlobal Only' : 'Wasalt (KSA) Only'}
                </button>
              ))}
            </div>

            {/* Suggested Question Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 text-left">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt.query)}
                  className="p-4 rounded-xl bg-navy-900/80 hover:bg-navy-850 border border-slate-800 hover:border-dargold-400/40 transition-all duration-200 group text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white group-hover:text-dargold-300 transition-colors">
                        {prompt.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-dargold-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{prompt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start space-x-3.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-slate-700 text-white'
                    : 'bg-gradient-to-br from-dargold-400 to-dargold-600 text-navy-950 font-bold'
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content Container */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl shadow-sm leading-relaxed ${
                    isUser
                      ? 'bg-dargold-500 text-navy-950 font-medium rounded-tr-none'
                      : 'bg-navy-900/95 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-serif prose-headings:text-dargold-300 prose-a:text-dargold-400 prose-strong:text-white">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Grounded Property Sources Carousel / Cards */}
                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-dargold-400" />
                      <span>Retrieved Verified Property Sources ({message.sources.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {message.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2.5 rounded-xl bg-navy-950/70 border border-slate-800 hover:border-dargold-400/50 hover:bg-navy-850/80 transition-all group"
                        >
                          <img
                            src={src.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80'}
                            alt={src.title}
                            className="w-14 h-14 rounded-lg object-cover bg-slate-900 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  src.source === 'DarGlobal'
                                    ? 'bg-dargold-400/20 text-dargold-300 border border-dargold-400/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {src.source}
                              </span>
                              <span className="text-[11px] font-bold text-white truncate">{src.price}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-200 truncate mt-1 group-hover:text-dargold-300 transition-colors">
                              {src.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate flex items-center mt-0.5">
                              <MapPin className="w-3 h-3 mr-0.5 text-dargold-400 shrink-0" />
                              {src.location}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-dargold-400 shrink-0 mr-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata timestamp & model */}
                {!isUser && (
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 px-1">
                    <span>{message.timestamp}</span>
                    {message.model_used && (
                      <span className="flex items-center text-slate-400">
                        <Sparkles className="w-3 h-3 mr-1 text-dargold-400" />
                        {message.model_used}
                      </span>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dargold-400 to-dargold-600 text-navy-950 font-bold flex items-center justify-center shadow-md animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 text-slate-300 flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-dargold-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-dargold-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-dargold-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Retrieving property vectors & synthesizing OpenRouter response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pb-4 pt-2 border-t border-slate-800/80 bg-navy-950">
        
        {/* Controls Above Input */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
          <div className="flex items-center space-x-2">
            <span>Filter:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-navy-900 border border-slate-800 rounded px-2 py-0.5 text-dargold-300 focus:outline-none"
            >
              <option value="ALL">All Developments (DarGlobal + Wasalt)</option>
              <option value="DarGlobal">DarGlobal Luxury Only</option>
              <option value="Wasalt">Wasalt Saudi Arabia Only</option>
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center space-x-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* Text Input Box */}
        <form onSubmit={handleSubmit} className="relative flex items-end bg-navy-900 rounded-2xl border border-slate-800 focus-within:border-dargold-400/70 focus-within:ring-1 focus-within:ring-dargold-400/40 transition-all p-2 shadow-lg">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about DarGlobal developments, DG1, Wasalt listings, prices in SAR/AED, or branded residences..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-3 py-1.5"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-dargold-400 text-navy-950 font-bold hover:bg-dargold-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-dargold-500/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 mt-2">
          Responses grounded via Vector RAG over scraped DarGlobal & Wasalt properties. OpenRouter API fallback enabled.
        </p>
      </div>

    </div>
  );
};
