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

export const ChatbotWidget = ({ onSelectTool, isWorkspace = false }) => {
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
    <div className={`fixed z-40 select-none transition-all duration-200 ${
      isWorkspace
        ? 'bottom-20 right-3 sm:bottom-6 sm:right-6'
        : 'bottom-4 right-3 sm:bottom-6 sm:right-6'
    }`}>
      {/* Tooltip greeting when closed */}
      {!isOpen && showTooltip && (
        <div 
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="absolute bottom-16 right-0 mb-2 w-64 max-w-[calc(100vw-2.5rem)] bg-white/95 dark:bg-[#121216]/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer animate-bounce hover:animate-none flex items-center space-x-3 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={16} className="text-zinc-700 dark:text-zinc-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 font-mono text-[11px] tracking-wide uppercase">
              <span>KlikPDF AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-normal">
              {lang === 'id' ? 'Tanya seputar alat PDF di sini' : 'Ask about PDF tools here'}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 cursor-pointer transition-colors"
            aria-label="Tutup tooltip"
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
          className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-950 dark:bg-black text-white hover:bg-zinc-900 dark:hover:bg-zinc-950 border border-zinc-800 dark:border-zinc-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bot size={22} className="sm:w-6 sm:h-6 text-zinc-100 group-hover:rotate-12 transition-transform duration-200" />
          
          {/* Online green indicator */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-white dark:border-[#0c0d12]"></span>
          </span>
        </button>
      ) : (
        /* Chat Window Dialog (Centered & adaptive on mobile) */
        <div className="fixed inset-x-3 bottom-3 top-auto sm:static sm:inset-auto w-auto sm:w-[410px] h-[520px] max-h-[calc(100dvh-4.5rem)] bg-white dark:bg-[#0c0d12] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.9)] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-fade-in transition-colors duration-200 z-50">
          
          {/* Header */}
          <div className="bg-zinc-950 dark:bg-[#121318] px-4 sm:px-5 py-3.5 sm:py-4 text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                <Bot size={20} className="text-zinc-200" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase leading-none flex items-center space-x-1.5 text-white">
                  <span>KlikPDF AI</span>
                  <Sparkles size={12} className="text-zinc-400" />
                </h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 mt-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>{lang === 'id' ? 'Aktif • Asisten Cerdas' : 'Online • Assistant'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title={lang === 'id' ? 'Bersihkan Obrolan' : 'Clear Chat'}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={lang === 'id' ? 'Tutup' : 'Close'}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                <Minus size={17} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-zinc-50/70 dark:bg-[#08090c] no-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-medium rounded-tr-xs shadow-sm border border-zinc-800 dark:border-zinc-200'
                      : 'bg-white dark:bg-[#14151c] text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* 1-Click Tool Action Link Button */}
                  {msg.toolId && (
                    <button
                      onClick={() => handleToolClick(msg.toolId)}
                      className="mt-3 w-full py-2.5 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-950 text-zinc-900 dark:text-white font-bold text-xs flex items-center justify-between border border-zinc-300/80 dark:border-zinc-700/80 transition-all cursor-pointer active:scale-95 group shadow-xs"
                    >
                      <span className="font-mono text-[11px] uppercase tracking-wide">Buka Alat: {msg.toolName}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center space-x-1.5 p-3 rounded-2xl bg-white dark:bg-[#14151c] border border-zinc-200 dark:border-zinc-800 w-20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3.5 py-2.5 bg-white dark:bg-[#0c0d12] border-t border-zinc-100 dark:border-zinc-800/80 overflow-x-auto no-scrollbar flex items-center gap-2">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 text-[11px] font-mono px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-[#15161f] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer border border-zinc-200 dark:border-zinc-800 active:scale-95"
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
            className="p-3 bg-white dark:bg-[#0c0d12] border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))]"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={lang === 'id' ? 'Tanyakan seputar alat PDF...' : 'Ask anything about PDF tools...'}
              className="flex-1 bg-zinc-100 dark:bg-[#15161f] text-zinc-900 dark:text-white px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 border border-transparent dark:border-zinc-800 transition-all placeholder:text-zinc-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 disabled:opacity-30 text-white dark:text-black flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 shadow-sm"
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
