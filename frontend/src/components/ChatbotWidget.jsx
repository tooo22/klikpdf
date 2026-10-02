import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getBotResponse, getSuggestionChips } from '../services/chatbotEngine';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Minus, 
  ArrowRight, 
  MessageSquare
} from 'lucide-react';

export const ChatbotWidget = ({ onSelectTool }) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef(null);

  // Initial greeting based on language
  const getInitialMessages = () => [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: lang === 'id' 
        ? 'Halo! 👋 Saya Asisten AI KlikPDF. Ada yang bisa saya bantu terkait pengelolaan atau konversi file PDF Anda hari ini?' 
        : 'Hello! 👋 I am your KlikPDF AI Assistant. How can I help you manage or convert your PDF files today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('klikpdf_chat_history_v1');
      return saved ? JSON.parse(saved) : getInitialMessages();
    } catch {
      return getInitialMessages();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('klikpdf_chat_history_v1', JSON.stringify(messages));
    } catch (e) {
      console.warn("Storage warning:", e);
    }
  }, [messages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Hide initial greeting tooltip after 8s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Natural bot response delay (400ms)
    setTimeout(() => {
      const reply = getBotResponse(userMsg.text, lang);
      const botMsg = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'bot',
        text: reply.text,
        toolId: reply.toolId,
        toolName: reply.toolName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearChat = () => {
    const fresh = getInitialMessages();
    setMessages(fresh);
    localStorage.removeItem('klikpdf_chat_history_v1');
  };

  const handleToolClick = (toolId) => {
    if (onSelectTool && toolId) {
      onSelectTool(toolId);
    }
  };

  const suggestions = getSuggestionChips(lang);

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Tooltip greeting when closed */}
      {!isOpen && showTooltip && (
        <div 
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="absolute bottom-16 right-0 mb-2 w-64 bg-white dark:bg-[#18181B] p-3.5 rounded-2xl shadow-2xl border border-border-subtle dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer animate-bounce hover:animate-none flex items-center space-x-3 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <span>KlikPDF AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {lang === 'id' ? 'Tanya seputar fitur PDF di sini!' : 'Ask about PDF tools here!'}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          aria-label="Buka Asisten AI"
          className="relative group w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-rose-600 to-red-500 text-white shadow-[0_8px_25px_rgba(225,29,72,0.45)] hover:shadow-[0_12px_35px_rgba(225,29,72,0.65)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bot size={28} className="group-hover:rotate-12 transition-transform duration-200" />
          
          {/* Online green indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-[#141724]"></span>
          </span>
        </button>
      ) : (
        /* Chat Window Dialog */
        <div className="w-[360px] sm:w-[410px] h-[560px] max-h-[85vh] bg-white dark:bg-[#141724] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-border-subtle/80 dark:border-slate-800 flex flex-col overflow-hidden animate-fade-in transition-colors duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-rose-600 to-red-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none flex items-center space-x-1.5">
                  <span>KlikPDF AI</span>
                  <Sparkles size={13} className="text-amber-300" />
                </h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-white/90 mt-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>{lang === 'id' ? 'Aktif Sekarang • Asisten Cerdas' : 'Online • Smart Assistant'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title={lang === 'id' ? 'Bersihkan Obrolan' : 'Clear Chat'}
                className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={lang === 'id' ? 'Tutup' : 'Close'}
                className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-canvas dark:bg-[#0f111a] no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary to-rose-600 text-white rounded-br-xs shadow-md shadow-primary/20'
                      : 'bg-white dark:bg-[#1a1e2e] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* 1-Click Tool Action Link Button */}
                  {msg.toolId && (
                    <button
                      onClick={() => handleToolClick(msg.toolId)}
                      className="mt-3 w-full py-2.5 px-3 rounded-xl bg-primary/10 dark:bg-primary/20 hover:bg-primary text-primary hover:text-white dark:text-rose-400 dark:hover:text-white font-bold text-xs flex items-center justify-between border border-primary/25 hover:border-primary transition-all cursor-pointer active:scale-95 group shadow-xs"
                    >
                      <span>Buka Alat: {msg.toolName}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center space-x-1.5 p-3 rounded-2xl bg-white dark:bg-[#1a1e2e] border border-slate-200/80 dark:border-slate-800 w-20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips (Without ugly scrollbars) */}
          <div className="px-3.5 py-2.5 bg-white dark:bg-[#141724] border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1f2436] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-primary transition-all cursor-pointer border border-slate-200/70 dark:border-slate-700/60 hover:border-primary/40 active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#141724] border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={lang === 'id' ? 'Tanyakan seputar alat PDF...' : 'Ask anything about PDF tools...'}
              className="flex-1 bg-slate-100 dark:bg-[#1a1e2e] text-slate-900 dark:text-white px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 border border-transparent dark:border-slate-700/80 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 shadow-md shadow-primary/25"
              aria-label="Kirim pesan"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
