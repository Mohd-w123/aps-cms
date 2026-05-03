"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FileUploader } from "@/components/admin/FileUploader";
import { Plus, Pencil, Trash2, X, Loader2, Search } from "lucide-react";

interface PageItem {
  _id: string; slug: string; title: string; content: string;
  featuredImage?: string; seo?: { metaTitle?: string; metaDescription?: string };
  isPublished: boolean; updatedAt: string;
}

interface FormState {
  slug: string; title: string; content: string; featuredImage: string;
  seo: { metaTitle: string; metaDescription: string }; isPublished: boolean;
}

const empty: FormState = { slug: "", title: "", content: "", featuredImage: "", seo: { metaTitle: "", metaDescription: "" }, isPublished: false };

export default function AdminPagesPage() {
  const api = useAdminApi();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => { const r = await api.get("/api/pages"); if (r.success) setPages(r.data); setLoading(false); };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = () => { setEditId(null); setForm(empty); setOpen(true); };
  const edit = (p: PageItem) => {
    setEditId(p._id);
    setForm({ slug: p.slug, title: p.title, content: p.content || "", featuredImage: p.featuredImage || "",
      seo: { metaTitle: p.seo?.metaTitle || "", metaDescription: p.seo?.metaDescription || "" }, isPublished: p.isPublished });
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); setForm(empty); };

  const save = async () => {
    setSaving(true);
    const body = { ...form, seo: form.seo.metaTitle || form.seo.metaDescription ? form.seo : undefined };
    const r = editId ? await api.put("/api/pages", { id: editId, ...body }) : await api.post("/api/pages", body);
    if (r.success) { close(); load(); }
    setSaving(false);
  };

  const remove = async () => { if (!delId) return; await api.del(`/api/pages?id=${delId}`); setDelId(null); load(); };

  const list = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Pages</h2><p className="text-sm text-gray-500 mt-1">Manage CMS pages</p></div>
        <button onClick={create} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Create Page</button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Published</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {list.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500">{p.slug}</td>
                  <td className="px-4 py-3"><StatusBadge status={String(p.isPublished)} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.updatedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => edit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDelId(p._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500 ml-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No pages found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Page" : "Create Page"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <RichTextEditor value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <FileUploader value={form.featuredImage} onChange={url => setForm(f => ({ ...f, featuredImage: url }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <input value={form.seo.metaTitle} onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaTitle: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                  <input value={form.seo.metaDescription} onChange={e => setForm(f => ({ ...f, seo: { ...f.seo, metaDescription: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.title || !form.slug} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Page" description="This will permanently delete this page." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
