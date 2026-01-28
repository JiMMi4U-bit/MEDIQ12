
import React, { useState, useEffect, useRef } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment, ChatMessage } from '../types';

interface ChatRoomProps {
  appointmentId: string;
  currentRole: 'patient' | 'doctor';
  theme: 'light' | 'dark';
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ appointmentId, currentRole, theme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = () => {
      const appt = appointmentService.getAppointments().find(a => a.id === appointmentId);
      if (appt && appt.chatHistory) {
        setMessages(appt.chatHistory);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000); // Polling for updates
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    appointmentService.addChatMessage(appointmentId, currentRole, input);
    setInput('');
    // Trigger immediate reload for better UX
    const appt = appointmentService.getAppointments().find(a => a.id === appointmentId);
    if (appt?.chatHistory) setMessages(appt.chatHistory);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-[400px] rounded-2xl border overflow-hidden shadow-inner ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
      <div className={`p-3 border-b flex justify-between items-center ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Direct Consultation Channel
        </h4>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {messages.length === 0 ? (
          <div className="text-center py-10 opacity-30">
            <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === currentRole;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm font-medium ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                    : (isDark ? 'bg-slate-800 text-slate-100 rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm')
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 px-1">
                  {isMe ? 'You' : (msg.senderRole === 'doctor' ? 'Doctor' : 'Patient')} • {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className={`p-3 border-t ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <div className="relative">
          <input
            type="text"
            className={`w-full pl-4 pr-12 py-2.5 rounded-xl text-sm outline-none transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500'
            }`}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
