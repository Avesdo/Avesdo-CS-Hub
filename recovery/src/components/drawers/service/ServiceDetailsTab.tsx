"import React, { useState, useEffect, useRef } from 'react';\nimport { Calendar, ChevronDown, Check, AlertTriangle } from 'lucide-react';\nimport { updateServiceRecord, addAutoLog, addProjectAutoLog } from '../../../api/dbService';\nimport { useAppState } from '../../../context/AppStateContext';\nimport { getSettingBadge } from '../../../utils/uiUtils';\n\ninterface ServiceDetailsTabProps {\n  service: any;\n}\n\nexport default function ServiceDetailsTab({ service }: ServiceDetailsTabProps) {\n  const { settings, user } = useAppState();\n\n  const [openPop, setOpenPop] = useState<'type' | 'manager' | 'outcome' | 'status' | 'date' | 'commDate' | null>(null);\n  const popRef = useRef<HTMLDivElement>(null);\n  const openPopRef = useRef(openPop);\n  useEffect(() => { openPopRef.current = openPop; }, [openPop]);\n  \n  // Date Picker State\n  const [calMonth, setCalMonth] = useState(() => {\n     if (service?.dateVal) {\n        const d = new Date(service.dateVal);\n        return new Date(d.getFullYear(), d.getMonth(), 1);\n     }\n     return new Date(new Date().getFullYear(), new Date().getMonth(), 1);\n  });\n  \n  const [commCalMonth, setCommCalMonth] = useState(() => {\n     if (service?.commDateVal) {\n        const d = new Date(service.commDateVal);\n        return new Date(d.getFullYear(), d.getMonth(), 1);\n     }\n     return new Date(new Date().getFullYear(), new Date().getMonth(), 1);\n  });\n\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (popRef.current && !popRef.current.contains(event.target as Node)) {\n        setOpenPop(null);\n      }\n    };\n    const handleKeyDown = (event: KeyboardEvent) => {\n      if (event.key === 'Escape' && openPopRef.current) {\n        event.stopPropagation();\n        setOpenPop(null);\n      }\n    };\n    document.addEventListener('mousedown', handleClickOutside);\n    document.addEventListener('keydown', handleKeyDown);\n    return () => {\n      document.removeEventListener('mousedown', handleClickOutside);\n      document.r
<truncated 25353 bytes>
import { updateServiceRecord, addAutoLog, addProjectAutoLog, addServiceAutoLog } from '../../../api/dbService';
          updates.status = 'Proposal Sent';
          updates.outcome = '';
      }
          {openPop === 'status' && (
             <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white border border-border rounded-lg shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
               {serviceStatuses.map((s: any) => (
                 <button key={s.name} onClick={() => handleStatusChange(s.name)} className="w-full text-left px-2 py-1.5 text-sm font-medium rounded-md hover:bg-slate-50 flex items-center justify-between">
                   {getSettingBadge('serviceStatuses', s.name, settings)}
        if (service?.clientIds) {
            for (const cid of service.clientIds) {
                await addAutoLog(cid, logMsg, user?.name || 'System');
            }
        }
        if (service?.projectId && service.projectId !== 'N/A') {
            await addProjectAutoLog(service.projectId, logMsg, user?.name || 'System');
        }
        await addServiceAutoLog(service.id, logMsg, user?.name || 'System');
    };
    const handleUpdate = async (field: string, newValue: any, oldValue: any, logPrefix?: string, forceUpdates?: any) => {
        if (newValue === oldValue) return;
        
        const payload = { ...service, [field]: newValue, ...(forceUpdates || {}) };
        await updateServiceRecord(payload);
        
        const displayVal = (val: any) => {
            if (val === null || val === undefined || val === '') return 'None';
            if (typeof val === 'boolean') return val ? 'Yes' : 'No';
            if (field.includes('DateVal') || field === 'dateVal') {
                 const parsed = new Date(val);
                 if (isNaN(parsed.getTime())) return 'None';
                 return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
            if (field === 'price' || field === 'commission') {
                 const num = Number(val);
                 if (isNaN(num)) return 'None';
                 return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
            }
            return String(val);
        };

        let logMsg = logPrefix 
          ? `${logPrefix} changed from "${displayVal(oldValue)}" to "${displayVal(newValue)}"`
          : `Updated ${field} to "${displayVal(newValue)}"`;
      const payload = { ...service, [field]: newValue, ...(forceUpdates || {}) };
      
      let successMsg = `Updates to '${service.name}' saved successfully.`;
      let errorMsg = `Failed to save updates to '${service.name}'.`;

      if (logPrefix) {
         successMsg = `${logPrefix} successfully updated for '${service.name}'.`;
         errorMsg = `Failed to update ${logPrefix} for '${service.name}'.`;
      } else if (field === 'contactName') {
         successMsg = `Client Contact Name successfully updated for '${service.name}'.`;
         errorMsg = `Failed to update Client Contact Name for '${service.name}'.`;
      }

      await updateServiceRecord(payload, { successMsg, errorMsg });
            <div className="popover-container">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Last Updated</label>
              <DatePicker
                value={service?.dateVal}
                onChange={(val, str) => handleUpdate('dateVal', val, service?.dateVal, 'Last Updated', { dateStr: str })}
                label="Set Update Date"
                placeholder="No Date"
              />
            </div>
        </div>
                onChange={(val, str) => handleUpdate('dateVal', val, service?.dateVal, 'Completion Date', { dateStr: str })}
                label="Set Completion Date"
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Completion Date</label>
      } else {
          updates.status = 'Proposal Sent';
          updates.outcome = 'Proposal Sent';
      }
      let logMsg = logPrefix 
        ? `${logPrefix} changed from "${displayVal(oldValue)}" to "${displayVal(newValue)}"`
        : `Updated ${field} to "${displayVal(newValue)}"`;

      if (field === 'status') {
          if (service?.clientIds) {
              for (const cid of service.clientIds) {
                  await addAutoLog(cid, logMsg, user?.name || 'System', true);
              }
          }
          if (service?.projectId && service.projectId !== 'N/A') {
              await addProjectAutoLog(service.projectId, logMsg, user?.name || 'System', true);
          }
      }
      await addServiceAutoLog(service.id, logMsg, user?.name || 'System');