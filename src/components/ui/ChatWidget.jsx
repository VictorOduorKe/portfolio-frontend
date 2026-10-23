import { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../../services/api';
import { MessageSquare, X, Send, Sparkles, Trash2, ArrowRight } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef(null);

  // Initial greeting
  const initialMessages = [
    {
      role: 'assistant',
      content: "Hi! I'm Victor's portfolio assistant. Ask me anything about his projects, skills, or professional experience!"
    }
  ];

  // Suggestions list
  const suggestions = [
    "Tell me about his projects",
    "What technologies does he use?",
    "Tell me about his cybersecurity experience"
  ];

  // Initialize session and restore messages from localstorage
  useEffect(() => {
    // Session ID
    let savedSessionId = sessionStorage.getItem('chat_session_id');
    if (!savedSessionId) {
      savedSessionId = 'session_' + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem('chat_session_id', savedSessionId);
    }
    setSessionId(savedSessionId);

    // Messages history
    const savedMessages = localStorage.getItem('chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        setMessages(initialMessages);
      }
    } else {
      setMessages(initialMessages);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save history to localStorage
  const saveMessages = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem('chat_history', JSON.stringify(newMessages));
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    // Clear input
    if (!textToSend) setInput('');

    const newMessages = [...messages, { role: 'user', content: messageText }];
    saveMessages(newMessages);
    setLoading(true);

    try {
      // Send full conversation history to backend
      const res = await sendChatMessage(newMessages, sessionId);
      saveMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      saveMessages([...newMessages, { role: 'assistant', content: "Sorry, I ran into an issue connecting to the chat server: " + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Reset conversation history?")) {
      saveMessages(initialMessages);
    }
  };

  const formatMessageContent = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];

    const parseLineText = (lineText) => {
      const parts = lineText.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        return;
      }

      const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        currentList.push(
          <li key={`li-${index}`} className="text-sm">
            {parseLineText(bulletMatch[1])}
          </li>
        );
      } else {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <p key={`p-${index}`} className="mt-2 first:mt-0 leading-relaxed">
            {parseLineText(trimmed)}
          </p>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key="list-end" className="list-disc pl-5 my-2 space-y-1">
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white hover:bg-primary-hover rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95 cursor-pointer relative"
        aria-label="Toggle chat assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-in fade-in zoom-in-50 duration-200" />
        ) : (
          <MessageSquare className="w-6 h-6 animate-in fade-in zoom-in-50 duration-200" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-[calc(100vw-48px)] sm:w-[400px] h-[550px] max-h-[calc(100vh-120px)] bg-white border border-primary/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-primary px-6 py-5 text-white flex justify-between items-center shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-white/90" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide">Ask About Me</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full"></span>
                  <span className="text-[10px] text-white/70 font-medium">Gemini AI Assistant</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/30 scrollbar-thin scrollbar-thumb-primary/10">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white border border-primary/5 text-text rounded-bl-none leading-relaxed'
                  }`}
                >
                  {msg.role === 'assistant' ? formatMessageContent(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-primary/5 rounded-2xl rounded-bl-none px-5 py-3.5 text-sm shadow-sm text-text-light flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions List */}
          {messages.length === 1 && !loading && (
            <div className="px-6 py-4 bg-background/10 border-t border-primary/5 flex flex-col gap-2 flex-shrink-0">
              <span className="text-[10px] text-text-light/70 font-semibold tracking-wider uppercase mb-1">Suggested Questions</span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="w-full text-left px-4 py-2.5 text-xs bg-white hover:bg-primary/5 border border-primary/10 rounded-lg text-primary font-medium flex justify-between items-center transition-colors group cursor-pointer"
                >
                  {s}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white border-t border-primary/10 flex gap-2 items-center flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask me something about Victor..."
              className="flex-1 px-4 py-3 border border-primary/15 rounded-xl bg-background/5 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-text placeholder:text-text-light/40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary text-white rounded-xl flex items-center cursor-pointer border-none rounded-md px-6 py-3 font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
