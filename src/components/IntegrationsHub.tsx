import React, { useState } from 'react';
import { IntegrationConnector } from '../types';
import { 
  Zap, Calendar, MessageSquare, GitBranch, BookOpen, CheckSquare, 
  ExternalLink, CheckCircle2, RefreshCw, Settings, Sliders, X, Shield 
} from 'lucide-react';

interface IntegrationsHubProps {
  integrations: IntegrationConnector[];
  onToggleConnect: (id: string) => void;
  onUpdateConfig: (id: string, config: any) => void;
}

interface DispatchedEventLog {
  id: string;
  service: string;
  event: string;
  status: 'DELIVERED' | 'PENDING' | 'RETRY';
  latencyMs: number;
  timestamp: string;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  integrations,
  onToggleConnect,
  onUpdateConfig,
}) => {
  const [configuringItem, setConfiguringItem] = useState<IntegrationConnector | null>(null);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<DispatchedEventLog[]>([
    {
      id: 'evt-901',
      service: 'Google Workspace',
      event: 'CALENDAR_EVENT_SCHEDULED (Focus Block: ApexCode Due Diligence)',
      status: 'DELIVERED',
      latencyMs: 34,
      timestamp: '4 mins ago',
    },
    {
      id: 'evt-902',
      service: 'Slack Enterprise',
      event: 'DISPATCH_ALERT (#executive-briefings: Q3 M&A Summary)',
      status: 'DELIVERED',
      latencyMs: 22,
      timestamp: '18 mins ago',
    },
    {
      id: 'evt-903',
      service: 'Custom Webhooks',
      event: 'HMAC_SHA256_POST (task.created -> Zapier Flow)',
      status: 'DELIVERED',
      latencyMs: 41,
      timestamp: '1 hour ago',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'google':
        return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'slack':
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'github':
        return <GitBranch className="w-5 h-5 text-violet-400" />;
      case 'notion':
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'jira':
        return <CheckSquare className="w-5 h-5 text-blue-400" />;
      default:
        return <Zap className="w-5 h-5 text-rose-400" />;
    }
  };

  const handleTestDispatch = async (connector: IntegrationConnector) => {
    setIsSyncingId(connector.id);

    try {
      const response = await fetch('/api/integrations/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: connector.name,
          eventType: 'PING_HEALTHCHECK',
          payload: { timestamp: new Date().toISOString() },
        }),
      });

      const data = await response.json();

      const newLog: DispatchedEventLog = {
        id: data.deliveryId || `del-${Date.now()}`,
        service: connector.name,
        event: 'OUTBOUND_DISPATCH (Test Payload 200 OK)',
        status: 'DELIVERED',
        latencyMs: data.latencyMs || 28,
        timestamp: 'Just now',
      };

      setEventLogs((prev) => [newLog, ...prev.slice(0, 7)]);
      setToastMessage(`${connector.name} synced successfully (${data.latencyMs || 28}ms)`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingId(null);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Connected Software & Integrations</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
              Active Connectors
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bridge your Personal AI Assistant with your daily productivity suite, enterprise issue trackers, and webhook pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>End-to-End TLS & HMAC SHA-256 Signed</span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {integrations.map((item) => {
          const isSyncing = isSyncingId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                item.connected
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getServiceIcon(item.service)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{item.name}</h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.syncFrequency}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleConnect(item.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.connected ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        item.connected ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500 font-mono">
                  {item.connected ? `Synced ${item.lastSynced}` : 'Disconnected'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfiguringItem(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                    title="Configure Connector Parameters"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {item.connected && (
                    <button
                      onClick={() => handleTestDispatch(item)}
                      disabled={isSyncing}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Testing...' : 'Test Sync'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatched Event Stream (Live Telemetry) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Real-Time Integration Event Ledger</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Live Audit
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Outbound webhook dispatches and event broadcasts to connected software
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Delivery ID</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Event Dispatched</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {eventLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 text-indigo-400">{log.id}</td>
                  <td className="py-2.5 px-3 text-slate-200">{log.service}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">{log.event}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-400">{log.latencyMs}ms</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Connector Modal */}
      {configuringItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Configure {configuringItem.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Edit channel, target repository or webhook endpoint</p>
              </div>
              <button
                onClick={() => setConfiguringItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Target Endpoint or Resource</label>
                <input
                  type="text"
                  defaultValue={
                    configuringItem.config.targetChannel ||
                    configuringItem.config.repoName ||
                    configuringItem.config.endpointUrl ||
                    configuringItem.config.calendarId ||
                    '#general'
                  }
                  id="targetConfigInput"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Sync Cadence</label>
                <select
                  defaultValue={configuringItem.syncFrequency}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="Real-time (Push)">Real-time (Push)</option>
                  <option value="Every 5 mins">Every 5 mins</option>
                  <option value="Hourly batch">Hourly batch</option>
                  <option value="On demand">On demand</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfiguringItem(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const inputVal = (document.getElementById('targetConfigInput') as HTMLInputElement)?.value;
                    onUpdateConfig(configuringItem.id, {
                      ...configuringItem.config,
                      targetChannel: inputVal,
                    });
                    setConfiguringItem(null);
                    setToastMessage('Configuration updated');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
