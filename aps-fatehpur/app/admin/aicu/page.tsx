"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FileUploader } from "@/components/admin/FileUploader";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

interface Service { name: string; description: string; icon: string; }
interface Form { title: string; description: string; services: Service[]; images: string[]; schedule: string; isActive: boolean; }

const empty: Form = { title: "", description: "", services: [], images: [], schedule: "", isActive: true };

export default function AdminAICUPage() {
  const api = useAdminApi();
  const [form, setForm] = useState<Form>(empty);
  const [aicuId, setAicuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!api.token) return;
    api.get("/api/aicu").then(r => {
      if (r.success && r.data) {
        const d = Array.isArray(r.data) ? r.data[0] : r.data;
        if (d) {
          setAicuId(d._id);
          setForm({ title: d.title || "", description: d.description || "", services: d.services || [], images: d.images || [], schedule: d.schedule || "", isActive: d.isActive ?? true });
        }
      }
      setLoading(false);
    });
  }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaving(true); setMsg("");
    const r = aicuId ? await api.put("/api/aicu", { id: aicuId, ...form }) : await api.post("/api/aicu", form);
    if (r.success) { setMsg("Saved!"); if (!aicuId && r.data?._id) setAicuId(r.data._id); }
    setSaving(false); setTimeout(() => setMsg(""), 3000);
  };

  const addService = () => setForm(f => ({ ...f, services: [...f.services, { name: "", description: "", icon: "" }] }));
  const removeService = (i: number) => setForm(f => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));
  const updateService = (i: number, key: keyof Service, val: string) =>
    setForm(f => ({ ...f, services: f.services.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-bold text-gray-900">AICU</h2><p className="text-sm text-gray-500 mt-1">Manage AICU section content</p></div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>

        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <RichTextEditor value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} /></div>

        <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
          <input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Services</label>
            <button onClick={addService} className="text-xs text-emerald-600 hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
          </div>
          {form.services.map((s, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-center">
              <input placeholder="Name" value={s.name} onChange={e => updateService(i, "name", e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input placeholder="Description" value={s.description} onChange={e => updateService(i, "description", e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <div className="flex gap-2">
                <input placeholder="Icon" value={s.icon} onChange={e => updateService(i, "icon", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={() => removeService(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div><label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <FileUploader value="" onChange={url => { if (url) setForm(f => ({ ...f, images: [...f.images, url] })); }} label="Add Image" /></div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300" />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !form.title} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
          {msg && <span className="text-sm text-emerald-600 font-medium">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
