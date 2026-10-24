import React from 'react';
import { SubscriptionTierType } from '../types';
import { subscriptionPlans } from '../data/mockData';
import { X, Check, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTierType;
  onSelectTier: (tier: SubscriptionTierType) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Subscription & Revenue Tiers</h2>
              <p className="text-xs text-slate-400">Manage your intelligence clearance and quota allocation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => {
              const isCurrent = currentTier === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-slate-950 border-indigo-500 shadow-md shadow-indigo-950'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-100">{plan.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-bold text-white font-mono my-2 tabular-nums">
                      ${plan.priceMonthly}
                      <span className="text-[11px] text-slate-400 font-sans font-normal ml-1">/mo</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                      {plan.tagline}
                    </p>

                    <div className="space-y-1.5 text-[11px] text-slate-300 mb-4">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTier(plan.id);
                      onClose();
                    }}
                    disabled={isCurrent}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Encrypted billing with instant activation & prorated refunds</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
