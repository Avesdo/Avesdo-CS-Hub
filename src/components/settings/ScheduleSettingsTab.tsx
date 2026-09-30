import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { saveSettings } from '../../api/dbService';
import { MultiSelect } from '../ui/MultiSelect';
import { DatePicker } from '../ui/DatePicker';
import { DateRangePicker } from '../ui/DateRangePicker';
import { Select } from '../ui/Select';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { Tooltip } from '../ui/Tooltip';
import {
  Check,
  User,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  Plus,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';

import { usePermissions } from '../../hooks/usePermissions';

export function ScheduleSettingsTab() {
  const settings = useAppStore((state) => state.settings);
  const users = useAppStore((state) => state.users);
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_schedule');

  // Time off state
  const [newTimeOffStart, setNewTimeOffStart] = useState<number | null>(null);
  const [newTimeOffEnd, setNewTimeOffEnd] = useState<number | null>(null);
  const [newTimeOffManager, setNewTimeOffManager] = useState<string>('');

  const [editTimeOffStart, setEditTimeOffStart] = useState<number | null>(null);
  const [editTimeOffEnd, setEditTimeOffEnd] = useState<number | null>(null);
  const [editTimeOffManager, setEditTimeOffManager] = useState<string>('');
  const [editingTimeOffIndex, setEditingTimeOffIndex] = useState<number | null>(null);
  const [showPastTimeOff, setShowPastTimeOff] = useState(false);

  // Stat holiday state
  const [newHolidayDate, setNewHolidayDate] = useState<number | null>(null);
  const [newHolidayName, setNewHolidayName] = useState<string>('');

  const [editHolidayDate, setEditHolidayDate] = useState<number | null>(null);
  const [editHolidayName, setEditHolidayName] = useState<string>('');
  const [editingHolidayIndex, setEditingHolidayIndex] = useState<number | null>(null);
  const [showPastHolidays, setShowPastHolidays] = useState(false);

  const [isAddingTimeOff, setIsAddingTimeOff] = useState(false);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);

  const getUserName = (id: string) => {
    const u = users.find((user) => user.uid === id);
    return u ? u.displayName || u.name || u.email || id : id;
  };

  const accountManagerOptions = useMemo(() => {
    return users
      .filter((u) => u.isAccountManager && !u.isDeactivated)
      .map((u) => ({
        value: u.uid,
        label: getUserName(u.uid),
      }));
  }, [users]);

  if (!settings) return null;

  const shiftsConfig = [
    {
      id: 'est',
      title: 'Mon–Fri • 9:00 AM – 5:00 PM EST',
      managers: settings?.estManagers || [],
      saveKey: 'estManagers',
      color: 'sky',
      iconBg: 'bg-sky-50 border-sky-100 text-sky-600',
    },
    {
      id: 'pst',
      title: 'Mon–Fri • 9:00 AM – 5:00 PM PST',
      managers: settings?.pstManagers || [],
      saveKey: 'pstManagers',
      color: 'indigo',
      iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    },
    {
      id: 'pstWedSat',
      title: 'Wed–Sat • 8:00 AM – 6:00 PM PST',
      managers: settings?.pstWedSatManagers || [],
      saveKey: 'pstWedSatManagers',
      color: 'purple',
      iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
    },
    {
      id: 'pstSunWed',
      title: 'Sun–Wed • 8:00 AM – 6:00 PM PST',
      managers: settings?.pstSunWedManagers || [],
      saveKey: 'pstSunWedManagers',
      color: 'purple',
      iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <div className="space-y-8 mt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Shift Coverage Assignments
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shiftsConfig.map((shift) => {
              const isCovered = shift.managers.length > 0;
              return (
                <div
                  key={shift.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${shift.iconBg}`}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{shift.title}</h4>
                    </div>
                    <div>
                      {isCovered ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {shift.managers.length}{' '}
                          {shift.managers.length === 1 ? 'Manager' : 'Managers'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <MultiSelect
                      variant="inline"
                      disabled={!canEdit}
                      options={accountManagerOptions}
                      values={shift.managers}
                      onChange={(vals) =>
                        saveSettings({ ...(settings as any), [shift.saveKey]: vals })
                      }
                      placeholder="Assign managers..."
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              Time Off Records
            </h3>
            <div className="flex items-center gap-4">
              <label className="relative flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showPastTimeOff}
                  onChange={(e) => setShowPastTimeOff(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${showPastTimeOff ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}
                >
                  {showPastTimeOff && (
                    <Check className="w-2.5 h-2.5 text-white animate-in zoom-in" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700">Show past</span>
              </label>
              {canEdit && !isAddingTimeOff && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingTimeOff(true)}
                  className="text-primary hover:text-primary hover:bg-primary/5 font-medium flex items-center gap-1.5 px-3"
                >
                  <Plus className="w-4 h-4" /> Add Time Off
                </Button>
              )}
            </div>
          </div>

          {isAddingTimeOff && (
            <div className="mb-6 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-slate-700">New Time Off Record</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddingTimeOff(false)}
                  className="w-8 h-8 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <DateRangePicker
                  preset="custom"
                  startDate={newTimeOffStart}
                  endDate={newTimeOffEnd}
                  onChange={(_, start, end) => {
                    setNewTimeOffStart(start);
                    setNewTimeOffEnd(end);
                  }}
                  className="flex-1 md:max-w-[260px]"
                  hidePresets={true}
                  placeholder="Select Date Range"
                  variant="outline"
                />
                <Select
                  value={newTimeOffManager}
                  onChange={(val) => setNewTimeOffManager(val)}
                  options={users
                    .filter((u) => u.isAccountManager && !u.isDeactivated)
                    .map((u) => ({
                      value: u.uid,
                      label: getUserName(u.uid),
                    }))}
                  trigger={
                    <Button
                      variant="outline"
                      className="flex-1 md:max-w-[220px] font-normal justify-between"
                    >
                      {newTimeOffManager ? (
                        getUserName(newTimeOffManager)
                      ) : (
                        <span className="text-muted-foreground">Select Manager...</span>
                      )}
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  }
                />
                <Button
                  onClick={() => {
                    if (newTimeOffStart && newTimeOffEnd && newTimeOffManager) {
                      const newEntry = {
                        startDate: format(new Date(newTimeOffStart), 'yyyy-MM-dd'),
                        endDate: format(new Date(newTimeOffEnd), 'yyyy-MM-dd'),
                        manager: newTimeOffManager,
                      };
                      const existingTimeOff = [...(settings?.timeOff || [])];
                      existingTimeOff.push(newEntry);
                      existingTimeOff.sort(
                        (a: any, b: any) =>
                          new Date(a.startDate || a.date).getTime() -
                          new Date(b.startDate || b.date).getTime()
                      );
                      saveSettings({ ...(settings as any), timeOff: existingTimeOff });
                      setNewTimeOffStart(null);
                      setNewTimeOffEnd(null);
                      setNewTimeOffManager('');
                      setIsAddingTimeOff(false);
                    }
                  }}
                  disabled={!newTimeOffStart || !newTimeOffEnd || !newTimeOffManager}
                  className="px-6 whitespace-nowrap"
                >
                  Add Time Off
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(() => {
              const todayStr = new Date(
                new Date().getTime() - new Date().getTimezoneOffset() * 60000
              )
                .toISOString()
                .split('T')[0];
              const visibleTimeOff = (settings?.timeOff || [])
                .map((t: any, i: number) => ({ ...t, originalIndex: i }))
                .filter((t: any) => {
                  if (showPastTimeOff) return true;
                  const end = t.endDate || t.date;
                  return end >= todayStr;
                });

              return (
                <>
                  {visibleTimeOff.map((t: any) => {
                    const i = t.originalIndex;
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-white p-3 px-4 rounded-xl border border-slate-200 text-sm shadow-sm hover:shadow-md transition-shadow"
                      >
                        {editingTimeOffIndex === i ? (
                          <div className="flex items-center gap-3 w-full">
                            <DateRangePicker
                              preset="custom"
                              startDate={editTimeOffStart}
                              endDate={editTimeOffEnd}
                              onChange={(_, start, end) => {
                                setEditTimeOffStart(start);
                                setEditTimeOffEnd(end);
                              }}
                              className="w-[220px]"
                              hidePresets={true}
                              placeholder="Select Date"
                              variant="outline"
                            />
                            <Select
                              value={editTimeOffManager}
                              onChange={(val) => setEditTimeOffManager(val)}
                              options={users
                                .filter((u) => u.isAccountManager && !u.isDeactivated)
                                .map((u) => ({
                                  value: u.uid,
                                  label: getUserName(u.uid),
                                }))}
                              trigger={
                                <Button
                                  variant="outline"
                                  className="flex-1 max-w-[200px] font-normal justify-between"
                                >
                                  {editTimeOffManager ? (
                                    getUserName(editTimeOffManager)
                                  ) : (
                                    <span className="text-muted-foreground">Select Manager...</span>
                                  )}
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                </Button>
                              }
                            />
                            <div className="flex items-center gap-2 ml-auto">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (editTimeOffStart && editTimeOffEnd && editTimeOffManager) {
                                    const newEntry = {
                                      startDate: format(new Date(editTimeOffStart), 'yyyy-MM-dd'),
                                      endDate: format(new Date(editTimeOffEnd), 'yyyy-MM-dd'),
                                      manager: editTimeOffManager,
                                    };
                                    const existingTimeOff = [...(settings?.timeOff || [])];
                                    existingTimeOff[i] = newEntry;
                                    existingTimeOff.sort(
                                      (a: any, b: any) =>
                                        new Date(a.startDate || a.date).getTime() -
                                        new Date(b.startDate || b.date).getTime()
                                    );
                                    saveSettings({
                                      ...(settings as any),
                                      timeOff: existingTimeOff,
                                    });
                                    setEditingTimeOffIndex(null);
                                    setEditTimeOffStart(null);
                                    setEditTimeOffEnd(null);
                                    setEditTimeOffManager('');
                                  }
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingTimeOffIndex(null);
                                  setEditTimeOffStart(null);
                                  setEditTimeOffEnd(null);
                                  setEditTimeOffManager('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">
                                  {(t.startDate || t.date) === (t.endDate || t.date)
                                    ? format(
                                        new Date(`${t.startDate || t.date}T00:00:00`),
                                        'MMM d, yyyy'
                                      )
                                    : `${format(new Date(`${t.startDate || t.date}T00:00:00`), 'MMM d, yyyy')} - ${format(new Date(`${t.endDate || t.date}T00:00:00`), 'MMM d, yyyy')}`}
                                </span>
                              </div>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="font-medium text-slate-700">
                                  {getUserName(t.manager)}
                                </span>
                              </div>
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1">
                                <Tooltip content="Edit time off">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const sDate = new Date(
                                        `${t.startDate || t.date}T00:00:00`
                                      ).getTime();
                                      const eDate = new Date(
                                        `${t.endDate || t.date}T00:00:00`
                                      ).getTime();
                                      setEditTimeOffStart(sDate);
                                      setEditTimeOffEnd(eDate);
                                      setEditTimeOffManager(t.manager);
                                      setEditingTimeOffIndex(i);
                                    }}
                                    className="w-8 h-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                <Tooltip content="Remove time off">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newTimeOff = (settings?.timeOff || []).filter(
                                        (_, index) => index !== i
                                      );
                                      saveSettings({ ...(settings as any), timeOff: newTimeOff });
                                    }}
                                    className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {visibleTimeOff.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-3">
                        <User className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700">No time off recorded</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1">
                        There are no upcoming absences.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Statutory Holidays
            </h3>
            <div className="flex items-center gap-4">
              <label className="relative flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showPastHolidays}
                  onChange={(e) => setShowPastHolidays(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${showPastHolidays ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}
                >
                  {showPastHolidays && (
                    <Check className="w-2.5 h-2.5 text-white animate-in zoom-in" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700">Show past</span>
              </label>
              {canEdit && !isAddingHoliday && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingHoliday(true)}
                  className="text-primary hover:text-primary hover:bg-primary/5 font-medium flex items-center gap-1.5 px-3"
                >
                  <Plus className="w-4 h-4" /> Add Holiday
                </Button>
              )}
            </div>
          </div>

          {isAddingHoliday && (
            <div className="mb-6 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-slate-700">New Holiday</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddingHoliday(false)}
                  className="w-8 h-8 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <DatePicker
                  value={newHolidayDate}
                  onChange={(val) => setNewHolidayDate(val)}
                  placeholder="Select Holiday Date"
                  className="flex-1 md:max-w-[200px]"
                />
                <Input
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="e.g. Christmas Day"
                  className="flex-1 h-10"
                />
                <Button
                  onClick={() => {
                    if (newHolidayDate && newHolidayName) {
                      const dateStr = new Date(
                        newHolidayDate - new Date().getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .split('T')[0];
                      const newHolidays = [...(settings?.statHolidays || [])];
                      newHolidays.push({ date: dateStr, name: newHolidayName, location: 'Global' });
                      newHolidays.sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                      );
                      saveSettings({ ...(settings as any), statHolidays: newHolidays });
                      setNewHolidayDate(null);
                      setNewHolidayName('');
                      setIsAddingHoliday(false);
                    }
                  }}
                  disabled={!newHolidayDate || !newHolidayName}
                  className="px-6 whitespace-nowrap"
                >
                  Add Holiday
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(() => {
              const todayStr = new Date(
                new Date().getTime() - new Date().getTimezoneOffset() * 60000
              )
                .toISOString()
                .split('T')[0];
              const visibleHolidays = (settings?.statHolidays || [])
                .map((h: any, i: number) => ({ ...h, originalIndex: i }))
                .filter((h: any) => showPastHolidays || h.date >= todayStr);

              return (
                <>
                  {visibleHolidays.map((h: any) => {
                    const i = h.originalIndex;
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-white p-3 px-4 rounded-xl border border-slate-200 text-sm shadow-sm hover:shadow-md transition-shadow"
                      >
                        {editingHolidayIndex === i ? (
                          <div className="flex items-center gap-3 w-full">
                            <DatePicker
                              value={editHolidayDate}
                              onChange={(val) => setEditHolidayDate(val)}
                              placeholder="Select Date"
                              className="w-[180px]"
                            />
                            <Input
                              value={editHolidayName}
                              onChange={(e) => setEditHolidayName(e.target.value)}
                              placeholder="Holiday Name"
                              className="flex-1 h-10"
                            />
                            <div className="flex items-center gap-2 ml-auto">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (editHolidayDate && editHolidayName) {
                                    const dateStr = new Date(
                                      editHolidayDate - new Date().getTimezoneOffset() * 60000
                                    )
                                      .toISOString()
                                      .split('T')[0];
                                    const newHolidays = [...(settings?.statHolidays || [])];
                                    newHolidays[i] = {
                                      date: dateStr,
                                      name: editHolidayName,
                                      location: 'Global',
                                    };
                                    newHolidays.sort(
                                      (a, b) =>
                                        new Date(a.date).getTime() - new Date(b.date).getTime()
                                    );
                                    saveSettings({
                                      ...(settings as any),
                                      statHolidays: newHolidays,
                                    });
                                    setEditingHolidayIndex(null);
                                    setEditHolidayDate(null);
                                    setEditHolidayName('');
                                  }
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setEditingHolidayIndex(null);
                                  setEditHolidayDate(null);
                                  setEditHolidayName('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800">
                                {format(new Date(`${h.date}T00:00:00`), 'MMM d, yyyy')}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              <span className="font-medium text-slate-700">{h.name}</span>
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1">
                                <Tooltip content="Edit holiday">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const dTime = new Date(`${h.date}T00:00:00`).getTime();
                                      setEditHolidayDate(dTime);
                                      setEditHolidayName(h.name);
                                      setEditingHolidayIndex(i);
                                    }}
                                    className="w-8 h-8 text-slate-400 hover:text-primary hover:bg-primary/5"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                                <Tooltip content="Remove holiday">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newHolidays = (settings?.statHolidays || []).filter(
                                        (_, index) => index !== i
                                      );
                                      saveSettings({
                                        ...(settings as any),
                                        statHolidays: newHolidays,
                                      });
                                      if (editingHolidayIndex === i) {
                                        setEditingHolidayIndex(null);
                                        setNewHolidayDate(null);
                                        setNewHolidayName('');
                                      }
                                    }}
                                    className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {visibleHolidays.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700">No statutory holidays</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1">
                        There are no upcoming global holidays.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
