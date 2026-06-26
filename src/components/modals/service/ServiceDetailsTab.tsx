import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DatePicker } from '../../../components/ui/DatePicker';
import { updateServiceRecord, addAutoLog, addProjectAutoLog } from '../../../api/dbService';
import { useAppStore } from '../../../store/useAppStore';

interface ServiceDetailsTabProps {
  service: any;
}

export default function ServiceDetailsTab({ service }: ServiceDetailsTabProps) {
  const user = useAppStore((state) => state.user);

  const handleUpdate = async (
    field: string,
    newValue: any,
    oldValue: any,
    logPrefix?: string,
    forceUpdates?: any
  ) => {
    if (newValue === oldValue) return;

    const payload = { ...service, [field]: newValue, ...(forceUpdates || {}) };

    let successMsg = `Updates to '${service.name}' saved successfully`;
    let errorMsg = `Failed to save updates to '${service.name}'`;

    if (logPrefix) {
      successMsg = `${logPrefix} successfully updated for '${service.name}'`;
      errorMsg = `Failed to update ${logPrefix} for '${service.name}'`;
    } else if (field === 'contactName') {
      successMsg = `Client Contact Name successfully updated for '${service.name}'`;
      errorMsg = `Failed to update Client Contact Name for '${service.name}'`;
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
      if (field === 'price' || field === 'commission' || field === 'serviceValue') {
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
      handleUpdate('price', null, service?.price, 'Invoice Value');
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
    handleUpdate('price', num, service?.price, 'Invoice Value');
    setPriceDraft(
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        num
      )
    );
  };

  // Service Value Draft
  const [serviceValueDraft, setServiceValueDraft] = useState(
    service?.serviceValue != null
      ? new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(service.serviceValue))
      : ''
  );

  useEffect(() => {
    setServiceValueDraft(
      service?.serviceValue != null
        ? new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(Number(service.serviceValue))
        : ''
    );
  }, [service?.serviceValue]);

  const handleServiceValueBlur = () => {
    if (serviceValueDraft.trim() === '') {
      handleUpdate('serviceValue', null, service?.serviceValue, 'Service Value');
      setServiceValueDraft('');
      return;
    }
    const raw = serviceValueDraft.replace(/,/g, '');
    const num = parseFloat(raw);
    if (isNaN(num)) {
      setServiceValueDraft(
        service?.serviceValue != null
          ? new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Number(service.serviceValue))
          : ''
      );
      return;
    }
    handleUpdate('serviceValue', num, service?.serviceValue, 'Service Value');
    setServiceValueDraft(
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
    <div className="flex flex-col space-y-6">
      {(!service?.type ||
        !service?.status ||
        (!service?.managers?.length && !service?.manager)) && (
        <div className="px-5 py-4 border border-orange-200/50 bg-orange-50/50 rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-orange-800 tracking-tight">
              Missing Fields
            </span>
            <span className="text-xs text-orange-600 font-medium">
              Please ensure Service Type, Manager, and Status are set in the left sidebar.
            </span>
          </div>
        </div>
      )}

      {isIncluded ? (
        <div className="flex flex-col items-center justify-center pt-10 pb-8 px-4 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
            <LucideIcons.PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Included service</h2>
          <p className="text-[14px] text-slate-500 max-w-md mx-auto mb-12">
            This service is included as part of a broader package. Invoicing and commissions are
            disabled because it does not carry an individual charge.
          </p>

          <div className="w-full max-w-sm mx-auto text-left">
            <div className="group relative">
              <label className="text-[13px] font-medium text-slate-500 mb-2 block transition-colors group-focus-within:text-primary">
                Standard service value
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-light text-slate-400">$</span>
                <input
                  type="text"
                  className="text-4xl font-light text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-slate-200"
                  value={serviceValueDraft}
                  onChange={(e) => setServiceValueDraft(e.target.value)}
                  onBlur={handleServiceValueBlur}
                  placeholder="0.00"
                />
              </div>
              <div className="h-[2px] bg-slate-100 w-full mt-2 transition-colors group-focus-within:bg-primary/40 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 px-4">
          {/* Invoicing Column */}
          <div className="flex flex-col space-y-10">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <LucideIcons.Receipt className="w-5 h-5 text-primary" />
                Invoicing
              </h3>

              <div className="flex flex-col gap-8">
                {/* Large Editable Number: Invoice Value */}
                <div className="group relative">
                  <label className="text-[13px] font-medium text-slate-500 mb-2 block transition-colors group-focus-within:text-primary">
                    Invoice value
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-light text-slate-400">$</span>
                    <input
                      type="text"
                      className="text-4xl font-light text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-slate-200"
                      value={priceDraft}
                      onChange={(e) => setPriceDraft(e.target.value)}
                      onBlur={handlePriceBlur}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="h-[2px] bg-slate-100 w-full mt-2 transition-colors group-focus-within:bg-primary/40 rounded-full" />
                </div>

                {/* Standard Editable Number: Service Value */}
                <div className="group relative">
                  <label className="text-[13px] font-medium text-slate-500 mb-2 block transition-colors group-focus-within:text-primary">
                    Service value
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-slate-400">$</span>
                    <input
                      type="text"
                      className="text-xl font-medium text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-slate-200"
                      value={serviceValueDraft}
                      onChange={(e) => setServiceValueDraft(e.target.value)}
                      onBlur={handleServiceValueBlur}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="h-[2px] bg-slate-100 w-full mt-2 transition-colors group-focus-within:bg-primary/40 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="group relative">
                <label className="text-[13px] font-medium text-slate-500 mb-2 block transition-colors group-focus-within:text-primary">
                  Invoice number
                </label>
                <div className="flex items-center gap-2">
                  <LucideIcons.Hash className="w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    placeholder="e.g. INV-1002"
                    className="text-[15px] font-medium text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-slate-300"
                    value={invoiceDraft}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    onBlur={handleInvoiceBlur}
                  />
                </div>
                <div className="h-[2px] bg-slate-100 w-full mt-2 transition-colors group-focus-within:bg-primary/40 rounded-full" />
              </div>

              <div className="flex items-center gap-8 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${service?.invoiceSent ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-transparent group-hover:border-primary/50'}`}
                  >
                    {service?.invoiceSent && <LucideIcons.Check className="w-3.5 h-3.5" />}
                  </div>
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
                    className="hidden"
                  />
                  <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    Invoice sent
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${service?.invoicePaid ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-transparent group-hover:border-primary/50'}`}
                  >
                    {service?.invoicePaid && <LucideIcons.Check className="w-3.5 h-3.5" />}
                  </div>
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
                    className="hidden"
                  />
                  <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    Invoice paid
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Commission Column */}
          <div className="flex flex-col space-y-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <LucideIcons.PieChart className="w-5 h-5 text-primary" />
                  Commission
                </h3>
              </div>

              <div className="flex flex-col gap-8">
                {/* Large Editable Number: Commission Value */}
                <div className="group relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-medium text-slate-500 transition-colors group-focus-within:text-primary">
                      Commission value
                    </label>
                    <button
                      onClick={autoCalcCommission}
                      className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 opacity-80 hover:opacity-100"
                    >
                      <LucideIcons.Sparkles className="w-3 h-3" />
                      Auto-calculate 20%
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-light text-slate-400">$</span>
                    <input
                      type="text"
                      className="text-4xl font-light text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-slate-200"
                      value={commDraft}
                      onChange={(e) => setCommDraft(e.target.value)}
                      onBlur={handleCommBlur}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="h-[2px] bg-slate-100 w-full mt-2 transition-colors group-focus-within:bg-primary/40 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${service?.commPaid ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-transparent group-hover:border-primary/50'}`}
                >
                  {service?.commPaid && <LucideIcons.Check className="w-3.5 h-3.5" />}
                </div>
                <input
                  type="checkbox"
                  checked={service?.commPaid || false}
                  onChange={(e) => handleCommPaidToggle(e.target.checked)}
                  className="hidden"
                />
                <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Commission paid
                </span>
              </label>

              {service?.commPaid && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-[13px] font-medium text-slate-500 mb-2 block">
                    Payment date
                  </label>
                  <div className="w-64">
                    <DatePicker
                      value={service?.commDateVal}
                      onChange={(val, str) =>
                        handleUpdate(
                          'commDateVal',
                          val,
                          service?.commDateVal,
                          'Commission Paid Date',
                          { commDateStr: str }
                        )
                      }
                      label="Select date"
                      placeholder="No date set"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
