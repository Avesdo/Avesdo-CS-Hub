import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Copy, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import DeliverablesGrid from '../ui/DeliverablesGrid';
import { updateProjectRecord } from '../../api/dbService';
import { exportFormToCSV } from '../../utils/exportUtils';

interface DeliverablesModalProps {
  project: any;
  template: any;
  onClose: () => void;
}

export default function DeliverablesModal({ project, template, onClose }: DeliverablesModalProps) {
  const [deliverablesState, setDeliverablesState] = useState<Record<string, any>>(
    project?.deliverables || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate a draft on first open so the state changes to "View"
  useEffect(() => {
    if (!project?.deliverables || Object.keys(project.deliverables).length === 0) {
      const now = new Date().toISOString();
      const initialDraft = { submittedAt: now, updatedAt: now, status: 'Draft' };
      updateProjectRecord(
        { ...project, deliverables: initialDraft },
        { successMsg: 'Checklist generated.', errorMsg: 'Failed to generate checklist.' },
        'Deliverables Checklist Generated',
        'System'
      );
      setDeliverablesState(initialDraft);
    }
  }, []);

  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}/portal/${project.id}?form=deliverables`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFieldChange = (itemId: string, field: string, value: any) => {
    if (field === 'replace') {
      setDeliverablesState(prev => ({
        ...prev,
        [itemId]: value
      }));
      return;
    }

    setDeliverablesState(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value
      }
    }));
  };

  const lastSavedState = useRef<string>(JSON.stringify(project?.deliverables || {}));

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentStateString = JSON.stringify(deliverablesState);
      if (currentStateString !== lastSavedState.current) {
        handleSave(true);
      }
    }, 1500); // 1.5s debounce
    return () => clearTimeout(timer);
  }, [deliverablesState]);

  const handleSave = async (silent = false) => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      let total = 0;
      let completed = 0;
      const activeFeatures = project?.features || [];
      (template?.sections || []).forEach((sec: any) => {
        if (!sec.dependsOnFeature || sec.dependsOnFeature.length === 0 || sec.dependsOnFeature.some((f: any) => activeFeatures.includes(f))) {
          sec.items.forEach((item: any) => {
            total++;
            const st = deliverablesState[item.id]?.status;
            if (['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(st)) completed++;
          });
        }
      });
      const customs = deliverablesState._customItems || [];
      total += customs.length;
      customs.forEach((c: any) => {
        if (['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(c.status)) completed++;
      });
      
      const isComplete = total > 0 && completed === total;

      const updatedDeliverables = {
        ...deliverablesState,
        submittedAt: isComplete ? (deliverablesState.submittedAt || now) : deliverablesState.submittedAt,
        updatedAt: now,
        status: isComplete ? 'Completed' : 'In Progress'
      };
      
      const toastOptions = silent ? undefined : {
        successMsg: 'Deliverables saved successfully!',
        errorMsg: 'Failed to save deliverables.'
      };
      
      await updateProjectRecord({ ...project, deliverables: updatedDeliverables }, toastOptions);
      lastSavedState.current = JSON.stringify(updatedDeliverables);
      if (!silent) onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10010] bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content 
          onEscapeKeyDown={(e) => { e.preventDefault(); onClose(); }}
          onInteractOutside={(e) => { e.preventDefault(); onClose(); }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10020] w-full max-w-6xl h-[95vh] outline-none flex flex-col"
        >
          {/* Modal Container */}
          <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="flex flex-col border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                 <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight">Deliverables Checklist</h2>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
                  {isSaving && (
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Saving...
                    </span>
                  )}
                  {(project?.deliverables?.submittedAt || project?.deliverables?.updatedAt) && !isSaving && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                      {project?.deliverables?.submittedAt && <span>Completed: {new Date(project?.deliverables.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      {project?.deliverables?.updatedAt && project?.deliverables?.updatedAt !== project?.deliverables?.submittedAt && <span>Updated: {new Date(project?.deliverables.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => exportFormToCSV('Deliverables Checklist', project, deliverablesState, { ...template, type: 'checklist' })}
                className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border border-transparent bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 hover:-translate-y-0.5 px-4 py-2 h-9 focus:ring-2 focus:ring-slate-400/20 focus:outline-none"
              >
                <FileText className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
                Download CSV
              </button>
              <button
                onClick={handleCopyLink}
                className="group inline-flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-300 px-4 py-2 h-9 focus:ring-2 focus:ring-primary/20 focus:outline-none bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 hover:-translate-y-0.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />}
                {copied ? 'Copied!' : 'Copy Client Link'}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Header Progress Bar */}
          {(() => {
            let total = 0;
            let completed = 0;
            
            // Count standard items
            const activeFeatures = project?.features || [];
            (template?.sections || []).forEach((sec: any) => {
              if (!sec.dependsOnFeature || sec.dependsOnFeature.length === 0 || sec.dependsOnFeature.some((f: any) => activeFeatures.includes(f))) {
                sec.items.forEach((item: any) => {
                  total++;
                  const st = deliverablesState[item.id]?.status;
                  if (['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(st)) completed++;
                });
              }
            });
            // Count custom items
            const customs = deliverablesState._customItems || [];
            total += customs.length;
            customs.forEach((c: any) => {
              if (['Completed', 'Setup Completed', 'Draft Complete', 'N/A'].includes(c.status)) completed++;
            });

            const pct = total === 0 ? 0 : (completed / total) * 100;
            
            return (
              <div className="w-full flex flex-col gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100 shadow-inner">
                <div className="flex justify-between items-center text-[13px] font-bold text-slate-600">
                  <span>Deliverables Progress</span>
                  <span className="text-primary">{completed} of {total} Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
                  <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 flex flex-col">
           <DeliverablesGrid
              template={template}
              project={project}
              values={deliverablesState}
              onChange={handleFieldChange}
           />
        </div>

      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
  );
}
