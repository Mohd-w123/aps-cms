"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface UserItem {
  _id: string; name: string; email: string; role: string; schoolId?: string; isActive: boolean; lastLogin?: string;
}
interface Form { name: string; email: string; password: string; role: string; schoolId: string; isActive: boolean; }
const empty: Form = { name: "", email: "", password: "", role: "editor", schoolId: "", isActive: true };

export default function AdminUsersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => { const r = await api.get("/api/users"); if (r.success) setItems(Array.isArray(r.data) ? r.data : []); setLoading(false); };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const doEdit = (u: UserItem) => {
    setEditId(u._id); setForm({ name: u.name, email: u.email, password: "", role: u.role,
      schoolId: u.schoolId || "", isActive: u.isActive }); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); setForm(empty); };

  const save = async () => {
    setSaving(true);
    const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, schoolId: form.schoolId || undefined, isActive: form.isActive };
    if (form.password) body.password = form.password;
    const r = editId ? await api.put("/api/users", { id: editId, ...body }) : await api.post("/api/users", body);
    if (r.success) { close(); load(); } setSaving(false);
  };

  const remove = async () => { if (!delId) return; await api.del(`/api/users?id=${delId}`); setDelId(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Users</h2><p className="text-sm text-gray-500 mt-1">Manage admin users</p></div>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add User</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.isActive ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => doEdit(u)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelId(u._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500 ml-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit User" : "Create User"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{editId ? "New Password (leave blank to keep)" : "Password *"}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="editor">Editor</option><option value="school_admin">School Admin</option><option value="superadmin">Super Admin</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">School ID</label>
                <input value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))} placeholder="Leave blank for superadmin" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.email} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete User" description="This will permanently remove this user." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
