import React, { useState } from 'react';
import { X, Save, FileText, Copy, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const updatedDeliverables = {
        ...deliverablesState,
        submittedAt: deliverablesState.submittedAt || now,
        updatedAt: now
      };
      
      await updateProjectRecord({ ...project, deliverables: updatedDeliverables }, {
        successMsg: 'Deliverables saved successfully!',
        errorMsg: 'Failed to save deliverables.'
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Subtle backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl h-[95vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
               <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight">Deliverables Checklist</h2>
              <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
              {(project?.deliverables?.submittedAt || project?.deliverables?.updatedAt) && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium px-3 py-0.5 bg-slate-100 rounded-full">
                  {project?.deliverables?.submittedAt && <span>Submitted: {new Date(project?.deliverables.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  {project?.deliverables?.updatedAt && project?.deliverables?.updatedAt !== project?.deliverables?.submittedAt && <span>Updated: {new Date(project?.deliverables.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                </div>
              )}
            </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportFormToCSV('Deliverables Checklist', project, deliverablesState, template)}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-thin-scroll">
           <DeliverablesGrid
              template={template}
              project={project}
              values={deliverablesState}
              onChange={handleFieldChange}
           />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div></div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
