import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import EmptyState from '../EmptyState';

export default function QuarterlyMovers({ healthHistory, activeClients }: { healthHistory: any; activeClients: any[] }) {
  const movers = useMemo(() => {
    if (!healthHistory || Object.keys(healthHistory).length === 0) return null;

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const timeThresh = ninetyDaysAgo.getTime();

    const improvers: any[] = [];
    const droppers: any[] = [];

    activeClients.forEach((c) => {
      if (c.healthScore !== 'N/A' && typeof c.healthScore === 'number') {
        const rawHistory = healthHistory[c.clientId] || [];
        const history = rawHistory
          .filter((h: any) => h.timeVal >= timeThresh && typeof h.score === 'number')
          .sort((a: any, b: any) => a.timeVal - b.timeVal);

        if (history.length > 0) {
          const oldest = history[0].score;
          const diff = c.healthScore - oldest;
          
          // Generate sparkline data
          const sparklineData = history.map((h: any) => ({ score: h.score }));
          sparklineData.push({ score: c.healthScore }); // Ensure current score is at the end

          const dataObj = {
            id: c.clientId,
            name: c.companyName,
            oldest,
            latest: c.healthScore,
            diff,
            sparklineData
          };
          
          if (diff > 0) improvers.push(dataObj);
          else if (diff < 0) droppers.push(dataObj);
        }
      }
    });

    improvers.sort((a, b) => b.diff - a.diff);
    droppers.sort((a, b) => a.diff - b.diff);

    return {
      improvers: improvers.slice(0, 5),
      droppers: droppers.slice(0, 5),
    };
  }, [activeClients, healthHistory]);

  if (!movers || (movers.improvers.length === 0 && movers.droppers.length === 0)) {
    return <EmptyState icon={BarChart3} title="No Movement" subtitle="No major health shifts." />;
  }

  const renderSparkline = (data: any[], isImprover: boolean) => (
    <div className="w-16 h-8 ml-2 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke={isImprover ? '#65a30d' : '#dc2626'} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
      {movers.improvers.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-lime-600 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/> Top Improvers</h5>
          {movers.improvers.map((m: any) => (
            <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[13px] font-bold text-foreground truncate group-hover:text-lime-600 transition-colors">{m.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{m.oldest} → {m.latest}</span>
              </div>
              <div className="flex items-center">
                {renderSparkline(m.sparklineData, true)}
                <span className="text-xs font-bold text-lime-600 bg-lime-100 px-2 py-0.5 rounded-full ml-3 shrink-0">+{m.diff}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {movers.droppers.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5"/> At Risk (Dropping)</h5>
          {movers.droppers.map((m: any) => (
            <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[13px] font-bold text-foreground truncate group-hover:text-red-600 transition-colors">{m.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{m.oldest} → {m.latest}</span>
              </div>
              <div className="flex items-center">
                {renderSparkline(m.sparklineData, false)}
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-3 shrink-0">{m.diff}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
