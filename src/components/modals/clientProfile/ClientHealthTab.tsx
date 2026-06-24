import React, { useEffect, useState, useMemo } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { calculateClientHealth } from '../../../utils/scoringUtils';
import { useAppStore } from '../../../store/useAppStore';
import { getHealthHistory } from '../../../api/dbService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface ClientHealthTabProps {
  client: any;
}

export default React.memo(function ClientHealthTab({ client }: ClientHealthTabProps) {
  const projects = useAppStore(state => state.projects);
  const settings = useAppStore(state => state.settings);

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'30' | '90' | '365' | 'all'>('30');

  useEffect(() => {
    async function fetchH() {
      setLoading(true);
      try {
        if (client?.clientId || client?.id) {
          const h = await getHealthHistory(client.clientId || client.id);
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
  }, [client]);

  const optimizedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    const now = new Date().getTime();
    let cutoff = 0;
    if (filter !== 'all') {
      cutoff = now - parseInt(filter) * 24 * 60 * 60 * 1000;
    }
    const inWindow = history.filter((h) => h.timeVal >= cutoff);
    if (inWindow.length === 0) return [];

    const chronological = [...inWindow].sort((a, b) => a.timeVal - b.timeVal);
    const dailyMap = new Map<string, any>();
    chronological.forEach((h) => {
      const dateStr = new Date(h.timeVal).toDateString();
      dailyMap.set(dateStr, h);
    });

    const dailyArray = Array.from(dailyMap.values()).sort((a, b) => a.timeVal - b.timeVal);
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
    labels: optimizedHistory.map((h) =>
      new Date(h.timeVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        data: optimizedHistory.map((h) => h.score),
        borderColor: '#00bdd9',
        backgroundColor: 'rgba(0, 189, 217, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00bdd9',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: true,
      },
    ],
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
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            return `Health Score: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } },
      x: { grid: { display: false } },
    },
  };

  const healthResult = calculateClientHealth(client, projects, settings);

  if (client?.activeProjectCount === 0 || healthResult.totalScore === 'N/A') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No active data to score</h3>
        <p className="text-slate-500 mt-2 max-w-sm">
          Metrics and trends will automatically calculate when the client has active projects generating data.
        </p>
      </div>
    );
  }

  const getScoreColor = (val: number | string) => {
    if (typeof val !== 'number') return 'text-slate-400';
    if (val >= 80) return 'text-emerald-600';
    if (val >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBarColor = (val: number | string) => {
    if (typeof val !== 'number') return 'bg-slate-200';
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 50) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const finVal = healthResult.financial;
  const opVal = healthResult.opActivity;
  const usrVal = healthResult.userVol;
  const fPct = healthResult.featAdoption;
  const csatVal = healthResult.csat;

  const metrics = [
    { label: 'Platform Engagement', desc: "Aggregated volume of core platform events and workflows", val: opVal },
    { label: 'Feature Adoption', desc: "Average breadth of platform features and modules toggled on", val: fPct },
    { label: 'Financial Standing', desc: "Outstanding invoices aggregated across projects", val: finVal },
    { label: 'User Adoption', desc: "Growth in unique monthly active users", val: usrVal },
    { label: 'CSAT', desc: "Aggregated satisfaction scores from surveys", val: csatVal },
  ];

  return (
    <div className="space-y-12">
      {/* Metrics Breakdown Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Health Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((m, idx) => (
            <div key={idx} className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-100 to-slate-50 group-hover:from-primary/20 group-hover:to-primary/5 transition-colors" />
              <div className="flex flex-col h-full">
                <span className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight mb-1">{m.label}</span>
                <span className="text-xs text-slate-500 font-medium leading-relaxed mb-4 flex-1">{m.desc}</span>
                
                <div className="flex items-end justify-between mt-auto pt-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${getBarColor(m.val)}`}
                      style={{ width: typeof m.val === 'number' ? `${Math.min(m.val, 100)}%` : '0%' }}
                    />
                  </div>
                  <span className={`text-2xl font-black tabular-nums tracking-tight leading-none ${getScoreColor(m.val)}`}>
                    {m.val}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Trends Graph */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Health Trends
          </h3>
          <div className="flex bg-slate-100/80 p-1 rounded-lg">
            {(['30', '90', '365', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filter === f
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === '30' ? '30D' : f === '90' ? '90D' : f === '365' ? '1Y' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-[300px] bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
        ) : optimizedHistory.length > 1 ? (
          <div className="h-[300px] w-full bg-white rounded-2xl border border-slate-100 p-4 pt-6 shadow-sm">
            <Line data={chartData} options={chartOptions as any} />
          </div>
        ) : (
          <div className="h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mb-3" />
            <h4 className="text-[15px] font-semibold text-slate-700 mb-1">Not Enough Data</h4>
            <p className="text-sm text-slate-500 max-w-xs">
              We need at least two data points to show a trend. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
