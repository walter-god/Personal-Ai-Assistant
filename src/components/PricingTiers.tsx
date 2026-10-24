import React, { useState } from 'react';
import { SubscriptionTierType, SubscriptionPlan } from '../types';
import { subscriptionPlans } from '../data/mockData';
import { Check, Sparkles, Shield, Zap, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface PricingTiersProps {
  currentTier: SubscriptionTierType;
  onSelectTier: (tier: SubscriptionTierType) => void;
  documentCount: number;
  taskCount: number;
  integrationCount: number;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({
  currentTier,
  onSelectTier,
  documentCount,
  taskCount,
  integrationCount,
}) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpgrade = (tier: SubscriptionTierType) => {
    onSelectTier(tier);
    setToastMessage(`Plan successfully updated to ${tier} Tier`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activePlanLimits = subscriptionPlans.find((p) => p.id === currentTier)?.limits;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Transparent, Value-Driven Revenue Tiers
        </h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Scale your personal intelligence from individual daily tasks to enterprise-grade Role-Based Access Control and Java policy automation.
        </p>

        {/* Monthly / Annual Segmented Control */}
        <div className="mt-6 inline-flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              !isAnnual ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isAnnual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-200">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Current Quota Consumption Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Active Tier Quota Allocation · {currentTier} Plan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live resource utilization against your active subscription threshold
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400">
            Billing Cycle: {isAnnual ? 'Annual (Renews Oct 2027)' : 'Monthly (Renews Nov 2026)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Permitted Docs Indexed</span>
              <span className="font-mono text-slate-200">
                {documentCount} / {activePlanLimits?.maxDocs === 'Unlimited' ? '∞' : activePlanLimits?.maxDocs}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    activePlanLimits?.maxDocs === 'Unlimited'
                      ? 25
                      : Math.min(100, (documentCount / (activePlanLimits?.maxDocs as number || 10)) * 100)
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Active Tasks & Reminders</span>
              <span className="font-mono text-slate-200">
                {taskCount} / {activePlanLimits?.maxTasks === 'Unlimited' ? '∞' : activePlanLimits?.maxTasks}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    activePlanLimits?.maxTasks === 'Unlimited'
                      ? 35
                      : Math.min(100, (taskCount / (activePlanLimits?.maxTasks as number || 5)) * 100)
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Connected Software Apps</span>
              <span className="font-mono text-slate-200">
                {integrationCount} / {activePlanLimits?.maxIntegrations === 'Unlimited' ? '∞' : activePlanLimits?.maxIntegrations}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{
                  width: `${
                    activePlanLimits?.maxIntegrations === 'Unlimited'
                      ? 60
                      : Math.min(100, (integrationCount / (activePlanLimits?.maxIntegrations as number || 1)) * 100)
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {subscriptionPlans.map((plan) => {
          const isCurrent = currentTier === plan.id;
          const price = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-slate-900 border-indigo-500/80 shadow-xl shadow-indigo-950/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      CURRENT PLAN
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px] mb-4">
                  {plan.tagline}
                </p>

                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ month</span>
                  </div>
                  {isAnnual && price > 0 && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-1">
                      Billed annually (${price * 12}/year)
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950'
                }`}
              >
                {isCurrent ? (
                  <span>Active Plan</span>
                ) : (
                  <>
                    <span>Switch to {plan.id}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 mb-4 font-mono uppercase tracking-wider">
          Enterprise Security & Feature Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-3 px-3">Capability</th>
                <th className="py-3 px-3">Starter</th>
                <th className="py-3 px-3">Pro</th>
                <th className="py-3 px-3">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-200">Permitted Document Vault</td>
                <td className="py-3 px-3">10 Documents</td>
                <td className="py-3 px-3 text-emerald-400">Unlimited</td>
                <td className="py-3 px-3 text-emerald-400">Unlimited (Air-Gapped)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-200">Role-Based Access Control (RBAC)</td>
                <td className="py-3 px-3">Level 2 (Member only)</td>
                <td className="py-3 px-3 text-emerald-400">4 Levels (Exec, Mgr, Member, Guest)</td>
                <td className="py-3 px-3 text-emerald-400">Custom ABAC & SAML Roles</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-200">Workflow Automation Engine</td>
                <td className="py-3 px-3 text-slate-500">Manual triggers only</td>
                <td className="py-3 px-3 text-emerald-400">Automated DAG Pipelines</td>
                <td className="py-3 px-3 text-emerald-400">Dedicated Virtual Threads Pool</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-200">Software Connectors</td>
                <td className="py-3 px-3">1 Connector</td>
                <td className="py-3 px-3 text-emerald-400">All 6 Standard Connectors</td>
                <td className="py-3 px-3 text-emerald-400">Unlimited + Custom Webhooks</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-200">Audit Log Retention</td>
                <td className="py-3 px-3">7 Days</td>
                <td className="py-3 px-3">30 Days</td>
                <td className="py-3 px-3 text-emerald-400">365 Days (SOC2 Compliant)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-slate-200">Response SLA Guarantee</td>
                <td className="py-3 px-3 text-slate-500">Best Effort</td>
                <td className="py-3 px-3">Standard Priority</td>
                <td className="py-3 px-3 text-emerald-400">99.99% Uptime (15m Pager SLA)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
