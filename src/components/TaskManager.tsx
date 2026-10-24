import React, { useState } from 'react';
import { TaskItem, ReminderItem, TaskPriority, TaskStatus } from '../types';
import { 
  CheckCircle2, Clock, Calendar, AlertCircle, Plus, Bell, 
  Trash2, ArrowUpRight, Filter, BellRing, Sparkles, X, Check
} from 'lucide-react';

interface TaskManagerProps {
  tasks: TaskItem[];
  reminders: ReminderItem[];
  onAddTask: (task: Partial<TaskItem>) => void;
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => void;
  onDeleteTask: (id: string) => void;
  onAddReminder: (reminder: Partial<ReminderItem>) => void;
  onDismissReminder: (id: string) => void;
  onSyncTaskToIntegration?: (taskId: string, service: string) => void;
}

const priorityColors: Record<TaskPriority, { text: string; bg: string; border: string }> = {
  Urgent: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-900/40' },
  High: { text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-900/40' },
  Medium: { text: 'text-sky-400', bg: 'bg-sky-950/40', border: 'border-sky-900/40' },
  Low: { text: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-800' },
};

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  reminders,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddReminder,
  onDismissReminder,
  onSyncTaskToIntegration,
}) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [category, setCategory] = useState('Operations');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const activeReminders = reminders.filter((r) => r.status === 'Active');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Partial<TaskItem> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'Pending',
      category,
      dueDate,
      assignedBy: 'User Initiated',
      reminderScheduled: enableReminder,
      reminderTime: enableReminder ? `${dueDate} at ${reminderTime}` : undefined,
    };

    onAddTask(newTask);

    if (enableReminder) {
      onAddReminder({
        title: `Reminder: ${title.trim()}`,
        time: reminderTime,
        date: dueDate,
        status: 'Active',
        priority,
      });
    }

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleTriggerSync = (taskId: string, service: string) => {
    if (onSyncTaskToIntegration) {
      onSyncTaskToIntegration(taskId, service);
    }
    setSyncFeedback(`Task synced to ${service} successfully`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Toast Feedback */}
      {syncFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Executive Task & Reminders Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track high-priority deliverables, automated AI action items, and scheduled Google Calendar alerts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task & Reminder</span>
        </button>
      </div>

      {/* Active Reminders Alert Banner */}
      {activeReminders.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <BellRing className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Upcoming Scheduled Reminders ({activeReminders.length})</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Auto-synced to Google Calendar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeReminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-start justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200 line-clamp-1">{rem.title}</div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{rem.date} · {rem.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDismissReminder(rem.id)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 transition-colors shrink-0"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
          {(['All', 'Pending', 'In Progress', 'Completed'] as (TaskStatus | 'All')[]).map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                  isSelected ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'All')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table / High-Density List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1">Create your first task or change filter options above.</p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-800/80">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'Completed';
            const prioStyle = priorityColors[task.priority];

            return (
              <div
                key={task.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-850/60 transition-colors ${
                  isDone ? 'opacity-60' : ''
                }`}
              >
                {/* Left check and title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() =>
                      onUpdateTask(task.id, {
                        status: isDone ? 'Pending' : 'Completed',
                      })
                    }
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-indigo-500 bg-slate-950'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded border ${prioStyle.bg} ${prioStyle.text} ${prioStyle.border}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-mono">
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Due {task.dueDate}</span>
                      {task.reminderScheduled && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-400 flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            <span>{task.reminderTime || 'Scheduled'}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions: Integrations & Delete */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => handleTriggerSync(task.id, 'Google Calendar')}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
                    title="Push task to Google Calendar"
                  >
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    <span>Sync Cal</span>
                  </button>
                  <button
                    onClick={() => handleTriggerSync(task.id, 'Slack')}
                    className="px-2.5 py-1 text-[11px] rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1 transition-colors"
                    title="Notify on Slack"
                  >
                    <span>Slack</span>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Schedule Task & Reminder</h2>
                <p className="text-xs text-slate-400 mt-0.5">Automated integration push enabled</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prepare M&A risk presentation for Board review"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Relevant context or sub-tasks..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Strategy">Strategy</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR & Policy">HR & Policy</option>
                    <option value="Operations">Operations</option>
                    <option value="Integrations">Integrations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enableReminder"
                  checked={enableReminder}
                  onChange={(e) => setEnableReminder(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="enableReminder" className="text-xs text-slate-300">
                  Broadcast active audio & notification alert on deadline
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
