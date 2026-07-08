import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Save,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Check,
  Eye,
  Copy,
  XCircle,
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { useAppStore } from '../../store/useAppStore';
import { saveSettings } from '../../api/dbService';
import { PERMISSION_NODES } from '../../hooks/usePermissions';
import { CustomRole } from '../../types';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  view_org_settings: 'View organization settings',
  edit_org_settings: 'Modify organization settings',
  view_schedule: 'View scheduling details',
  edit_schedule: 'Modify schedules',
  view_project_workflows: 'View project workflow configurations',
  edit_project_workflows: 'Modify project workflow configurations',
  view_service_catalog: 'View the service catalog',
  edit_service_catalog: 'Modify the service catalog',
  view_health_scoring: 'View health scoring metrics',
  edit_health_scoring: 'Configure health scoring metrics',
  view_form_templates: 'View form templates',
  edit_form_templates: 'Create and edit form templates',
  view_upload_log: 'View data upload history',
  upload_csv: 'Upload CSV Data',
  resolve_imports: 'Resolve data import conflicts',
  run_exports: 'Export system data',
  view_audit_logs: 'View system audit logs',
  view_archives: 'View archived records',
  restore_archives: 'Restore archived records',
  hard_delete_archives: 'Permanently delete archived records',
  view_user_access: 'View user access levels',
  manage_user_access: 'Manage user accounts and access',
  view_roles: 'View role definitions',
  manage_roles: 'Create, edit, and delete roles',
  client_create: 'Create new clients',
  client_edit_profile: 'Edit client profiles',
  client_add_notes: 'Add notes to clients',
  client_archive: 'Archive clients',
  client_export: 'Export client data',
  project_create: 'Create new projects',
  project_edit_details: 'Edit project details',
  project_add_notes: 'Add notes to projects',
  project_archive: 'Archive projects',
  project_export: 'Export project data',
  service_create: 'Create new services',
  service_edit_details: 'Edit service details',
  service_edit_financials: 'Edit service financial information',
  service_add_notes: 'Add notes to services',
  service_archive: 'Archive services',
  service_export: 'Export service data',
  view_academy: 'View the Academy and take Knowledge Checks',
  manage_academy: 'Manage Academy settings, KB ingestion, and review Quizzes',
};

const NODE_GROUPS = [
  {
    title: 'Workspace Settings',
    nodes: [
      'view_org_settings',
      'edit_org_settings',
      'view_schedule',
      'edit_schedule',
      'view_project_workflows',
      'edit_project_workflows',
      'view_service_catalog',
      'edit_service_catalog',
      'view_health_scoring',
      'edit_health_scoring',
      'view_form_templates',
      'edit_form_templates',
    ],
  },
  {
    title: 'Operations & Data',
    nodes: [
      'view_upload_log',
      'upload_csv',
      'resolve_imports',
      'run_exports',
      'view_audit_logs',
      'view_archives',
      'restore_archives',
      'hard_delete_archives',
    ],
  },
  {
    title: 'System Administration',
    nodes: ['view_user_access', 'manage_user_access', 'view_roles', 'manage_roles'],
  },
  {
    title: 'Client Management',
    nodes: [
      'client_create',
      'client_edit_profile',
      'client_add_notes',
      'client_archive',
      'client_export',
    ],
  },
  {
    title: 'Project Management',
    nodes: [
      'project_create',
      'project_edit_details',
      'project_add_notes',
      'project_archive',
      'project_export',
    ],
  },
  {
    title: 'Service Management',
    nodes: [
      'service_create',
      'service_edit_details',
      'service_edit_financials',
      'service_add_notes',
      'service_archive',
      'service_export',
    ],
  },
  {
    title: 'Academy',
    nodes: ['view_academy', 'manage_academy'],
  },
];

const ALL_NODES = NODE_GROUPS.flatMap((g) => g.nodes);

export function RoleManagerTab() {
  const { settings, setSimulatedRoleId } = useAppStore();
  const [roles, setRoles] = useState<CustomRole[]>(settings?.roles || []);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<CustomRole | null>(null);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});

  const [editData, setEditData] = useState<CustomRole | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const counts: Record<string, number> = {};
        snapshot.forEach((doc) => {
          const roleId = doc.data().roleId;
          if (roleId) {
            counts[roleId] = (counts[roleId] || 0) + 1;
          }
        });
        setRoleCounts(counts);
      } catch (err) {
        console.error('Failed to fetch role counts', err);
      }
    };
    fetchCounts();
  }, [roles]);

  const handleSave = async () => {
    if (!settings || !editData) return;

    let updatedRoles = [...roles];
    if (editData.isDefault) {
      updatedRoles = updatedRoles.map((r) => ({ ...r, isDefault: false }));
    }

    if (updatedRoles.find((r) => r.id === editData.id)) {
      updatedRoles = updatedRoles.map((r) => (r.id === editData.id ? editData : r));
    } else {
      updatedRoles.push(editData);
    }

    // Compute rolePermissions map for Firestore Security Rules
    const rolePermissions = updatedRoles.reduce(
      (acc, role) => {
        acc[role.id] = role.permissions.reduce(
          (pAcc, perm) => {
            pAcc[perm] = true;
            return pAcc;
          },
          {} as Record<string, boolean>
        );
        return acc;
      },
      {} as Record<string, Record<string, boolean>>
    );

    try {
      await saveSettings({ ...settings, roles: updatedRoles, rolePermissions });
      setRoles(updatedRoles);
      setSelectedRole(editData);
      setIsEditing(false);
    } catch (err) {
      // toast already handled in dbService
    }
  };

  const handleDelete = async () => {
    if (!settings || !roleToDelete) return;
    const roleId = roleToDelete.id;
    const updatedRoles = roles.filter((r) => r.id !== roleId);

    // Compute rolePermissions map for Firestore Security Rules
    const rolePermissions = updatedRoles.reduce(
      (acc, role) => {
        acc[role.id] = role.permissions.reduce(
          (pAcc, perm) => {
            pAcc[perm] = true;
            return pAcc;
          },
          {} as Record<string, boolean>
        );
        return acc;
      },
      {} as Record<string, Record<string, boolean>>
    );

    try {
      await saveSettings({ ...settings, roles: updatedRoles, rolePermissions });
      setRoles(updatedRoles);
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
        setIsEditing(false);
      }
      setRoleToDelete(null);
    } catch (err) {}
  };

  const createNewRole = () => {
    const newRole: CustomRole = {
      id: `role_${Date.now()}`,
      name: 'New Custom Role',
      permissions: [],
    };
    setEditData(newRole);
    setIsEditing(true);
    setSelectedRole(null);
  };

  const startEdit = (role: CustomRole) => {
    setEditData({ ...role });
    setIsEditing(true);
  };

  const handleDuplicate = (role: CustomRole) => {
    setEditData({
      ...role,
      id: `role_${Date.now()}`,
      name: `Copy of ${role.name}`,
    });
    setIsEditing(true);
    setSelectedRole(null);
  };

  const togglePermission = (node: string) => {
    if (!editData) return;
    const newPerms = editData.permissions.includes(node)
      ? editData.permissions.filter((p) => p !== node)
      : [...editData.permissions, node];
    setEditData({ ...editData, permissions: newPerms });
  };

  const toggleAllGlobal = () => {
    if (!editData) return;
    if (editData.permissions.length === ALL_NODES.length) {
      setEditData({ ...editData, permissions: [] });
    } else {
      setEditData({ ...editData, permissions: [...ALL_NODES] });
    }
  };

  const toggleGroup = (nodes: string[]) => {
    if (!editData) return;
    const allSelected = nodes.every((n) => editData.permissions.includes(n));
    let newPerms = [...editData.permissions];
    if (allSelected) {
      newPerms = newPerms.filter((p) => !nodes.includes(p));
    } else {
      nodes.forEach((n) => {
        if (!newPerms.includes(n)) newPerms.push(n);
      });
    }
    setEditData({ ...editData, permissions: newPerms });
  };

  return (
    <div className="flex h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* LEFT PANE - Role List */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col relative z-10">
        <div className="h-[80px] px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 text-xl">Roles</h3>
          <UITooltip content="Create New Role">
            <button
              onClick={createNewRole}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </UITooltip>
        </div>
        <div className="flex-1 overflow-y-auto custom-thin-scroll">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => {
                setSelectedRole(role);
                setIsEditing(false);
              }}
              className={`p-4 cursor-pointer transition-all border-b border-slate-100 last:border-0 rounded-none ${
                (selectedRole?.id === role.id && !isEditing) ||
                (editData?.id === role.id && isEditing)
                  ? 'bg-primary/5 border-l-[3px] border-l-primary'
                  : 'bg-transparent hover:bg-slate-50 border-l-[3px] border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800">{role.name}</h4>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                    {roleCounts[role.id] || 0} User{roleCounts[role.id] !== 1 ? 's' : ''}
                  </span>
                </div>
                {role.isDefault && (
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <div className="text-center py-10 px-4">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No custom roles defined.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE - Role Details / Editor */}
      <div className="flex-1 bg-white flex flex-col relative">
        {!selectedRole && !isEditing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Shield className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">Select a role to view or edit</p>
            <p className="text-sm mt-1">
              Or create a new custom role to assign specific permissions
            </p>
          </div>
        ) : (
          <>
            <div className="min-h-[80px] px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between shrink-0">
              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData?.name || ''}
                      onChange={(e) =>
                        setEditData((prev) => (prev ? { ...prev, name: e.target.value } : null))
                      }
                      className="text-xl font-bold text-slate-900 border-b border-dashed border-slate-300 focus:border-primary outline-none bg-transparent w-full pb-1"
                      placeholder="Role Name"
                    />
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="relative group/cb flex items-center justify-center">
                          <input
                            type="checkbox"
                            id="defaultRole"
                            checked={editData?.isDefault || false}
                            onChange={(e) =>
                              setEditData((prev) =>
                                prev ? { ...prev, isDefault: e.target.checked } : null
                              )
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div
                            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${editData?.isDefault ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-white border-slate-300 group-hover/cb:border-primary/50'}`}
                          >
                            <Check
                              className={`w-3 h-3 text-white transition-transform duration-200 ${editData?.isDefault ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                              strokeWidth={3}
                            />
                          </div>
                        </div>
                        <label htmlFor="defaultRole" className="text-sm font-medium text-slate-600">
                          Set as Default Role for New Users
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative group/cb flex items-center justify-center">
                          <input
                            type="checkbox"
                            id="selectAllGlobal"
                            checked={editData?.permissions.length === ALL_NODES.length}
                            onChange={toggleAllGlobal}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div
                            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${editData?.permissions.length === ALL_NODES.length ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-white border-slate-300 group-hover/cb:border-primary/50'}`}
                          >
                            <Check
                              className={`w-3 h-3 text-white transition-transform duration-200 ${editData?.permissions.length === ALL_NODES.length ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                              strokeWidth={3}
                            />
                          </div>
                        </div>
                        <label
                          htmlFor="selectAllGlobal"
                          className="text-sm font-medium text-slate-600"
                        >
                          Select All Permissions
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedRole?.name}</h2>
                      {selectedRole?.isDefault && (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <UITooltip content="Preview Role">
                      <button
                        onClick={() => selectedRole && setSimulatedRoleId?.(selectedRole.id)}
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </UITooltip>
                    <UITooltip content="Edit Role">
                      <button
                        onClick={() => selectedRole && startEdit(selectedRole)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </UITooltip>
                    <UITooltip content="Duplicate Role">
                      <button
                        onClick={() => selectedRole && handleDuplicate(selectedRole)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </UITooltip>
                    <UITooltip content="Delete Role">
                      <button
                        onClick={() => selectedRole && setRoleToDelete(selectedRole)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </UITooltip>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-thin-scroll p-8 bg-white">
              <div className="max-w-4xl mx-auto space-y-10">
                {NODE_GROUPS.map((group) => (
                  <div key={group.title} className="bg-transparent">
                    <div className="pb-3 mb-4 flex items-center justify-between border-b border-slate-200">
                      <h4 className="font-semibold text-slate-800 text-sm tracking-wide">
                        {group.title}
                      </h4>
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <div className="relative group/cb flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={group.nodes.every((n) => editData?.permissions.includes(n))}
                              onChange={() => toggleGroup(group.nodes)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${group.nodes.every((n) => editData?.permissions.includes(n)) ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-white border-slate-300 group-hover/cb:border-primary/50'}`}
                            >
                              <Check
                                className={`w-3 h-3 text-white transition-transform duration-200 ${group.nodes.every((n) => editData?.permissions.includes(n)) ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                                strokeWidth={3}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-600">Select All</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.nodes.map((node) => {
                        const isChecked = isEditing
                          ? editData?.permissions.includes(node)
                          : selectedRole?.permissions.includes(node);

                        return (
                          <div
                            key={node}
                            onClick={() => isEditing && togglePermission(node)}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-all border border-transparent ${
                              isEditing
                                ? 'cursor-pointer hover:bg-slate-50 ' +
                                  (isChecked
                                    ? 'bg-primary/5 !border-primary/20'
                                    : 'bg-transparent hover:!border-slate-200')
                                : 'cursor-default ' +
                                  (isChecked ? 'bg-slate-50' : 'bg-transparent opacity-50')
                            }`}
                          >
                            {isEditing ? (
                              <div className="relative group/cb flex items-center justify-center mt-0.5 shrink-0">
                                <div
                                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 ${isChecked ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'bg-white border-slate-300 group-hover/cb:border-primary/50'}`}
                                >
                                  <Check
                                    className={`w-3 h-3 text-white transition-transform duration-200 ${isChecked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                                    strokeWidth={3}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center mt-0.5 shrink-0">
                                {isChecked ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                            )}
                            <div className="font-medium text-sm text-slate-800">
                              {PERMISSION_DESCRIPTIONS[node] ||
                                node
                                  .split('_')
                                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                  .join(' ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>

          {roleToDelete && (roleCounts[roleToDelete.id] || 0) > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <strong>Warning:</strong> There {roleCounts[roleToDelete.id] === 1 ? 'is' : 'are'}{' '}
                currently{' '}
                <strong>
                  {roleCounts[roleToDelete.id]} user{roleCounts[roleToDelete.id] !== 1 ? 's' : ''}
                </strong>{' '}
                assigned to this role. Deleting it may block their access. Please reassign them
                before deleting.
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <button
              onClick={() => setRoleToDelete(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={roleToDelete ? (roleCounts[roleToDelete.id] || 0) > 0 : false}
              className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm ${
                roleToDelete && (roleCounts[roleToDelete.id] || 0) > 0
                  ? 'bg-red-300 cursor-not-allowed text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
              }`}
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
