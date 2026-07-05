"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUploader } from "@/components/admin/FileUploader";
import { Plus, Trash2, X, Loader2, ImageIcon, Film } from "lucide-react";

interface GalleryItem {
  _id: string; type: string; category: string; image: string; videoUrl?: string; order: number; isPublished: boolean;
}

interface Form { type: string; category: string; image: string; videoUrl: string; order: number; isPublished: boolean; }
const empty: Form = { type: "image", category: "general", image: "", videoUrl: "", order: 0, isPublished: true };

export default function AdminGalleryPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "image" | "video">("all");

  const load = async () => { const r = await api.get("/api/gallery?limit=200"); if (r.success) setItems(r.data); setLoading(false); };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { setOpen(false); setForm(empty); };

  const save = async () => {
    setSaving(true);
    const body = {
      ...form,
      category: form.category.trim().toLowerCase() || "general",
      videoUrl: form.type === "video" && form.videoUrl ? form.videoUrl : undefined,
    };
    const r = await api.post("/api/gallery", body);
    if (r.success) { close(); load(); }
    setSaving(false);
  };

  const togglePublish = async (item: GalleryItem) => {
    await api.put("/api/gallery", { id: item._id, isPublished: !item.isPublished });
    load();
  };

  const remove = async () => { if (!delId) return; await api.del(`/api/gallery?id=${delId}`); setDelId(null); load(); };

  const filtered = tab === "all" ? items : items.filter(i => i.type === tab);
  const existingCategories = Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Gallery</h2><p className="text-sm text-gray-500 mt-1">Manage photos & videos</p></div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Item</button>
      </div>

      <div className="flex gap-2">
        {(["all", "image", "video"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${tab === t ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t === "all" ? "All" : t === "image" ? "Photos" : "Videos"}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item._id} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-white">
              <div className="aspect-square relative bg-gray-100">
                {item.image ? <Image src={item.image} alt="" fill className="object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="h-8 w-8 text-gray-300" /></div>}
                {item.type === "video" && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Film className="h-8 w-8 text-white" /></div>}
              </div>
              <div className="p-2 flex items-center justify-between">
                <button onClick={() => togglePublish(item)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {item.isPublished ? "Published" : "Draft"}
                </button>
                <button onClick={() => setDelId(item._id)} className="p-1 rounded hover:bg-gray-100 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No items</div>}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Item</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="image">Photo</option><option value="video">Video</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  list="gallery-categories"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. annual function"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="gallery-categories">
                  {existingCategories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Select an existing category or type a new one. Saved in lowercase.</p>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{form.type === "video" ? "Thumbnail Image *" : "Image *"}</label>
                <FileUploader value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} /></div>
              {form.type === "video" && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              )}
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

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Item" description="This will permanently delete this gallery item." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
