import React from 'react';
import { ClearanceRole, SubscriptionTierType } from '../types';
import { ShieldCheck, ShieldAlert, Sparkles, ChevronDown, Check, Zap } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: ClearanceRole;
  setActiveRole: (role: ClearanceRole) => void;
  currentTier: SubscriptionTierType;
  openSubscriptionModal: () => void;
}

const roleDescriptions: Record<ClearanceRole, { label: string; clearance: number; desc: string; color: string }> = {
  EXECUTIVE: {
    label: 'Executive (Level 4)',
    clearance: 4,
    desc: 'Full access to Confidential M&A, Financial Budgets & Global Operations',
    color: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
  },
  MANAGER: {
    label: 'Lead / Manager (Level 3)',
    clearance: 3,
    desc: 'Access to Restricted Engineering Architecture & Team Policies',
    color: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
  },
  MEMBER: {
    label: 'Member / Analyst (Level 2)',
    clearance: 2,
    desc: 'Access to Internal Standard Docs, SLAs, Perks, and Tasks',
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
  },
  GUEST: {
    label: 'Guest / Contractor (Level 1)',
    clearance: 1,
    desc: 'Access limited to Public API Guides & Basic Documentation',
    color: 'text-slate-400 bg-slate-900/60 border-slate-700/60',
  },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  currentTier,
  openSubscriptionModal,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'chat', label: 'AI Assistant' },
    { id: 'documents', label: 'Permitted Docs' },
    { id: 'tasks', label: 'Tasks & Reminders' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'automation', label: 'Java Automation & RBAC' },
    { id: 'pricing', label: 'Plans & Revenue' },
  ];

  const currentRoleInfo = roleDescriptions[activeRole];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span 
            onClick={() => setActiveTab('chat')} 
            className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 cursor-pointer whitespace-nowrap transition-colors"
          >
            Aetherius <span className="text-xs font-normal text-indigo-400 font-mono tracking-normal ml-1">AI OS</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Security Clearance Switcher & Plan CTA */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Role Clearance Selector (RBAC Simulator) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${currentRoleInfo.color}`}
              title="Switch Active RBAC Security Clearance"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline font-mono">{activeRole}</span>
              <span className="sm:hidden font-mono text-[10px]">L{currentRoleInfo.clearance}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Spring Security RBAC Role
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Changes active principal clearance level
                  </p>
                </div>
                {(Object.keys(roleDescriptions) as ClearanceRole[]).map((role) => {
                  const info = roleDescriptions[role];
                  const isSelected = activeRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        setActiveRole(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
                        isSelected ? 'bg-indigo-950/60 text-white border border-indigo-800/50' : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{role}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            Level {info.clearance}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {info.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subscription Tier Pill */}
          <button
            onClick={openSubscriptionModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-colors whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentTier} Plan</span>
          </button>

          {/* User Profile Avatar */}
          <div className="relative group">
            <img
              src="/src/assets/images/user_avatar_1792842958909.jpg"
              alt="Walter Godliving"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-700 hover:border-indigo-400 transition-colors"
            />
          </div>

        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around gap-1 pt-2.5 mt-2 border-t border-slate-800/60 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2 py-1 text-[11px] font-medium rounded whitespace-nowrap ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
