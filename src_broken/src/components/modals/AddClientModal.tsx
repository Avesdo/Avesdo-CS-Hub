"import React, { useState } from 'react';\nimport { X, ChevronDown, Search } from 'lucide-react';\nimport { useUI } from '../../context/UIContext';\nimport { useAppState } from '../../context/AppStateContext';\nimport { updateClientRecord, addAutoLog } from '../../api/dbService';\nimport { Client } from '../../types';\nimport { v4 as uuidv4 } from 'uuid';\n\nconst SelectPopover = ({ value, options, onChange, placeholder }: { value: string, options: string[], onChange: (val: string) => void, placeholder: string }) => {\n  const [isOpen, setIsOpen] = useState(false);\n  const [search, setSearch] = useState('');\n  const ref = React.useRef<HTMLDivElement>(null);\n\n  React.useEffect(() => {\n    const handleClickOutside = (e: MouseEvent) => {\n      if (ref.current && !ref.current.contains(e.target as Node)) {\n        setIsOpen(false);\n      }\n    };\n    if (isOpen) document.addEventListener('mousedown', handleClickOutside);\n    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, [isOpen]);\n\n  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));\n\n  return (\n    <div className=\"relative w-full\" ref={ref}>\n      <button \n        type=\"button\"\n        onClick={() => setIsOpen(!isOpen)}\n        className=\"w-full bg-white shadow-sm h-[38px] active:scale-95 transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-[#00bdd9]/20 border border-input rounded-md px-3 text-left flex justify-between items-center text-sm\"\n      >\n        <span className={`truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}>{value || placeholder}</span>\n        <ChevronDown className=\"w-4 h-4 text-muted-foreground shrink-0\" />\n      </button>\n      {isOpen && (\n        <div className=\"absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-xl shadow-xl z-[90] p-1 font-normal animate-in fade-in zoom-in-95 duration-100\">\n          <div className=\"relative mb-1 p-1\">\n          
<truncated 8449 bytes>
  const [isClosing, setIsClosing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isModalOpen('addClient') && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeModal();
    }, 200);
  };
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[120] duration-200 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in'}`} onClick={handleClose}></div>
      const newClientId = uuidv4().substring(0, 8);
      const newClientId = uuidv4().substring(0, 8);
      await updateClientRecord(newClient, {
        successMsg: `Client '${companyName.trim()}' successfully created.`,
        errorMsg: `Failed to create client '${companyName.trim()}'.`
      });
        <div className="p-6 custom-thin-scroll overflow-visible">
        className={`fixed inset-0 z-[150] overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:py-12 flex items-start justify-center custom-thin-scroll transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>