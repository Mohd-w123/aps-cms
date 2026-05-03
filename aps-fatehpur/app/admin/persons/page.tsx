"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FileUploader } from "@/components/admin/FileUploader";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface PersonItem {
  _id: string; role: string; name: string; designation: string; bio: string;
  photo?: string; qualifications?: string; order: number; isActive: boolean;
}

interface Form { role: string; name: string; designation: string; bio: string; photo: string; qualifications: string; order: number; isActive: boolean; }
const empty: Form = { role: "principal", name: "", designation: "", bio: "", photo: "", qualifications: "", order: 0, isActive: true };

export default function AdminPersonsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => { const r = await api.get("/api/persons"); if (r.success) setItems(Array.isArray(r.data) ? r.data : []); setLoading(false); };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const doEdit = (p: PersonItem) => {
    setEditId(p._id); setForm({ role: p.role, name: p.name, designation: p.designation || "", bio: p.bio || "",
      photo: p.photo || "", qualifications: p.qualifications || "", order: p.order, isActive: p.isActive }); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); setForm(empty); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put("/api/persons", { id: editId, ...form }) : await api.post("/api/persons", form);
    if (r.success) { close(); load(); } setSaving(false);
  };

  const remove = async () => { if (!delId) return; await api.del(`/api/persons?id=${delId}`); setDelId(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Persons</h2><p className="text-sm text-gray-500 mt-1">Director, Chairman, Principal</p></div>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Person</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Designation</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 capitalize"><StatusBadge status={p.role} /></td>
                  <td className="px-4 py-3 text-gray-500">{p.designation}</td>
                  <td className="px-4 py-3"><StatusBadge status={String(p.isActive)} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => doEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelId(p._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500 ml-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No persons found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Person" : "Add Person"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="director">Director</option><option value="chairman">Chairman</option><option value="principal">Principal</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                  <input value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <RichTextEditor value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <FileUploader value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.name} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Person" description="This will permanently remove this person." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
