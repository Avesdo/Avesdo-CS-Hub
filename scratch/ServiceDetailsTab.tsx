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
  const user = useAppStore(state => state.user);

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
      {(!service?.type || !service?.status || (!service?.managers?.length && !service?.manager)) && (
        <div className="px-5 py-4 border border-orange-200/50 bg-orange-50/50 rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-orange-800 tracking-tight">Missing Fields</span>
            <span className="text-xs text-orange-600 font-medium">Please ensure Service Type, Manager, and Status are set in the left sidebar.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* General Details Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col space-y-5 h-fit">
          <h3 className="text-[13px] font-bold text-slate-900 tracking-wide uppercase">General Details</h3>
          
          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Client Contact Name</label>
            <input
              type="text"
              placeholder="Enter primary contact name..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
              value={contactDraft}
              onChange={(e) => setContactDraft(e.target.value)}
              onBlur={handleContactBlur}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Completion Date</label>
            <DatePicker
              value={service?.dateVal}
              onChange={(val, str) => handleUpdate('dateVal', val, service?.dateVal, 'Completion Date', { dateStr: str })}
              label="Set Completion Date"
              placeholder="No Date"
            />
          </div>
        </div>

        {/* Financials Card */}
        {!isIncluded && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col space-y-5 h-fit">
            <h3 className="text-[13px] font-bold text-slate-900 tracking-wide uppercase">Financials</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Invoice Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                  <input
                    type="text"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    value={priceDraft}
                    onChange={(e) => setPriceDraft(e.target.value)}
                    onBlur={handlePriceBlur}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Service Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                  <input
                    type="text"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    value={serviceValueDraft}
                    onChange={(e) => setServiceValueDraft(e.target.value)}
                    onBlur={handleServiceValueBlur}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Invoice Number</label>
              <input
                type="text"
                placeholder="e.g. INV-1002"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all mb-4"
                value={invoiceDraft}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                onBlur={handleInvoiceBlur}
              />

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={service?.invoiceSent || false}
                    onChange={(e) => handleUpdate('invoiceSent', e.target.checked, service?.invoiceSent, 'Invoice Sent')}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 outline-none transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Invoice Sent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={service?.invoicePaid || false}
                    onChange={(e) => handleUpdate('invoicePaid', e.target.checked, service?.invoicePaid, 'Invoice Paid')}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 outline-none transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Invoice Paid</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Commission Card */}
        {!isIncluded && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col space-y-5 h-fit xl:col-span-2">
            <h3 className="text-[13px] font-bold text-slate-900 tracking-wide uppercase">Commission Tracking</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Commission Value</label>
                  <button
                    onClick={autoCalcCommission}
                    className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors active:scale-95"
                  >
                    Auto Calc (20%)
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                  <input
                    type="text"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                    value={commDraft}
                    onChange={(e) => setCommDraft(e.target.value)}
                    onBlur={handleCommBlur}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Payment Status</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={service?.commPaid || false}
                    onChange={(e) => handleCommPaidToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 outline-none transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Commission Paid</span>
                </label>

                {service?.commPaid && (
                  <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <DatePicker
                      value={service?.commDateVal}
                      onChange={(val, str) => handleUpdate('commDateVal', val, service?.commDateVal, 'Commission Paid Date', { commDateStr: str })}
                      label="Set Paid Date"
                      placeholder="No Date"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}