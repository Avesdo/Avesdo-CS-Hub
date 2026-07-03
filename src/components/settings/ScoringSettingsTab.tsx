import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { saveSettings } from '../../api/dbService';
import { toast } from '../../utils/toast';
import { DonutChart } from '../ui/DonutChart';
import { DualThumbSlider } from '../ui/DualThumbSlider';
import { Tooltip } from '../ui/Tooltip';
import { AlertCircle } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';

export function ScoringSettingsTab() {
  const settings = useAppStore((state) => state.settings);
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_health_scoring');

  const [projectWeights, setProjectWeights] = useState({
    opActivity: 35,
    featAdoption: 25,
    userVol: 15,
    financial: 15,
    csat: 10,
  });
  const [thresholds, setThresholds] = useState({ healthy: 80, warning: 50 });

  useEffect(() => {
    if (settings?.scoring) {
      setProjectWeights(
        settings.scoring.weights || {
          opActivity: 35,
          featAdoption: 25,
          userVol: 15,
          financial: 15,
          csat: 10,
        }
      );
      setThresholds(settings.scoring.thresholds || { healthy: 80, warning: 50 });
    }
  }, [settings]);

  if (!settings) return null;

  const totalProjectWeights = Object.values(projectWeights).reduce((a, b) => a + Number(b), 0);

  const handleSaveScoring = async () => {
    if (totalProjectWeights !== 100) {
      toast.error('Weights must equal exactly 100%');
      return;
    }
    if (thresholds.warning >= thresholds.healthy) {
      toast.error('Warning threshold must be strictly less than Healthy threshold');
      return;
    }

    const newSettings = {
      ...settings,
      scoring: {
        weights: projectWeights,
        thresholds: thresholds,
      },
    };
    toast.promise(saveSettings(newSettings), {
      loading: 'Saving Scoring Rules...',
      success: 'Scoring Rules Saved!',
      error: 'Failed to save Scoring Rules',
    });
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
      {/* Unified Health Pillar Weights */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6">
        <style>{`
          .premium-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--slider-color);
            cursor: grab;
            transition: transform 0.15s;
            margin-top: -4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          .premium-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
          .premium-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(0.9);
          }
          .premium-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--slider-color);
            cursor: grab;
            transition: transform 0.15s;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          .premium-slider::-moz-range-thumb:hover {
            transform: scale(1.2);
          }
          .premium-slider::-moz-range-thumb:active {
            cursor: grabbing;
            transform: scale(0.9);
          }
          .premium-slider::-webkit-slider-runnable-track {
            border-radius: 8px;
            height: 8px;
            background: #f1f5f9;
          }
          .premium-slider::-moz-range-track {
            border-radius: 8px;
            height: 8px;
            background: #f1f5f9;
          }
        `}</style>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
            Health Score Weights
          </h3>
          <p className="text-sm text-slate-500">
            Adjust the weights for each pillar so they equal exactly 100%.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Sliders */}
          <div className="flex-1 w-full space-y-5">
            {[
              {
                label: 'Platform Engagement',
                key: 'opActivity',
                val: projectWeights.opActivity,
                color: '#0ea5e9',
                tooltip: 'Measures engagement based on the pages accessed and total page views.',
              },
              {
                label: 'Feature Adoption',
                key: 'featAdoption',
                val: projectWeights.featAdoption,
                color: '#0284c7',
                tooltip:
                  'Measures the breadth of platform utilization based on enabled features versus total available features.',
              },
              {
                label: 'Financial Standing',
                key: 'financial',
                val: projectWeights.financial || 0,
                color: '#3b82f6',
                tooltip: 'Measures financial standing based on current invoice payment status.',
              },
              {
                label: 'Active Users',
                key: 'userVol',
                val: projectWeights.userVol,
                color: '#6366f1',
                tooltip:
                  'Measures user activity based on active users and their average login frequency.',
              },
              {
                label: 'Client Sentiment',
                key: 'csat',
                val: projectWeights.csat,
                color: '#8b5cf6',
                tooltip:
                  'Measures client sentiment based on onboarding satisfaction, support feedback, and NPS.',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-4">
                <Tooltip content={item.tooltip} position="top">
                  <label className="text-sm font-semibold text-slate-600 w-44 flex items-center justify-between gap-1.5 shrink-0 cursor-help pr-2 border-r border-slate-100">
                    {item.label}
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                </Tooltip>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={!canEdit}
                  className="flex-1 appearance-none bg-transparent cursor-pointer premium-slider disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ '--slider-color': item.color } as React.CSSProperties}
                  value={item.val}
                  onChange={(e) =>
                    setProjectWeights({
                      ...projectWeights,
                      [item.key]: Number(e.target.value) || 0,
                    })
                  }
                />
                <span className="text-sm font-bold text-slate-700 w-12 text-right">
                  {item.val}%
                </span>
              </div>
            ))}
          </div>

          {/* Right: Donut Chart */}
          <div className="w-full lg:w-64 h-64 shrink-0 flex flex-col items-center justify-center">
            <DonutChart
              total={totalProjectWeights}
              data={[
                {
                  name: 'Platform Engagement',
                  value: projectWeights.opActivity,
                  color: '#0ea5e9',
                },
                {
                  name: 'Feature Adoption',
                  value: projectWeights.featAdoption,
                  color: '#0284c7',
                },
                {
                  name: 'Financial Standing',
                  value: projectWeights.financial || 0,
                  color: '#3b82f6',
                },
                { name: 'Active Users', value: projectWeights.userVol, color: '#6366f1' },
                {
                  name: 'Client Sentiment',
                  value: projectWeights.csat,
                  color: '#8b5cf6',
                },
              ].filter((d) => d.value > 0)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end items-center">
          {canEdit && (
            <div className="flex gap-4 items-center">
              <button
                onClick={handleSaveScoring}
                disabled={totalProjectWeights !== 100}
                className="bg-primary text-white px-5 h-9 rounded text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Weights
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Thresholds */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-800 mb-1">KPI Thresholds</h3>
          <p className="text-sm text-slate-500">
            Drag the handles below to define the score boundaries for At-Risk, Warning, and Healthy
            states.
          </p>
        </div>

        <div className="px-4 max-w-3xl">
          <DualThumbSlider
            value={{ warning: thresholds.warning, healthy: thresholds.healthy }}
            onChange={({ warning, healthy }) => setThresholds({ warning, healthy })}
            disabled={!canEdit}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="text-center w-24">
              <span className="block text-sm font-semibold text-slate-500 mb-1">At Risk</span>
              <span className="text-base font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">
                0 - {thresholds.warning - 1}
              </span>
            </div>
            <div className="text-center w-24">
              <span className="block text-sm font-semibold text-slate-500 mb-1">Warning</span>
              <span className="text-base font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded">
                {thresholds.warning} - {thresholds.healthy - 1}
              </span>
            </div>
            <div className="text-center w-24">
              <span className="block text-sm font-semibold text-slate-500 mb-1">Healthy</span>
              <span className="text-base font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                {thresholds.healthy} - 100
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end items-center">
          {canEdit && (
            <button
              onClick={handleSaveScoring}
              className="bg-primary text-white px-5 h-9 rounded text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              Save Thresholds
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
