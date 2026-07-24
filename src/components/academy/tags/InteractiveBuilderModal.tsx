import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Wand2, Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';

interface InteractiveBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveBuilderModal({ isOpen, onClose }: InteractiveBuilderModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Placeholder copy logic
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[var(--z-modal-overlay)] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-[var(--z-modal)] animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-slate-800">
                  Format Builder
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  Quickly nest and format your tags without syntax errors.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-slate-500 text-sm mb-4">
                We're currently designing the new Format Builder based on our discussions!
              </p>
              <Button onClick={onClose} variant="outline">
                Close for now
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
