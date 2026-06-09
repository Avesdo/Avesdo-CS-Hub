"import React, { useState, useMemo, useEffect, useRef } from 'react';\nimport { useAppState } from '../context/AppStateContext';\nimport { useUI } from '../context/UIContext';\nimport { getHealthBadge, getSettingBadge } from '../utils/uiUtils';\nimport { PageHeader } from '../components/PageHeader';\nimport { Users, AlertCircle, AlertTriangle, CheckCircle2, Activity, ChevronRight, Filter, Search, Minus } from 'lucide-react';\nimport { getHealthHistory } from '../api/dbService';\n\ntype SortCol = 'companyName' | 'type' | 'healthScore' | 'projectCount' | 'manager' | 'trend';\n\n// --- Sparkline Component ---\ninterface SparklineProps {\n  data: number[];\n  color?: string;\n}\nfunction Sparkline({ data, color }: SparklineProps) {\n  if (!data || data.length < 2) return <div className=\"w-12 h-4 flex items-center justify-center text-slate-300\">-</div>;\n\n  const min = Math.min(...data);\n  const max = Math.max(...data);\n  const range = max - min === 0 ? 1 : max - min;\n  \n  const w = 48;\n  const h = 16;\n  const padding = 2;\n\n  const points = data.map((val, i) => {\n    const x = padding + (i / (data.length - 1)) * (w - 2 * padding);\n    const y = padding + (1 - (val - min) / range) * (h - 2 * padding);\n    return `${x},${y}`;\n  });\n\n  const lastVal = data[data.length - 1];\n  const firstVal = data[0];\n  const isUp = lastVal >= firstVal;\n  const strokeColor = color || (isUp ? '#10b981' : '#ef4444');\n  const lastPoint = points[points.length - 1].split(',');\n\n  return (\n    <svg width={w} height={h} className=\"overflow-visible\">\n      <polyline\n        fill=\"none\"\n        stroke={strokeColor}\n        strokeWidth=\"1.5\"\n        strokeLinecap=\"round\"\n        strokeLinejoin=\"round\"\n        points={points.join(' ')}\n      />\n      <circle cx={lastPoint[0]} cy={lastPoint[1]} r=\"2\" fill={strokeColor} />\n    </svg>\n  );\n}\n\n// --- Column Filter Popover Component ---\nconst ColumnFilter = ({ \n    options, selected, onChange, searchable = false \n}: { \n    options: string[], selected
<truncated 29491 bytes>
            {/* Scrollable area for KPIs and Table */}
            <div className="flex-1 overflow-auto custom-thin-scroll relative">
                <div className="px-4 md:px-6 pb-6 md:pb-8 flex flex-col min-w-[1000px] min-h-full">
                    {/* KPI Cards (Dashboard style) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0 relative z-10">
        <div className="flex flex-1 flex-col h-full bg-white">
import { getHealthBadge } from '../utils/uiUtils';
import { universalExportCSV } from '../utils/exportUtils';
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 shrink-0 mt-2 relative z-30">
import { useAppState } from '../context/AppStateContext';
import { useUI } from '../context/UIContext';
import { useLocation } from 'react-router-dom';

    // Mapping routing state to local tabs
    const getInitialTab = () => {
        if (location.state?.kpiFilter) {
            switch(location.state.kpiFilter) {
                case 'healthy': return 'Healthy';
                case 'warning': return 'Warning';
                case 'risk': return 'At Risk';
                case 'active': return 'Active';
                default: return 'All Clients';
            }
        }
        return 'All Clients';
    };

    const [activeTab, setActiveTab] = useState<'All Clients' | 'Healthy' | 'Warning' | 'At Risk' | 'Active'>(getInitialTab());

    const [searchTerm, setSearchTerm] = useState('');
                const hist = healthHistory[c.clientId] || [];
                const olderThan30 = hist.filter((x:any) => x.timeVal <= thirtyDaysAgo).sort((a:any,b:any) => b.timeVal - a.timeVal);
                let pastScore = c.healthScore;
                
                if (olderThan30.length > 0) {
                    pastScore = olderThan30[0].score;
                } else if (hist.length > 0) {
                    // Fall back to the earliest data point we have if history is < 30 days
                    const earliest = [...hist].sort((a:any, b:any) => a.timeVal - b.timeVal);
                    pastScore = earliest[0].score;
                }

                            <TrendIndicator current={kpis.warning} previous={kpis.prevWarning} inverted={true} />
                            <TrendIndicator current={kpis.atRisk} previous={kpis.prevAtRisk} inverted={true} />
"                            </div>\n                            <TrendIndicator current={kpis.healthy} previous={kpis.prevHealthy} />\n                        </div>\n\n                        <div onClick={() => setActiveTab('Active')} className=\"cursor-pointer flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group active:scale-[0.98]\">\n                            <div className=\"absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-500\"></div>        \n                            <div className=\"flex items-start justify-between mb-2 relative z-10\">\n                                <div className=\"flex flex-col pr-2\">\n                                     <div className=\"font-bold text-sm text-foreground flex items-center gap-1.5\">Active Clients <ArrowRight className=\"w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary\" /></div>\n                                     <span className=\"text-xs text-muted-foreground mt-0.5 leading-snug\">Clients with active projects</span>\n                                </div>\n                                <div className=\"w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0\">\n                                    <Activity className=\"w-5 h-5\" />\n                                </div>\n                            </div>\n                            <TrendIndicator current={kpis.active} previous={kpis.prevActive} />\n                        </div>\n                    </div>\n\n                    <div className=\"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0\">\n                        <div className=\"flex items-center gap-2 overflow-x-auto custom-thin-scroll pb
<truncated 2287 bytes>
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 ${activeTab === tab.label ? 'bg-white text-foreground border-border shadow-sm' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}
                        <div className="flex items-center gap-2 overflow-x-auto custom-thin-scroll pt-2 pb-2 px-1 -ml-1">
                            {[
                                { label: 'All Clients', icon: Users },
                                { label: 'Active', icon: Activity },
                                { label: 'Healthy', icon: CheckCircle2 },
                                { label: 'Warning', icon: AlertTriangle },
                                { label: 'At Risk', icon: AlertCircle }
                            ].map(tab => {
                                const Icon = tab.icon;
                                return (
                                <button 
                                    key={tab.label}
                                    onClick={() => setActiveTab(tab.label as any)} 
                                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full transition-all active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm whitespace-nowrap border focus:outline-none focus:ring-2 focus:ring-[#00bdd9]/20 ${activeTab === tab.label ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}
                                    className="rounded border-slate-300 text-primary focus:ring-2 focus:ring-[#00bdd9]/20 w-3 h-3 cursor-pointer"
                                <thead className="text-[11px] text-slate-500 bg-slate-50 border-b border-border sticky top-0 z-30 font-bold tracking-wider">
                                <tr>
                                    <th className="sticky left-0 z-40 bg-slate-50 px-6 py-3 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] group/th">
                    <div className="flex-1 min-h-0 bg-white border border-border rounded-xl shadow-sm flex flex-col relative">
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden bg-white relative">
                        <div className="shrink-0 px-6 py-3 border-t border-border bg-slate-50/95 backdrop-blur flex items-center z-40 rounded-b-xl sticky bottom-0">
                    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col relative">
        <div className="flex flex-1 overflow-auto custom-thin-scroll bg-white relative">
                        <div className="shrink-0 px-6 py-3 border-t border-border bg-slate-50 flex items-center z-40 rounded-b-xl sticky bottom-0">
                    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col relative mb-4">
                        <div className="flex-1 rounded-t-xl">
        <div className="flex flex-1 overflow-auto custom-thin-scroll bg-white relative">
                    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col relative mb-4">
                        <div className="overflow-x-auto overflow-y-hidden flex-1 custom-thin-scroll rounded-t-xl">
                    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col relative mb-4 overflow-hidden">
                    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col relative mb-4 overflow-clip">
                        <div className="shrink-0 px-6 py-3 border-t border-border bg-slate-50 flex items-center z-20 rounded-b-xl">
                    <div className="bg-white border border-border rounded-xl shadow-sm flex flex-col relative mb-4" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                        <div className="overflow-auto custom-thin-scroll flex-1 rounded-t-xl">
                        <div className="shrink-0 px-6 py-3 border-t border-border bg-slate-50 flex items-center z-20 rounded-b-xl">
                    <div className="flex-1 min-h-0 bg-white border border-border rounded-xl shadow-sm flex flex-col relative mb-4">
                        <div className="overflow-auto custom-thin-scroll flex-1 rounded-t-xl">
        <div className="flex flex-1 overflow-hidden bg-slate-50/50 relative">
                                {sortedClients.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground h-full border-b border-l border-r border-border">
                                            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            <p className="font-semibold text-slate-600">No clients found</p>
                                            <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                                        </td>
                                    </tr>
                                )}
                        <div className="shrink-0 px-6 py-3 border-t border-border bg-slate-50 flex items-center z-30 rounded-b-xl sticky bottom-0">
                                <thead className="text-[11px] text-slate-500 bg-slate-50 border-b border-border sticky top-0 z-40 font-bold tracking-wider">
                                            <button onClick={clearAllFilters} className="text-xs text-primary hover:underline transition-colors ml-2">Clear Filters</button>
                        <thead className="sticky top-0 z-40 bg-white shadow-sm rounded-t-xl">
                                            <button onClick={clearAllFilters} className="text-xs text-primary hover:underline active:scale-95 transition-all ml-2">Clear Filters</button>
                <div className="bg-white border-x border-b border-border rounded-b-xl rounded-t-xl shadow-sm flex flex-col relative mb-4">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 z-40 bg-white rounded-t-xl shadow-sm">
                <div className="bg-white border-b border-border rounded-b-xl rounded-t-xl shadow-sm flex flex-col relative mb-4">
                <div className="bg-slate-50 border-t border-border font-medium text-foreground px-8 py-3 flex justify-between items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">            
                    <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">Total Clients Displayed: <span className="text-foreground text-[13px] ml-1">{tableData.length}</span></span>            
                    <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">
                        Average Health Score: <span className="text-[13px] font-bold ml-1 text-foreground">
                        <div className="bg-slate-50 border-t border-border font-medium text-foreground px-8 py-3 flex items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                            <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">Total Clients Displayed: <span className="text-foreground text-[13px] ml-1">{sortedClients.length}</span></span>
                        </div>
                                     <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Active Clients</div>
                                     <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Healthy</div>
                                     <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Warning</div>
                                     <div className="font-bold text-sm text-foreground flex items-center gap-1.5">At Risk</div>
                        <div className="bg-slate-50 border-t border-border font-medium text-foreground px-16 py-4 flex items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                        <div className="bg-slate-50 border-t border-border font-medium text-foreground px-[128px] py-[12px] h-[45px] flex items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                            <tr className="text-[11px] text-slate-500 bg-slate-50 border-b border-border font-bold tracking-wider capitalize h-[45px]">
                                        <tr 
                                            key={c.clientId} 
                                            className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                            onClick={() => openDrawer('client', c.clientId)} // default to overview
                                        >
                <div className="bg-white border border-border rounded-b-xl rounded-t-xl shadow-sm flex flex-col relative mx-4 md:mx-6 mb-6">
                            <tr>
                                <th colSpan={5} className="px-4 py-4 md:px-6 font-normal bg-white relative before:absolute before:-left-[2px] before:-right-[2px] before:-top-[2px] before:bottom-0 before:bg-white before:-z-10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
                            <tr>
                                <th colSpan={5} className="px-4 py-4 md:px-6 font-normal bg-white relative before:absolute before:-left-[2px] before:-right-[2px] before:-top-[2px] before:bottom-0 before:bg-white before:-z-10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
                        <div className="bg-slate-50 border-y border-border font-medium text-foreground px-[128px] py-[12px] h-[45px] flex items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                            <tr className="text-[11px] text-slate-500 bg-slate-50 border-y border-border font-bold tracking-wider capitalize h-[45px]">
                        <div className="bg-slate-50 border-y border-border font-medium text-foreground px-[128px] py-[12px] h-[45px] flex items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] relative before:absolute before:-bottom-[2px] before:inset-x-0 before:h-2 before:bg-slate-50 before:-z-10">
                                <th colSpan={5} className="px-4 py-4 md:px-6 font-normal bg-white relative before:absolute before:-left-[2px] before:-right-[2px] before:-top-[2px] before:-bottom-[2px] before:bg-white before:-z-10">
                            <tr>
                                <th colSpan={5} className="px-4 py-4 md:px-6 font-normal bg-white relative before:absolute before:-left-[2px] before:-right-[2px] before:top-0 before:-bottom-[2px] before:bg-white before:-z-10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 relative">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 z-40 bg-white shadow-sm before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
                            <tr>
                        <div className="bg-slate-50 border-y border-border font-medium text-foreground px-[128px] py-[12px] h-[45px] flex items-center shrink-0 rounded-b-xl sticky bottom-0 z-30 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] relative before:absolute before:-bottom-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 z-40 bg-white shadow-sm border-t border-border before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
                            <tr>
                            <tr>
                                <th colSpan={5} className="px-4 py-4 md:px-6 font-normal bg-white relative before:absolute before:-left-[2px] before:-right-[2px] before:top-0 before:bottom-0 before:bg-white before:-z-10">
                        <thead className="sticky top-0 z-40 bg-white shadow-sm before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-border before:-z-10">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 z-40 bg-white shadow-sm before:absolute before:-top-[1px] before:inset-x-0 before:h-[1px] before:bg-white before:-z-10">
                            <tr>
                        <button 
                            onClick={() => universalExportCSV('Clients', sortedClients, 'ClientHealth')}
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 border border-input bg-white hover:bg-accent hover:text-accent-foreground active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm px-4 py-2 h-9 focus:ring-2 focus:ring-[#00bdd9]/20 focus:outline-none"
                        >
                            <Download className="w-4 h-4 shrink-0" />
                            <span>Export</span>
                        </button>
                                    <div className="absolute right-0 top-full mt-1 bg-white p-1.5 shadow-xl border border-border rounded-xl min-w-[220px] whitespace-nowrap z-[90]">
                                            <div className="cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('projectCount')}>
                                                Projects <span className="text-xs font-normal text-slate-500">(Active/Onboarding/Closed)</span>
                                            </div>
                                        <div className="flex items-center">
                                            <div className="cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('projectCount')}>
                                                Projects
                                                <span className="text-[9px] font-normal text-slate-400 normal-case tracking-normal ml-1">(Active/Onboarding/Closed)</span>
                                            </div>
                                            <ColumnFilter options={['Active', 'Onboarding', 'Closed']} selected={projectFilter} onChange={setProjectFilter} />
                                        </div>