import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Activity, Building, TrendingUp, DollarSign, Filter, ChevronDown, Plus, Download, Users, ListTodo, Briefcase, PieChart, ShieldCheck, PauseCircle, AlertOctagon, History, BarChart3, TrendingDown, ArrowRight, AlertCircle, Package, Rocket, HousePlus } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useUI } from '../context/UIContext';
import { getHealthHistory, getSystemLogs } from '../api/dbService';
import { getHealthBadge, getSettingBadge, hexToRgba, getSafeHex, renderIcon } from '../utils/uiUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { universalExportCSV } from '../utils/exportUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

import { TrendIndicator } from '../components/TrendIndicator';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

export default function Dashboard() {
    const { clients, projects, services, settings } = useAppState();
    const { openModal, openDrawer } = useUI();
    const navigate = useNavigate();
    const [managerFilter, setManagerFilter] = useState('All Managers');
    const [showAmMenu, setShowAmMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [actionTab, setActionTab] = useState<'risk' | 'sus'>('risk');
    const [healthHistory, setHealthHistory] = useState<any>({});
    const [systemLogs, setSystemLogs] = useState<any[]>([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    
    // Feature adoption tabs: 'active' or 'onb'
    const [featTab, setFeatTab] = useState<'active' | 'onb'>('active');

    const amMenuRef = useRef<HTMLDivElement>(null);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(amMenuRef, () => setShowAmMenu(false), showAmMenu);
    useOnClickOutside(addMenuRef, () => setShowAddMenu(false), showAddMenu);
    useOnClickOutside(exportMenuRef, () => setShowExportMenu(false), showExportMenu);

    useEffect(() => {
        getHealthHistory().then(data => {
            setHealthHistory(data);
            setIsFetchingHistory(false);
        }).catch(err => {
            console.error("Failed to load history for movers", err);
            setIsFetchingHistory(false);
        });

        getSystemLogs().then(data => {
            setSystemLogs(data.slice(0, 10)); // limit to 10 latest
        }).catch(console.error);
    }, []);

    const allManagers = useMemo(() => {
        const managers = new Set<string>();
        projects?.forEach(p => { if (p.assignee) managers.add(p.assignee); });
        const managerOrder = settings?.managers?.map(m => m.name) || [];
        return Array.from(managers).sort((a,b) => {
            const idxA = managerOrder.indexOf(a);
            const idxB = managerOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [projects, settings]);

    const filteredProjects = useMemo(() => {
        if (managerFilter === 'All Managers') return projects || [];
        return projects?.filter(p => p.assignee === managerFilter) || [];
    }, [projects, managerFilter]);

    const filteredClients = useMemo(() => {
        if (managerFilter === 'All Managers') return clients || [];
        return clients?.filter(c => c.accountManager === managerFilter) || [];
    }, [clients, managerFilter]);

    const filteredServices = useMemo(() => {
        if (managerFilter === 'All Managers') return services || [];
        return services?.filter(s => s.manager === managerFilter) || [];
    }, [services, managerFilter]);

    const activeClients = useMemo(() => filteredClients.filter(c => c.activeProjectCount > 0), [filteredClients]);

    const healthyThresh = settings?.scoring?.thresholds?.healthy || 80;
    const warningThresh = settings?.scoring?.thresholds?.warning || 50;

    const { healthyCount, warningCount, riskCount, avgHealth, totalScored, prevHealth } = useMemo(() => {
        let h = 0, w = 0, r = 0, totalScore = 0, scoredCount = 0;
        let prevTotalScore = 0, prevScoredCount = 0;
        const thirtyDaysAgo = new Date().getTime() - (30 * 86400000);

        activeClients.forEach(c => {
            if (c.healthScore !== "N/A" && typeof c.healthScore === 'number') {
                totalScore += c.healthScore;
                scoredCount++;
                if (c.healthScore >= healthyThresh) h++;
                else if (c.healthScore >= warningThresh) w++;
                else r++;

                // Prev Health
                const hist = healthHistory[c.clientId] || [];
                const olderThan30 = hist.filter((x:any) => x.timeVal <= thirtyDaysAgo).sort((a:any,b:any) => b.timeVal - a.timeVal);
                
                if (olderThan30.length > 0) {
                    prevTotalScore += olderThan30[0].score;
                    prevScoredCount++;
                } else if (hist.length > 0) {
                    const sortedAsc = [...hist].sort((a:any,b:any) => a.timeVal - b.timeVal);
                    prevTotalScore += sortedAsc[0].score;
                    prevScoredCount++;
                }
            }
        });
        const currentAvg = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
        const prevAvg = prevScoredCount > 0 ? Math.round(prevTotalScore / prevScoredCount) : 0;
        return {
            healthyCount: h,
            warningCount: w,
            riskCount: r,
            avgHealth: currentAvg,
            totalScored: scoredCount,
            prevHealth: prevAvg
        };
    }, [activeClients, healthyThresh, warningThresh, healthHistory]);

    const { totalUnits, prevUnits, pipelineCount, prevPipelineCount } = useMemo(() => {
        let u = 0, prevU = 0, p = 0, prevP = 0;
        const thirtyDaysAgo = new Date().getTime() - (30 * 86400000);
        const fortyFiveDays = new Date().getTime() + (45 * 86400000);
        const fifteenDays = new Date().getTime() + (15 * 86400000);

        filteredProjects.forEach(proj => {
            const currentUnits = parseInt(proj.units as any) || 0;
            if (proj.projectStatus === 'Active' || proj.projectStatus === 'Suspended') {
                u += currentUnits;
            }
            if (proj.projectStatus === 'Onboarding') {
                if (proj.releaseDateVal && proj.releaseDateVal <= fortyFiveDays) p++;
            }
            
            const hist = proj.history || [];
            const olderThan30 = hist.filter((x:any) => x.timeVal <= thirtyDaysAgo).sort((a:any,b:any) => b.timeVal - a.timeVal);
            
            if (olderThan30.length > 0) {
                const snapshot = olderThan30[0];
                if (snapshot.status === 'Active' || snapshot.status === 'Suspended') {
                    prevU += snapshot.units || 0;
                }
                if (snapshot.status === 'Onboarding') {
                    if (proj.releaseDateVal && proj.releaseDateVal <= fifteenDays) prevP++;
                }
            } else {
                if (proj.projectStatus === 'Active' || proj.projectStatus === 'Suspended') {
                    if (proj.releaseDateVal && proj.releaseDateVal <= thirtyDaysAgo) {
                        prevU += currentUnits;
                    } else if (proj.releaseDateVal && proj.releaseDateVal > thirtyDaysAgo) {
                        if (proj.releaseDateVal <= fifteenDays) prevP++;
                    }
                } else if (proj.projectStatus === 'Onboarding') {
                    if (proj.releaseDateVal && proj.releaseDateVal <= fifteenDays) prevP++;
                }
            }
        });
        return { totalUnits: u, prevUnits: prevU, pipelineCount: p, prevPipelineCount: prevP };
    }, [filteredProjects]);

    const { qRev, prevQRev } = useMemo(() => {
        let rev = 0;
        let prevRev = 0;
        let today = new Date(); 
        let currYear = today.getFullYear(); 
        let currQtr = Math.floor(today.getMonth() / 3);
        const lastQuarter = currQtr === 0 ? 3 : currQtr - 1;
        const lastQuarterYear = currQtr === 0 ? currYear - 1 : currYear;
        const monthInQuarter = today.getMonth() % 3;
        const pqtdLimit = new Date(lastQuarterYear, lastQuarter * 3 + monthInQuarter, today.getDate(), 23, 59, 59).getTime();

        filteredServices.forEach(s => {
            if (s.outcome === 'Won') {
                let d = new Date(s.dateVal || s.dateInput || 0);
                let y = d.getFullYear();
                let q = Math.floor(d.getMonth() / 3);
                const price = parseFloat(s.price?.toString().replace(/[^0-9.-]+/g,"")) || 0;
                
                const timestamp = s.dateVal || (s.dateInput ? new Date(s.dateInput).getTime() : 0);

                if (y === currYear && q === currQtr) {
                     rev += price;
                } else if (y === lastQuarterYear && q === lastQuarter && timestamp <= pqtdLimit) {
                     prevRev += price;
                }
            }
        });
        return { qRev: rev, prevQRev: prevRev };
    }, [filteredServices]);

    const chartData = {
        labels: ['Healthy', 'Warning', 'At Risk'],
        datasets: [{ data: [healthyCount, warningCount, riskCount], backgroundColor: ['#5ea500', '#fe9a00', '#e7000b'], borderWidth: 2, borderColor: '#ffffff', hoverOffset: 4 }]
    };

    const chartOptions: any = {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        onClick: (event: any, elements: any) => {
            if (elements && elements.length > 0) {
                const index = elements[0].index;
                const filters = ['healthy', 'warning', 'risk'];
                navigate('/clients', { state: { kpiFilter: filters[index] } });
            }
        },
        plugins: { 
            legend: { display: false }, 
            tooltip: { 
                backgroundColor: '#ffffff', titleColor: '#0f172a', bodyColor: '#0f172a', borderColor: '#e2e8f0', borderWidth: 1, padding: 10, cornerRadius: 4, displayColors: true,
                callbacks: {
                    title: () => '',
                    label: (context: any) => ` ${context.label} ${context.raw}`
                }
            } 
        }
    };

    const onboardingPhases = useMemo(() => {
        const obProjs = filteredProjects.filter(p => p.projectStatus === 'Onboarding');
        const counts: Record<string, number> = {};
        obProjs.forEach(p => { 
            const ph = p.onboardingPhase || settings?.phases?.[0]?.name || 'Not Started'; 
            
            // Match exactly with the settings phase name if possible (case-insensitive) to ensure color mapping
            const matchedPhase = settings?.phases?.find(sp => sp.name?.toLowerCase() === ph.toLowerCase())?.name || ph;
            
            counts[matchedPhase] = (counts[matchedPhase] || 0) + 1; 
        });
        const phasesOrder = settings?.phases?.map(p => p.name) || [];
        const activePhases = Object.keys(counts).sort((a,b) => {
            let ia = phasesOrder.indexOf(a);
            let ib = phasesOrder.indexOf(b);
            if(ia === -1) ia = 999;
            if(ib === -1) ib = 999;
            return ia - ib;
        });
        return activePhases.map(ph => [ph, counts[ph]]);
    }, [filteredProjects, settings?.phases]);

    // Timelines
    const deliveryTimelines = useMemo(() => {
        if (!projects || !settings?.timelines) return [];
        const onboardingProjects = projects.filter(p => p.projectStatus === 'Onboarding');
        const total = onboardingProjects.length || 1;
        
        return settings.timelines.map(t => {
            const count = onboardingProjects.filter(p => {
                const status = p.timelineStatus || settings?.timelines?.[0]?.name || 'Not Started';
                return status.toLowerCase() === t.name.toLowerCase();
            }).length;
            return {
                name: t.name,
                color: t.color,
                count,
                percentage: (count / total) * 100
            };
        }).filter(t => t.count > 0);
    }, [projects, settings]);

    const allSystemFeatures = useMemo(() => {
        if (!projects) return [];
        return Array.from(new Set(projects.flatMap(p => p.features || [])));
    }, [projects]);

    const featureAdoptionActive = useMemo(() => {
        const activeProjs = filteredProjects.filter(p => p.projectStatus === 'Active' || p.projectStatus === 'Suspended');
        const counts: Record<string, number> = {};
        allSystemFeatures.forEach(f => counts[f] = 0);
        activeProjs.forEach(p => { (p.features || []).forEach((f: string) => { counts[f] = (counts[f] || 0) + 1; }); });
        return { data: Object.entries(counts).sort((a,b) => b[1] - a[1]), total: activeProjs.length };
    }, [filteredProjects, allSystemFeatures]);

    const featureAdoptionOnb = useMemo(() => {
        const onbProjs = filteredProjects.filter(p => p.projectStatus === 'Onboarding');
        const counts: Record<string, number> = {};
        allSystemFeatures.forEach(f => counts[f] = 0);
        onbProjs.forEach(p => { (p.features || []).forEach((f: string) => { counts[f] = (counts[f] || 0) + 1; }); });
        return { data: Object.entries(counts).sort((a,b) => b[1] - a[1]), total: onbProjs.length };
    }, [filteredProjects, allSystemFeatures]);

    const managerWorkload = useMemo(() => {
        const wl: Record<string, { active: number, onboarding: number }> = {};
        const activeManagers = settings?.managers?.map((m: any) => m.name) || [];
        
        activeManagers.forEach((m: string) => wl[m] = { active: 0, onboarding: 0 });
        
        projects.forEach(p => {
            let m = p.assignee || 'Unassigned';
            if (m !== 'Unassigned' && !activeManagers.includes(m)) {
                m = 'Unassigned';
            }
            if (!wl[m]) wl[m] = { active: 0, onboarding: 0 };
            
            if (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') wl[m].active++;
            else if (p.projectStatus === 'Onboarding') wl[m].onboarding++;
        });
        return Object.entries(wl).filter(([name, c]) => name !== 'Unassigned' && (c.active > 0 || c.onboarding > 0)).sort((a, b) => (b[1].active + b[1].onboarding) - (a[1].active + a[1].onboarding));
    }, [projects, settings?.managers]);

    const recentServices = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentQtr = Math.floor((new Date().getMonth() + 3) / 3);
        return [...filteredServices].filter(s => {
            if (s.outcome !== 'Won') return false;
            if (!s.dateVal) return false;
            const d = new Date(s.dateVal);
            return d.getFullYear() === currentYear && Math.floor((d.getMonth() + 3) / 3) === currentQtr;
        }).sort((a,b) => (b.dateVal || 0) - (a.dateVal || 0));
    }, [filteredServices]);

    const getServiceIcon = (type: string) => {
        const s = settings?.serviceTypes?.find((x:any) => x.name === type);
        if (s) return { iconName: s.icon || 'Briefcase', color: s.color || 'blue' };
        return { iconName: 'Briefcase', color: 'blue' };
    };

    const recentLaunches = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const currentQtr = Math.floor((new Date().getMonth() + 3) / 3);
        return [...filteredProjects].filter(p => {
            if (p.timelineStatus !== 'Released' && p.onboardingPhase !== 'Released') return false;
            if (!p.releaseDateVal) return false;
            const d = new Date(p.releaseDateVal);
            return d.getFullYear() === currentYear && Math.floor((d.getMonth() + 3) / 3) === currentQtr;
        }).sort((a,b) => (b.releaseDateVal || 0) - (a.releaseDateVal || 0));
    }, [filteredProjects]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    // Quarterly Movers calculation
    const movers = useMemo(() => {
        if (!healthHistory || Object.keys(healthHistory).length === 0) return null;
        
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const timeThresh = ninetyDaysAgo.getTime();
       
        const improvers: any[] = [];
        const droppers: any[] = [];
        
        activeClients.forEach(c => {
            if(c.healthScore !== "N/A" && typeof c.healthScore === 'number') {
                const rawHistory = healthHistory[c.clientId] || [];
                const history = rawHistory.filter((h:any) => h.timeVal >= timeThresh).sort((a:any,b:any) => a.timeVal - b.timeVal);
               
                if(history.length > 0) {
                    const oldest = history[0].score;
                    const diff = c.healthScore - oldest;
                    const dataObj = {id: c.clientId, name: c.companyName, oldest, latest: c.healthScore, diff};
                    if (diff > 0) improvers.push(dataObj);
                    else if (diff < 0) droppers.push(dataObj);
                }
            }
        });
       
        improvers.sort((a,b) => b.diff - a.diff);
        droppers.sort((a,b) => a.diff - b.diff);
       
        return {
            improvers: improvers.slice(0, 5),
            droppers: droppers.slice(0, 5)
        };
    }, [activeClients, healthHistory]);

    // Action Required
    const atRiskClients = useMemo(() => {
        return filteredClients.filter(c => c.healthScore !== "N/A" && typeof c.healthScore === 'number' && (c.healthScore as number) < warningThresh).sort((a,b) => ((a.healthScore as number) || 0) - ((b.healthScore as number) || 0));
    }, [filteredClients, warningThresh]);

    const suspendedProjects = useMemo(() => {
        return filteredProjects.filter(p => p.projectStatus === 'Suspended');
    }, [filteredProjects]);

    const hasRisk = atRiskClients.length > 0;
    const hasSus = suspendedProjects.length > 0;
    const showActionReq = hasRisk || hasSus;

    // Health color dynamic based on score
    const getHealthColorClass = (score: number) => {
        if (score >= healthyThresh) return 'text-lime-600';
        if (score >= warningThresh) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-1 overflow-y-auto px-4 pt-0 md:px-6 md:pt-0 flex-col bg-white relative">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 shrink-0 mt-2 relative z-30">    
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Executive Dashboard</h1>
                    <p className="text-base text-muted-foreground mt-1">High-level overview of portfolio health, project activity, and service revenue.</p>
                </div>  
           
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">  
                    {/* All Managers Filter */}
                    <div className="relative shadow-sm rounded-md" ref={amMenuRef}>  
                        <button onClick={() => setShowAmMenu(!showAmMenu)} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 border border-input bg-white hover:bg-accent hover:text-accent-foreground active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm text-foreground px-3 py-1.5 h-9 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">            
                            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />      
                            <span className="truncate flex-1 text-left font-semibold text-sm">{managerFilter}</span>            
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />        
                        </button>  
                        {showAmMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white p-2 shadow-xl border border-border rounded-xl min-w-[200px] z-[90]">            
                                <div className="px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 cursor-pointer" onClick={() => { setManagerFilter('All Managers'); setShowAmMenu(false); }}>All Managers</div>
                                <div className="border-t border-border mt-1 pt-1"></div>
                                {allManagers.map(m => (
                                    <div key={m} className="px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 cursor-pointer" onClick={() => { setManagerFilter(m); setShowAmMenu(false); }}>{m}</div>
                                ))}
                            </div>  
                        )}
                     </div>
                   
                    {/* Add New Button */}
                    <div className="relative shadow-sm rounded-md" ref={addMenuRef}>
                        <button onClick={() => setShowAddMenu(!showAddMenu)} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm px-4 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>Add New</span>
                            <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
                        </button>
                        {showAddMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white p-1.5 shadow-xl border border-border rounded-xl min-w-[180px] z-[90]">
                                <div className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium" onClick={() => { openModal('addClient'); setShowAddMenu(false); }}><Building className="w-4 h-4 text-muted-foreground" /> Client</div>
                                <div className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium" onClick={() => { openModal('addProject'); setShowAddMenu(false); }}><HousePlus className="w-4 h-4 text-muted-foreground" /> Project</div>
                                <div className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium" onClick={() => { openModal('addService'); setShowAddMenu(false); }}><Briefcase className="w-4 h-4 text-muted-foreground" /> Service</div>
                            </div>
                        )}
                    </div>

                    {/* Export Button */}
                    <div className="relative shadow-sm rounded-md" ref={exportMenuRef}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 border border-input bg-white hover:bg-accent hover:text-accent-foreground active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm px-4 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <Download className="w-4 h-4 shrink-0" />
                            <span>Export</span>
                            <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white p-1.5 shadow-xl border border-border rounded-xl min-w-[220px] whitespace-nowrap z-[90]">
                                <div className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium" onClick={() => { setShowExportMenu(false); universalExportCSV('Clients', clients, 'All_Clients'); }}><Users className="w-4 h-4 text-muted-foreground" /> All Clients</div>
                                <div className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium" onClick={() => { setShowExportMenu(false); universalExportCSV('Projects', projects, 'All_Projects'); }}><ListTodo className="w-4 h-4 text-muted-foreground" /> All Projects</div>
                                <div className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer flex items-center gap-2 text-sm font-medium" onClick={() => { setShowExportMenu(false); universalExportCSV('Services', services, 'All_Services'); }}><Briefcase className="w-4 h-4 text-muted-foreground" /> All Services</div>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* TOP 4 KPI TILES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 relative z-10">    
                <div onClick={() => navigate('/clients', { state: { kpiFilter: 'active' } })} className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]" style={{ animationDelay: '50ms' }}>      
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-lime-500/5 rounded-full blur-xl group-hover:bg-lime-500/10 transition-colors duration-500"></div>        
                    <div className="flex items-start justify-between mb-2 relative z-10">
                        <div className="flex flex-col pr-2">
                             <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Global Health Index <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" /></div>
                             <span className="text-xs text-muted-foreground mt-0.5 leading-snug">Average score of all active accounts</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-lime-500/10 text-lime-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>        
                    {totalScored > 0 ? (
                        <TrendIndicator current={avgHealth} previous={prevHealth} colorClass={getHealthColorClass(avgHealth)} />
                    ) : (
                        <div className="mt-auto pt-2 relative z-10">
                            <div className="text-3xl font-bold tracking-tight text-muted-foreground">N/A</div>
                            <div className="text-[11px] text-muted-foreground mt-1">Add health scores to clients to see index</div>
                        </div>
                    )}
                </div>      
               
                <div onClick={() => navigate('/projects', { state: { ptTab: 'All Projects', kpiFilter: 'units' } })} className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]" style={{ animationDelay: '150ms' }}>        
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>        
                    <div className="flex items-start justify-between mb-2 relative z-10">
                        <div className="flex flex-col pr-2">
                             <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Live Units <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" /></div>
                             <span className="text-xs text-muted-foreground mt-0.5 leading-snug">Scale of actively supported product</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            <Building className="w-5 h-5" />
                        </div>
                    </div>        
                    <TrendIndicator current={totalUnits} previous={prevUnits} />
                </div>      
               
                <div onClick={() => navigate('/projects', { state: { ptTab: 'All Projects', kpiFilter: 'onboarding' } })} className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]" style={{ animationDelay: '250ms' }}>        
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors duration-500"></div>        
                    <div className="flex items-start justify-between mb-2 relative z-10">
                        <div className="flex flex-col pr-2">
                             <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Launch Pipeline <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" /></div>
                             <span className="text-xs text-muted-foreground mt-0.5 leading-snug">Projects launching in &le; 45 days</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>        
                    <TrendIndicator current={pipelineCount} previous={prevPipelineCount} neutral={true} />
                </div>     
             
                <div onClick={() => {
                    const d = new Date();
                    const y = d.getFullYear();
                    const q = Math.floor(d.getMonth() / 3);
                    const sm = (q * 3 + 1).toString().padStart(2, '0');
                    const em = (q * 3 + 3).toString().padStart(2, '0');
                    navigate('/services', { state: { svTab: 'Won', dateRange: { start: `${y}-${sm}`, end: `${y}-${em}` } } });
                }} className="cursor-pointer flex flex-col rounded-xl border border-border bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-300 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both active:scale-[0.98]" style={{ animationDelay: '350ms' }}>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>    
                    <div className="flex items-start justify-between mb-2 relative z-10">
                        <div className="flex flex-col pr-2">
                             <div className="font-bold text-sm text-foreground flex items-center gap-1.5">Service Revenue <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" /></div>
                             <span className="text-xs text-muted-foreground mt-0.5 leading-snug">Revenue won in this quarter</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>          
                    <TrendIndicator current={qRev} previous={prevQRev} prefix="$" periodText="last quarter" />
                </div>
            </div>

            {/* ROW 2: Portfolio Dist + Movers + Action Required */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-5 mb-5 relative z-10 transition-all duration-500 animate-in fade-in duration-700 delay-300 fill-mode-both">    
                <div className={`flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md lg:col-span-1 ${showActionReq ? 'xl:col-span-2' : 'xl:col-span-3'} overflow-hidden min-h-[300px] max-h-[520px]`}>        
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">            
                        <div className="text-base font-semibold tracking-tight text-foreground">Portfolio Distribution</div>            
                        <p className="text-xs text-muted-foreground font-medium">Real-time health segmentation across active accounts</p>        
                    </div>        
                    <div className="flex-1 overflow-hidden p-6 flex items-center justify-center gap-6">            
                        {totalScored === 0 ? (
                            <EmptyState icon={PieChart} title="No Data" subtitle="Score your clients to see portfolio distribution" className="w-full" />
                        ) : (
                            <div className="flex flex-row items-center justify-center gap-6 w-full h-full px-2">
                                <div className="w-60 h-60 shrink-0 relative flex items-center justify-center">
                                    <Doughnut data={chartData} options={chartOptions} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                                        <span className="text-4xl font-bold text-foreground leading-none">{totalScored}</span>
                                        <span className="text-[11px] text-muted-foreground font-semibold mt-1 text-center leading-tight">Active<br/>Clients</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center space-y-4 shrink-0 pr-2">
                                    <button className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-lime-500/10 text-lime-700 border border-lime-500/20 hover:bg-lime-500/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm text-left flex items-center justify-between min-w-[120px] active:scale-95" onClick={() => navigate('/clients', { state: { kpiFilter: 'healthy' } })}>
                                        <span>Healthy</span><span className="ml-3 text-sm font-bold">{healthyCount}</span>
                                    </button>
                                    <button className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-orange-500/10 text-orange-700 border border-orange-500/20 hover:bg-orange-500/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm text-left flex items-center justify-between min-w-[120px] active:scale-95" onClick={() => navigate('/clients', { state: { kpiFilter: 'warning' } })}>
                                        <span>Warning</span><span className="ml-3 text-sm font-bold">{warningCount}</span>
                                    </button>
                                    <button className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-red-500/10 text-destructive border border-red-500/20 hover:bg-destructive/20 hover:-translate-y-1 hover:shadow-md transition-all duration-300 shadow-sm text-left flex items-center justify-between min-w-[120px] active:scale-95" onClick={() => navigate('/clients', { state: { kpiFilter: 'risk' } })}>
                                        <span>At Risk</span><span className="ml-3 text-sm font-bold">{riskCount}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>    
                </div>    
               
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden min-h-[300px] max-h-[520px] lg:col-span-1 xl:col-span-2">  
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">            
                        <div className="text-base font-semibold tracking-tight text-foreground">Quarterly Movers</div>          
                        <p className="text-xs text-muted-foreground font-medium">Largest 90-day health score changes</p>        
                    </div>        
                    <div className="flex-1 overflow-auto p-5 custom-thin-scroll">
                        {isFetchingHistory ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                </div>
                                <h4 className="text-sm font-bold text-foreground mb-1">Gathering Data...</h4>
                            </div>
                        ) : (!movers || (movers.improvers.length === 0 && movers.droppers.length === 0)) ? (
                            <EmptyState icon={BarChart3} title="No Significant Movement" subtitle="There have been no major health score shifts in the last 90 days." className="h-full" />
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full h-full pb-2 pr-2 content-start">
                                {movers.improvers.length > 0 && (
                                    <div className="flex flex-col gap-2.5">
                                        <h5 className="text-sm font-bold text-lime-500 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Top Improvers</h5>
                                        {movers.improvers.map((m:any) => (
                                            <div key={m.id} onClick={() => openDrawer('client', m.id, { targetTab: 'trends' })} className="flex items-center justify-between p-3.5 rounded-xl border border-border border-l-4 border-l-lime-500 bg-white shadow-sm cursor-pointer hover:border-lime-500/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                                                <div className="flex flex-col min-w-0 pr-3 justify-center">
                                                    <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{m.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">{m.oldest} <ArrowRight className="w-3 h-3 opacity-50" /> {m.latest}</span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-lime-500/10 text-lime-500 shadow-sm">+{m.diff}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {movers.droppers.length > 0 && (
                                    <div className="flex flex-col gap-2.5">
                                        <h5 className="text-sm font-bold text-red-500 mb-1 flex items-center gap-1.5"><TrendingDown className="w-4 h-4" /> At Risk (Dropping)</h5>
                                        {movers.droppers.map((m:any) => (
                                            <div key={m.id} onClick={() => openDrawer('client', m.id, { targetTab: 'trends' })} className="flex items-center justify-between p-3.5 rounded-xl border border-border border-l-4 border-l-red-500 bg-white shadow-sm cursor-pointer hover:border-red-500/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                                                <div className="flex flex-col min-w-0 pr-3 justify-center">
                                                    <span className="text-sm font-semibold text-foreground truncate group-hover:text-red-500 transition-colors">{m.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">{m.oldest} <ArrowRight className="w-3 h-3 opacity-50" /> {m.latest}</span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-red-500 shadow-sm">{m.diff}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>    
                </div>

                {/* ACTION REQUIRED WIDGET */}
                {showActionReq && (
                    <div className="flex flex-col gap-0 rounded-xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:border-red-300 hover:shadow-md lg:col-span-2 xl:col-span-1 overflow-hidden min-h-[300px] max-h-[520px]">
                        {hasRisk && hasSus ? (
                            <div className="flex flex-col p-4 pb-3 border-b border-red-200 bg-red-50 w-full shrink-0">
                                <div className="text-base font-semibold tracking-tight text-red-600 flex items-center gap-2 mb-3"><AlertOctagon className="w-4 h-4" /> Action Required</div>            
                                <div className="flex items-center gap-1.5 w-full">
                                    <button onClick={() => setActionTab('risk')} className={`relative inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all duration-200 border ${actionTab === 'risk' ? 'bg-white text-red-600 shadow-sm border-red-200' : 'bg-red-50 text-red-600/70 border-transparent hover:bg-red-100 hover:text-red-600 hover:border-red-200'}`}>At Risk</button>
                                    <button onClick={() => setActionTab('sus')} className={`relative inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all duration-200 border ${actionTab === 'sus' ? 'bg-white text-red-600 shadow-sm border-red-200' : 'bg-red-50 text-red-600/70 border-transparent hover:bg-red-100 hover:text-red-600 hover:border-red-200'}`}>Suspended</button>
                                </div>
                            </div>
                        ) : hasRisk ? (
                            <div className="flex flex-col p-4 pb-3 border-b border-red-200 bg-red-50 w-full shrink-0">
                                <div className="text-base font-semibold tracking-tight text-red-600 flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> At-Risk Watchlist</div>
                                <p className="text-xs text-red-500 font-medium mt-1">Clients with health scores under {warningThresh}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col p-4 pb-3 border-b border-red-200 bg-red-50 w-full shrink-0">
                                <div className="text-base font-semibold tracking-tight text-red-600 flex items-center gap-2"><PauseCircle className="w-4 h-4" /> Suspended Projects</div>
                                <p className="text-xs text-red-500 font-medium mt-1">Temporarily suspended projects</p>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-auto p-4 custom-thin-scroll">
                            {(hasRisk && (!hasSus || actionTab === 'risk')) && (
                                <div className="flex flex-col gap-3">
                                    {atRiskClients.map(c => (
                                        <div key={c.clientId} onClick={() => openDrawer('client', c.clientId, { targetTab: 'health' })} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-white shadow-sm cursor-pointer hover:border-red-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                                            <span className="text-[13px] font-bold text-foreground truncate pr-2 group-hover:text-red-600 transition-colors">{c.companyName}</span>
                                            {getHealthBadge(c.healthScore, settings)}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {(hasSus && (!hasRisk || actionTab === 'sus')) && (
                                <div className="flex flex-col gap-3">
                                    {suspendedProjects.map(p => {
                                        const clientDisplay = (p.clients || []).join(', ');
                                        return (
                                            <div key={p.id} onClick={() => openDrawer('project', p.id, { targetTab: 'overview' })} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-white shadow-sm cursor-pointer hover:border-red-300 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
                                                <div className="flex flex-col min-w-0 pr-3 flex-1">
                                                    <span className="text-[13px] font-bold text-foreground group-hover:text-red-600 transition-colors truncate">{p.name}</span>
                                                    <span className="text-[11px] font-bold text-muted-foreground truncate mt-1">{clientDisplay}</span>
                                                </div>
                                                <PauseCircle className="w-5 h-5 text-red-500 shrink-0 group-hover:text-red-600 transition-colors" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ROW 3: Phases + Timelines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 transition-all duration-500 animate-in fade-in duration-700 delay-300 fill-mode-both">  
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full max-h-[400px] min-h-[280px] overflow-hidden lg:col-span-1">        
                    <div className="flex flex-col items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">  
                        <div className="text-base font-semibold tracking-tight text-foreground">Onboarding Phases</div>      
                        <p className="text-xs text-muted-foreground font-medium">Projects in each implementation stage</p>      
                    </div>    
                    <div className="flex-1 overflow-y-hidden overflow-x-auto pb-8 pt-8 custom-thin-scroll relative min-h-[160px] group/container">            
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-border z-0"></div>
                        <div className="flex items-center w-full min-w-max justify-around relative z-10 px-6 h-full gap-12">
                            {onboardingPhases.length === 0 ? (
                                <span className="bg-white px-4 text-muted-foreground font-medium z-10">No onboarding projects</span>
                            ) : onboardingPhases.map(([phase, count], idx) => {
                                const isTop = idx % 2 === 0;
                                const colorName = settings?.phases?.find(p => p.name?.toLowerCase() === String(phase).toLowerCase())?.color;
                                const hexColor = getSafeHex(colorName, 'slate');
                                
                                return (
                                    <div key={phase} className="relative flex flex-col items-center justify-center min-w-[120px] flex-1 group cursor-pointer transition-all duration-300 z-10 h-[10px]" onClick={() => openDrawer('dashDrilldown', undefined, { title: `Milestone: ${phase}`, subtitle: 'Onboarding Projects', projects: filteredProjects.filter(p => p.projectStatus === 'Onboarding' && (p.onboardingPhase === phase || (!p.onboardingPhase && phase === 'Not Started'))) })}>
                                        {isTop && (
                                            <div className="absolute bottom-full mb-3 flex flex-col items-center justify-end text-center w-[120px] transition-transform group-hover:-translate-y-1 left-1/2 -translate-x-1/2">
                                                <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-none">{count}</span>
                                                <span className="text-[13px] font-medium text-muted-foreground mt-1.5 whitespace-normal leading-tight w-full">{phase}</span>
                                            </div>
                                        )}
                                        <div className="w-6 h-3 shrink-0 rounded-full ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform z-10" style={{ backgroundColor: hexColor }}></div>
                                        {!isTop && (
                                            <div className="absolute top-full mt-3 flex flex-col items-center justify-start text-center w-[120px] transition-transform group-hover:translate-y-1 left-1/2 -translate-x-1/2">
                                                <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-none">{count}</span>
                                                <span className="text-[13px] font-medium text-muted-foreground mt-1.5 whitespace-normal leading-tight w-full">{phase}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>    
                </div>    
         
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full max-h-[400px] min-h-[280px] overflow-hidden lg:col-span-1">  
                    <div className="flex flex-col items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">            
                        <div className="text-base font-semibold tracking-tight text-foreground">Delivery Statuses</div>
                        <p className="text-xs text-muted-foreground font-medium">Breakdown of projects based on the launch timeline</p>  
                    </div>        
                    <div className="flex-1 overflow-auto p-6 flex flex-col justify-center">          
                        <div className="w-full flex h-6 rounded-full overflow-hidden mb-5 gap-[3px]">
                            {deliveryTimelines.map(t => {
                                const hexColor = getSafeHex(t.color, 'slate');
                                return (
                                    <div 
                                        key={t.name}
                                        className="h-full hover:opacity-90 cursor-pointer transition-opacity" 
                                        style={{ width: `${t.percentage}%`, backgroundColor: hexColor }}
                                        onClick={() => openDrawer('dashDrilldown', undefined, { 
                                            title: `Delivery Delivery Status: ${t.name}`, 
                                            subtitle: 'Onboarding Projects', 
                                            contextType: 'timeline',
                                            projects: projects.filter(p => p.projectStatus === 'Onboarding' && p.timelineStatus === t.name) 
                                        })}
                                    ></div>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-foreground">
                            {deliveryTimelines.map(t => {
                                const hexColor = getSafeHex(t.color, 'slate');
                                return (
                                    <button 
                                        key={t.name}
                                        onClick={() => openDrawer('dashDrilldown', undefined, { 
                                            title: `Delivery Delivery Status: ${t.name}`, 
                                            subtitle: 'Onboarding Projects', 
                                            contextType: 'timeline',
                                            projects: projects.filter(p => p.projectStatus === 'Onboarding' && p.timelineStatus === t.name) 
                                        })}
                                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer bg-white"
                                        style={{ backgroundColor: hexToRgba(hexColor, 0.1), color: hexColor, borderColor: hexToRgba(hexColor, 0.2) }}
                                    >
                                        <span className="font-bold">{t.count}</span> {t.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>    
                </div>    
            </div>

            {/* ROW 4: Features + Workload */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 animate-in fade-in duration-700 delay-300 fill-mode-both">    
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md lg:col-span-2 overflow-hidden h-full min-h-[250px] max-h-[400px]">      
                    <div className="flex justify-between items-center p-4 pb-3 border-b border-border bg-slate-50 shrink-0">            
                        <div className="flex flex-col pr-4 min-w-0">          
                            <div className="text-base font-semibold tracking-tight text-foreground truncate">Feature Adoption</div>        
                            <p className="text-xs text-muted-foreground mt-1 font-medium truncate">Percentage of total projects utilizing platform modules</p>     
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => setFeatTab('active')} className={`relative inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 ${featTab === 'active' ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}>Active</button>
                            <button onClick={() => setFeatTab('onb')} className={`relative inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 hover:-translate-y-1 hover:shadow-md shadow-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 ${featTab === 'onb' ? 'bg-white text-foreground border-border' : 'bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-accent hover:border-border'}`}>Onboarding</button>
                        </div>      
                    </div>  
                    <div className="flex-1 overflow-auto p-6 custom-thin-scroll">            
                        {featTab === 'active' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 content-start">           
                                {featureAdoptionActive.data.length === 0 ? <span className="text-sm text-muted-foreground font-medium text-center w-full block">No active features tracked.</span> : featureAdoptionActive.data.map(([feature, count]) => {
                                    const pct = featureAdoptionActive.total > 0 ? Math.round((count / featureAdoptionActive.total) * 100) : 0;
                                    const barColorClass = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-orange-500' : 'bg-red-500';
                                    
                                    return (
                                        <div key={feature} className="flex items-center gap-4 cursor-pointer group p-2 rounded-lg bg-white border border-transparent hover:border-border hover:shadow-sm transition-all -m-2" onClick={() => openDrawer('dashDrilldown', undefined, { contextType: 'featureAdoption', title: `Feature: ${feature}`, subtitle: 'Active Projects', projects: filteredProjects.filter(p => (p.projectStatus === 'Active' || p.projectStatus === 'Suspended') && (p.features || []).includes(feature)) })}>
                                            <div className="w-[140px] text-[13px] text-slate-600 font-bold truncate group-hover:text-primary transition-colors">{feature}</div>
                                            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner"><div className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`} style={{ width: `${pct}%` }}></div></div>
                                            <div className="w-[85px] text-right flex items-center justify-end gap-1.5 shrink-0">
                                                <span className="text-sm font-bold text-foreground">{pct}%</span>
                                                <span className="text-[10px] font-medium text-slate-400/80">({count}/{featureAdoptionActive.total})</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>                      
                        )}
                        {featTab === 'onb' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 content-start">        
                                {featureAdoptionOnb.data.length === 0 ? <span className="text-sm text-muted-foreground font-medium text-center w-full block">No onboarding features tracked.</span> : featureAdoptionOnb.data.map(([feature, count]) => {
                                    const pct = featureAdoptionOnb.total > 0 ? Math.round((count / featureAdoptionOnb.total) * 100) : 0;
                                    const barColorClass = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-orange-500' : 'bg-red-500';

                                    return (
                                        <div key={feature} className="flex items-center gap-4 cursor-pointer group p-2 rounded-lg bg-white border border-transparent hover:border-border hover:shadow-sm transition-all -m-2" onClick={() => openDrawer('dashDrilldown', undefined, { contextType: 'featureAdoption', title: `Feature: ${feature}`, subtitle: 'Onboarding Projects', projects: filteredProjects.filter(p => p.projectStatus === 'Onboarding' && (p.features || []).includes(feature)) })}>
                                            <div className="w-[140px] text-[13px] text-slate-600 font-bold truncate group-hover:text-primary transition-colors">{feature}</div>
                                            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner"><div className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClass}`} style={{ width: `${pct}%` }}></div></div>
                                            <div className="w-[85px] text-right flex items-center justify-end gap-1.5 shrink-0">
                                                <span className="text-sm font-bold text-foreground">{pct}%</span>
                                                <span className="text-[10px] font-medium text-slate-400/80">({count}/{featureAdoptionOnb.total})</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>        
                        )}
                    </div>    
                </div>  
               
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md overflow-hidden h-full min-h-[250px] max-h-[400px]">        
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">            
                        <div className="text-base font-semibold tracking-tight text-foreground">Manager Workload</div>
                        <p className="text-xs text-muted-foreground font-medium">Project volume distribution by assignee</p>  
                    </div>        
                    <div className="flex-1 overflow-auto p-4 space-y-3 content-start custom-thin-scroll">            
                        {managerWorkload.length === 0 && <span className="text-sm text-muted-foreground font-medium text-center w-full block">No manager workload data.</span>}
                        {managerWorkload.map(([manager, counts]) => {
                            const initials = manager !== 'Unassigned' ? manager.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '?';
                            const mHex = getSafeHex(settings?.managers?.find((m:any) => m.name === manager)?.color, 'slate');
                            return (
                                <div key={manager} className="flex items-center justify-between p-2 rounded-lg bg-white border border-transparent hover:border-border hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-3 w-1/3 min-w-[120px]">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200" style={{ backgroundColor: hexToRgba(mHex, 0.08), color: mHex, borderColor: hexToRgba(mHex, 0.2) }}>
                                            {initials}
                                        </div>
                                        <span className="text-sm font-bold text-foreground truncate">{manager}</span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                        <button 
                                            onClick={() => openDrawer('dashDrilldown', undefined, { contextType: 'managerWorkloadActive', title: 'Active Projects', subtitle: manager, projects: projects.filter((p:any) => p.assignee === manager && (p.projectStatus === 'Active' || p.projectStatus === 'Suspended')) })}
                                            className="px-4 py-2 rounded-md text-xs font-bold transition-all border w-[110px] text-center bg-green-50 text-green-500 border-transparent shadow-sm hover:border-green-500/30 hover:bg-green-100 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer"
                                        >
                                            {counts.active} Active
                                        </button>
                                        <button 
                                            onClick={() => openDrawer('dashDrilldown', undefined, { contextType: 'managerWorkloadOnboarding', title: 'Onboarding Projects', subtitle: manager, projects: projects.filter((p:any) => p.assignee === manager && p.projectStatus === 'Onboarding') })}
                                            className="px-4 py-2 rounded-md text-xs font-bold transition-all border w-[120px] text-center bg-blue-50 text-blue-500 border-transparent shadow-sm hover:border-blue-500/30 hover:bg-blue-100 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer"
                                        >
                                            {counts.onboarding} Onboarding
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>    
                </div>
            </div>

            {/* ROW 5: Recent Services + Launches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8 animate-in fade-in duration-700 delay-300 fill-mode-both">    
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full max-h-[350px] min-h-[250px] overflow-hidden"> 
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0">            
                         <div className="text-base font-semibold tracking-tight text-foreground">Recent Services Delivered</div>      
                         <p className="text-xs text-muted-foreground font-medium">Services completed this quarter</p>        
                    </div>        
                   
                    <div className="flex-1 overflow-auto p-4 custom-thin-scroll flex flex-col gap-3">  
                        {recentServices.length === 0 && <div className="text-sm text-muted-foreground text-center mt-4 pb-4">No recent services.</div>}
                        {recentServices.map((s, idx) => {
                            const { iconName: SIconName, color: sColor } = getServiceIcon(s.type || '');
                            const hexColor = getSafeHex(sColor, 'slate');
                            const sDate = s.dateVal ? new Date(s.dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date';
                            const formattedPrice = formatCurrency(parseFloat(s.price?.toString().replace(/[^0-9.-]+/g,"")) || 0);
                            return (
                                <div key={s.id} onClick={() => openDrawer('service', s.id)} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.99] flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-white shadow-sm" style={{ backgroundColor: hexToRgba(hexColor, 0.1), borderColor: hexToRgba(hexColor, 0.2), color: hexColor }}>
                                            {renderIcon(SIconName, "w-5 h-5")}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                                            <span className="text-[11px] text-muted-foreground font-medium mt-0.5">{s.clientName || 'Not Set'} &bull; {s.manager || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-sm font-bold text-foreground">{formattedPrice}</span>
                                        <span className="text-[11px] text-muted-foreground font-medium mt-0.5">{sDate}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>        
                 
                    <div className="bg-muted/50 border-t border-border font-medium text-foreground px-6 py-3 flex justify-between items-center shrink-0">            
                        <span className="text-xs text-muted-foreground font-semibold">Total Services: <span className="text-foreground text-sm font-bold ml-1">{recentServices.length}</span></span>            
                        <span className="text-xs text-muted-foreground font-semibold">Total Revenue: <span className="text-sm font-bold ml-1 text-lime-600">{formatCurrency(qRev)}</span></span>    
                    </div>    
                </div>      
               
                <div className="flex flex-col gap-0 rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full max-h-[350px] min-h-[250px] overflow-hidden">  
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-0.5 p-4 pb-3 border-b border-border bg-slate-50 shrink-0"> 
                        <div className="text-base font-semibold tracking-tight text-foreground">Recent Launches</div>      
                        <p className="text-xs text-muted-foreground font-medium">Projects released in this quarter</p>        
                    </div>  
                    <div className="flex-1 overflow-auto p-4 custom-thin-scroll flex flex-col gap-3 mt-0">            
                        {recentLaunches.length === 0 && <div className="text-sm text-muted-foreground text-center mt-4 pb-4">No recent launches.</div>}
                        {recentLaunches.map((p, idx) => {
                            const primaryClientName = p.clients && p.clients.length > 0 ? p.clients[0] : null;
                            const primaryClient = activeClients?.find((c:any) => c.companyName === primaryClientName);
                            const score = p.healthScore || (primaryClient?.healthScore !== "N/A" && typeof primaryClient?.healthScore === 'number' ? primaryClient.healthScore : 0);
                            
                            const healthyThresh = settings?.scoring?.thresholds?.healthy || 80;
                            const warningThresh = settings?.scoring?.thresholds?.warning || 50;
                            let orbColorClass = 'text-red-500 bg-red-50 border-red-200';
                            let badgeColorClass = 'bg-red-500';
                            const numScore = score === "N/A" ? 0 : Number(score);
                            if (numScore >= healthyThresh) {
                                orbColorClass = 'text-green-500 bg-green-50 border-green-200';
                                badgeColorClass = 'bg-green-500';
                            } else if (numScore >= warningThresh) {
                                orbColorClass = 'text-orange-500 bg-orange-50 border-orange-200';
                                badgeColorClass = 'bg-orange-500';
                            }

                            const pDate = p.releaseDateVal ? new Date(p.releaseDateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date';
                            const clientDisplay = (p.clients || []).join(', ');

                            return (
                                <div key={p.id} onClick={() => openDrawer('project', p.id)} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.99] flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${orbColorClass}`}>
                                            <Rocket className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col overflow-hidden pr-3">
                                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                                            <span className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">{clientDisplay || 'No Client'} &bull; {p.assignee || 'No Manager'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 pl-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mb-0.5 shadow-sm ${badgeColorClass}`}>
                                            {score}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-medium">{pDate}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>        
           
                    <div className="bg-muted/50 border-t border-border font-medium text-foreground px-6 py-3 flex justify-between items-center shrink-0">            
                        <span className="text-xs text-muted-foreground font-semibold">Total Projects: <span className="text-foreground text-sm font-bold ml-1">{recentLaunches.length}</span></span>
                    </div>    
                </div>
            </div>


            
        </div>
    );
}
