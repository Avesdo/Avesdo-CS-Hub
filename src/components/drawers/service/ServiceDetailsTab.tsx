import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Check, AlertTriangle } from 'lucide-react';
import { DatePicker } from '../../../components/ui/DatePicker';
import {
  updateServiceRecord,
  addAutoLog,
  addProjectAutoLog,
  addServiceAutoLog,
} from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';
import { getSettingBadge } from '../../../utils/uiUtils';

interface ServiceDetailsTabProps {
  service: any;
}

export default function ServiceDetailsTab({ service }: ServiceDetailsTabProps) {
  const { settings, user } = useAppStore();

  const serviceOutcomes = (settings?.settingsData || []).filter(
    (s: any) => s.category === 'ServiceOutcome'
  );
  const serviceStatuses = (settings?.settingsData || []).filter(
    (s: any) => s.category === 'ServiceStatus'
  );

  const [openPop, setOpenPop] = useState<'type' | 'manager' | 'outcome' | 'status' | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const openPopRef = useRef(openPop);
  useEffect(() => {
    openPopRef.current = openPop;
  }, [openPop]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openPopRef.current && !target.closest(`#popover-${openPopRef.current}`)) {
        setOpenPop(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openPopRef.current) {
        event.stopPropagation();
        setOpenPop(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUpdate = async (
    field: string,
    newValue: any,
    oldValue: any,
    logPrefix?: string,
    forceUpdates?: any
  ) => {
    if (newValue === oldValue) return;

    const payload = { ...service, [field]: newValue, ...(forceUpdates || {}) };

    if (field === 'outcome' && newValue === 'Won') {
      payload.status = 'Accepted';
    } else if (field === 'outcome' && newValue === 'Lost') {
      payload.status = 'Not Accepted';
    } else if (field === 'status' && newValue === 'Accepted') {
      payload.outcome = 'Won';
    } else if (field === 'status' && newValue === 'Not Accepted') {
      payload.outcome = 'Lost';
    } else if (field === 'status' && newValue === 'Completed') {
      payload.dateVal = new Date().getTime();
      payload.dateStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    let successMsg = `Updates to '${service.name}' saved successfully.`;
    let errorMsg = `Failed to save updates to '${service.name}'.`;

    if (logPrefix) {
      successMsg = `${logPrefix} successfully updated for '${service.name}'.`;
      errorMsg = `Failed to update ${logPrefix} for '${service.name}'.`;
    } else if (field === 'contactName') {
      successMsg = `Client Contact Name successfully updated for '${service.name}'.`;
      errorMsg = `Failed to update Client Contact Name for '${service.name}'.`;
    }

    const displayVal = (val: any) => {
      if (val === null || val === undefined || val === '') return 'None';
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      if (field.includes('DateVal') || field === 'dateVal') {
        const parsed = new Date(val);
        if (isNaN(parsed.getTime())) return 'None';
        return parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      if (field === 'price' || field === 'commission') {
        const num = Number(val);
        if (isNaN(num)) return 'None';
        return (
          '$' +
          new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(num)
        );
      }
      return String(val);
    };

    const logMsg = logPrefix
      ? `${logPrefix} changed from "${displayVal(oldValue)}" to "${displayVal(newValue)}"`
      : `Updated ${field} to "${displayVal(newValue)}"`;

    await updateServiceRecord(payload, { successMsg, errorMsg }, logMsg, user?.name);

    if (field === 'status' && newValue === 'Completed') {
      if (service?.clientIds) {
        for (const cid of service.clientIds) {
          await addAutoLog(cid, logMsg, user?.name || 'System', true);
        }
      }
      if (service?.projectId && service.projectId !== 'N/A') {
        await addProjectAutoLog(service.projectId, logMsg, user?.name || 'System', true);
      }
    }
  };

  const handleTypeChange = (newType: string) => {
    setOpenPop(null);
    if (newType === service?.type) return;

    const updates: any = {};

    if (newType === 'Included') {
      updates.price = 0;
      updates.outcome = 'Included';
      updates.status = 'Awaiting Inputs';
      updates.invoicePaid = false;
      updates.invoiceSent = false;
      updates.invoiceNum = 'N/A';
      updates.commission = 0;
      updates.commPaid = false;
    } else {
      updates.status = 'Proposal Sent';
      updates.outcome = 'Proposal Sent';
    }

    handleUpdate('type', newType, service?.type, 'Service Type', updates);
  };

  const handleStatusChange = (newStatus: string) => {
    setOpenPop(null);
    if (newStatus === service?.status) return;

    const updates: any = {
      dateVal: new Date().getTime(),
      dateStr: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    if (newStatus === 'Accepted') updates.outcome = 'Won';
    if (newStatus === 'Not Accepted') updates.outcome = 'Lost';

    handleUpdate('status', newStatus, service?.status, 'Fulfillment Status', updates);
  };

  const handleOutcomeChange = (newOutcome: string) => {
    setOpenPop(null);
    if (newOutcome === service?.outcome) return;

    const updates: any = {
      dateVal: new Date().getTime(),
      dateStr: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    if (newOutcome === 'Won') updates.status = 'Accepted';
    if (newOutcome === 'Lost') updates.status = 'Not Accepted';

    handleUpdate('outcome', newOutcome, service?.outcome, 'Service Outcome', updates);
  };

  // Contact Draft
  const [contactDraft, setContactDraft] = useState(service?.contactName || '');
  useEffect(() => {
    setContactDraft(service?.contactName || '');
  }, [service?.contactName]);

  const handleContactBlur = () => {
    handleUpdate('contactName', contactDraft, service?.contactName);
  };

  // Price Draft
  const [priceDraft, setPriceDraft] = useState(() =>
    service?.price != null
      ? new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(service.price))
      : ''
  );
  useEffect(() => {
    setPriceDraft(
      service?.price != null
        ? new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(service.price))
        : ''
    );
  }, [service?.price]);

  const handlePriceBlur = () => {
    if (priceDraft.trim() === '') {
      handleUpdate('price', null, service?.price, 'Service Value');
      setPriceDraft('');
      return;
    }
    const raw = priceDraft.replace(/,/g, '');
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setPriceDraft(
        service?.price != null
          ? new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Number(service.price))
          : ''
      );
      return;
    }
    handleUpdate('price', num, service?.price, 'Service Value');
    setPriceDraft(
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        num
      )
    );
  };

  // Invoice Draft
  const [invoiceDraft, setInvoiceDraft] = useState(service?.invoiceNum || '');
  useEffect(() => {
    setInvoiceDraft(service?.invoiceNum || '');
  }, [service?.invoiceNum]);

  const handleInvoiceChange = (val: string) => {
    setInvoiceDraft(val);
    if (val.trim().length > 0 && !service?.invoiceSent) {
      handleUpdate('invoiceSent', true, service?.invoiceSent, 'Invoice Sent', { invoiceNum: val });
    }
  };
  const handleInvoiceBlur = () => {
    handleUpdate('invoiceNum', invoiceDraft, service?.invoiceNum, 'Invoice Number');
  };

  // Commission Draft
  const [commDraft, setCommDraft] = useState(() =>
    service?.commission != null && !isNaN(Number(service.commission))
      ? new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(service.commission))
      : ''
  );
  useEffect(() => {
    setCommDraft(
      service?.commission != null && !isNaN(Number(service.commission))
        ? new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(service.commission))
        : ''
    );
  }, [service?.commission]);

  const autoCalcCommission = () => {
    const p = Number(service?.price) || 0;
    const c = p * 0.2;
    setCommDraft(
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        c
      )
    );
    handleUpdate('commission', c, service?.commission, 'Commission Value');
  };

  const handleCommBlur = () => {
    if (commDraft.trim() === '') {
      handleUpdate('commission', null, service?.commission, 'Commission Value');
      setCommDraft('');
      return;
    }
    const raw = commDraft.replace(/,/g, '');
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setCommDraft(
        service?.commission != null
          ? new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Number(service.commission))
          : ''
      );
      return;
    }
    handleUpdate('commission', num, service?.commission, 'Commission Value');
    setCommDraft(
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        num
      )
    );
  };

  // Commission Paid Toggle
  const handleCommPaidToggle = (checked: boolean) => {
    if (checked) {
      const d = new Date();
      handleUpdate('commPaid', true, service?.commPaid, 'Commission Paid', {
        commDateVal: d.getTime(),
        commDateStr: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
    } else {
      handleUpdate('commPaid', false, service?.commPaid, 'Commission Paid', {
        commDateVal: null,
        commDateStr: '',
      });
    }
  };

  const isIncluded = service?.type === 'Included';

  return (
    <div className="flex flex-col space-y-8" ref={popRef}>
      {(!service?.type ||
        !service?.status ||
        (!service?.managers?.length && !service?.manager)) && (
        <div className="px-6 py-3 border-b border-orange-200/50 bg-orange-50/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <div className="i-lucide-alert-triangle w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-orange-800 tracking-tight">
              Missing Fields
            </span>
            <span className="text-xs text-orange-600 font-medium">
              Please ensure Service Type, Managers, and Status are populated.
            </span>
          </div>
        </div>
      )}

      {/* Row 1: Service Classification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border items-start">
        <div id="popover-type" className="relative popover-container">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Service Type
          </label>
          <div className="flex">
            <button
              onClick={() => setOpenPop(openPop === 'type' ? null : 'type')}
              className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex"
            >
              {getSettingBadge('serviceTypes', service?.type || 'None', settings, 'md')}
            </button>
          </div>
          {openPop === 'type' && (
            <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {settings?.serviceTypes?.map((t: any) => (
                <button
                  key={t.name}
                  onClick={() => handleTypeChange(t.name)}
                  className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 flex items-center justify-between"
                >
                  {getSettingBadge('serviceTypes', t.name, settings, 'md')}
                  {service?.type === t.name && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {!isIncluded && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Service Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                $
              </span>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                value={priceDraft}
                onChange={(e) => setPriceDraft(e.target.value)}
                onBlur={handlePriceBlur}
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Personnel & Routing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border items-start">
        <div id="popover-manager" className="relative popover-container">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Manager</label>
          <button
            onClick={() => setOpenPop(openPop === 'manager' ? null : 'manager')}
            className="w-full flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200 active:scale-95 hover:bg-slate-50 hover:border-primary/50 focus:outline-none min-h-[38px]"
          >
            <span className="truncate font-semibold text-foreground">
              {service?.managers?.length
                ? service.managers.join(', ')
                : service?.manager || 'Unassigned'}
            </span>
            <div className="i-lucide-chevron-down w-4 h-4 text-muted-foreground shrink-0" />
          </button>
          {openPop === 'manager' && (
            <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto custom-thin-scroll">
              {settings?.managers?.map((m: any) => {
                const isSelected =
                  service?.managers?.includes(m.name) ||
                  (!service?.managers && service?.manager === m.name);
                return (
                  <button
                    key={m.name}
                    onClick={() => {
                      let newManagers = [
                        ...(service?.managers || (service?.manager ? [service.manager] : [])),
                      ];
                      if (isSelected) {
                        newManagers = newManagers.filter((name) => name !== m.name);
                      } else {
                        newManagers.push(m.name);
                      }
                      const payload = {
                        manager: newManagers.length > 0 ? newManagers[0] : 'Unassigned',
                        managers: newManagers,
                      };
                      handleUpdate('managers', newManagers, service?.managers, 'Managers', payload);
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 flex items-center justify-between whitespace-nowrap"
                  >
                    {m.name}
                    {isSelected && <div className="i-lucide-check w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Client Contact Name
          </label>
          <input
            type="text"
            placeholder="Enter primary contact name..."
            className="w-full px-3 py-2 border border-input rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            value={contactDraft}
            onChange={(e) => setContactDraft(e.target.value)}
            onBlur={handleContactBlur}
          />
        </div>
      </div>

      {/* Row 3: Lifecycle & Scheduling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border items-start">
        <div className="flex flex-col space-y-6">
          <div id="popover-outcome" className="relative popover-container">
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Outcome
            </label>
            <div className="flex">
              <button
                onClick={() => setOpenPop(openPop === 'outcome' ? null : 'outcome')}
                className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex"
              >
                {getSettingBadge('serviceOutcomes', service?.outcome || 'Not Set', settings, 'md')}
              </button>
            </div>
            {openPop === 'outcome' && (
              <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {serviceOutcomes.map((s: any) => (
                  <button
                    key={s.name}
                    onClick={() => handleOutcomeChange(s.name)}
                    className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 flex items-center justify-between"
                  >
                    {getSettingBadge('serviceOutcomes', s.name, settings, 'md')}
                    {service?.outcome === s.name && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="popover-container">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
              Completion Date
            </label>
            <DatePicker
              value={service?.dateVal}
              onChange={(val, str) =>
                handleUpdate('dateVal', val, service?.dateVal, 'Completion Date', { dateStr: str })
              }
              label="Set Completion Date"
              placeholder="No Date"
            />
          </div>
        </div>

        <div id="popover-status" className="relative popover-container">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Fulfillment Status
          </label>
          <div className="flex">
            <button
              onClick={() => setOpenPop(openPop === 'status' ? null : 'status')}
              className="text-left hover:-translate-y-0.5 hover:shadow-md transition-all rounded-full inline-flex"
            >
              {getSettingBadge('serviceStatuses', service?.status || 'Not Set', settings, 'md')}
            </button>
          </div>
          {openPop === 'status' && (
            <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {serviceStatuses.map((s: any) => (
                <button
                  key={s.name}
                  onClick={() => handleStatusChange(s.name)}
                  className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 flex items-center justify-between"
                >
                  {getSettingBadge('serviceStatuses', s.name, settings, 'md')}
                  {service?.status === s.name && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Invoice Tracking */}
      {!isIncluded && (
        <div
          id="sd-invoice-container"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border items-center"
        >
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Invoice Number
            </label>
            <input
              type="text"
              placeholder="e.g. INV-1002"
              className="w-full px-3 py-2 border border-input rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              value={invoiceDraft}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              onBlur={handleInvoiceBlur}
            />
          </div>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={service?.invoiceSent || false}
                onChange={(e) =>
                  handleUpdate(
                    'invoiceSent',
                    e.target.checked,
                    service?.invoiceSent,
                    'Invoice Sent'
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-0 focus-visible:ring-primary/20 focus-visible:ring-2 focus:ring-offset-0 outline-none"
              />
              <span className="text-sm font-semibold">Invoice Sent</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={service?.invoicePaid || false}
                onChange={(e) =>
                  handleUpdate(
                    'invoicePaid',
                    e.target.checked,
                    service?.invoicePaid,
                    'Invoice Paid'
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-0 focus-visible:ring-primary/20 focus-visible:ring-2 focus:ring-offset-0 outline-none"
              />
              <span className="text-sm font-semibold">Invoice Paid</span>
            </label>
          </div>
        </div>
      )}

      {/* Row 5: Commission Tracking */}
      {!isIncluded && (
        <div
          id="sd-comm-container"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 items-start"
        >
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-muted-foreground">
                Commission Value
              </label>
              <button
                onClick={autoCalcCommission}
                className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors active:scale-95"
              >
                Auto Calc (20%)
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                $
              </span>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 border border-input rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                value={commDraft}
                onChange={(e) => setCommDraft(e.target.value)}
                onBlur={handleCommBlur}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <label className="block text-sm font-medium text-muted-foreground">
              Commission Paid?
            </label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={service?.commPaid || false}
                onChange={(e) => handleCommPaidToggle(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-0 focus-visible:ring-primary/20 focus-visible:ring-2 focus:ring-offset-0 outline-none"
              />
              <span className="text-sm font-semibold">Paid</span>
            </label>

            {service?.commPaid && (
              <div className="popover-container">
                <DatePicker
                  value={service?.commDateVal}
                  onChange={(val, str) =>
                    handleUpdate('commDateVal', val, service?.commDateVal, 'Commission Paid Date', {
                      commDateStr: str,
                    })
                  }
                  label="Set Commission Paid Date"
                  placeholder="No Date"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
