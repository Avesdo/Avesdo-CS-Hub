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
  ChevronUp,
  Check,
  Trash2,
  Send,
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
  const [statusFilter, setStatusFilter] = useState('active');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPendingExpanded, setIsPendingExpanded] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userToToggle, setUserToToggle] = useState<{ user: AppUser; isDeactivating: boolean } | null>(
    null
  );

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
    } catch (err) {
      // Error handled by service
    }
  };

  const handleResendInvite = async (inv: Invitation) => {
    try {
      if (!appUser?.email) return;
      await createInvitation(inv.email, inv.roleId, appUser.email);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend invitation');
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

  const filteredUsers = users
    .filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.roleId === roleFilter;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? !u.isDeactivated
          : u.isDeactivated;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      {/* Subtle Metrics */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-slate-600 font-medium">
            Total Users: <strong className="text-slate-900">{users.length}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-slate-600 font-medium">
            Active: <strong className="text-slate-900">{activeUsersCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <Mail className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-slate-600 font-medium">
            Pending Invites: <strong className="text-slate-900">{invitations.length}</strong>
          </span>
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
          <div className="relative w-40 shrink-0 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 group-hover:text-primary/70 transition-colors pointer-events-none" />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'All Users', value: 'all' },
                { label: 'Active Users', value: 'active' },
                { label: 'Deactivated', value: 'deactivated' },
              ]}
              trigger={
                <button
                  type="button"
                  className="w-full flex items-center justify-between pl-9 pr-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-sm"
                >
                  <TruncatedText
                    text={
                      statusFilter === 'active'
                        ? 'Active'
                        : statusFilter === 'deactivated'
                        ? 'Deactivated'
                        : 'All Users'
                    }
                    containerClassName="font-medium"
                  >
                    {statusFilter === 'active'
                      ? 'Active Users'
                      : statusFilter === 'deactivated'
                      ? 'Deactivated'
                      : 'All Users'}
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


      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto w-full">
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
                      <div className="flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={u.email === 'support@avesdo.com' || u.isDeactivated}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          >
                            {u.roleId === 'super_admin' ? 'Owner' : (roles.find((r) => r.id === u.roleId)?.name || `Unknown (${u.roleId})`)}
                            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[180px]">
                            {roles.map((r) => (
                              <DropdownMenuItem
                                key={r.id}
                                onClick={() => handleRoleChange(u.uid, r.id)}
                                className={`text-sm cursor-pointer ${
                                  r.id === u.roleId ? 'font-medium bg-slate-50' : ''
                                }`}
                              >
                                <span className="flex-1">{r.name}</span>
                                {r.id === u.roleId && <Check className="w-4 h-4 text-primary ml-2" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {u.lastLogin ? format(new Date(u.lastLogin), 'MMM d, yyyy, h:mm a') : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.isDeactivated ? (
                      <button
                        onClick={() => setUserToToggle({ user: u, isDeactivating: false })}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Reactivate User"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setUserToToggle({ user: u, isDeactivating: true })}
                        disabled={u.email === 'support@avesdo.com'}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed inline-flex items-center justify-center"
                        title="Deactivate User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
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

      {invitations.length > 0 && (
        <div className="mt-8 mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <button
            onClick={() => setIsPendingExpanded(!isPendingExpanded)}
            className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-colors w-full text-left"
          >
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Pending Invitations ({invitations.length})
            </h4>
            {isPendingExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {isPendingExpanded && (
            <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
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
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="truncate max-w-[150px]">{inv.invitedBy || 'Unknown'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {inv.invitedAt ? format(new Date(inv.invitedAt), 'MMM d, yyyy') : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleResendInvite(inv)}
                            className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Resend Invite"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRevoke(inv.email)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                            title="Revoke Invite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
                <Select
                  value={inviteRoleId}
                  onChange={setInviteRoleId}
                  placeholder="Select a role..."
                  options={roles.map((r) => ({ label: r.name, value: r.id }))}
                  className="w-full"
                />
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
      {/* Deactivate/Reactivate Confirmation Modal */}
      {userToToggle && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    userToToggle.isDeactivating ? 'bg-red-100' : 'bg-emerald-100'
                  }`}
                >
                  {userToToggle.isDeactivating ? (
                    <UserX className="w-5 h-5 text-red-600" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {userToToggle.isDeactivating ? 'Deactivate User' : 'Reactivate User'}
                </h3>
              </div>
              <p className="text-slate-600 text-sm">
                Are you sure you want to {userToToggle.isDeactivating ? 'deactivate' : 'reactivate'}{' '}
                <strong>{userToToggle.user.email}</strong>?{' '}
                {userToToggle.isDeactivating
                  ? 'They will immediately lose all access to the platform.'
                  : 'They will regain their previous access to the platform.'}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setUserToToggle(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(userToToggle.user.uid, userToToggle.isDeactivating);
                  setUserToToggle(null);
                }}
                className={`px-4 py-2 text-white rounded-lg font-bold text-sm transition-colors shadow-sm ${
                  userToToggle.isDeactivating
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {userToToggle.isDeactivating ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
