import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { Customer } from '../types';
import { processNaturalLanguageQuery } from '../services/aiService';

interface AIAssistantProps {
  customers: Customer[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ customers }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your SmartPort AI analyst. You can ask me things like 'Which customers in Europe have a high churn risk?' or 'Summarize the total device count for Enterprise plans'." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await processNaturalLanguageQuery(userMsg, customers);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer || "I processed your request, but couldn't generate a specific textual answer." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error analytical processing." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-6">
      <div className="mb-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-light italic">AI <span className="font-bold uppercase tracking-tighter not-italic text-black">Analyst</span></h2>
          <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">Natural language telemetry interaction</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="mono text-[10px] font-bold text-blue-600">LLM CORE ACTIVE</span>
        </div>
      </div>

      <div className="flex-1 border border-border bg-white flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-gray-50/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`p-5 max-w-[85%] rounded-sm border shadow-sm ${
                m.role === 'assistant' 
                ? 'bg-ink text-white border-ink' 
                : 'bg-white border-border text-ink'
              }`}>
                <div className="flex items-center gap-2 mb-3 opacity-50 font-mono text-[9px] font-bold uppercase tracking-[0.2em] border-b border-current/20 pb-1">
                  {m.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  SYSTEM {m.role}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 items-center opacity-40 font-mono text-[10px] font-bold uppercase tracking-wider pl-4">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing Analytical Query...
            </div>
          )}
        </div>

        <div className="p-5 bg-white border-t border-border">
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="ENTER ANALYTICAL QUERY..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-3 border border-border bg-gray-50 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-black focus:bg-white outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="btn-primary px-8 flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
