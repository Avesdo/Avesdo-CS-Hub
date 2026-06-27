import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getPendingAliases, resolveAlias } from '../../api/dbService';
import { db } from '../../api/firebase';
import { writeBatch, doc } from 'firebase/firestore';
import { SearchableSelect } from '../ui/SearchableSelect';
import { Tooltip } from '../ui/Tooltip';
import { TruncatedText } from '../ui/TruncatedText';
import {
  CheckCircle2,
  Building2,
  Home,
  Briefcase,
  ChevronRight,
  AlertCircle,
  X,
  Check,
  Ban,
  User,
  Trash2,
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface DataIntakePipelineProps {
  onPendingCountChange?: (count: number) => void;
  onBindClearAll?: (clearAll: () => Promise<void>) => void;
}

export function DataIntakePipeline({
  onPendingCountChange,
  onBindClearAll,
}: DataIntakePipelineProps = {}) {
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
      if (onPendingCountChange) {
        onPendingCountChange(data.length);
      }
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

  const handleDismissAllRef = useRef<any>(null);

  useEffect(() => {
    if (onBindClearAll) {
      onBindClearAll(async () => {
        if (handleDismissAllRef.current) {
          await handleDismissAllRef.current();
        }
      });
    }
  }, [onBindClearAll]);

  const handleDismissAll = async () => {
    try {
      const batches = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      for (const alias of pendingAliases) {
        currentBatch.delete(doc(db, 'aliases', alias.id));
        count++;
        if (count === 490) {
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        batches.push(currentBatch);
      }

      for (const b of batches) {
        await b.commit();
      }

      toast.success('Successfully cleared all pending entries');
      loadAliases();
    } catch (e) {
      console.error(e);
      toast.error('Failed to clear pending entries');
    }
  };

  useEffect(() => {
    handleDismissAllRef.current = handleDismissAll;
  }, [handleDismissAll]);

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
      }
      setPendingAliases((prev) => {
        const next = prev.filter((alias) => alias.id !== id);
        if (onPendingCountChange) {
          onPendingCountChange(next.length);
        }
        return next;
      });
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

  const getPrettySourceName = (name: string) => {
    if (name === 'Satisfaction Report') return 'Happyfox Support CSAT';
    if (name === 'Userpilot') return 'Userpilot Data';
    if (name === 'NPS Report') return 'Userpilot NPS';
    return name;
  };

  return (
    <div className="space-y-4 pb-48">
      <div className="space-y-3">
        {pendingAliases.map((alias) => {
          const isCorrecting = correctingAliasId === alias.id;
          const prettySource = alias.contextName ? getPrettySourceName(alias.contextName) : '';

          return (
            <div
              key={alias.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
            >
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Tooltip
                    content={
                      alias.contextName === 'Satisfaction Report' ||
                      alias.contextName === 'NPS Report'
                        ? 'User to Client Mapping'
                        : alias.type.charAt(0).toUpperCase() + alias.type.slice(1)
                    }
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                      ${
                        alias.contextName === 'Satisfaction Report' ||
                        alias.contextName === 'NPS Report'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : alias.type === 'client'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : alias.type === 'project'
                              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}
                    >
                      {alias.contextName === 'Satisfaction Report' ||
                      alias.contextName === 'NPS Report' ? (
                        <User className="w-5 h-5" />
                      ) : alias.type === 'client' ? (
                        <Building2 className="w-5 h-5" />
                      ) : alias.type === 'project' ? (
                        <Home className="w-5 h-5" />
                      ) : (
                        <Briefcase className="w-5 h-5" />
                      )}
                    </div>
                  </Tooltip>
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="flex flex-col min-w-0">
                      <TruncatedText
                        text={alias.rawName}
                        className="text-sm font-semibold text-slate-800"
                        containerClassName="min-w-0 max-w-[250px]"
                      />
                      {alias.subLabel && (
                        <TruncatedText
                          text={alias.subLabel}
                          className="text-[12px] font-medium text-slate-500 mt-0.5"
                          containerClassName="min-w-0 max-w-[250px]"
                        />
                      )}
                    </div>
                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                      {prettySource && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                          Source: {prettySource}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AnimatePresence mode="wait">
                    {!isCorrecting ? (
                      <motion.div
                        key="actions"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={() => setCorrectingAliasId(alias.id)}
                          className="px-4 py-2 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 font-bold rounded-lg text-xs transition-all shadow-sm"
                        >
                          Map Manually
                        </button>
                        <button
                          onClick={() => handleResolveAlias(alias.id, 'reject')}
                          className="px-3 py-2 text-slate-500 hover:text-red-600 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Ban className="w-4 h-4" />
                          Ignore
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mapping"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-[250px] bg-white rounded-lg shadow-sm border border-slate-200">
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
                          onClick={() =>
                            handleResolveAlias(alias.id, 'correct', correctionTargetId)
                          }
                          className="px-4 py-2 h-[38px] bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setCorrectingAliasId(null);
                            setCorrectionTargetId('');
                          }}
                          className="px-3 py-2 h-[38px] bg-white text-slate-600 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
