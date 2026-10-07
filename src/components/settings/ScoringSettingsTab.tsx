import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { saveSettings } from '../../api/dbService';
import { toast } from '../../utils/toast';
import { DonutChart } from '../ui/DonutChart';
import { DualThumbSlider } from '../ui/DualThumbSlider';
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { Settings } from '../../types';
import {
  ScoringWeights,
  ScoringThresholds,
  DEFAULT_WEIGHTS,
  DEFAULT_THRESHOLDS,
  PILLARS,
  SLIDER_STYLES,
  TotalAllocationBadge,
  PillarRow,
} from './ScoringSettingsHelpers';

export function ScoringSettingsTab() {
  const settings = useAppStore((state) => state.settings);
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_health_scoring');

  const savedWeights: ScoringWeights = useMemo(
    () => ({
      opActivity: settings?.scoring?.weights?.opActivity ?? DEFAULT_WEIGHTS.opActivity,
      featAdoption: settings?.scoring?.weights?.featAdoption ?? DEFAULT_WEIGHTS.featAdoption,
      userVol: settings?.scoring?.weights?.userVol ?? DEFAULT_WEIGHTS.userVol,
      financial: settings?.scoring?.weights?.financial ?? DEFAULT_WEIGHTS.financial,
      csat: settings?.scoring?.weights?.csat ?? DEFAULT_WEIGHTS.csat,
    }),
    [
      settings?.scoring?.weights?.opActivity,
      settings?.scoring?.weights?.featAdoption,
      settings?.scoring?.weights?.userVol,
      settings?.scoring?.weights?.financial,
      settings?.scoring?.weights?.csat,
    ]
  );

  const savedThresholds: ScoringThresholds = useMemo(
    () => ({
      healthy: settings?.scoring?.thresholds?.healthy ?? DEFAULT_THRESHOLDS.healthy,
      warning: settings?.scoring?.thresholds?.warning ?? DEFAULT_THRESHOLDS.warning,
    }),
    [settings?.scoring?.thresholds?.healthy, settings?.scoring?.thresholds?.warning]
  );

  const [projectWeights, setProjectWeights] = useState<ScoringWeights>(savedWeights);
  const [thresholds, setThresholds] = useState<ScoringThresholds>(savedThresholds);
  const [isSavingWeights, setIsSavingWeights] = useState(false);
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  const isInitialized = useRef(false);

  const isDirtyWeights = JSON.stringify(projectWeights) !== JSON.stringify(savedWeights);
  const isDirtyThresholds =
    thresholds.warning !== savedThresholds.warning ||
    thresholds.healthy !== savedThresholds.healthy;

  useEffect(() => {
    if (!settings?.scoring) return;
    if (!isInitialized.current) {
      setProjectWeights(savedWeights);
      setThresholds(savedThresholds);
      isInitialized.current = true;
    }
  }, [settings?.scoring, savedWeights, savedThresholds]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (!isDirtyWeights) {
      setProjectWeights((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(savedWeights)) return prev;
        return savedWeights;
      });
    }
  }, [savedWeights, isDirtyWeights]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (!isDirtyThresholds) {
      setThresholds((prev) => {
        if (prev.warning === savedThresholds.warning && prev.healthy === savedThresholds.healthy) {
          return prev;
        }
        return savedThresholds;
      });
    }
  }, [savedThresholds, isDirtyThresholds]);

  if (!settings) return null;

  const totalProjectWeights =
    (Number(projectWeights.opActivity) || 0) +
    (Number(projectWeights.featAdoption) || 0) +
    (Number(projectWeights.userVol) || 0) +
    (Number(projectWeights.financial) || 0) +
    (Number(projectWeights.csat) || 0);

  const handleSaveWeights = async () => {
    if (!settings || !canEdit) return;
    if (totalProjectWeights !== 100) {
      toast.error('Weights must equal exactly 100%');
      return;
    }

    setIsSavingWeights(true);
    const store = useAppStore.getState();
    const prevSettings = store.settings;

    const newSettings: Settings = {
      ...settings,
      scoring: {
        ...settings.scoring,
        weights: projectWeights,
        thresholds: settings.scoring?.thresholds || thresholds,
      },
    };

    store.setAppState({ ...store, settings: newSettings });

    try {
      await toast.promise(saveSettings(newSettings, { silent: true }), {
        loading: 'Saving Weights...',
        success: 'Weights Saved Successfully!',
        error: 'Failed to save Weights',
      });
    } catch {
      if (prevSettings) {
        useAppStore.getState().setAppState({
          ...useAppStore.getState(),
          settings: prevSettings,
        });
      }
    } finally {
      setIsSavingWeights(false);
    }
  };

  const handleSaveThresholds = async () => {
    if (!settings || !canEdit) return;
    if (thresholds.warning >= thresholds.healthy) {
      toast.error('Warning threshold must be strictly less than Healthy threshold');
      return;
    }

    setIsSavingThresholds(true);
    const store = useAppStore.getState();
    const prevSettings = store.settings;

    const newSettings: Settings = {
      ...settings,
      scoring: {
        ...settings.scoring,
        weights: settings.scoring?.weights || projectWeights,
        thresholds: thresholds,
      },
    };

    store.setAppState({ ...store, settings: newSettings });

    try {
      await toast.promise(saveSettings(newSettings, { silent: true }), {
        loading: 'Saving Thresholds...',
        success: 'Thresholds Saved Successfully!',
        error: 'Failed to save Thresholds',
      });
    } catch {
      if (prevSettings) {
        useAppStore.getState().setAppState({
          ...useAppStore.getState(),
          settings: prevSettings,
        });
      }
    } finally {
      setIsSavingThresholds(false);
    }
  };

  const cannotSaveWeights =
    !isDirtyWeights || totalProjectWeights !== 100 || isSavingWeights || !canEdit;
  const cannotSaveThresholds =
    !isDirtyThresholds ||
    thresholds.warning >= thresholds.healthy ||
    isSavingThresholds ||
    !canEdit;

  return (
    <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
      {/* Unified Health Pillar Weights */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6">
        <style>{SLIDER_STYLES}</style>
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
            {PILLARS.map((p) => (
              <PillarRow
                key={p.key}
                pillar={p}
                value={projectWeights[p.key] ?? 0}
                canEdit={canEdit}
                onChange={(val) => setProjectWeights((prev) => ({ ...prev, [p.key]: val }))}
              />
            ))}
          </div>

          {/* Right: Donut Chart */}
          <div className="w-full lg:w-64 h-64 shrink-0 flex flex-col items-center justify-center">
            <DonutChart
              total={totalProjectWeights}
              data={PILLARS.map((p) => ({
                name: p.label,
                value: projectWeights[p.key] ?? 0,
                color: p.color,
              })).filter((d) => d.value > 0)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <TotalAllocationBadge total={totalProjectWeights} />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {canEdit && isDirtyWeights && (
              <button
                type="button"
                onClick={() => setProjectWeights(savedWeights)}
                disabled={isSavingWeights}
                className="px-3.5 h-9 rounded text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50"
              >
                Discard Changes
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={handleSaveWeights}
                disabled={cannotSaveWeights}
                className="bg-primary text-white px-5 h-9 rounded text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingWeights && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSavingWeights ? 'Saving...' : 'Save Weights'}
              </button>
            )}
          </div>
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

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {thresholds.warning >= thresholds.healthy && (
              <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Warning threshold must be strictly less than Healthy threshold
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {canEdit && isDirtyThresholds && (
              <button
                type="button"
                onClick={() => setThresholds(savedThresholds)}
                disabled={isSavingThresholds}
                className="px-3.5 h-9 rounded text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50"
              >
                Discard Changes
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={handleSaveThresholds}
                disabled={cannotSaveThresholds}
                className="bg-primary text-white px-5 h-9 rounded text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingThresholds && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSavingThresholds ? 'Saving...' : 'Save Thresholds'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
