import React, { useState, useEffect } from 'react';
import { 
  ClearanceRole, SubscriptionTierType, DocumentItem, 
  TaskItem, ReminderItem, IntegrationConnector, WorkflowRule 
} from './types';
import { initialTasks, initialReminders, initialIntegrations, initialWorkflows } from './data/mockData';
import { TopNav } from './components/TopNav';
import { ChatAssistant } from './components/ChatAssistant';
import { DocumentVault } from './components/DocumentVault';
import { TaskManager } from './components/TaskManager';
import { IntegrationsHub } from './components/IntegrationsHub';
import { JavaPolicyEngine } from './components/JavaPolicyEngine';
import { PricingTiers } from './components/PricingTiers';
import { SubscriptionModal } from './components/SubscriptionModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeRole, setActiveRole] = useState<ClearanceRole>('EXECUTIVE');
  const [currentTier, setCurrentTier] = useState<SubscriptionTierType>('Pro');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Core Data States
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>(initialIntegrations);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(initialWorkflows);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Fetch documents whenever activeRole changes
  const fetchDocuments = async (role: ClearanceRole) => {
    try {
      const res = await fetch(`/api/documents?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents from server:', err);
    }
  };

  useEffect(() => {
    fetchDocuments(activeRole);
  }, [activeRole]);

  // Handlers for Tasks
  const handleAddTask = (taskData: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Untitled Action Item',
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Pending',
      category: taskData.category || 'Operations',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      assignedBy: taskData.assignedBy || 'User Initiated',
      reminderScheduled: taskData.reminderScheduled || false,
      reminderTime: taskData.reminderTime,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers for Reminders
  const handleAddReminder = (reminderData: Partial<ReminderItem>) => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: reminderData.title || 'Scheduled Reminder',
      time: reminderData.time || '10:00',
      date: reminderData.date || new Date().toISOString().split('T')[0],
      status: 'Active',
      priority: reminderData.priority || 'Medium',
      taskId: reminderData.taskId,
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleDismissReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Dismissed' } : r))
    );
  };

  // Handlers for Documents
  const handleAddDocument = async (newDoc: DocumentItem) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
      if (res.ok) {
        fetchDocuments(activeRole);
      } else {
        setDocuments((prev) => [newDoc, ...prev]);
      }
    } catch {
      setDocuments((prev) => [newDoc, ...prev]);
    }
  };

  const handleAskDocInChat = (prompt: string) => {
    setActiveTab('chat');
  };

  // Handlers for Integrations
  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    );
  };

  const handleUpdateIntegrationConfig = (id: string, config: any) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, config } : item))
    );
  };

  // Handlers for Workflows
  const handleToggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, isActive: !wf.isActive } : wf))
    );
  };

  const handleAddWorkflow = (newWf: WorkflowRule) => {
    setWorkflows((prev) => [newWf, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentTier={currentTier}
        openSubscriptionModal={() => setIsSubModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatAssistant
            activeRole={activeRole}
            documents={documents}
            tasks={tasks}
            reminders={reminders}
            onAddTask={handleAddTask}
            onAddReminder={handleAddReminder}
            onSelectDocument={(docId) => {
              setSelectedDocId(docId);
              setActiveTab('documents');
            }}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentVault
            documents={documents}
            activeRole={activeRole}
            onAddDocument={handleAddDocument}
            onAskDocInChat={handleAskDocInChat}
            selectedDocId={selectedDocId}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            reminders={reminders}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddReminder={handleAddReminder}
            onDismissReminder={handleDismissReminder}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsHub
            integrations={integrations}
            onToggleConnect={handleToggleIntegration}
            onUpdateConfig={handleUpdateIntegrationConfig}
          />
        )}

        {activeTab === 'automation' && (
          <JavaPolicyEngine
            activeRole={activeRole}
            workflows={workflows}
            onToggleWorkflow={handleToggleWorkflow}
            onAddWorkflow={handleAddWorkflow}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTiers
            currentTier={currentTier}
            onSelectTier={setCurrentTier}
            documentCount={documents.length}
            taskCount={tasks.length}
            integrationCount={integrations.filter((i) => i.connected).length}
          />
        )}
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        currentTier={currentTier}
        onSelectTier={setCurrentTier}
      />

    </div>
  );
}
