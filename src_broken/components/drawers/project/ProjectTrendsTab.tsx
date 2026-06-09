import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { getHealthHistory } from '../../../api/dbService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface ProjectTrendsTabProps {
  project: any;
}

export default function ProjectTrendsTab({ project }: ProjectTrendsTabProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'30' | '90' | '365' | 'all'>('30');

    useEffect(() => {
        async function fetchH() {
            setLoading(true);
            try {
                if (project?.projectId || project?.id) {
                    // Pass the project's specific ID to fetch project-level snapshots
                    const h = await getHealthHistory(project.projectId || project.id);
                    setHistory(Array.isArray(h) ? h : []);
                } else {
                    setHistory([]);
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
        fetchH();
    }, [project]);

    const optimizedHistory = useMemo(() => {
        if (!history || history.length === 0) return [];
        
        const now = new Date().getTime();
        let cutoff = 0;
        if (filter !== 'all') {
            cutoff = now - (parseInt(filter) * 24 * 60 * 60 * 1000);
        }
        
        const inWindow = history.filter(h => h.timeVal >= cutoff);
        if (inWindow.length === 0) return [];

        const chronological = [...inWindow].sort((a,b) => a.timeVal - b.timeVal);

        const dailyMap = new Map<string, any>();
        chronological.forEach(h => {
            const dateStr = new Date(h.timeVal).toDateString();
            dailyMap.set(dateStr, h);
        });

        const dailyArray = Array.from(dailyMap.values()).sort((a,b) => a.timeVal - b.timeVal);

        const finalArray: any[] = [];
        for (let i = 0; i < dailyArray.length; i++) {
            const current = dailyArray[i];
            if (i === 0 || i === dailyArray.length - 1) {
                finalArray.push(current);
            } else {
                const prev = finalArray[finalArray.length - 1];
                if (current.score !== prev.score) {
                    finalArray.push(current);
                }
            }
        }
        return finalArray;
    }, [history, filter]);

    const chartData = {
        labels: optimizedHistory.map(h => new Date(h.timeVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [{
            data: optimizedHistory.map(h => h.score),
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00bdd9', // Primary brand color
            backgroundColor: 'rgba(0, 189, 217, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#fff',
            pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00bdd9',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.3,
            fill: true
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                callbacks: {
                    label: function(context: any) {
                        return `Health Score: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: { 
            y: { 
                min: 0, 
                max: 100,
                grid: {
                    color: '#f1f5f9'
                },
                border: { dash: [4, 4] }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col space-y-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                   <div className="h-5 bg-slate-200 rounded w-40"></div>
                   <div className="h-9 bg-slate-200 rounded w-48"></div>
                </div>
                <div className="bg-slate-50 border border-border rounded-xl p-4 h-64 shadow-sm -mt-6"></div>
                <div className="h-40 bg-slate-50 border border-border rounded-xl"></div>
            </div>
        );
    }

    if (history.length === 0 || optimizedHistory.length === 0) {
        return (
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-semibold text-foreground text-sm">Project Health Trajectory</h3>
                   <div className="inline-flex items-center rounded-lg p-[3px] text-muted-foreground bg-slate-100 w-max justify-start flex-nowrap h-9 shrink-0">
                       <button onClick={() => setFilter('30')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === '30' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>30D</button>
                       <button onClick={() => setFilter('90')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === '90' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>90D</button>
                       <button onClick={() => setFilter('365')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === '365' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>1Y</button>
                       <button onClick={() => setFilter('all')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === 'all' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>All</button>
                   </div>
                </div>
                <div className="bg-slate-50 border border-dashed border-border rounded-xl p-8 text-center">
                    <p className="text-sm font-bold text-foreground">No History Available</p>
                    <p className="text-xs text-muted-foreground mt-1">There is no historical health data for this timeframe.</p>
                </div>
            </div>
        );
    }

    const tableData = [...optimizedHistory].sort((a,b) => b.timeVal - a.timeVal);

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <h3 className="font-semibold text-foreground text-sm">Project Health Trajectory</h3>
               <div className="inline-flex items-center rounded-lg p-[3px] text-muted-foreground bg-slate-100 w-max justify-start flex-nowrap h-9 shrink-0">
                   <button onClick={() => setFilter('30')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === '30' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>30D</button>
                   <button onClick={() => setFilter('90')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === '90' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>90D</button>
                   <button onClick={() => setFilter('365')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === '365' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>1Y</button>
                   <button onClick={() => setFilter('all')} className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${filter === 'all' ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'}`}>All</button>
               </div>
            </div>
            
            <div className="bg-white border border-border rounded-xl p-4 h-64 shadow-sm relative mb-6">
                <Line data={chartData} options={chartOptions as any} />
            </div>
            
            <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-border text-[13px] font-medium text-slate-500">
                        <tr>
                            <th className="px-4 py-4">Snapshot Date</th>
                            <th className="px-4 py-4 text-center">Score</th>
                            <th className="px-4 py-4 text-right">Change</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {tableData.map((h, i) => {
                            const prevScore = i < tableData.length - 1 ? tableData[i + 1].score : h.score;
                            const diff = h.score - prevScore;
                            
                            let rowBg = 'bg-white';
                            let diffColor = 'text-slate-400';
                            let diffText = '-';

                            if (diff > 0) {
                                rowBg = 'bg-emerald-50/40';
                                diffColor = 'text-emerald-600 font-bold';
                                diffText = `+${diff}`;
                            } else if (diff < 0) {
                                rowBg = 'bg-red-50/40';
                                diffColor = 'text-red-600 font-bold';
                                diffText = `${diff}`;
                            }

                            return (
                                <tr key={i} className={`${rowBg} hover:opacity-90 transition-opacity`}>
                                    <td className="px-4 py-3 font-medium text-slate-700">{new Date(h.timeVal).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-bold text-slate-800">{h.score}</span>
                                    </td>
                                    <td className={`px-4 py-3 text-right ${diffColor}`}>
                                        {diffText}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
