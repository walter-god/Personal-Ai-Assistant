import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client with required User-Agent header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initial Permitted Documents
interface DocumentItem {
  id: string;
  title: string;
  category: 'Financial' | 'Engineering' | 'HR & Policy' | 'Operations' | 'Strategy';
  clearanceLevel: 'EXECUTIVE' | 'MANAGER' | 'MEMBER' | 'GUEST';
  classification: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
  summary: string;
  content: string;
  author: string;
  updatedAt: string;
  tags: string[];
}

const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-001',
    title: 'Q3 Financial & M&A Expansion Strategy',
    category: 'Financial',
    clearanceLevel: 'EXECUTIVE',
    classification: 'Confidential',
    summary: 'Executive budget allocation of $14.2M for European market entry and acquisition targets in AI developer tooling.',
    content: `CONFIDENTIAL - EXECUTIVE CLEARANCE ONLY
Subject: Q3 Fiscal Review & Strategic Acquisition Pipeline
Author: CFO Office & Corporate Development

1. Financial Allocations:
- Total Q3 Strategic Fund: $14,200,000 USD
- Target Allocation: $8.5M allocated for acquisition of 'ApexCode Systems' (Munich-based static analysis engine).
- European expansion budget: $3.2M designated for London & Frankfurt data centers.
- Contingency & Reserve: $2.5M.

2. Confidential M&A Milestones:
- Due Diligence Phase 2 completion deadline: November 15, 2026.
- Key Risk Factors: Currency volatility against EUR/GBP and cross-border regulatory antitrust review.
- Signing Target: Q4 Closing expected December 10, 2026.`,
    author: 'Eleanor Vance (CFO)',
    updatedAt: '2026-10-18',
    tags: ['M&A', 'Budget', 'Finance', 'ApexCode', 'Expansion'],
  },
  {
    id: 'doc-002',
    title: 'Java Microservices Core Architecture v3.4',
    category: 'Engineering',
    clearanceLevel: 'MANAGER',
    classification: 'Restricted',
    summary: 'Spring Boot 3.3 microservices topology, Kafka event streaming, RBAC token verification, and 99.99% SLA targets.',
    content: `ENGINEERING SPECIFICATION - MANAGER & LEAD CLEARANCE
Title: Core Microservices & Security Token Architecture
Author: Principal Platform Architect

1. Technology Stack:
- Java 21 LTS runtime with Spring Boot 3.3.4
- Spring Security with Stateless JWT verification & Method-level RBAC (@PreAuthorize)
- Event Bus: Apache Kafka with Avro schema registry
- Persistence: PostgreSQL 16 with Read Replicas & Redis caching layer

2. Service Boundaries:
- 'auth-service': Issues signed RSA-256 JWT tokens containing role claims (ROLE_EXECUTIVE, ROLE_MANAGER, ROLE_MEMBER, ROLE_GUEST).
- 'document-vault-service': Enforces document clearance validation before streaming payload contents.
- 'workflow-engine-service': Async DAG execution pipeline powered by Java Virtual Threads (Project Loom) for high-concurrency tasks.
- 'integration-bridge-service': Webhook dispatchers with exponential backoff and circuit-breaker patterns (Resilience4j).`,
    author: 'Dr. Marcus Vance (VP Platform)',
    updatedAt: '2026-10-20',
    tags: ['Java', 'Spring Boot', 'Architecture', 'Kafka', 'Security'],
  },
  {
    id: 'doc-003',
    title: 'Employee Remote Work, Wellness Perks & Travel Guidelines',
    category: 'HR & Policy',
    clearanceLevel: 'MEMBER',
    classification: 'Internal',
    summary: 'Comprehensive company guide covering home office stipends ($1,200/yr), health insurance, flexible hours, and travel reimbursement.',
    content: `INTERNAL EMPLOYEE HANDBOOK
Subject: Remote Work, Wellness Stipends & Travel Policy
Audience: All Full-Time & Contract Team Members

1. Remote Office Allowance:
- Annual ergonomic and hardware stipend: $1,200 USD reimbursable via Expensify.
- High-speed internet subsidy: Up to $80/month.

2. Wellness & Mental Health Perks:
- $100/month wellness credit (gym, meditation apps, fitness equipment).
- 5 Company-wide recharge wellness Fridays per calendar year.

3. Core Working Hours & Asynchronous Norms:
- Core collaborative window: 10:00 AM - 3:00 PM local timezone.
- Slack notification quiet hours encouraged between 7:00 PM and 8:00 AM.
- Travel policy: Domestic flights under 4 hours standard economy; flights over 6 hours eligible for Premium Economy upgrade with manager sign-off.`,
    author: 'Sofia Alvarez (Head of People)',
    updatedAt: '2026-10-12',
    tags: ['HR', 'Perks', 'Remote Work', 'Stipends', 'Wellness'],
  },
  {
    id: 'doc-004',
    title: 'Customer Escalation & Incident Management SLA Matrix',
    category: 'Operations',
    clearanceLevel: 'MEMBER',
    classification: 'Internal',
    summary: 'Incident severity tiers P1 through P4, on-call paging rotations, escalation trees, and post-mortem review requirements.',
    content: `OPERATIONS & SUPPORT PROTOCOL
Document: Incident Severity & Response Times
Classification: Internal Standard

1. Incident Classification:
- Severity 1 (Critical Outage): Core service down, data corruption risk. Response time < 15 minutes. PagerDuty auto-escalation to VP Engineering after 30 min.
- Severity 2 (Major Impairment): Key integration offline, significant performance degradation. Response time < 45 minutes.
- Severity 3 (Minor Bug): Functional workaround exists. Response time < 4 hours.
- Severity 4 (General Question/Enhancement): Standard ticket queue. Response time < 24 hours.

2. Post-Mortem Requirements:
- Blameless post-mortem document mandatory within 72 hours for all Sev-1 and Sev-2 incidents.
- Root cause analysis (RCA) must be published to team wiki.`,
    author: 'James Sterling (Director of DevOps)',
    updatedAt: '2026-10-15',
    tags: ['Operations', 'SLA', 'Support', 'Incidents', 'DevOps'],
  },
  {
    id: 'doc-005',
    title: 'Q4 Product Roadmap & Strategic OKRs',
    category: 'Strategy',
    clearanceLevel: 'MEMBER',
    classification: 'Internal',
    summary: 'Quarterly objectives focused on AI Assistant document permissions, enterprise Zapier/Slack connectors, and SOC2 Type II certification.',
    content: `COMPANY OBJECTIVES & KEY RESULTS (OKRs) - Q4
Target Period: October - December 2026

Objective 1: Launch Enterprise-Grade Personal AI Assistant
- KR 1.1: Sub-second semantic search across 50,000+ indexed company documents.
- KR 1.2: Zero permission leakages verified through automated penetration testing suite.
- KR 1.3: 40% reduction in internal support ticket resolution time.

Objective 2: Scale Workflow Integrations
- KR 2.1: Ship native bidirectional connectors for Google Workspace, Slack, Jira, GitHub, and Notion.
- KR 2.2: Reach 99.95% webhook delivery success rate.

Objective 3: Enterprise Compliance Readiness
- KR 3.1: Complete SOC2 Type II audit readiness review.
- KR 3.2: Implement audit logging pipeline for all AI prompt-to-document interactions.`,
    author: 'Elena Gomez (VP Product)',
    updatedAt: '2026-10-22',
    tags: ['Roadmap', 'OKRs', 'Product', 'Milestones', 'AI'],
  },
  {
    id: 'doc-006',
    title: 'Public API Documentation & Rate Limiting Overview',
    category: 'Engineering',
    clearanceLevel: 'GUEST',
    classification: 'Public',
    summary: 'Public developer documentation outlining REST API authentication, pagination, rate limits, and webhook event payloads.',
    content: `PUBLIC DEVELOPER GUIDE
Title: Aetherius Platform Public REST API
Access: Open to all registered developers and guests

1. Authentication:
- Bearer API Token in Authorization header: 'Authorization: Bearer <API_KEY>'

2. Rate Limits:
- Free / Guest tier: 60 requests per minute
- Pro tier: 600 requests per minute
- Enterprise tier: Custom dedicated throughput with burst allowance

3. Webhook Events:
- 'task.created', 'task.completed', 'reminder.triggered', 'workflow.finished'`,
    author: 'Developer Relations Team',
    updatedAt: '2026-10-05',
    tags: ['API', 'Documentation', 'Public', 'Webhooks', 'Developers'],
  },
];

let documentsStore: DocumentItem[] = [...initialDocuments];

// Role Clearance Hierarchy mapping
const roleLevelHierarchy: Record<string, number> = {
  GUEST: 1,
  MEMBER: 2,
  MANAGER: 3,
  EXECUTIVE: 4,
};

function hasClearance(userRole: string, docClearance: string): boolean {
  const userRank = roleLevelHierarchy[userRole] || 1;
  const docRank = roleLevelHierarchy[docClearance] || 1;
  return userRank >= docRank;
}

// 1. API: List Documents with clearance check
app.get('/api/documents', (req, res) => {
  const userRole = (req.query.role as string) || 'MEMBER';
  const roleRank = roleLevelHierarchy[userRole] || 2;

  const result = documentsStore.map((doc) => {
    const isPermitted = hasClearance(userRole, doc.clearanceLevel);
    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      clearanceLevel: doc.clearanceLevel,
      classification: doc.classification,
      summary: doc.summary,
      author: doc.author,
      updatedAt: doc.updatedAt,
      tags: doc.tags,
      isPermitted,
      // If not permitted, redact full content
      content: isPermitted ? doc.content : '[REDACTED: Requires ' + doc.clearanceLevel + ' Clearance]',
    };
  });

  res.json({ documents: result, activeRole: userRole, total: result.length });
});

// 2. API: Search Documents
app.post('/api/documents/search', (req, res) => {
  const { query, role = 'MEMBER', category } = req.body;
  const q = (query || '').toLowerCase().trim();

  const filtered = documentsStore.filter((doc) => {
    if (category && category !== 'All' && doc.category !== category) return false;
    if (!q) return true;
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q)) ||
      (hasClearance(role, doc.clearanceLevel) && doc.content.toLowerCase().includes(q))
    );
  });

  const processed = filtered.map((doc) => {
    const isPermitted = hasClearance(role, doc.clearanceLevel);
    return {
      ...doc,
      isPermitted,
      content: isPermitted ? doc.content : '[CONTENT CLASSIFIED - Access Denied for ' + role + ']',
    };
  });

  res.json({ results: processed, query: q, activeRole: role });
});

// 3. API: Add Custom Document
app.post('/api/documents', (req, res) => {
  const { title, category, clearanceLevel, classification, summary, content, author, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    title,
    category: category || 'Operations',
    clearanceLevel: clearanceLevel || 'MEMBER',
    classification: classification || 'Internal',
    summary: summary || title,
    content,
    author: author || 'Current User',
    updatedAt: new Date().toISOString().split('T')[0],
    tags: tags || ['Custom'],
  };

  documentsStore.unshift(newDoc);
  res.status(201).json({ success: true, document: newDoc });
});

// 4. API: Assistant Chat (Server-side Gemini Integration)
app.post('/api/chat', async (req, res) => {
  const { message, history = [], userRole = 'MEMBER', activeTasks = [], activeReminders = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Filter accessible documents for the current user role
  const accessibleDocs = documentsStore.filter((doc) => hasClearance(userRole, doc.clearanceLevel));
  const classifiedDeniedDocs = documentsStore.filter((doc) => !hasClearance(userRole, doc.clearanceLevel));

  // Construct grounding document context
  const docKnowledgeBase = accessibleDocs
    .map(
      (d) =>
        `[DOCUMENT ID: ${d.id}]
Title: ${d.title}
Clearance: ${d.clearanceLevel} | Classification: ${d.classification} | Category: ${d.category}
Author: ${d.author} | Updated: ${d.updatedAt}
Content Excerpt:
${d.content}
`
    )
    .join('\n---\n');

  const deniedDocTitles = classifiedDeniedDocs.map((d) => `"${d.title}" (${d.clearanceLevel} required)`).join(', ');

  const taskContext = activeTasks.length > 0
    ? activeTasks.map((t: any) => `- [${t.priority}] ${t.title} (Status: ${t.status}, Due: ${t.dueDate || 'No date'})`).join('\n')
    : 'No active tasks recorded yet.';

  const reminderContext = activeReminders.length > 0
    ? activeReminders.map((r: any) => `- Reminder: "${r.title}" at ${r.time} (${r.status})`).join('\n')
    : 'No pending reminders.';

  const systemInstruction = `You are "Aetherius", an executive-grade Personal AI Assistant and workflow automation intelligence.
You serve the current authenticated user who holds the clearance role: "${userRole}".

CRITICAL PERMISSION & GROUNDING RULES:
1. SECURITY & ACCESS CONTROL:
- You ONLY have permission to disclose, summarize, or quote information from documents in the PERMITTED REPOSITORY below.
- If the user asks about topics or documents requiring a higher clearance level than "${userRole}" (e.g. Executive M&A budgets or confidential numbers when user is not EXECUTIVE):
  - You MUST strictly refuse to disclose the confidential details.
  - State clearly that access is restricted by enterprise Role-Based Access Control (RBAC). Mention which clearance level is required (e.g., EXECUTIVE).
  - List denied documents if relevant: ${deniedDocTitles || 'None'}.
- When answering from permitted documents, cite the document title cleanly (e.g., [Source: Employee Remote Work Handbook]).

2. MULTI-CAPABILITY ASSISTANCE:
- You manage tasks, reminders, document search, and workflow automation.
- If the user asks you to create or remember a task (e.g., "Remind me tomorrow to review...", "Create a task for..."), acknowledge it and return an action directive in your JSON structure if appropriate.

3. CONVERSATIONAL TONE:
- Professional, concise, articulate, and direct. Avoid unnecessary preamble. Use clean formatting with bullet points.
- Respond in natural English.

PERMITTED DOCUMENTS FOR ROLE "${userRole}":
${docKnowledgeBase}

ACTIVE USER TASKS:
${taskContext}

ACTIVE REMINDERS:
${reminderContext}`;

  // If Gemini API is configured, use real gemini-3.8-flash model
  if (ai) {
    try {
      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add recent message history (up to last 6 messages)
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.role === 'user' || h.role === 'model' || h.role === 'assistant') {
            contents.push({
              role: h.role === 'assistant' ? 'model' : h.role,
              parts: [{ text: h.content || h.text || '' }],
            });
          }
        }
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      // Call Gemini 3.8 Flash with a safety timeout race
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 7000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const assistantReply = response.text || "I've processed your request.";

      // Detect if user intent implies a task or reminder creation
      let extractedTask: any = null;
      let extractedReminder: any = null;

      const lower = message.toLowerCase();
      if (lower.includes('task') || lower.includes('todo') || lower.includes('action item') || lower.includes('assign')) {
        extractedTask = {
          title: message.replace(/create\s+(a\s+)?task\s+(to|for)?/i, '').replace(/add\s+task\s+/i, '').trim() || 'Follow up on request',
          priority: lower.includes('urgent') || lower.includes('critical') ? 'Urgent' : lower.includes('high') ? 'High' : 'Medium',
          category: 'Operations',
        };
      }

      if (lower.includes('remind me') || lower.includes('reminder') || lower.includes('set reminder')) {
        extractedReminder = {
          title: message.replace(/remind\s+me\s+(to|about)?/i, '').trim() || 'Scheduled reminder',
          time: 'Today 17:00',
        };
      }

      return res.json({
        reply: assistantReply,
        userRole,
        permittedDocsCount: accessibleDocs.length,
        deniedDocsCount: classifiedDeniedDocs.length,
        extractedTask,
        extractedReminder,
      });
    } catch (err: any) {
      console.error('Gemini API call error:', err);
      // Fallback response with RBAC enforcement intact if API throws
      return res.json({
        reply: generateLocalAssistantResponse(message, userRole, accessibleDocs, classifiedDeniedDocs),
        userRole,
        permittedDocsCount: accessibleDocs.length,
        deniedDocsCount: classifiedDeniedDocs.length,
        fallback: true,
      });
    }
  } else {
    // If no API key is present in environment, provide local deterministic intelligence
    const reply = generateLocalAssistantResponse(message, userRole, accessibleDocs, classifiedDeniedDocs);
    return res.json({
      reply,
      userRole,
      permittedDocsCount: accessibleDocs.length,
      deniedDocsCount: classifiedDeniedDocs.length,
      simulated: true,
    });
  }
});

// Fallback intelligence engine when offline or no API key
function generateLocalAssistantResponse(
  message: string,
  userRole: string,
  accessibleDocs: DocumentItem[],
  deniedDocs: DocumentItem[]
): string {
  const q = message.toLowerCase();

  // Check if user is asking about confidential M&A or budget
  if (q.includes('m&a') || q.includes('acquisition') || q.includes('budget') || q.includes('14.2m') || q.includes('apexcode') || q.includes('q3 financial')) {
    const hasAccess = hasClearance(userRole, 'EXECUTIVE');
    if (!hasAccess) {
      return `### Security Notice: Access Denied
The document **"Q3 Financial & M&A Expansion Strategy"** requires **EXECUTIVE** clearance.
- **Your Current Role:** ${userRole}
- **Security Check:** Failed policy evaluatePreAuthorize("@hasRole('ROLE_EXECUTIVE')")
- **Action Required:** Request temporary security elevation from the Chief Information Security Officer or switch clearance in the top navigation.`;
    } else {
      const doc = accessibleDocs.find((d) => d.id === 'doc-001');
      return `### Q3 Financial & Strategic M&A Summary
[Source: Q3 Financial & M&A Expansion Strategy - EXECUTIVE CLEARANCE]

- **Total Allocation:** $14,200,000 USD
- **Primary Acquisition Target:** $8.5M allocated for 'ApexCode Systems' (Munich-based static code analysis engine).
- **Infrastructure Expansion:** $3.2M dedicated for London & Frankfurt data centers.
- **Contingency Reserve:** $2.5M
- **Due Diligence Deadline:** November 15, 2026, with signing target December 10, 2026.`;
    }
  }

  // Check if asking about remote work / perks / benefits
  if (q.includes('remote') || q.includes('stipend') || q.includes('wellness') || q.includes('perk') || q.includes('benefits') || q.includes('reimburse') || q.includes('travel')) {
    return `### Employee Remote Work & Wellness Benefits
[Source: Employee Remote Work, Wellness Perks & Travel Guidelines - Internal]

- **Home Office Hardware Stipend:** $1,200/year reimbursable for ergonomic furniture and equipment.
- **High-Speed Internet Subsidy:** Up to $80/month.
- **Wellness Credit:** $100/month for gym memberships, fitness, and meditation applications.
- **Wellness Fridays:** 5 company-wide recharge Fridays per year.
- **Core Collaboration Hours:** 10:00 AM – 3:00 PM local time.
- **Travel Policy:** Flights over 6 hours are eligible for Premium Economy upgrades.`;
  }

  // Check if asking about architecture / microservices
  if (q.includes('architecture') || q.includes('java') || q.includes('microservice') || q.includes('kafka') || q.includes('spring')) {
    const hasAccess = hasClearance(userRole, 'MANAGER');
    if (!hasAccess) {
      return `### Security Notice: Access Denied
The document **"Java Microservices Core Architecture v3.4"** requires **MANAGER** or **EXECUTIVE** clearance.
- **Your Current Role:** ${userRole}
- **Security Check:** Failed method-level authority check for \`ROLE_MANAGER\`
- **Resolution:** Elevate role to Manager or Executive to review system architecture blueprints.`;
    } else {
      return `### Java Microservices Core Architecture v3.4
[Source: Java Microservices Core Architecture v3.4 - Restricted]

- **Runtime:** Java 21 LTS with Spring Boot 3.3.4
- **Security:** Spring Security stateless JWT with method-level RBAC (\`@PreAuthorize\`)
- **Event Bus:** Apache Kafka with Avro schema registry
- **Core Services:**
  1. \`auth-service\`: Signs RSA-256 JWT tokens with role claims.
  2. \`document-vault-service\`: Real-time permission gatekeeper.
  3. \`workflow-engine-service\`: Async DAG pipeline using Java Virtual Threads (Project Loom).
  4. \`integration-bridge-service\`: Webhook dispatchers with Resilience4j circuit breakers.`;
    }
  }

  // Check if asking about SLAs / support / incidents
  if (q.includes('sla') || q.includes('incident') || q.includes('support') || q.includes('severity') || q.includes('pagerduty')) {
    return `### Incident Management & Support SLA Matrix
[Source: Customer Escalation & Incident Management SLA Matrix]

- **Severity 1 (Critical Outage):** Core service down. Response SLA: **< 15 minutes**. Auto-escalates to VP Engineering after 30 minutes.
- **Severity 2 (Major Impairment):** Key integration down. Response SLA: **< 45 minutes**.
- **Severity 3 (Minor Bug):** Workaround exists. Response SLA: **< 4 hours**.
- **Severity 4 (General Inquiry):** Standard queue. Response SLA: **< 24 hours**.
- **Post-Mortem Requirement:** Blameless review within 72 hours for Sev-1 & Sev-2.`;
  }

  // Check if asking about roadmap or OKRs
  if (q.includes('roadmap') || q.includes('okr') || q.includes('goals') || q.includes('q4')) {
    return `### Q4 Strategic Objectives & Key Results
[Source: Q4 Product Roadmap & Strategic OKRs]

1. **Enterprise AI Assistant:** Sub-second semantic search, zero permission leaks, and 40% faster internal ticket resolution.
2. **Workflow Integrations:** Native bidirectional connectors for Google Workspace, Slack, Jira, GitHub, and Notion with 99.95% delivery rate.
3. **Enterprise Compliance:** Complete SOC2 Type II audit readiness and full prompt-to-document audit logging.`;
  }

  // Default helpful response
  return `I have indexed **${accessibleDocs.length} permitted documents** matching your clearance level (**${userRole}**).

Here are key areas I can assist you with right now:
- **Document Inquiries:** Query company policies, technical specs, financial summaries, or support SLAs.
- **Task Management:** Create, prioritize, and track action items with due dates.
- **Automated Workflows:** Trigger cross-app synchronization (Slack, GitHub, Google Calendar, Jira).
- **Reminders:** Schedule intelligent alerts for deadlines and review meetings.

What would you like me to look into?`;
}

// 5. API: Workflow Automation Execution Simulator
app.post('/api/workflows/execute', (req, res) => {
  const { workflowId, trigger = 'MANUAL' } = req.body;

  const steps = [
    { name: 'Spring Security Context Validation', status: 'SUCCESS', durationMs: 14, detail: 'Principal token validated with active claims' },
    { name: 'Document Vault Policy Evaluation', status: 'SUCCESS', durationMs: 28, detail: 'Document access permissions verified across all nodes' },
    { name: 'Virtual Thread Worker Pool Dispatch', status: 'SUCCESS', durationMs: 42, detail: 'Loom fiber allocated; non-blocking I/O execution' },
    { name: 'Webhook Event Broadcast', status: 'SUCCESS', durationMs: 65, detail: 'Payload dispatched to configured integrations (HTTP 200 OK)' },
  ];

  res.json({
    workflowId,
    trigger,
    executionId: `exec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'COMPLETED',
    totalDurationMs: 149,
    steps,
  });
});

// 6. API: Integration Webhook Dispatcher
app.post('/api/integrations/dispatch', (req, res) => {
  const { service, eventType, payload } = req.body;

  res.json({
    success: true,
    service,
    eventType,
    deliveryId: `del-${Date.now()}`,
    status: 'DELIVERED',
    latencyMs: Math.floor(Math.random() * 40) + 15,
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite middleware in development mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aetherius Personal AI Assistant server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
