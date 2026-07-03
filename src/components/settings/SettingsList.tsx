import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { CustomPicker, COLOR_MAP, hexToRgba, renderIcon } from './SettingsHelpers';
import {
  saveSettings,
  bulkUpdateProjects,
  bulkUpdateClients,
  bulkUpdateServices,
  addGlobalLog,
} from '../../api/dbService';
import { toast } from '../../utils/toast';

const fieldDisplayNames: Record<string, string> = {
  managers: 'Account manager',
  phases: 'Implementation Status',
  statuses: 'Status',
  timelines: 'Schedule Status',
  clientTypes: 'Client Type',
  features: 'Feature',
  services: 'Service',
  serviceTypes: 'Service Type',
  serviceOutcomes: 'Service Outcome',
  serviceStatuses: 'Fulfillment Status',
};

export function SettingsList({
  title,
  desc,
  fieldName,
  canEdit = true,
}: {
  title: string;
  desc: string;
  fieldName: string;
  canEdit?: boolean;
}) {
  const settings = useAppStore((state) => state.settings);
  const projects = useAppStore((state) => state.projects);
  const clients = useAppStore((state) => state.clients);
  const services = useAppStore((state) => state.services);
  const user = useAppStore((state) => state.user);

  const [editingItem, setEditingItem] = useState<{ idx: number; globalIdx?: number } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ idx: number; globalIdx?: number } | null>(
    null
  );
  const [editForm, setEditForm] = useState<any>({});
  const [newForm, setNewForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [localOrder, setLocalOrder] = useState<any[] | null>(null);

  const saveTimeout = useRef<any>(null);

  const debouncedSaveSettings = (newSettings: any, customMsg?: string) => {
    const sanitizedSettings = JSON.parse(JSON.stringify(newSettings));
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const savePromise = saveSettings(sanitizedSettings, { silent: true });
      toast.promise(savePromise, {
        loading: 'Saving changes...',
        success: customMsg || 'Settings updated successfully!',
        error: 'Failed to save settings',
      });
      try {
        await savePromise;
      } catch (e) {
        console.error('Save settings failed', e);
      }
    }, 800);
  };

  const cascadeSettingRename = async (field: string, oldName: string, newName: string) => {
    if (oldName === newName) return;

    const projIds: string[] = [];
    const projUpdates: any = {};
    const clientIds: string[] = [];
    const clientUpdates: any = {};
    const svcIds: string[] = [];
    const svcUpdates: any = {};

    if (field === 'managers') {
      projUpdates.assignee = newName;
      clientUpdates.accountManager = newName;
      svcUpdates.manager = newName;
      projects.forEach((p) => {
        if (p.assignee === oldName) projIds.push(p.id);
      });
      clients.forEach((c) => {
        if (c.accountManager === oldName) clientIds.push(c.clientId);
      });
      services.forEach((s) => {
        if (s.manager === oldName) svcIds.push(s.id);
      });
    } else if (field === 'statuses') {
      projUpdates.projectStatus = newName;
      projects.forEach((p) => {
        if (p.projectStatus === oldName) projIds.push(p.id);
      });
    } else if (field === 'timelines') {
      projUpdates.timelineStatus = newName;
      projects.forEach((p) => {
        if (p.timelineStatus === oldName) projIds.push(p.id);
      });
    } else if (field === 'phases') {
      projUpdates.onboardingPhase = newName;
      projects.forEach((p) => {
        if (p.onboardingPhase === oldName) projIds.push(p.id);
      });
    } else if (field === 'clientTypes') {
      clientUpdates.clientType = newName;
      clients.forEach((c) => {
        if (c.clientType === oldName) clientIds.push(c.clientId);
      });
    } else if (['services', 'serviceTypes', 'serviceOutcomes', 'serviceStatuses'].includes(field)) {
      if (field === 'services') svcUpdates.name = newName;
      if (field === 'serviceTypes') svcUpdates.type = newName;
      if (field === 'serviceOutcomes') svcUpdates.outcome = newName;
      if (field === 'serviceStatuses') svcUpdates.status = newName;

      services.forEach((s) => {
        if (field === 'services' && s.name === oldName) svcIds.push(s.id);
        if (field === 'serviceTypes' && s.type === oldName) svcIds.push(s.id);
        if (field === 'serviceOutcomes' && s.outcome === oldName) svcIds.push(s.id);
        if (field === 'serviceStatuses' && s.status === oldName) svcIds.push(s.id);
      });
    } else if (field === 'features') {
      const updates = projects
        .filter((p) => p.features?.includes(oldName))
        .map((p) => {
          const newFeats = p.features?.map((f: string) => (f === oldName ? newName : f)) || [];
          return bulkUpdateProjects([p.id], { features: newFeats }, { silent: true });
        });
      if (updates.length > 0) await Promise.all(updates);
      return updates.length;
    }

    const totalRecords = projIds.length + clientIds.length + svcIds.length;
    try {
      if (totalRecords > 0) {
        if (projIds.length > 0) await bulkUpdateProjects(projIds, projUpdates, { silent: true });
        if (clientIds.length > 0)
          await bulkUpdateClients(clientIds, clientUpdates, { silent: true });
        if (svcIds.length > 0) await bulkUpdateServices(svcIds, svcUpdates, { silent: true });
      }
    } catch (e) {
      console.error('Cascade failed', e);
      toast.error('Cascade Failed', 'Failed to cascade updates to active records.');
    }
    return totalRecords;
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !settings) return;
    const { idx, globalIdx } = editingItem;
    const newName = editForm.name;
    if (!newName?.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    let newSettings = { ...settings };
    let oldName = '';

    if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
      const currentData = [...(settings.settingsData || [])];
      oldName = currentData[globalIdx!].name;
      currentData[globalIdx!] = {
        ...currentData[globalIdx!],
        name: newName.trim(),
        color: editForm.color,
        icon: editForm.icon,
      };
      newSettings.settingsData = currentData;
    } else {
      const currentList = [...(settings[fieldName as keyof typeof settings] as any[])];
      const oldItem = currentList[idx];
      oldName = typeof oldItem === 'string' ? oldItem : oldItem.name;

      let newItemData: any;
      if (typeof oldItem === 'string') {
        newItemData = newName.trim();
      } else if (fieldName === 'services') {
        newItemData = { name: newName.trim(), price: Number(editForm.price) || 0 };
      } else {
        newItemData = { name: newName.trim(), color: editForm.color, icon: editForm.icon };
      }
      currentList[idx] = newItemData;
      newSettings = { ...newSettings, [fieldName]: currentList };
    }

    try {
      const cascadedCount = await cascadeSettingRename(fieldName, oldName, newName.trim());
      const displayField = fieldDisplayNames[fieldName] || fieldName;

      let customMsg = '';
      let logMsg = '';
      if (oldName !== newName.trim()) {
        logMsg = `${displayField} changed from ${oldName} to ${newName.trim()}`;
        customMsg = logMsg;
        if (cascadedCount && cascadedCount > 0)
          customMsg += ` (Cascaded to ${cascadedCount} records)`;
      } else {
        logMsg = `Updated styling properties for '${newName.trim()}'`;
        customMsg = logMsg;
      }

      debouncedSaveSettings(newSettings, customMsg);
      setEditingItem(null);

      const author = user?.name || user?.email || 'Admin';
      addGlobalLog(logMsg, 'Setting', fieldName, newName.trim(), author);
    } catch (e) {}
  };

  const handleConfirmDelete = () => {
    if (!deletingItem || !settings) return;
    const { idx, globalIdx } = deletingItem;
    let newSettings = { ...settings };
    if (!newSettings.archivedData) newSettings.archivedData = {};

    let deletedItem: any;

    if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
      const currentData = [...(settings.settingsData || [])];
      [deletedItem] = currentData.splice(globalIdx!, 1);
      newSettings.settingsData = currentData;

      if (!newSettings.archivedData.settingsData) newSettings.archivedData.settingsData = [];
      newSettings.archivedData.settingsData.push({
        ...deletedItem,
        archivedAt: new Date().toISOString(),
      });
    } else {
      const currentList = [...(settings[fieldName as keyof typeof settings] as any[])];
      [deletedItem] = currentList.splice(idx, 1);
      newSettings = { ...newSettings, [fieldName]: currentList };

      if (!newSettings.archivedData[fieldName]) newSettings.archivedData[fieldName] = [];
      newSettings.archivedData[fieldName].push(
        typeof deletedItem === 'string'
          ? { name: deletedItem, archivedAt: new Date().toISOString() }
          : { ...deletedItem, archivedAt: new Date().toISOString() }
      );
    }

    const deletedName =
      typeof deletedItem === 'string' ? deletedItem : deletedItem?.name || 'Unknown';
    const displayField = fieldDisplayNames[fieldName] || fieldName;
    const msg = `${displayField} '${deletedName}' archived`;

    debouncedSaveSettings(newSettings, msg);
    setDeletingItem(null);

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', fieldName, deletedName, author);
  };

  const handleAdd = () => {
    if (!settings) return;
    const name = newForm.name?.trim();
    if (!name) return;

    let newSettings = { ...settings };

    if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
      const currentData = [...(settings.settingsData || [])];
      const cat = fieldName === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
      currentData.push({
        category: cat,
        name: name,
        color: newForm.color || 'slate',
        icon: newForm.icon || 'CircleDashed',
      });
      newSettings.settingsData = currentData;
    } else {
      const currentList = [...((settings[fieldName as keyof typeof settings] as any[]) || [])];
      let newItemData: any;
      if (fieldName === 'features') {
        newItemData = name;
      } else if (fieldName === 'services') {
        newItemData = { name: name, price: Number(newForm.price) || 0 };
      } else {
        newItemData = {
          name: name,
          color: newForm.color || 'slate',
          icon: newForm.icon || (fieldName === 'managers' ? 'User' : 'CircleDashed'),
        };
      }
      currentList.push(newItemData);
      newSettings = { ...newSettings, [fieldName]: currentList };
    }

    const displayField = fieldDisplayNames[fieldName] || fieldName;
    const msg = `New ${displayField}: ${name} added`;

    debouncedSaveSettings(newSettings, msg);
    setNewForm({});
    setIsAdding(false);

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', fieldName, name, author);
  };

  const moveItem = (idx: number, dir: number, items: any[]) => {
    if (!settings) return;
    if (idx + dir < 0 || idx + dir >= items.length) return;
    let newSettings = { ...settings };

    if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
      const cat = fieldName === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
      const globalData = [...(settings.settingsData || [])];

      const item1 = items[idx];
      const item2 = items[idx + dir];
      const gIdx1 = globalData.findIndex((s) => s.category === cat && s.name === item1.name);
      const gIdx2 = globalData.findIndex((s) => s.category === cat && s.name === item2.name);

      if (gIdx1 !== -1 && gIdx2 !== -1) {
        const temp = globalData[gIdx1];
        globalData[gIdx1] = globalData[gIdx2];
        globalData[gIdx2] = temp;
      }
      newSettings.settingsData = globalData;
    } else {
      const currentList = [...(settings[fieldName as keyof typeof settings] as any[])];
      const temp = currentList[idx];
      currentList[idx] = currentList[idx + dir];
      currentList[idx + dir] = temp;
      newSettings = { ...newSettings, [fieldName]: currentList };
    }

    const msg = `Reordered ${fieldDisplayNames[fieldName] || fieldName}`;
    debouncedSaveSettings(newSettings, msg);

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', fieldName, 'Reorder', author);
  };

  const handleDragEnd = () => {
    if (!settings || !localOrder) return;

    let newSettings = { ...settings };

    if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
      const cat = fieldName === 'serviceOutcomes' ? 'ServiceOutcome' : 'ServiceStatus';
      const globalData = [...(settings.settingsData || [])];
      const otherItems = globalData.filter((s) => s.category !== cat);
      newSettings.settingsData = [...otherItems, ...localOrder];
    } else {
      newSettings = { ...newSettings, [fieldName]: localOrder };
    }

    const msg = `Reordered ${fieldDisplayNames[fieldName] || fieldName}`;
    debouncedSaveSettings(newSettings, msg);

    const author = user?.name || user?.email || 'Admin';
    addGlobalLog(msg, 'Setting', fieldName, 'Reorder', author);
    setLocalOrder(null);
  };

  if (!settings) return null;

  let globalItems: any[] = [];
  if (fieldName === 'serviceOutcomes')
    globalItems = (settings.settingsData || []).filter((s: any) => s.category === 'ServiceOutcome');
  else if (fieldName === 'serviceStatuses')
    globalItems = (settings.settingsData || []).filter((s: any) => s.category === 'ServiceStatus');
  else globalItems = (settings[fieldName as keyof typeof settings] as any[]) || [];

  const items = localOrder || globalItems;
  const isStringList = fieldName === 'features';
  const isServices = fieldName === 'services';

  return (
    <div className="mb-10 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
        </div>
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add{' '}
            {title.endsWith('Status') ? title : title.replace(/s$/, '')}
          </button>
        )}
      </div>
      <div className="bg-white border border-border rounded-xl shadow-sm">
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={canEdit ? setLocalOrder : () => {}}
          className="divide-y divide-border relative list-none m-0 p-0"
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              let globalIdx: number | undefined;
              if (fieldName === 'serviceOutcomes' || fieldName === 'serviceStatuses') {
                globalIdx = settings.settingsData?.findIndex(
                  (s: any) => s.category === item.category && s.name === item.name
                );
              }

              const isEditing = editingItem?.idx === i;
              const isDeleting = deletingItem?.idx === i;
              const name = typeof item === 'string' ? item : item.name;

              const hex = item.color?.startsWith('#')
                ? item.color
                : COLOR_MAP[item.color] || COLOR_MAP.slate;

              if (isEditing) {
                return (
                  <Reorder.Item
                    value={item}
                    key={name}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 relative z-10 ${i === 0 ? 'rounded-t-xl' : ''} ${i === items.length - 1 && !isAdding ? 'rounded-b-xl' : ''}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <input
                        autoFocus
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1 min-w-0 rounded-md border border-input bg-white px-3 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      {isServices && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground font-medium text-sm">$</span>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                            className="w-24 rounded-md border border-input bg-white px-2 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      )}
                      {!isStringList && !isServices && (
                        <div className="flex items-center gap-2 shrink-0">
                          <CustomPicker
                            type="color"
                            value={editForm.color}
                            onChange={(color) => setEditForm({ ...editForm, color })}
                          />
                          {fieldName !== 'managers' && (
                            <CustomPicker
                              type="icon"
                              value={editForm.icon}
                              onChange={(icon) => setEditForm({ ...editForm, icon })}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.name || editForm.name.trim() === ''}
                        className="bg-primary text-primary-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                    </div>
                  </Reorder.Item>
                );
              }

              if (isDeleting) {
                return (
                  <Reorder.Item
                    value={item}
                    key={name}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-red-50/50 border-l-4 border-l-destructive relative z-10 ${i === 0 ? 'rounded-t-xl' : ''} ${i === items.length - 1 && !isAdding ? 'rounded-b-xl' : ''}`}
                  >
                    <div className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Archive "{name}"? This removes it from
                      active dropdowns, but preserves historical records.
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDeletingItem(null)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        className="bg-destructive text-destructive-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-destructive/90 transition-all active:scale-95"
                      >
                        Archive
                      </button>
                    </div>
                  </Reorder.Item>
                );
              }

              return (
                <Reorder.Item
                  value={item}
                  key={name}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group ${i === 0 ? 'rounded-t-xl' : ''} ${i === items.length - 1 && !isAdding ? 'rounded-b-xl' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {!isStringList && !isServices ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-1 text-xs shadow-sm tracking-wide font-semibold rounded-full border flex items-center gap-1.5"
                          style={{
                            backgroundColor: hexToRgba(hex, 0.1),
                            color: hex,
                            borderColor: hexToRgba(hex, 0.2),
                          }}
                        >
                          {(fieldName === 'managers' || item.icon) &&
                            renderIcon(fieldName === 'managers' ? 'User' : item.icon, 'w-3 h-3')}
                          {name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                        {isServices && (
                          <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shadow-sm">
                            $
                            {parseFloat(item.price || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <>
                        <Tooltip content="Drag to reorder">
                          <div className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </Tooltip>
                        <Tooltip content="Move Up">
                          <button
                            onClick={() => moveItem(i, -1, items)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Move Down">
                          <button
                            onClick={() => moveItem(i, 1, items)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Edit">
                          <button
                            onClick={() => {
                              setEditingItem({ idx: i, globalIdx });
                              setEditForm(
                                isStringList
                                  ? { name }
                                  : isServices
                                    ? { name, price: item.price }
                                    : { name, color: item.color, icon: item.icon }
                              );
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Archive">
                          <button
                            onClick={() => setDeletingItem({ idx: i, globalIdx })}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
          {items.length === 0 && !isAdding && (
            <li className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">
                No {title.toLowerCase()} configured
              </h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Get started by adding your first {title.replace(/s$/, '').toLowerCase()} to the
                list.
              </p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 text-sm font-medium bg-white border border-border text-slate-700 hover:text-primary hover:border-primary/30 hover:bg-primary/5 px-4 h-9 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add {title.replace(/s$/, '')}
              </button>
            </li>
          )}

          <AnimatePresence>
            {isAdding && (
              <motion.li
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 bg-slate-50/80 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10 ${items.length === 0 ? 'rounded-xl' : 'rounded-b-xl'}`}
              >
                <input
                  autoFocus
                  type="text"
                  className="flex-1 min-w-0 rounded-md border border-input bg-white px-3 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder={`New ${title.replace(/s$/, '')} name...`}
                  value={newForm.name || ''}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newForm.name) {
                      handleAdd();
                    }
                  }}
                />
                {isServices && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground font-medium text-sm">$</span>
                    <input
                      type="number"
                      className="w-24 rounded-md border border-input bg-white px-2 h-9 text-sm shadow-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="Price"
                      value={newForm.price || ''}
                      onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newForm.name) {
                          handleAdd();
                        }
                      }}
                    />
                  </div>
                )}
                {!isStringList && !isServices && (
                  <div className="flex items-center gap-2 shrink-0">
                    <CustomPicker
                      type="color"
                      value={newForm.color || 'slate'}
                      onChange={(color) => setNewForm({ ...newForm, color })}
                    />
                    {fieldName !== 'managers' && (
                      <CustomPicker
                        type="icon"
                        value={newForm.icon || 'CircleDashed'}
                        onChange={(icon) => setNewForm({ ...newForm, icon })}
                      />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newForm.name) handleAdd();
                    }}
                    disabled={!newForm.name || newForm.name.trim() === ''}
                    className="bg-primary text-primary-foreground rounded-md text-xs font-medium h-8 px-3 shadow-sm hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </motion.li>
            )}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}
