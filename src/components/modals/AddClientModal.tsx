import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronDown, Check, Tag, User, AlignLeft, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { useAppStore } from '../../store/useAppStore';
import { updateClientRecord, addAutoLog } from '../../api/dbService';
import { Client } from '../../types';

import { Select } from '../ui/Select';
import { RichTextEditor } from '../ui/RichTextEditor';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const clientSchema = z.object({
  companyName: z.string().min(1, 'Client Name is required.'),
  clientType: z.string().min(1, 'Client Type is required.'),
  accountManager: z.string().optional(),
  note: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const TokenTrigger = ({ label, value, icon: Icon, error, onClick }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex items-center h-10 px-4 rounded-full border bg-white shadow-sm transition-all duration-200 active:scale-95 hover:border-primary/50 hover:shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-destructive' : 'border-slate-200'}`}
  >
    {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors mr-2 shrink-0" />}
    <span className="text-[13px] font-medium text-slate-500 mr-2">{label}:</span>
    <span className={`text-[13px] font-semibold truncate max-w-[160px] ${value ? 'text-slate-900' : 'text-slate-400'}`}>
      {value || 'Select'}
    </span>
    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default function AddClientModal() {
  const { isModalOpen, closeModal, openDrawer } = useUI();
  const settings = useAppStore(state => state.settings);
  const clients = useAppStore(state => state.clients);
  const user = useAppStore(state => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: '',
      clientType: '',
      accountManager: '',
      note: '',
    },
  });

  const isOpen = isModalOpen('addClient');

  
  
  const handleClose = (force?: boolean | any) => {
    const isForced = force === true;
    if (!isForced && isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    setShowDiscardConfirm(false);
    closeModal();
    reset();
    setGlobalError('');
    setShowNote(false);
    setShowSuccess(false);
  };

  const onSubmit = async (data: ClientFormValues) => {
    setGlobalError('');

    const nameExists = clients.some(
      (c) => c.companyName.toLowerCase() === data.companyName.trim().toLowerCase()
    );
    if (nameExists) {
      setGlobalError('A client with this Client Name already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newClientId = crypto.randomUUID().substring(0, 8).toUpperCase();
      const newClient: Client = {
        id: crypto.randomUUID(),
        clientId: newClientId,
        companyName: data.companyName.trim(),
        clientType: data.clientType,
        accountManager: data.accountManager || 'Unassigned',
        activeProjectCount: 0,
        healthScore: 'N/A',
        billing: 100,
        dateAdded: new Date().getTime(),
        lastUpdated: new Date().getTime(),
        scoreTrajectory: [],
      };

      await updateClientRecord(newClient, {
        successMsg: `Client '${data.companyName.trim()}' successfully created.`,
        errorMsg: `Failed to create client '${data.companyName.trim()}'.`,
      });

      const logMessage = data.note
        ? `Client profile created. Initial Note: ${data.note}`
        : `Client profile created.`;
      await addAutoLog(newClientId, logMessage, user?.name || 'System');

      // Only close if we're not showing the success animation
      // The timeout handles the actual closing later

      // Seamless Routing Handoff
      setShowSuccess(true);
      setTimeout(() => {
        handleClose(true);
        if (isModalOpen('addProject')) {
          window.dispatchEvent(new CustomEvent('clientCreated', { detail: newClientId }));
        } else {
          setTimeout(() => {
            openDrawer('client', newClient.id);
          }, 350);
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setGlobalError('An error occurred while creating the client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose(false)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          onInteractOutside={(e) => {
            e.preventDefault();
            handleClose(false);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose(false);
          }}
          className="fixed left-[50%] top-[50%] z-[10000] flex max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col rounded-2xl bg-white shadow-2xl outline-none overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] transition-all duration-300">
          <div className="flex justify-end p-4 absolute top-0 right-0 z-10">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-thin-scroll min-h-0 pt-16 pb-8 px-10">
            {globalError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-[13px] font-semibold bg-destructive/5 px-4 py-3 rounded-xl border border-destructive/20 mb-6">
                {globalError}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full text-4xl font-bold text-slate-800 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 p-0"
                    placeholder="Client Name"
                    autoFocus
                  />
                )}
              />
              {errors.companyName && (
                <p className="text-destructive text-sm mt-2 font-medium">{errors.companyName.message}</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-start gap-3 mb-10">
              <div className="flex flex-col gap-1">
                <Controller
                  name="clientType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      options={(settings?.clientTypes?.map((t) => t.name) || []).map((t) => ({ label: t, value: t }))}
                      onChange={field.onChange}
                      trigger={<TokenTrigger label="Client Type" value={field.value} icon={Tag} error={errors.clientType} />}
                    />
                  )}
                />
                <AnimatePresence>
                  {errors.clientType && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-destructive text-[11px] font-medium ml-2">{errors.clientType.message}</motion.span>}
                </AnimatePresence>
              </div>

              <Controller
                name="accountManager"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    options={(settings?.managers?.map((m) => m.name) || []).map((m) => ({ label: m, value: m }))}
                    onChange={field.onChange}
                    trigger={<TokenTrigger label="Manager" value={field.value} icon={User} />}
                  />
                )}
              />
            </motion.div>



            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {!showNote && (
                  <motion.div key="note-btn" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <button type="button" onClick={() => setShowNote(true)} className="group flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 outline-none w-fit">
                      <span className="text-[13px] font-semibold text-slate-500 group-hover:text-primary transition-colors">+ Add Initial Note</span>
                    </button>
                  </motion.div>
                )}
                {showNote && (
                  <motion.div key="note-editor" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                    <label className="flex items-center text-[13px] font-semibold text-slate-600 ml-1">
                      <AlignLeft className="w-3.5 h-3.5 mr-1.5" /> Initial Note
                    </label>
                    <Controller
                      name="note"
                      control={control}
                      render={({ field }) => (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 overflow-hidden">
                          <RichTextEditor
                            content={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Enter an optional note..."
                          />
                        </div>
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end items-center shrink-0 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-200 active:scale-95 hover:-translate-y-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 h-10 px-5 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="group inline-flex items-center justify-center rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showDiscardConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 flex flex-col items-center text-center max-w-sm mx-4"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Discard changes?</h3>
                  <p className="text-sm text-slate-500 mb-6">You have unsaved changes. If you close this now, your data will be lost.</p>
                  <div className="flex gap-3 w-full">
                    <button 
                      type="button"
                      onClick={() => setShowDiscardConfirm(false)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Keep Editing
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleClose(true)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                key="success-bloom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white rounded-2xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <Check className="w-12 h-12 text-green-600 stroke-[3]" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-slate-800"
                >
                  Client Created
                </motion.h2>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
