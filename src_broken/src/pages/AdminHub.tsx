"import React, { useState, useEffect } from 'react';\nimport { useAppState } from '../context/AppStateContext';\nimport { \n    AlertCircle, ArchiveRestore, RotateCcw, Trash2, \n    History, Search, Settings as SettingsIcon, Users, \n    FolderOpen, Package, ChevronDown\n} from 'lucide-react';\nimport { getSystemLogs, restoreRecord, hardDeleteRecord, saveSettings } from '../api/dbService';\nimport { toast } from '../utils/toast';\n\nexport default function AdminHub() {\n    const [activeTab, setActiveTab] = useState<'audit' | 'archives'>('audit');\n    const { settings, archivedClients, archivedProjects, archivedServices } = useAppState();\n    \n    // --- AUDIT TRAIL STATE ---\n    const [logs, setLogs] = useState<any[]>([]);\n    const [loadingLogs, setLoadingLogs] = useState(false);\n    const [auditSearch, setAuditSearch] = useState('');\n    const [auditFilter, setAuditFilter] = useState<'All' | 'Clients' | 'Projects' | 'Services' | 'Settings'>('All');\n    const [auditLimit, setAuditLimit] = useState(50);\n\n    // --- ARCHIVES STATE ---\n    const [archiveTab, setArchiveTab] = useState<'clients' | 'projects' | 'services' | 'settings'>('clients');\n    const [archiveSearch, setArchiveSearch] = useState('');\n    const [confirmArchiveDeleteId, setConfirmArchiveDeleteId] = useState<string | null>(null);\n\n    useEffect(() => {\n        if (activeTab === 'audit') {\n            loadLogs();\n        }\n    }, [activeTab]);\n\n    const loadLogs = async () => {\n        setLoadingLogs(true);\n        const data = await getSystemLogs();\n        setLogs(data);\n        setLoadingLogs(false);\n    };\n\n    // --- ARCHIVES ACTIONS ---\n    const handleRestoreRecordLocal = async (collectionName: string, item: any) => {\n        const title = item.companyName || item.name || 'Record';\n        toast.promise(restoreRecord(collectionName, item.id), {\n            loading: `Restoring ${title}...`,\n            success: `${title} restored successfully.`,\n            error: `Failed to restore ${title}.`\n        });\n
<truncated 21929 bytes>
            <div className="flex items-center gap-2 overflow-x-auto custom-thin-scroll mb-6 px-1 -ml-1 pb-1">
                {[
    History, Search, Settings as SettingsIcon, Users, 
    FolderOpen, Package, ChevronDown, Grid,
    Building2, Home, Briefcase
} from 'lucide-react';
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 ${activeTab === tab.id ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'opacity-70'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 min-h-0 w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex-col">
                <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white custom-thin-scroll">
                    {activeTab === 'audit' && renderAuditTrail()}
                    {activeTab === 'archives' && renderArchives()}
                </div>
            </div>
                    <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar shrink-0">
                    <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar shrink-0">
                    <div className="flex gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar shrink-0">
                    <div className="flex gap-2 overflow-x-auto py-2 px-2 -mx-2 sm:px-2 sm:-mx-2 hide-scrollbar shrink-0">
                    <div className="flex gap-2 overflow-x-auto py-2 px-2 -mx-2 sm:px-2 sm:-mx-2 hide-scrollbar shrink-0">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 shrink-0 relative z-30">
    return (
        <div className="flex flex-1 overflow-hidden flex-col bg-slate-50/50 pt-2 px-4 md:px-6 pb-0">
    return (
        <div className="flex flex-1 overflow-hidden flex-col bg-white pt-2 px-4 md:px-6 pb-0">
    const handleRestoreRecordLocal = async (collectionName: string, item: any) => {
        const title = item.companyName || item.name || 'Record';
        toast.promise(restoreRecord(collectionName, item.clientId || item.id), {
            loading: `Restoring ${title}...`,
            success: `${title} restored successfully.`,
    const handleRestoreRecordLocal = async (collectionName: string, item: any) => {
        const title = item.companyName || item.name || 'Record';
        toast.promise(restoreRecord(collectionName, item.clientId || item.id, title, { silent: true }), {
            loading: `Restoring ${title}...`,
            success: `${title} restored successfully.`,
            error: `Failed to restore ${title}.`
        });
    };

    const handleHardDeleteRecordLocal = async (collectionName: string, item: any) => {
        const title = item.companyName || item.name || 'Record';
        toast.promise(hardDeleteRecord(collectionName, item.clientId || item.id, title, { silent: true }), {
            loading: `Permanently deleting ${title}...`,
            success: `${title} permanently deleted.`,
            error: `Failed to delete ${title}.`
        });
    };
                                                    {log.entityType === 'Client' ? <Building2 className="w-4 h-4" /> :
                                                     log.entityType === 'Project' ? <Home className="w-4 h-4" /> :
                                                     log.entityType === 'Service' ? <Briefcase className="w-4 h-4" /> :
                                                     <SettingsIcon className="w-4 h-4" />}
                                                </div>