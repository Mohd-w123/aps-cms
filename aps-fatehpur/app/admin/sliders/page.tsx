"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUploader } from "@/components/admin/FileUploader";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface SliderItem {
  _id: string; image: string; title: string; subtitle: string;
  ctaLabel?: string; ctaLink?: string; order: number; isPublished: boolean; scope: string;
}
interface Form {
  image: string; title: string; subtitle: string; ctaLabel: string; ctaLink: string;
  order: number; isPublished: boolean; scope: string;
}
const empty: Form = { image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "", order: 0, isPublished: true, scope: "school" };

export default function AdminSlidersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [tab, setTab] = useState<"school" | "group">("school");

  const load = async () => {
    setLoading(true);
    // Fetch both scopes for admin view
    const [s, g] = await Promise.all([
      api.get("/api/sliders?scope=school&limit=50"),
      api.get("/api/sliders?scope=group&limit=50"),
    ]);
    const all: SliderItem[] = [];
    if (s.success) all.push(...s.data);
    if (g.success) all.push(...g.data);
    setItems(all);
    setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCreate = () => { setEditId(null); setForm({ ...empty, scope: tab }); setOpen(true); };
  const doEdit = (s: SliderItem) => {
    setEditId(s._id); setForm({ image: s.image, title: s.title, subtitle: s.subtitle || "",
      ctaLabel: s.ctaLabel || "", ctaLink: s.ctaLink || "", order: s.order, isPublished: s.isPublished, scope: s.scope }); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); setForm(empty); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put("/api/sliders", { id: editId, ...form }) : await api.post("/api/sliders", form);
    if (r.success) { close(); load(); } setSaving(false);
  };

  const remove = async () => { if (!delId) return; await api.del(`/api/sliders?id=${delId}`); setDelId(null); load(); };

  const filtered = items.filter(i => i.scope === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Sliders</h2><p className="text-sm text-gray-500 mt-1">Manage hero carousel slides</p></div>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Slide</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("school")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "school" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>School Homepage</button>
        <button onClick={() => setTab("group")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "group" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Group Landing</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">Image</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">CTA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 w-24">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="w-16 h-10 relative rounded overflow-hidden bg-gray-100">
                      {s.image && <Image src={s.image} alt="" fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900 truncate max-w-[200px]">{s.title}</p><p className="text-xs text-gray-400 truncate max-w-[200px]">{s.subtitle}</p></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.ctaLabel || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.order}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{s.isPublished ? "Live" : "Draft"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => doEdit(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelId(s._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500 ml-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No slides for {tab === "school" ? "school homepage" : "group landing"}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Slide" : "Add Slide"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Background Image *</label>
                <FileUploader value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">CTA Label</label>
                  <input value={form.ctaLabel} onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))} placeholder="e.g. Apply Now" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                  <input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="e.g. /academy/admissions" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                <select value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="school">School Homepage</option><option value="group">Group Landing</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.image || !form.title} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Slide" description="This will permanently remove this slide." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
