import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, UploadCloud } from 'lucide-react';
import { DataUploader } from './DataUploader';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataUploadModal: React.FC<DataUploadModalProps> = ({ isOpen, onClose }) => {
  const [isCompiling, setIsCompiling] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !isCompiling && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[var(--z-modal-overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          onInteractOutside={(e) => {
            if (e.detail.originalEvent.type === 'focusin') {
              e.preventDefault();
              return;
            }
            if (isCompiling) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isCompiling) e.preventDefault();
          }}
          className="fixed left-[50%] top-[50%] z-[var(--z-modal)] w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 tracking-tight">
                  New Data Import
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500 mt-0.5 font-medium">
                  Upload CSV files to import clients, projects, or services
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                disabled={isCompiling}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  isCompiling
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'hover:bg-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 bg-white overflow-y-auto max-h-[75vh] custom-thin-scroll">
            <DataUploader onCompileStateChange={setIsCompiling} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
