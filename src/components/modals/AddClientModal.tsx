import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronDown } from 'lucide-react';
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

export default function AddClientModal() {
  const { isModalOpen, closeModal, openDrawer } = useUI();
  const settings = useAppStore(state => state.settings);
  const clients = useAppStore(state => state.clients);
  const user = useAppStore(state => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
    
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

  
  
  const handleClose = () => {
    closeModal();
    reset();
    setGlobalError('');
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

      handleClose();

      // Seamless Routing Handoff
      if (isModalOpen('addProject')) {
        window.dispatchEvent(new CustomEvent('clientCreated', { detail: newClientId }));
      } else {
        setTimeout(() => {
          openDrawer('client', newClient.id);
        }, 350);
      }
    } catch (err) {
      console.error(err);
      setGlobalError('An error occurred while creating the client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[10000] flex max-h-[90vh] w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl shrink-0">
            <h3 className="font-semibold text-lg tracking-tight text-foreground">Add New Client</h3>
            <button
              onClick={handleClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 custom-thin-scroll overflow-y-auto">
            {globalError && (
              <div className="text-destructive text-sm font-semibold bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20 mb-5">
                {globalError}
              </div>
            )}

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Client Name <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full min-w-0 rounded-md border ${errors.companyName ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} bg-white px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 hover:border-primary/50 h-[38px] placeholder:text-muted-foreground`}
                      placeholder="Enter client name..."
                    />
                  )}
                />
                {errors.companyName && (
                  <p className="text-destructive text-xs mt-1 font-medium">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Client Type <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="clientType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      options={(settings?.clientTypes?.map((t) => t.name) || []).map((t) => ({
                        label: t,
                        value: t,
                      }))}
                      onChange={field.onChange}
                      className="w-full block"
                      trigger={
                        <button
                          type="button"
                          className={`w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border ${errors.clientType ? 'border-destructive focus:border-destructive' : 'border-input'} rounded-md px-3 text-left flex justify-between items-center text-sm`}
                        >
                          <span
                            className={`truncate ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value || 'Select Type'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
                {errors.clientType && (
                  <p className="text-destructive text-xs mt-1 font-medium">{errors.clientType.message}</p>
                )}
              </div>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Manager
                </label>
                <Controller
                  name="accountManager"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      options={(settings?.managers?.map((m) => m.name) || []).map((m) => ({
                        label: m,
                        value: m,
                      }))}
                      onChange={field.onChange}
                      className="w-full block"
                      trigger={
                        <button
                          type="button"
                          className="w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm"
                        >
                          <span
                            className={`truncate ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
                          >
                            {field.value || 'Select Manager'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      }
                    />
                  )}
                />
              </div>
              <div className="pt-3 border-t border-border/50">
                <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                  Initial Note <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <div className="rounded-md border border-input bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 overflow-hidden">
                      <RichTextEditor
                        content={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter an optional note..."
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 shrink-0 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border border-input bg-white hover:bg-accent hover:text-accent-foreground h-10 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </button>
          </div>
                </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
