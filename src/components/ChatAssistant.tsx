import React, { useState, useRef, useEffect } from 'react';
import { ClearanceRole, DocumentItem, TaskItem, ReminderItem, ChatMessage } from '../types';
import { 
  Send, Sparkles, ShieldAlert, ShieldCheck, Plus, CheckCircle2, 
  Clock, ArrowRight, Trash2, Volume2, VolumeX, FileText, Lock
} from 'lucide-react';

interface ChatAssistantProps {
  activeRole: ClearanceRole;
  documents: DocumentItem[];
  tasks: TaskItem[];
  reminders: ReminderItem[];
  onAddTask: (task: Partial<TaskItem>) => void;
  onAddReminder: (reminder: Partial<ReminderItem>) => void;
  onSelectDocument: (docId: string) => void;
}

const quickPrompts = [
  { label: 'Q3 M&A & Expansion Budget', prompt: 'What are our Q3 acquisition targets and confidential financial budget?' },
  { label: 'Wellness Perks & Stipends', prompt: 'What is our annual home office stipend and wellness perks policy?' },
  { label: 'Java Microservices Architecture', prompt: 'Summarize our Java 21 Spring Boot microservices and Kafka architecture.' },
  { label: 'Incident Escalation SLAs', prompt: 'What are the response SLA times and post-mortem rules for Sev-1 outages?' },
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  activeRole,
  documents,
  tasks,
  reminders,
  onAddTask,
  onAddReminder,
  onSelectDocument,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello Walter. I am **Aetherius**, your personal executive assistant.

I have indexed your permitted documents, current tasks, and software connectors under your active clearance level: **${activeRole}**.

How may I assist you with document research, task workflows, or operational inquiries today?`,
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play gentle web audio chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages,
          userRole: activeRole,
          activeTasks: tasks,
          activeReminders: reminders,
        }),
      });

      const data = await response.json();
      playChime();

      let detectedAction: any = undefined;
      if (data.extractedTask) {
        detectedAction = {
          type: 'task',
          data: data.extractedTask,
        };
      } else if (data.extractedReminder) {
        detectedAction = {
          type: 'reminder',
          data: data.extractedReminder,
        };
      }

      // Check if response contains access denial
      const isDenied = data.reply.includes('Access Denied') || data.reply.includes('requires EXECUTIVE') || data.reply.includes('Security Notice: Access Denied');

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        securityNotice: isDenied ? {
          isBlocked: true,
          requiredClearance: data.reply.includes('EXECUTIVE') ? 'EXECUTIVE' : 'MANAGER',
          reason: 'Principal role does not meet document security clearance threshold.',
        } : undefined,
        suggestedAction: detectedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I encountered an issue connecting to the reasoning pipeline. Please check your network and retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTaskFromAction = (actionData: any) => {
    onAddTask({
      title: actionData.title || 'Follow up on chat inquiry',
      priority: actionData.priority || 'Medium',
      category: actionData.category || 'Operations',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      assignedBy: 'Aetherius Assistant',
      reminderScheduled: true,
      reminderTime: 'Tomorrow at 10:00',
    });

    onAddReminder({
      title: `Reminder: ${actionData.title || 'Follow up on inquiry'}`,
      time: '10:00',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      status: 'Active',
      priority: actionData.priority || 'Medium',
    });

    showToast('Task & Reminder scheduled successfully');
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. Active clearance is **${activeRole}**. How can I help you?`,
        timestamp: 'Just now',
      },
    ]);
  };

  const permittedCount = documents.filter((d) => d.isPermitted).length;
  const restrictedCount = documents.length - permittedCount;

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-5xl mx-auto px-4 py-4">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security Context Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/assistant_avatar_1792842957583.jpg"
              alt="Assistant"
              className="w-10 h-10 rounded-full object-cover border border-indigo-500/50 shadow-md shadow-indigo-950"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">Aetherius Grounded Intelligence</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                Gemini 3.8 Flash
              </span>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-2">
              <span>Grounded in {permittedCount} permitted documents</span>
              <span>·</span>
              <span className="text-amber-400/90 font-mono">{restrictedCount} classified above {activeRole}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Chimes enabled' : 'Chimes muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-indigo-500/40">
                  <img
                    src="/src/assets/images/assistant_avatar_1792842957583.jpg"
                    alt="AI"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-900/90 border border-slate-800/90 text-slate-200 shadow-sm'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                }`}
              >
                {/* Security Restriction Callout */}
                {msg.securityNotice?.isBlocked && (
                  <div className="mb-3 p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-200 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-300">RBAC Enforcement Active</div>
                      <p className="mt-0.5 text-amber-200/90">{msg.securityNotice.reason}</p>
                    </div>
                  </div>
                )}

                {/* Message Body with markdown-like formatting */}
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Suggested Action Item */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-indigo-900/40">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-semibold text-indigo-200">
                          {msg.suggestedAction.type === 'task' ? 'Action Item Detected' : 'Scheduled Reminder'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {msg.suggestedAction.data.title}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateTaskFromAction(msg.suggestedAction?.data)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Tasks</span>
                    </button>
                  </div>
                )}

                {/* Message Timestamp */}
                <div
                  className={`mt-2 text-[10px] text-right font-mono ${
                    isAssistant ? 'text-slate-500' : 'text-indigo-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-700">
                  <img
                    src="/src/assets/images/user_avatar_1792842958909.jpg"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-indigo-500/40">
              <img
                src="/src/assets/images/assistant_avatar_1792842957583.jpg"
                alt="AI"
                className="w-full h-full object-cover animate-pulse"
              />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Grounded reasoning across permitted documents...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1.5 mb-2 no-scrollbar">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Aetherius anything under ${activeRole} clearance (or "Remind me to...", "Create a task...")`}
          className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 shadow-inner pr-12 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
          title="Send inquiry"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
