import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { 
    Building2, GitMerge, Package, Calculator, Plus, Trash2, Edit2, 
    GripVertical, ChevronUp, ChevronDown, User, AlertCircle, ArchiveRestore, RotateCcw
} from 'lucide-react';
import { saveSettings, bulkUpdateProjects, bulkUpdateClients, bulkUpdateServices, restoreRecord, hardDeleteRecord, addAutoLog, addProjectAutoLog, addServiceAutoLog, addGlobalLog } from '../api/dbService';
import { toast } from '../utils/toast';
import { ICONS, COLORS, COLOR_MAP, hexToRgba, renderIcon } from '../utils/uiUtils';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

function CustomPicker({ 
    type, 
    value, 
    onChange 
}: { 
    type: 'color' | 'icon', 
    value: string, 
    onChange: (val: string) => void 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOnClickOutside(ref, () => setIsOpen(false), isOpen);

    const hex = type === 'color' ? (COLOR_MAP[value] || COLOR_MAP.slate) : '';

    return (
        <div 
            className="relative shrink-0" 
            ref={ref}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.stopPropagation();
                    setIsOpen(false);
                }
                if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
                    e.preventDefault();
                    setIsOpen(true);
                }
            }}
        >
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 rounded-md border border-input bg-white px-2.5 text-sm outline-none hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md w-full"
            >
                {type === 'color' ? (
                    <span className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: hex }}></span>
                ) : (
                    <span className="text-slate-600">{renderIcon(value, "w-4 h-4")}</span>
                )}
                <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100" style={{ width: type === 'icon' ? '420px' : '220px' }}>
                    {type === 'color' ? (
                        <div className="grid grid-cols-5 gap-1.5">
                            {COLORS.map(c => {
                                const cHex = COLOR_MAP[c];
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onChange(c);
                                                setIsOpen(false);
                                            }
                                        }}
                                        onClick={() => { onChange(c); setIsOpen(false); }}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all hover:scale-110 active:scale-95 outline-none focus:ring-2 focus:ring-primary/20 ${value === c ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                                        title={c}
                                    >
                                        <span className="w-5 h-5 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: cHex }}></span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-10 gap-1 p-1">
                            {ICONS.map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onChange(i);
                                            setIsOpen(false);
                                        }
                                    }}
                                    onClick={() => { onChange(i); setIsOpen(false); }}
                                    className={`w-9 h-9 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-primary transition-all active:scale-95 outline-none focus:ring-2 focus:ring-primary/20 ${value === i ? 'bg-primary/10 text-primary border border-primary/20' : 'border border-transparent'}`}
                                    title={i}
                                >
                                    {renderIcon(i, "w-4 h-4")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SettingsDraft() {
    const { settings, projects, clients, services, user } = useAppState();
    const [activeTab, setActiveTab] = useState<'org' | 'workflow' | 'products' | 'scoring'>('org');

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    useEffect(() => {
        if (errorMsg) {
            const timer = setTimeout(() => setErrorMsg(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

    const [editingItem, setEditingItem] = useState<{ field: string, idx: number, globalIdx?: number } | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ field: string, idx: number, globalIdx?: number } | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [newForm, setNewForm] = useState<{ [key: string]: any }>({});
    
    const [draggedItem, setDraggedItem] = useState<{ field: string, idx: number, globalIdx?: number } | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

    const [projectWeights, setProjectWeights] = useState({ opActivity: 40, featAdoption: 30, userVol: 20, csat: 10 });
    const [clientWeights, setClientWeights] = useState({ billing: 15, engagement: 50, utilization: 25, experience: 10 });
    const [thresholds, setThresholds] = useState({ healthy: 80, warning: 50 });

    const saveTimeout = useRef<any>(null);

    useEffect(() => {
        if (settings?.scoring) {
            setProjectWeights(settings.scoring.weights || { opActivity: 40, featAdoption: 30, userVol: 20, csat: 10 });
            setClientWeights(settings.scoring.clientWeights || { billing: 15, engagement: 50, utilization: 25, experience: 10 });
            setThresholds(settings.scoring.thresholds || { healthy: 80, warning: 50 });
        }
    }, [settings]);

    if (!settings) {
        return (
            <div className="flex flex-1 items-center justify-center bg-slate-50">
                <div className="animate-pulse text-muted-foreground text-sm font-medium">Loading settings...</div>
            </div>
        );
    }

    const totalProjectWeights = Object.values(projectWeights).reduce((a, b) => a + Number(b), 0);
    const totalClientWeights = Object.values(clientWeights).reduce((a, b) => a + Number(b), 0);

    const debouncedSaveSettings = (newSettings: any) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            try {
                await saveSettings(newSettings);
            } catch (e) {
                console.error("Save settings failed", e);
            }
        }, 800);
    };

    const cascadeSettingRename = async (field: string, oldName: string, newName: string) => {
        if (oldName === newName) return;

        let projIds: string[] = []; let projUpdates: any = {};
        let clientIds: string[] = []; let clientUpdates: any = {};
        let svcIds: string[] = []; let svcUpdates: any = {};

        if (field === 'managers') {
            projUpdates.assignee = newName;
            clientUpdates.accountManager = newName;
            svcUpdates.manager = newName;
            projects.forEach(p => { if (p.assignee === oldName) projIds.push(p.id); });
            clients.forEach(c => { if (c.accountManager === oldName) clientIds.push(c.clientId); });
            services.forEach(s => { if (s.manager === oldName) svcIds.push(s.id); });
        } else if (field === 'statuses') {
            projUpdates.projectStatus = newName;
            projects.forEach(p => { if (p.projectStatus === oldName) projIds.push(p.id); });
        } else if (field === 'timelines') {
            projUpdates.timelineStatus = newName;
            projects.forEach(p => { if (p.timelineStatus === oldName) projIds.push(p.id); });
        } else if (field === 'phases') {
            projUpdates.onboardingPhase = newName;
            projects.forEach(p => { if (p.onboardingPhase === oldName) projIds.push(p.id); });
        } else if (field === 'clientTypes') {
            clientUpdates.clientType = newName;
            clients.forEach(c => { if (c.clientType === oldName) clientIds.push(c.clientId); });
        } else if (field === 'services' || field === 'serviceTypes' || field === 'serviceOutcomes' || field === 'serviceStatuses') {
            if (field === 'services') svcUpdates.name = newName;
            if (field === 'serviceTypes') svcUpdates.type = newName;
            if (field === 'serviceOutcomes') svcUpdates.outcome = newName;
            if (field === 'serviceStatuses') svcUpdates.status = newName;
            
            services.forEach(s => { 
                if (field === 'services' && s.name === oldName) svcIds.push(s.id); 
                if (field === 'serviceTypes' && s.type === oldName) svcIds.push(s.id);
                if (field === 'serviceOutcomes' && s.outcome === oldName) svcIds.push(s.id);
                if (field === 'serviceStatuses' && s.status === oldName) svcIds.push(s.id);
            });
        } else if (field === 'features') {
            const updates = projects.filter(p => p.features?.includes(oldName)).map(p => {
                 const newFeats = (p.features || []).map((f: string) => f === oldName ? newName : f);
                 return bulkUpdateProjects([p.id], { features: newFeats }, { silent: true });
            });
            if(updates.length > 0) {
                await Promise.all(updates);
            }
            return;
        }

        if (projIds.length > 0 || clientIds.length > 0 || svcIds.length > 0) {
            if (projIds.length > 0) await bulkUpdateProjects(projIds, projUpdates, { silent: true });
            if (clientIds.length > 0) await bulkUpdateClients(clientIds, clientUpdates, { silent: true });
            if (svcIds.length > 0) await bulkUpdateServices(svcIds, svcUpdates, { silent: true });
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        const { field, idx, globalIdx } = editingItem;
        const newName = editForm.name;
        if (!newName?.trim()) { setErrorMsg("Name cannot be empty."); return; }

        let newSettings = { ...settings };
        let oldName = '';

        if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
            const currentData = [...(settings.settingsData || [])];
            oldName = currentData[globalIdx!].name;
            currentData[globalIdx!] = { ...currentData[globalIdx!], name: newName.trim(), color: editForm.color, icon: editForm.icon };
            newSettings.settingsData = currentData;
        } else {
            const currentList = [...(settings[field as keyof typeof settings] as any[])];
            const oldItem = currentList[idx];
            oldName = typeof oldItem === 'string' ? oldItem : oldItem.name;

            let newItemData: any;
            if (typeof oldItem === 'string') {
                newItemData = newName.trim();
            } else if (field === 'services') {
                newItemData = { name: newName.trim(), price: Number(editForm.price) || 0 };
            } else {
                newItemData = { name: newName.trim(), color: editForm.color, icon: editForm.icon };
            }
            currentList[idx] = newItemData;
            newSettings = { ...newSettings, [field]: currentList };
        }

        const saveProcess = async () => {
            await saveSettings(newSettings, { silent: true });
            await cascadeSettingRename(field, oldName, newName.trim());
            
            const logMapping: Record<string, string> = {
                managers: 'Account Manager',
                types: 'Client Type',
                projectStatuses: 'Project Status',
                timelines: 'Timeline tag',
                phases: 'Project Phase',
                serviceOutcomes: 'Service Outcome',
                serviceStatuses: 'Service Status',
                serviceTypes: 'Service Type',
                services: 'Service template',
                features: 'Feature'
            };
            const prefix = logMapping[field] || field;
            if (oldName !== newName.trim()) {
                await addGlobalLog(`Updated ${prefix} from '${oldName}' to '${newName.trim()}'`, 'Setting', 'global', 'Settings', user?.name);
            } else {
                await addGlobalLog(`Updated configuration properties for ${prefix}: '${oldName}'`, 'Setting', 'global', 'Settings', user?.name);
            }
        };

        const categoryName = (() => {
            const m: any = { managers: 'Account Managers', types: 'Client Types', projectStatuses: 'Project Statuses', phases: 'Project Phases', serviceOutcomes: 'Service Outcomes', serviceStatuses: 'Service Statuses', features: 'Features', services: 'Services' };
            return m[field] || field;
        })();

        toast.promise(saveProcess(), {
            loading: `Saving and applying updates to ${categoryName}: '${newName.trim()}' ...`,
            success: `${categoryName}: '${newName.trim()}' successfully updated.`,
            error: `Failed to update setting ${categoryName}: '${newName.trim()}'.`
        }).then(() => {
            setEditingItem(null);
        }).catch((e) => {
            console.error("Save failed", e);
        });
    };

    const handleConfirmDelete = () => {
        if (!deletingItem) return;
        const { field, idx, globalIdx } = deletingItem;
        let newSettings = { ...settings };

        if (!newSettings.archivedData) newSettings.archivedData = {};

        if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
            const currentData = [...(settings.settingsData || [])];
            const archivedItem = currentData.splice(globalIdx!, 1)[0];
            newSettings.settingsData = currentData;
            
            if (!newSettings.archivedData.settingsData) newSettings.archivedData.settingsData = [];
            newSettings.archivedData.settingsData.push(archivedItem);
        } else {
            const currentList = [...(settings[field as keyof typeof settings] as any[])];
            const archivedItem = currentList.splice(idx, 1)[0];
            newSettings = { ...newSettings, [field]: currentList };
            
            if (!newSettings.archivedData[field]) newSettings.archivedData[field] = [];
            newSettings.archivedData[field].push(archivedItem);
        }

        debouncedSaveSettings(newSettings);
        setDeletingItem(null);
    };

    const handleAdd = (field: string) => {
        const form = newForm[field] || {};
        const name = form.name?.trim();
        if (!name) return;

        let newSettings = { ...settings };

        if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
            const currentData = [...(settings.settingsData || [])];
            const cat = field === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
            currentData.push({ category: cat, name: name, color: form.color || 'slate', icon: form.icon || 'CircleDashed' });
            newSettings.settingsData = currentData;
        } else {
            const currentList = [...((settings[field as keyof typeof settings] as any[]) || [])];
            let newItemData: any;
            if (field === 'features') {
                newItemData = name;
            } else if (field === 'services') {
                newItemData = { name: name, price: Number(form.price) || 0 };
            } else {
                newItemData = { name: name, color: form.color || 'slate', icon: form.icon || (field==='managers'?'User':'CircleDashed') };
            }
            currentList.push(newItemData);
            newSettings = { ...newSettings, [field]: currentList };
        }

        const categoryName = (() => {
            const m: any = { managers: 'Account Managers', types: 'Client Types', projectStatuses: 'Project Statuses', phases: 'Project Phases', serviceOutcomes: 'Service Outcomes', serviceStatuses: 'Service Statuses', features: 'Features', services: 'Services' };
            return m[field] || field;
        })();

        toast.promise(saveSettings(newSettings, { silent: true }), {
            loading: `Adding '${name}' to ${categoryName}...`,
            success: `'${name}' was successfuly added to ${categoryName}.`,
            error: `Failed to add '${name}' to ${categoryName}.`
        }).then(async () => {
            setNewForm({ ...newForm, [field]: {} });
            
            const logMapping: Record<string, string> = {
                managers: 'Account Manager',
                types: 'Client Type',
                projectStatuses: 'Project Status',
                timelines: 'Timeline tag',
                phases: 'Project Phase',
                serviceOutcomes: 'Service Outcome',
                serviceStatuses: 'Service Status',
                serviceTypes: 'Service Type',
                services: 'Service template',
                features: 'Feature'
            };
            const prefix = logMapping[field] || field;
            await addGlobalLog(`Added ${prefix}: '${name}'`, 'Setting', 'global', 'Settings', user?.name);
        }).catch(e => console.error("Add failed", e));
    };

    const moveItem = (field: string, idx: number, dir: number, items: any[]) => {
        if (idx + dir < 0 || idx + dir >= items.length) return;
        let newSettings = { ...settings };

        if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
            const cat = field === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
            const globalData = [...(settings.settingsData || [])];
            
            const item1 = items[idx];
            const item2 = items[idx + dir];
            const gIdx1 = globalData.findIndex(s => s.category === cat && s.name === item1.name);
            const gIdx2 = globalData.findIndex(s => s.category === cat && s.name === item2.name);
            
            if (gIdx1 !== -1 && gIdx2 !== -1) {
                const temp = globalData[gIdx1];
                globalData[gIdx1] = globalData[gIdx2];
                globalData[gIdx2] = temp;
            }
            newSettings.settingsData = globalData;
        } else {
            const currentList = [...(settings[field as keyof typeof settings] as any[])];
            const temp = currentList[idx];
            currentList[idx] = currentList[idx + dir];
            currentList[idx + dir] = temp;
            newSettings = { ...newSettings, [field]: currentList };
        }

        debouncedSaveSettings(newSettings);
    };

    const handleDragStart = (e: React.DragEvent, field: string, idx: number, globalIdx?: number) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedItem({ field, idx, globalIdx });
    };

    const handleDragOver = (e: React.DragEvent, field: string, idx: number) => {
        e.preventDefault();
        if (draggedItem?.field === field && draggedItem.idx !== idx) {
            setDragOverIdx(idx);
        }
    };

    const handleDrop = (e: React.DragEvent, field: string, idx: number, items: any[]) => {
        e.preventDefault();
        if (draggedItem?.field === field && draggedItem.idx !== idx) {
            let newSettings = { ...settings };
            
            if (field === 'serviceOutcomes' || field === 'serviceStatuses') {
                const cat = field === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
                let globalData = [...(settings.settingsData || [])];
                const itemToMove = items[draggedItem.idx];
                
                let catItems = globalData.filter(s => s.category === cat);
                let otherItems = globalData.filter(s => s.category !== cat);
                
                catItems.splice(draggedItem.idx, 1);
                catItems.splice(idx, 0, itemToMove);
                
                newSettings.settingsData = [...otherItems, ...catItems];
            } else {
                const currentList = [...(settings[field as keyof typeof settings] as any[])];
                const item = currentList.splice(draggedItem.idx, 1)[0];
                currentList.splice(idx, 0, item);
                newSettings = { ...newSettings, [field]: currentList };
            }
            debouncedSaveSettings(newSettings);
        }
        setDraggedItem(null);
        setDragOverIdx(null);
    };

    const handleSaveScoring = async () => {
        if (totalProjectWeights !== 100 || totalClientWeights !== 100) {
            setErrorMsg("Weights must equal exactly 100%");
            return;
        }
        if (thresholds.warning >= thresholds.healthy) {
            setErrorMsg("Warning threshold must be strictly less than Healthy threshold");
            return;
        }

        const newSettings = {
            ...settings,
            scoring: {
                weights: projectWeights,
                clientWeights: clientWeights,
                thresholds: thresholds
            }
        };
        toast.promise(saveSettings(newSettings, { silent: true }), {
            loading: 'Saving Scoring Rules...',
            success: 'Scoring Rules Saved!',
            error: 'Failed to save Scoring Rules'
        }).then(async () => {
            const pw = `Billing: ${clientWeights.billing}%, Engagement: ${clientWeights.engagement}%, Utilization: ${clientWeights.utilization}%, Experience: ${clientWeights.experience}%`;
            await addGlobalLog(`Updated Client Health Pillar Weights. ${pw}`, 'Setting', 'global', 'Settings', user?.name);
            await addGlobalLog(`Updated KPI Thresholds: Healthy >= ${thresholds.healthy}, Warning <= ${thresholds.warning}`, 'Setting', 'global', 'Settings', user?.name);
        }).catch(e => console.error("Scoring save failed", e));
    };

    const renderList = (title: string, desc: string, fieldName: string) => {
        let items: any[] = [];
        if (fieldName === 'serviceOutcomes') items = (settings.settingsData || []).filter((s:any) => s.category === 'ServiceOutcome');
        else if (fieldName === 'serviceStatuses') items = (settings.settingsData || []).filter((s:any) => s.category === 'ServiceStatus');
        else items = settings[fieldName as keyof typeof settings] as any[] || [];

        const isStringList = fieldName === 'features';
        const isServices = fieldName === 'services';
        const form = newForm[fieldName] || {};

        return (
            <div className="mb-10">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
                <div className="bg-white border border-border rounded-xl shadow-sm">
                    <div className="p-4 border-b border-border bg-slate-50 rounded-t-xl flex gap-3 flex-wrap sm:flex-nowrap items-center z-20 relative">
                            <input 
                                type="text" 
                                className="flex-1 min-w-0 rounded-md border border-input bg-white px-3 h-9 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                            placeholder={`New ${title.endsWith('Status') ? title : title.replace(/s$/, '')}...`}
                            value={form.name || ''}
                            onChange={(e) => setNewForm({...newForm, [fieldName]: {...form, name: e.target.value}})}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd(fieldName)}
                        />
                        {isServices && (
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground font-medium text-sm">$</span>
                                <input 
                                    type="number" 
                                    className="w-24 rounded-md border border-input bg-white px-2 h-9 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                                    placeholder="Price"
                                    value={form.price || ''}
                                    onChange={(e) => setNewForm({...newForm, [fieldName]: {...form, price: e.target.value}})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd(fieldName)}
                                />
                            </div>
                        )}
                        {!isStringList && !isServices && (
                            <div className="flex items-center gap-2">
                                <CustomPicker 
                                    type="color" 
                                    value={form.color || 'slate'} 
                                    onChange={(color) => setNewForm({...newForm, [fieldName]: {...form, color}})} 
                                />
                                {fieldName !== 'managers' && (
                                    <CustomPicker 
                                        type="icon" 
                                        value={form.icon || 'CircleDashed'} 
                                        onChange={(icon) => setNewForm({...newForm, [fieldName]: {...form, icon}})} 
                                    />
                                )}
                            </div>
                        )}
                        <button 
                            onClick={() => handleAdd(fieldName)}
                            className="bg-primary text-primary-foreground px-4 h-9 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 shrink-0 shadow-sm transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md">
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                    <ul className="divide-y divide-border relative">
                        {items.map((item, i) => {
                            let globalIdx: number | undefined;
                            if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
                                globalIdx = settings.settingsData?.findIndex((s:any) => s.category === item.category && s.name === item.name);
                            }

                            const isEditing = editingItem?.field === fieldName && editingItem.idx === i;
                            const isDeleting = deletingItem?.field === fieldName && deletingItem.idx === i;
                            const name = typeof item === 'string' ? item : item.name;
                            const isDragOver = dragOverIdx === i && draggedItem?.field === fieldName;
                            
                            const hex = COLOR_MAP[item.color] || COLOR_MAP.slate;

                            if (isEditing) {
                                return (
                                    <li key={i} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border-l-4 border-l-primary relative z-10 shadow-sm">
                                        <div className="flex items-center gap-3 w-full">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editForm.name} 
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                className="flex-1 min-w-0 rounded-md border border-primary bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                                            />
                                            {isServices && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-muted-foreground font-medium text-sm">$</span>
                                                    <input 
                                                        type="number" 
                                                        value={editForm.price} 
                                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                        className="w-24 rounded-md border border-input bg-white px-2 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                                    />
                                                </div>
                                            )}
                                            {!isStringList && !isServices && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <CustomPicker 
                                                        type="color" 
                                                        value={editForm.color} 
                                                        onChange={(color) => setEditForm({...editForm, color})} 
                                                    />
                                                    {fieldName !== 'managers' && (
                                                        <CustomPicker 
                                                            type="icon" 
                                                            value={editForm.icon} 
                                                            onChange={(icon) => setEditForm({...editForm, icon})} 
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => setEditingItem(null)} className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95 ">Cancel</button>
                                            <button onClick={handleSaveEdit} className="bg-primary text-primary-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-primary/90 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md">Save</button>
                                        </div>
                                    </li>
                                );
                            }

                            if (isDeleting) {
                                return (
                                    <li key={i} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-destructive/5 relative z-10">
                                        <div className="text-sm font-semibold text-destructive flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Archive "{name}"? This removes it from dropdowns but preserves historical records.
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => setDeletingItem(null)} className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95 ">Cancel</button>
                                            <button onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-destructive/90 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md">Confirm Archive</button>
                                        </div>
                                    </li>
                                );
                            }

                            return (
                                <li 
                                    key={i} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, fieldName, i, globalIdx)}
                                    onDragOver={(e) => handleDragOver(e, fieldName, i)}
                                    onDrop={(e) => handleDrop(e, fieldName, i, items)}
                                    onDragEnd={() => { setDraggedItem(null); setDragOverIdx(null); }}
                                    className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-all group ${isDragOver ? 'border-t-2 border-t-primary bg-accent/20' : ''} relative`}
                                >
                                    {isDeleting && (
                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm border border-destructive/20 flex flex-col sm:flex-row items-center justify-between px-4 z-20">
                                            <div className="text-sm font-semibold text-destructive flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" /> Archive "{name}"? This removes it from dropdowns but preserves historical records.
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button onClick={() => setDeletingItem(null)} className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95">Cancel</button>
                                                <button onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-destructive/90 transition-all active:scale-95">Confirm Archive</button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        {!isStringList && !isServices ? (
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="px-2.5 py-1 text-xs shadow-sm tracking-wide font-semibold rounded-full border flex items-center gap-1.5"
                                                    style={{ backgroundColor: hexToRgba(hex, 0.1), color: hex, borderColor: hexToRgba(hex, 0.2) }}
                                                >
                                                    {item.icon && renderIcon(item.icon, "w-3 h-3")}
                                                    <span className="group-hover:text-primary transition-colors">{name}</span>
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{name}</span>
                                                {isServices && (
                                                    <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shadow-sm">
                                                        ${parseFloat(item.price || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors" title="Drag to reorder">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <button onClick={() => moveItem(fieldName, i, -1, items)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95 " title="Move Up">
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveItem(fieldName, i, 1, items)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95 " title="Move Down">
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => {
                                            setEditingItem({ field: fieldName, idx: i, globalIdx });
                                            setEditForm(isStringList ? { name } : (isServices ? { name, price: item.price } : { name, color: item.color, icon: item.icon }));
                                        }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95 " title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeletingItem({ field: fieldName, idx: i, globalIdx })} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-all active:scale-95 " title="Archive">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                        {items.length === 0 && (
                            <li className="text-sm text-muted-foreground font-medium text-center py-10 w-full block bg-slate-50/50">
                                No items found. Add one above.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        );
    };

    const handleRestoreRecordLocal = async (collection: string, record: any) => {
        const id = collection === 'clients' ? (record.clientId || record.id) : record.id;
        const name = collection === 'clients' ? record.companyName : record.name;
        try { 
            await restoreRecord(collection, id, name); 
            const author = user?.name || 'System';
            if (collection === 'clients') {
                await addAutoLog(id, 'Client profile restored', author);
                if (record.projectIds) {
                    for (const pid of record.projectIds) await addProjectAutoLog(pid, `Attached client name updated from "${name}" to "${name}"`, author);
                }
            } else if (collection === 'projects') {
                await addProjectAutoLog(id, 'Project restored', author);
                if (record.clientIds) {
                    for (const cid of record.clientIds) await addAutoLog(cid, 'Project restored', author);
                }
            } else if (collection === 'services') {
                await addServiceAutoLog(id, 'Service restored', author);
                if (record.clientIds) {
                    for (const cid of record.clientIds) await addAutoLog(cid, 'Service restored', author);
                }
                if (record.projectId && record.projectId !== 'N/A') {
                    await addProjectAutoLog(record.projectId, 'Service restored', author);
                }
            }
        } catch (e) {}
    };

    const handleHardDeleteRecordLocal = async (collection: string, record: any) => {
        const id = collection === 'clients' ? (record.clientId || record.id) : record.id;
        const name = collection === 'clients' ? record.companyName : record.name;
        try { 
            await hardDeleteRecord(collection, id, name); 
            // Note: Cannot log to the deleted entity itself because it is gone, 
            // but we can cascade if it was a project or service.
            const author = user?.name || 'System';
            if (collection === 'projects' && record.clientIds) {
                for (const cid of record.clientIds) await addAutoLog(cid, 'Project permanently deleted', author);
            } else if (collection === 'services') {
                if (record.clientIds) {
                    for (const cid of record.clientIds) await addAutoLog(cid, 'Service permanently deleted', author);
                }
                if (record.projectId && record.projectId !== 'N/A') {
                    await addProjectAutoLog(record.projectId, 'Service permanently deleted', author);
                }
            }
        } catch (e) {}
    };

    const handleRestoreSetting = async (category: string, index: number, isSettingsData = false) => {
        if (!settings || !settings.archivedData) return;
        let newSettings = JSON.parse(JSON.stringify(settings));
        if (isSettingsData) {
             const item = newSettings.archivedData.settingsData.splice(index, 1)[0];
             if (!newSettings.settingsData) newSettings.settingsData = [];
             newSettings.settingsData.push(item);
        } else {
             const item = newSettings.archivedData[category].splice(index, 1)[0];
             if (!newSettings[category]) newSettings[category] = [];
             newSettings[category].push(item);
        }
        await saveSettings(newSettings);
        toast.success('Setting Restored', 'The setting was restored successfully.');
    };

    const handleHardDeleteSetting = async (category: string, index: number, isSettingsData = false) => {
        if (!settings || !settings.archivedData) return;
        let newSettings = JSON.parse(JSON.stringify(settings));
        if (isSettingsData) {
             newSettings.archivedData.settingsData.splice(index, 1);
        } else {
             newSettings.archivedData[category].splice(index, 1);
        }
        await saveSettings(newSettings);
        toast.success('Setting Permanently Deleted', 'The setting was permanently removed.');
    };


    return (
        <div className="flex flex-1 overflow-hidden flex-col bg-white pt-2 px-4 md:px-6 pb-0">
            {errorMsg && (
                <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-lg mb-4 text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {errorMsg}
                </div>
            )}
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 shrink-0 relative z-30">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
                    <p className="text-base text-muted-foreground mt-1">Manage workspace configuration, organization, and system defaults.</p>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 w-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex-col md:flex-row">
                <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-border shrink-0 p-4 flex flex-col gap-1 overflow-y-auto custom-thin-scroll">
                    {[
                        { id: 'org', label: 'Organization', icon: Building2 },
                        { id: 'workflow', label: 'Workflow & Status', icon: GitMerge },
                        { id: 'products', label: 'Features & Services', icon: Package },
                        { id: 'scoring', label: 'Scoring Engine', icon: Calculator },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-95  w-full text-left outline-none ${ activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground' }`}
                        >
                            <tab.icon className="w-4 h-4 opacity-70" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white custom-thin-scroll">
                    {activeTab === 'org' && (
                        <div className="max-w-3xl animate-in fade-in duration-300">
                            {renderList("Account Managers", "Manage the users who can be assigned to clients and projects.", 'managers')}
                            {renderList("Client Types", "Classify your clients.", 'clientTypes')}
                        </div>
                    )}
                    {activeTab === 'workflow' && (
                        <div className="max-w-3xl animate-in fade-in duration-300">
                            {renderList("Project Status", "Workflow stages for projects.", 'statuses')}
                            {renderList("Timelines", "Timeline statuses for projects.", 'timelines')}
                            {renderList("Project Phases", "Detailed phases for project execution.", 'phases')}
                            {renderList("Service Outcomes", "Outcome statuses for services.", 'serviceOutcomes')}
                            {renderList("Service Status", "Lifecycle stages for services.", 'serviceStatuses')}
                        </div>
                    )}
                    {activeTab === 'products' && (
                        <div className="max-w-3xl animate-in fade-in duration-300">
                            {renderList("Service Types", "Categories of services.", 'serviceTypes')}
                            {renderList("Services", "Available billable services.", 'services')}
                            {renderList("Features", "System features and modules.", 'features')}
                        </div>
                    )}
                    {activeTab === 'scoring' && (
                        <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
                            {/* Client Pillar Weights */}
                            <div className="bg-white border border-border rounded-lg p-6">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-6">
                                    Client Pillar Weights (Total: {totalClientWeights}%)
                                </h3>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Financial Standing', key: 'billing', val: clientWeights.billing },
                                        { label: 'Platform Engagement', key: 'engagement', val: clientWeights.engagement },
                                        { label: 'Product Utilization', key: 'utilization', val: clientWeights.utilization },
                                        { label: 'Client Experience', key: 'experience', val: clientWeights.experience },
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center gap-4">
                                            <label className="text-[13px] font-bold text-slate-800 w-[180px] shrink-0">{item.label}</label>
                                            <input 
                                                type="range" min="0" max="100" 
                                                className="flex-1 accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer outline-none" 
                                                value={item.val} 
                                                onChange={(e) => setClientWeights({...clientWeights, [item.key]: Number(e.target.value) || 0})} 
                                            />
                                            <span className="text-[13px] font-bold text-slate-800 w-12 text-right">{item.val}%</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                                    <span className={`text-[13px] font-bold ${totalClientWeights === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        Total: {totalClientWeights}%
                                    </span>
                                </div>
                            </div>

                            {/* Project Pillar Weights */}
                            <div className="bg-white border border-border rounded-lg p-6">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-6">
                                    Project Pillar Weights (Total: {totalProjectWeights}%)
                                </h3>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Operational Activity', key: 'opActivity', val: projectWeights.opActivity },
                                        { label: 'Feature Adoption', key: 'featAdoption', val: projectWeights.featAdoption },
                                        { label: 'Active User Volume', key: 'userVol', val: projectWeights.userVol },
                                        { label: 'Project CSAT', key: 'csat', val: projectWeights.csat },
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center gap-4">
                                            <label className="text-[13px] font-bold text-slate-500 w-[180px] shrink-0">{item.label}</label>
                                            <input 
                                                type="range" min="0" max="100" 
                                                className="flex-1 accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer outline-none" 
                                                value={item.val} 
                                                onChange={(e) => setProjectWeights({...projectWeights, [item.key]: Number(e.target.value) || 0})} 
                                            />
                                            <span className="text-[13px] font-bold text-slate-800 w-12 text-right">{item.val}%</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                                    <span className={`text-[13px] font-bold ${totalProjectWeights === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        Total: {totalProjectWeights}%
                                    </span>
                                    <button 
                                        onClick={handleSaveScoring}
                                        disabled={totalProjectWeights !== 100 || totalClientWeights !== 100 || thresholds.warning >= thresholds.healthy}
                                        className="bg-primary text-primary-foreground px-5 h-[34px] rounded-md text-[13px] font-bold hover:bg-primary/90 flex items-center justify-center transition-all active:scale-95  disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Rules
                                    </button>
                                </div>
                            </div>

                            {/* KPI Thresholds */}
                            <div className="bg-white border border-border rounded-lg p-6">
                                <h3 className="text-[15px] font-bold text-slate-800 mb-6">KPI Thresholds</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] font-bold text-slate-500">Healthy Threshold</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[15px] font-medium text-slate-600">≥</span>
                                            <input 
                                                type="number" 
                                                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                                value={thresholds.healthy} 
                                                onChange={(e) => setThresholds({...thresholds, healthy: Number(e.target.value) || 0})} 
                                            />
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-500 mt-1">Scores above this will display green.</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[13px] font-bold text-slate-500">At-Risk Threshold</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[15px] font-medium text-slate-600">&lt;</span>
                                            <input 
                                                type="number" 
                                                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                                value={thresholds.warning} 
                                                onChange={(e) => setThresholds({...thresholds, warning: Number(e.target.value) || 0})} 
                                            />
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-500 mt-1">Scores below this will display red.</span>
                                    </div>
                                </div>
                                {thresholds.warning >= thresholds.healthy && (
                                    <div className="mt-6 text-[13px] font-bold text-destructive flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Warning threshold must be strictly less than Healthy threshold.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
