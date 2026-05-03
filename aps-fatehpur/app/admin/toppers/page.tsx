"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUploader } from "@/components/admin/FileUploader";
import { Plus, Trash2, X, Loader2, Trophy } from "lucide-react";

interface TopperItem { _id: string; image: string; order: number; isPublished: boolean; }
interface Form { image: string; order: number; isPublished: boolean; }
const empty: Form = { image: "", order: 0, isPublished: true };

export default function AdminToppersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<TopperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => { const r = await api.get("/api/toppers?limit=100"); if (r.success) setItems(r.data); setLoading(false); };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { setOpen(false); setForm(empty); };
  const save = async () => { setSaving(true); const r = await api.post("/api/toppers", form); if (r.success) { close(); load(); } setSaving(false); };
  const togglePublish = async (t: TopperItem) => { await api.put("/api/toppers", { id: t._id, isPublished: !t.isPublished }); load(); };
  const remove = async () => { if (!delId) return; await api.del(`/api/toppers?id=${delId}`); setDelId(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Toppers</h2><p className="text-sm text-gray-500 mt-1">Manage topper result cards</p></div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Topper</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(t => (
            <div key={t._id} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-white">
              <div className="aspect-[3/4] relative bg-gray-100">
                {t.image ? <Image src={t.image} alt="" fill className="object-cover" /> : <div className="flex items-center justify-center h-full"><Trophy className="h-8 w-8 text-gray-300" /></div>}
              </div>
              <div className="p-2 flex items-center justify-between">
                <button onClick={() => togglePublish(t)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {t.isPublished ? "Published" : "Draft"}
                </button>
                <button onClick={() => setDelId(t._id)} className="p-1 rounded hover:bg-gray-100 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No toppers added</div>}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add Topper</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Result Card Image *</label>
                <FileUploader value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.image} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Add</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Topper" description="This will permanently delete this topper card." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
