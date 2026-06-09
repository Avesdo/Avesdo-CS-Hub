"import React, { useState, useMemo, useEffect, useRef } from 'react';\nimport { X, ChevronDown } from 'lucide-react';\nimport { useUI } from '../../context/UIContext';\nimport { useAppState } from '../../context/AppStateContext';\nimport { updateServiceRecord, addAutoLog, addProjectAutoLog, addServiceAutoLog } from '../../api/dbService';\nimport { Service } from '../../types';\nimport toast from 'react-hot-toast';\nimport { v4 as uuidv4 } from 'uuid';\nimport { Select } from '../ui/Select';\nimport { useOnClickOutside } from '../../hooks/useOnClickOutside';\n\nconst CreatableSelect = ({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (val: string) => void, placeholder: string }) => {\n  const [isOpen, setIsOpen] = useState(false);\n  const ref = useRef<HTMLDivElement>(null);\n  \n  useOnClickOutside(ref, () => setIsOpen(false), isOpen);\n\n  const filteredOptions = options.filter(o => o.toLowerCase().includes(value.toLowerCase()) && o !== value);\n\n  return (\n    <div className=\"relative w-full\" ref={ref}>\n      <div className=\"relative\">\n        <input \n          type=\"text\"\n          value={value}\n          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}\n          onFocus={() => setIsOpen(true)}\n          placeholder={placeholder}\n          className=\"w-full min-w-0 rounded-md border border-input bg-white px-3 py-2 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/50 text-sm h-[38px] pr-8\"\n        />\n        <ChevronDown className={`w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />\n      </div>\n      {isOpen && filteredOptions.length > 0 && (\n        <div className=\"absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-xl shadow-xl z-[250] p-1 font-normal animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto custom-thin-scroll\">\n       
<truncated 17456 bytes>
      const serviceId = uuidv4();
      const today = new Date();
      const newService: Service = {
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
      <div 
        className={`fixed inset-0 z-[130] overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:py-12 flex items-start justify-center custom-thin-scroll transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);
        serviceId: serviceId.substring(0, 8),
        serviceId: serviceId.substring(0, 8),
      await updateServiceRecord(newService, {
        successMsg: `Service '${serviceName.trim()}' successfully added.`,
        errorMsg: `Failed to add service '${serviceName.trim()}'.`
      });