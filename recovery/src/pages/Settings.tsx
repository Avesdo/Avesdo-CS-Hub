"import React, { useState } from 'react';\nimport { useAppState } from '../context/AppStateContext';\nimport { Building2, GitMerge, Package, Calculator, Plus, Trash2, Edit2, Check } from 'lucide-react';\nimport { PageHeader } from '../components/PageHeader';\n\nexport default function Settings() {\n    const { settings } = useAppState();\n    const [activeTab, setActiveTab] = useState<'org' | 'workflow' | 'products' | 'scoring'>('org');\n\n    const tabs = [\n        { id: 'org', label: 'Organization', icon: Building2 },\n        { id: 'workflow', label: 'Workflow & Status', icon: GitMerge },\n        { id: 'products', label: 'Features & Services', icon: Package },\n        { id: 'scoring', label: 'Scoring Engine', icon: Calculator },\n    ] as const;\n\n    if (!settings) {\n        return (\n            <div className=\"flex flex-1 items-center justify-center bg-slate-50\">\n                <div className=\"animate-pulse text-muted-foreground text-sm font-medium\">Loading settings...</div>\n            </div>\n        );\n    }\n\n    const renderList = (title: string, desc: string, items: any[], fieldName: string) => {\n        return (\n            <div className=\"mb-10\">\n                <div className=\"mb-4\">\n                    <h3 className=\"text-lg font-semibold text-foreground tracking-tight\">{title}</h3>\n                    <p className=\"text-sm text-muted-foreground mt-1\">{desc}</p>\n                </div>\n                <div className=\"bg-white border border-border rounded-xl shadow-sm overflow-hidden\">\n                    <div className=\"p-4 border-b border-border bg-slate-50 flex gap-3\">\n                        <input type=\"text\" className=\"w-full min-w-0 rounded-md border border-input bg-white px-3 h-9 text-sm outline-none focus:border-primary transition-all shadow-sm\" placeholder={`New ${title.replace(/s$/, '')}...`} />\n                        <button className=\"bg-primary text-primary-foreground px-4 h-9 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center
<truncated 11406 bytes>
                <div className="bg-white border border-border rounded-xl shadow-sm">
                    <div className="p-4 border-b border-border bg-slate-50 rounded-t-xl flex gap-3 flex-wrap sm:flex-nowrap items-center z-20 relative">
const ICONS = ["Activity", "AlarmClock", "AlertCircle", "AlertTriangle", "Archive", "Award", "Ban", "BarChart", "Blocks", "BookOpen", "Briefcase", "Building", "Building2", "Calendar", "CalendarCheck", "CalendarClock", "CalendarX", "CheckCircle2", "CheckSquare", "CircleCheckBig", "CircleDashed", "CircleEllipsis", "CircleX", "ClipboardCheck", "ClockAlert", "Contact", "FileText", "Flag", "Hammer", "House", "HousePlus", "Inbox", "Layers", "Loader", "Loader2", "Mail", "Package", "PackageCheck", "Pause", "PauseCircle", "PieChart", "Play", "PlayCircle", "PlusCircle", "Rocket", "Search", "Send", "Settings", "Shield", "ShieldCheck", "Star", "StopCircle", "Target", "ThumbsUp", "TrendingUp", "Trophy", "User", "Users", "Wrench", "Zap"];
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all active:scale-95 w-full text-left outline-none ${
                                        <button onClick={() => {
                                            setEditingItem({ field: fieldName, idx: i, globalIdx });
                                            setEditForm(isStringList ? { name } : (isServices ? { name, price: item.price } : { name, color: item.color, icon: item.icon }));
                                        }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-all active:scale-95" title="Edit">
                        <button 
                            onClick={() => handleAdd(fieldName)}
                            className="text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1.5"
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => { onChange(i); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95"
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => { onChange(c); setIsOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95"
                                        <button onClick={() => moveItem(fieldName, i, -1, items)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95" title="Move Up">
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveItem(fieldName, i, 1, items)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-all active:scale-95" title="Move Down">
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => {