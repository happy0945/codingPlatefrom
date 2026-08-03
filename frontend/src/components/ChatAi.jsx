import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosClient from '../utils/axiosClient';

// ─── Markdown-style AI message renderer ──────────────────────────────────────
function AiMessage({ text }) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3).replace(/^\w+\n/, '');
          return (
            <pre key={i} className="my-2 p-3 rounded-lg text-xs overflow-x-auto font-mono"
              style={{ background: 'rgba(0,0,0,0.45)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' }}>
              <code>{inner}</code>
            </pre>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1.5 py-0.5 rounded text-xs font-mono"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#c084fc' }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return (
          <span key={i}>
            {part.split('**').map((s, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: '#c084fc' }}>{s}</strong> : s
            )}
          </span>
        );
      })}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

// ─── Main Chat Component ───────────────────────────────────────────────────────
function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: `Hi! I'm your AI tutor for **"${problem?.title || 'this problem'}"**.\n\nAsk me about the approach, hints, time complexity, or code explanation! 🚀` }]
    }
  ]);
  const [typing, setTyping] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const onSubmit = async (data) => {
    const userMsg = { role: 'user', parts: [{ text: data.message }] };
    setMessages(prev => [...prev, userMsg]);
    reset();
    setTyping(true);
    try {
      const response = await axiosClient.post('/ai/chat', {
        messages: [...messages, userMsg],
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode,
      });
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.data.message }] }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '❌ Something went wrong. Please try again.' }] }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300 shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.07))' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>🤖</div>
        <div>
          <div className="font-bold text-sm">AI Tutor</div>
          <div className="flex items-center gap-1.5 text-xs opacity-50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Powered by Gemini
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx}
            className={`flex gap-2 animate-messageIn ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
              style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : 'rgba(99,102,241,0.15)'
              }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className={`max-w-[84%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'chat-msg-user text-white' : 'chat-msg-ai'}`}>
              {msg.role === 'model'
                ? <AiMessage text={msg.parts[0].text} />
                : <p className="text-sm">{msg.parts[0].text}</p>}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(99,102,241,0.15)' }}>🤖</div>
            <div className="chat-msg-ai px-3 py-1 rounded-2xl">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-3 border-t border-base-300 shrink-0">
        <div className="flex gap-2 items-center">
          <input
            {...register('message', { required: true, minLength: 2 })}
            placeholder="Ask about approach, hints, or code…"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-base-300 bg-base-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(onSubmit)(); } }}
          />
          <button type="submit" disabled={!!errors.message || typing}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs opacity-30 mt-1 text-center">Enter to send · Shift+Enter for newline</p>
      </form>
    </div>
  );
}

export default ChatAi;