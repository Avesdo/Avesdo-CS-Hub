import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getPendingAliases, resolveAlias } from '../../api/dbService';
import { SearchableSelect } from '../ui/SearchableSelect';
import {
  CheckCircle2,
  Building2,
  Home,
  Briefcase,
  ChevronRight,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { toast } from '../../utils/toast';

export function DataIntakePipeline() {
  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);
  const services = useAppStore((state) => state.services);

  const [pendingAliases, setPendingAliases] = useState<any[]>([]);
  const [loadingAliases, setLoadingAliases] = useState(true);
  const [correctingAliasId, setCorrectingAliasId] = useState<string | null>(null);
  const [correctionTargetId, setCorrectionTargetId] = useState<string>('');

  const loadAliases = async () => {
    setLoadingAliases(true);
    try {
      const data = await getPendingAliases();
      setPendingAliases(data);
    } catch (e) {
      toast.error('Failed to load pending aliases');
    } finally {
      setLoadingAliases(false);
    }
  };

  useEffect(() => {
    loadAliases();
    
    const handleUpdate = () => loadAliases();
    window.addEventListener('pipeline-updated', handleUpdate);
    return () => window.removeEventListener('pipeline-updated', handleUpdate);
  }, []);

  const handleResolveAlias = async (
    id: string,
    action: 'approve' | 'reject' | 'correct' | 'create_new',
    targetId?: string
  ) => {
    try {
      await resolveAlias(id, action, targetId);
      if (action === 'correct' || action === 'create_new') {
        setCorrectingAliasId(null);
        setCorrectionTargetId('');
        toast.success('Alias mapped successfully');
      } else if (action === 'approve') {
        toast.success('Alias approved');
      } else if (action === 'reject') {
        toast.success('Alias ignored');
      }
      loadAliases();
    } catch (e) {
      toast.error('Failed to resolve alias');
    }
  };

  if (loadingAliases) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-sm font-medium text-slate-500 animate-pulse shadow-sm">
        Loading pending merges...
      </div>
    );
  }

  if (pendingAliases.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h4 className="text-lg font-bold text-slate-800">Pipeline is clear</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          There are no unrecognized data sources that require manual mapping. You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingAliases.map((alias) => {
        const isCorrecting = correctingAliasId === alias.id;

        return (
          <div
            key={alias.id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                    ${
                      alias.type === 'client'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : alias.type === 'project'
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                >
                  {alias.type === 'client' ? (
                    <Building2 className="w-5 h-5" />
                  ) : alias.type === 'project' ? (
                    <Home className="w-5 h-5" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider text-slate-400">
                      {alias.type} Merge
                    </span>
                    {alias.contextName && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {alias.contextName}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-semibold text-slate-800 mt-1 flex items-center gap-2">
                    "{alias.rawName}"
                  </h4>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>Needs to be mapped to an internal {alias.type}</span>
                  </div>
                </div>
              </div>

              {!isCorrecting ? (
                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    onClick={() => setCorrectingAliasId(alias.id)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 font-medium rounded-lg text-sm transition-all shadow-sm"
                  >
                    Map Manually
                  </button>
                  <button
                    onClick={() => handleResolveAlias(alias.id, 'reject')}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Ignore"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mapping Drawer */}
            {isCorrecting && (
              <div className="bg-slate-50 border-t border-slate-200 p-5 px-6">
                <div className="max-w-2xl">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select the correct {alias.type} for "{alias.rawName}"
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white rounded-lg shadow-sm">
                      <SearchableSelect
                        options={
                          alias.type === 'client'
                            ? clients.map((c) => ({
                                value: c.clientId || c.id,
                                label: c.companyName || 'Unnamed Client',
                              }))
                            : alias.type === 'project'
                              ? projects.map((p) => ({
                                  value: p.id,
                                  label: p.name || 'Unnamed Project',
                                }))
                              : alias.type === 'service'
                                ? services.map((s) => ({
                                    value: s.id,
                                    label: s.name || 'Unnamed Service',
                                  }))
                                : []
                        }
                        value={correctionTargetId}
                        onChange={setCorrectionTargetId}
                        placeholder={`Search ${alias.type}s...`}
                      />
                    </div>
                    <button
                      disabled={!correctionTargetId}
                      onClick={() => handleResolveAlias(alias.id, 'correct', correctionTargetId)}
                      className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setCorrectingAliasId(null);
                        setCorrectionTargetId('');
                      }}
                      className="px-4 py-2 bg-white text-slate-600 border border-slate-200 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
