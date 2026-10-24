export type ClearanceRole = 'EXECUTIVE' | 'MANAGER' | 'MEMBER' | 'GUEST';

export type DocumentCategory = 'Financial' | 'Engineering' | 'HR & Policy' | 'Operations' | 'Strategy';

export type DocumentClassification = 'Confidential' | 'Restricted' | 'Internal' | 'Public';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  clearanceLevel: ClearanceRole;
  classification: DocumentClassification;
  summary: string;
  content: string;
  author: string;
  updatedAt: string;
  tags: string[];
  isPermitted?: boolean;
}

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  dueDate: string;
  assignedBy?: string;
  reminderScheduled?: boolean;
  reminderTime?: string;
}

export interface ReminderItem {
  id: string;
  taskId?: string;
  title: string;
  time: string;
  date: string;
  status: 'Active' | 'Dismissed' | 'Snoozed';
  priority: TaskPriority;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  service: 'google' | 'slack' | 'github' | 'notion' | 'jira' | 'webhook';
  description: string;
  iconName: string;
  connected: boolean;
  syncFrequency: string;
  lastSynced: string;
  activeWorkflows: number;
  config: {
    targetChannel?: string;
    repoName?: string;
    endpointUrl?: string;
    calendarId?: string;
  };
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  securityCondition: string;
  actionOutput: string;
  isActive: boolean;
  lastRun?: string;
  executionCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
  securityNotice?: {
    isBlocked?: boolean;
    requiredClearance?: ClearanceRole;
    reason?: string;
  };
  suggestedAction?: {
    type: 'task' | 'reminder' | 'workflow';
    data: any;
  };
}

export type SubscriptionTierType = 'Starter' | 'Pro' | 'Enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTierType;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  badge?: string;
  features: string[];
  limits: {
    maxDocs: number | 'Unlimited';
    maxTasks: number | 'Unlimited';
    maxIntegrations: number | 'Unlimited';
    aiReasoningTier: string;
    rbacLevel: string;
    auditLogRetentionDays: number;
  };
}
