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
  HelpCircle,
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
        ? 'Halo! 👋 Saya Asisten AI KlikPDF. Ada yang bisa saya bantu terkait pengelolaan atau konversi file PDF Anda?' 
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
          className="absolute bottom-16 right-0 mb-2 w-60 bg-white dark:bg-[#1E1E22] p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-[#2E2E33] text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer animate-bounce hover:animate-none flex items-center space-x-2.5 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#E5322D] flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white">KlikPDF AI</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {lang === 'id' ? 'Tanya seputar fitur PDF di sini!' : 'Ask about PDF tools here!'}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          aria-label="Open AI Chatbot"
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#CC2520] to-[#E5322D] text-white shadow-[0_8px_25px_rgba(229,50,45,0.45)] hover:shadow-[0_12px_35px_rgba(229,50,45,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bot size={28} className="group-hover:rotate-12 transition-transform duration-200" />
          
          {/* Online green indicator */}
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-[#1E1E22]"></span>
          </span>
        </button>
      ) : (
        /* Chat Window Dialog */
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white dark:bg-[#1E1E22] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-[#2E2E33] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E5322D] to-[#FF5E57] px-5 py-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none flex items-center space-x-1.5">
                  <span>KlikPDF AI</span>
                  <Sparkles size={13} className="text-amber-300" />
                </h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-white/90 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>{lang === 'id' ? 'Aktif Sekarang' : 'Online Assistant'}</span>
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
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F9FAFB] dark:bg-[#141416]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#E5322D] text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#1E1E22] text-gray-800 dark:text-gray-200 border border-gray-200/70 dark:border-[#2E2E33] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* 1-Click Tool Action Link Button */}
                  {msg.toolId && (
                    <button
                      onClick={() => handleToolClick(msg.toolId)}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-[#E5322D] dark:text-[#FF6B66] font-bold text-xs flex items-center justify-center space-x-1.5 border border-red-200/60 dark:border-red-800/40 transition-all cursor-pointer active:scale-95"
                    >
                      <span>{msg.toolName}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center space-x-1.5 p-3 rounded-2xl bg-white dark:bg-[#1E1E22] border border-gray-200/70 dark:border-[#2E2E33] w-20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#E5322D] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#E5322D] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#E5322D] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3.5 py-2 bg-white dark:bg-[#1E1E22] border-t border-gray-100 dark:border-[#2E2E33] overflow-x-auto no-scrollbar flex items-center space-x-2">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-[#27272A] hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-gray-300 hover:text-[#E5322D] dark:hover:text-[#FF6B66] transition-all cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-800/40"
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
            className="p-3 bg-white dark:bg-[#1E1E22] border-t border-gray-100 dark:border-[#2E2E33] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={lang === 'id' ? 'Tanyakan seputar alat PDF...' : 'Ask anything about PDF tools...'}
              className="flex-1 bg-gray-100 dark:bg-[#27272A] text-gray-900 dark:text-white px-4 py-2.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E5322D]/50 border border-transparent dark:border-[#3F3F46]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-9 h-9 rounded-full bg-[#E5322D] hover:bg-[#CC2520] disabled:opacity-40 disabled:hover:bg-[#E5322D] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90 shadow-sm"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
