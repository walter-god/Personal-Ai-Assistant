import React, { useState } from 'react';
import { ClearanceRole, WorkflowRule } from '../types';
import { 
  Terminal, ShieldCheck, ShieldAlert, Cpu, Play, CheckCircle2, 
  Workflow, Layers, Sparkles, RefreshCw, Plus, X, ArrowRight, Code2 
} from 'lucide-react';

interface JavaPolicyEngineProps {
  activeRole: ClearanceRole;
  workflows: WorkflowRule[];
  onToggleWorkflow: (id: string) => void;
  onAddWorkflow: (workflow: WorkflowRule) => void;
}

interface StepLog {
  name: string;
  status: string;
  durationMs: number;
  detail: string;
}

export const JavaPolicyEngine: React.FC<JavaPolicyEngineProps> = ({
  activeRole,
  workflows,
  onToggleWorkflow,
  onAddWorkflow,
}) => {
  const [selectedRule, setSelectedRule] = useState(
    "@PreAuthorize(\"hasRole('EXECUTIVE') and hasAuthority('docs:confidential')\")"
  );
  const [evaluationResult, setEvaluationResult] = useState<{
    permitted: boolean;
    reason: string;
    evaluatedAt: string;
  } | null>(null);

  const [executingWfId, setExecutingWfId] = useState<string | null>(null);
  const [executionTrace, setExecutionTrace] = useState<{
    id: string;
    wfName: string;
    status: string;
    durationMs: number;
    steps: StepLog[];
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Workflow State
  const [wfName, setWfName] = useState('');
  const [wfDesc, setWfDesc] = useState('');
  const [wfTrigger, setWfTrigger] = useState('TASK_CREATED (Priority == Urgent)');
  const [wfCondition, setWfCondition] = useState('hasRole("ROLE_MANAGER")');
  const [wfAction, setWfAction] = useState('SlackWebhook.dispatch(#alerts)');

  // Evaluate RBAC rule for current role
  const handleEvaluatePolicy = () => {
    const isExecutive = activeRole === 'EXECUTIVE';
    const isManager = activeRole === 'MANAGER' || isExecutive;

    let permitted = false;
    let reason = '';

    if (selectedRule.includes('EXECUTIVE')) {
      permitted = isExecutive;
      reason = isExecutive
        ? 'Principal holds authority ROLE_EXECUTIVE and token contains scope docs:confidential.'
        : `AccessDeniedException: Principal role '${activeRole}' lacks required authority 'ROLE_EXECUTIVE'.`;
    } else if (selectedRule.includes('MANAGER')) {
      permitted = isManager;
      reason = isManager
        ? `Principal role '${activeRole}' satisfies threshold requirement hasAnyRole('MANAGER', 'EXECUTIVE').`
        : `AccessDeniedException: Role '${activeRole}' fails authority threshold check.`;
    } else {
      permitted = true;
      reason = `Policy satisfied for principal role '${activeRole}'.`;
    }

    setEvaluationResult({
      permitted,
      reason,
      evaluatedAt: new Date().toLocaleTimeString(),
    });
  };

  const handleExecuteWorkflow = async (wf: WorkflowRule) => {
    setExecutingWfId(wf.id);

    try {
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: wf.id }),
      });

      const data = await response.json();

      setExecutionTrace({
        id: data.executionId,
        wfName: wf.name,
        status: data.status,
        durationMs: data.totalDurationMs,
        steps: data.steps,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingWfId(null);
    }
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfName.trim()) return;

    const newWf: WorkflowRule = {
      id: `wf-${Date.now()}`,
      name: wfName.trim(),
      description: wfDesc.trim(),
      triggerEvent: wfTrigger,
      securityCondition: wfCondition,
      actionOutput: wfAction,
      isActive: true,
      lastRun: 'Never',
      executionCount: 0,
    };

    onAddWorkflow(newWf);
    setIsCreateModalOpen(false);
    setWfName('');
    setWfDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Java Security & Workflow Automation Engine</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono font-normal border border-indigo-800/40">
              Spring Boot 3.3 · Java 21 LTS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Method-level RBAC policy evaluation (@PreAuthorize), stateless JWT verification, and virtual-thread DAG pipeline execution.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workflow Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Spring Security Token & Policy Inspector */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Spring Security Context</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                JWT Claims
              </span>
            </div>

            {/* Principal Token View */}
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 mb-4">
              <div><span className="text-slate-500">principal:</span> "walter.godliving"</div>
              <div><span className="text-slate-500">activeRole:</span> <span className="text-indigo-400 font-bold">"ROLE_{activeRole}"</span></div>
              <div>
                <span className="text-slate-500">authorities:</span> [
                <span className="text-emerald-400">"docs:read"</span>,{' '}
                <span className="text-emerald-400">"tasks:manage"</span>
                {activeRole === 'EXECUTIVE' && <span className="text-amber-400">, "docs:confidential", "m&a:review"</span>}
                {activeRole === 'MANAGER' && <span className="text-sky-400">, "docs:architecture", "team:lead"</span>}
                ]
              </div>
              <div><span className="text-slate-500">tokenType:</span> "Bearer RS256"</div>
            </div>

            {/* Policy Tester */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Test @PreAuthorize Expression:
              </label>
              <select
                value={selectedRule}
                onChange={(e) => {
                  setSelectedRule(e.target.value);
                  setEvaluationResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-indigo-500"
              >
                <option value="@PreAuthorize(&quot;hasRole('EXECUTIVE') and hasAuthority('docs:confidential')&quot;)">
                  @PreAuthorize("hasRole('EXECUTIVE') and hasAuthority('docs:confidential')")
                </option>
                <option value="@PreAuthorize(&quot;hasAnyRole('MANAGER', 'EXECUTIVE')&quot;)">
                  @PreAuthorize("hasAnyRole('MANAGER', 'EXECUTIVE')")
                </option>
                <option value="@PreAuthorize(&quot;hasAuthority('docs:read')&quot;)">
                  @PreAuthorize("hasAuthority('docs:read')")
                </option>
              </select>

              <button
                onClick={handleEvaluatePolicy}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Evaluate Access Decision</span>
              </button>
            </div>
          </div>

          {/* Evaluation Result */}
          {evaluationResult && (
            <div className={`mt-4 p-3 rounded-lg border text-xs font-mono ${
              evaluationResult.permitted
                ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/50 border-red-800/60 text-red-300'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {evaluationResult.permitted ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>AUTHORIZATION_GRANTED (HTTP 200)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>ACCESS_DENIED (HTTP 403 Forbidden)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300 font-sans mt-1">
                {evaluationResult.reason}
              </p>
              <div className="text-[10px] text-slate-500 text-right mt-1">
                Evaluated at {evaluationResult.evaluatedAt}
              </div>
            </div>
          )}
        </div>

        {/* Right Columns: Workflow Pipeline Rules */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                <span>Configured Workflow DAG Pipelines</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated event triggers evaluated by Project Loom virtual worker threads
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {workflows.map((wf) => {
              const isExecuting = executingWfId === wf.id;

              return (
                <div
                  key={wf.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-100">{wf.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                        {wf.executionCount} Runs
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExecuteWorkflow(wf)}
                        disabled={isExecuting}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Play className={`w-3 h-3 ${isExecuting ? 'animate-spin' : ''}`} />
                        <span>{isExecuting ? 'Executing...' : 'Run Now'}</span>
                      </button>

                      <button
                        onClick={() => onToggleWorkflow(wf.id)}
                        className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
                          wf.isActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {wf.isActive ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {wf.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">TRIGGER:</span>
                      <span className="text-indigo-300 truncate block">{wf.triggerEvent}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CONDITION:</span>
                      <span className="text-amber-300 truncate block">{wf.securityCondition}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ACTION:</span>
                      <span className="text-emerald-300 truncate block">{wf.actionOutput}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Execution Trace Canvas (If executed) */}
      {executionTrace && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100">
                  Execution Trace: {executionTrace.wfName}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                  STATUS: {executionTrace.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Pipeline finished in {executionTrace.durationMs}ms across 4 worker stages
              </p>
            </div>
            <button
              onClick={() => setExecutionTrace(null)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Close Trace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {executionTrace.steps.map((step, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-indigo-400">Stage 0{idx + 1}</span>
                  <span className="text-slate-400 tabular-nums">{step.durationMs}ms</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{step.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug font-mono">
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Create Workflow Automation</h2>
                <p className="text-xs text-slate-400 mt-0.5">Define automated pipeline with Java security constraints</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Workflow Title</label>
                <input
                  type="text"
                  required
                  value={wfName}
                  onChange={(e) => setWfName(e.target.value)}
                  placeholder="e.g. Automated M&A Risk Alert Pipeline"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={wfDesc}
                  onChange={(e) => setWfDesc(e.target.value)}
                  placeholder="What business rule does this automate?"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Trigger Event</label>
                <input
                  type="text"
                  required
                  value={wfTrigger}
                  onChange={(e) => setWfTrigger(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Security / Policy Condition</label>
                <input
                  type="text"
                  required
                  value={wfCondition}
                  onChange={(e) => setWfCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Action Output</label>
                <input
                  type="text"
                  required
                  value={wfAction}
                  onChange={(e) => setWfAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Deploy Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
