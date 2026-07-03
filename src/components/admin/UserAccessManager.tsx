import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Users,
  Mail,
  Shield,
  CheckCircle2,
  Search,
  X,
  MoreHorizontal,
  UserX,
  UserCheck,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../context/AuthContext';
import {
  createInvitation,
  updateUserRole,
  revokeInvitation,
  toggleUserActiveStatus,
} from '../../api/dbService';
import { AppUser, CustomRole, Invitation } from '../../types';
import { toast } from '../../utils/toast';
import { Select } from '../ui/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { TruncatedText } from '../../components/ui/TruncatedText';

export function UserAccessManager() {
  const { settings } = useAppStore();
  const { appUser } = useAuth();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const roles = settings?.roles || [];

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => doc.data() as AppUser);
      setUsers(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const qInvites = query(collection(db, 'invitations'));
    const unsubInvites = onSnapshot(qInvites, (snap) => {
      const data = snap.docs.map((doc) => doc.data() as Invitation);
      data.sort((a, b) => b.invitedAt - a.invitedAt);
      setInvitations(data);
    });
    return () => unsubInvites();
  }, []);

  const handleRevoke = async (email: string) => {
    try {
      await revokeInvitation(email);
      toast.success('Invitation revoked');
    } catch (err) {
      toast.error('Failed to revoke invitation');
    }
  };

  const handleToggleStatus = async (uid: string, deactivate: boolean) => {
    try {
      await toggleUserActiveStatus(uid, deactivate);
      toast.success(`User ${deactivate ? 'deactivated' : 'reactivated'}`);
    } catch (err) {
      toast.error(`Failed to ${deactivate ? 'deactivate' : 'reactivate'} user`);
    }
  };

  const handleRoleChange = async (uid: string, newRoleId: string) => {
    try {
      await updateUserRole(uid, newRoleId);
    } catch (err) {
      // Toast is handled in service
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.endsWith('@avesdo.com')) {
      toast.error('Email must be an @avesdo.com address');
      return;
    }
    if (!inviteRoleId) {
      toast.error('Please select a role');
      return;
    }

    setIsInviting(true);
    try {
      await createInvitation(inviteEmail, inviteRoleId, appUser?.email || 'Admin');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRoleId('');
    } catch (err) {
      // error handled in service
    } finally {
      setIsInviting(false);
    }
  };

  const activeUsersCount = users.filter((u) => !u.isDeactivated).length;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.roleId === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <h4 className="text-2xl font-bold text-slate-900">{users.length}</h4>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Users</p>
            <h4 className="text-2xl font-bold text-slate-900">{activeUsersCount}</h4>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Invitations</p>
            <h4 className="text-2xl font-bold text-slate-900">{invitations.length}</h4>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="relative w-48 shrink-0 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 group-hover:text-primary/70 transition-colors pointer-events-none" />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { label: 'All Roles', value: 'all' },
                ...roles.map((r) => ({ label: r.name, value: r.id })),
              ]}
              trigger={
                <button
                  type="button"
                  className="w-full flex items-center justify-between pl-9 pr-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-sm"
                >
                  <TruncatedText
                    text={String(
                      '' + roleFilter === 'all'
                        ? 'All Roles'
                        : roles.find((r) => r.id === roleFilter)?.name || 'All Roles' + ''
                    )}
                    containerClassName="font-medium"
                  >
                    {roleFilter === 'all'
                      ? 'All Roles'
                      : roles.find((r) => r.id === roleFilter)?.name || 'All Roles'}
                  </TruncatedText>
                  <ChevronDown className="w-4 h-4 text-slate-400 opacity-70" />
                </button>
              }
            />
          </div>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)] shrink-0"
        >
          <Mail className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {invitations.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Pending Invitations ({invitations.length})
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                    Invited By
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <tr key={inv.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {roles.find((r) => r.id === inv.roleId)?.name || inv.roleId}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{inv.invitedBy}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {inv.invitedAt ? format(new Date(inv.invitedAt), 'MMM d, yyyy') : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRevoke(inv.email)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-y-auto custom-thin-scroll flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  User
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  Role
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  Last Login
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  Joined
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <span className="text-xs font-bold text-slate-600">
                            {u.displayName
                              ? u.displayName.charAt(0).toUpperCase()
                              : u.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {u.displayName || 'No Name'}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.isDeactivated ? (
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1.5 w-fit"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Deactivated
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 w-fit"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.roleId === 'super_admin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-purple-50 border-purple-200 text-purple-700 text-xs font-semibold">
                        <Shield className="w-3.5 h-3.5" />
                        Super Admin
                      </span>
                    ) : (
                      <div className="flex items-center">
                        <Select
                          value={u.roleId}
                          onChange={(val) => handleRoleChange(u.uid, val)}
                          disabled={u.email === 'roell.pereira@avesdo.com' || u.isDeactivated}
                          options={[
                            ...roles.map((r) => ({ label: r.name, value: r.id })),
                            ...(!roles.find((r) => r.id === u.roleId)
                              ? [{ label: `Unknown (${u.roleId})`, value: u.roleId }]
                              : []),
                          ]}
                          className={`w-[150px] ${
                            u.roleId.includes('admin')
                              ? 'bg-blue-50/50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                          placeholder="Select role..."
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy, h:mm a') : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-slate-100 rounded-lg outline-none transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {u.isDeactivated ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(u.uid, false)}
                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer font-medium"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Reactivate User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(u.uid, true)}
                            disabled={u.email === 'roell.pereira@avesdo.com'}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer font-medium"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-sm">
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Invite User</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="employee@avesdo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Assign Role
                </label>
                <select
                  required
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                >
                  <option value="" disabled>
                    Select a role...
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 mt-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-primary/80 leading-relaxed">
                  An email invitation will be sent immediately. Once they sign in with Google SSO,
                  their role will be automatically applied.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
