"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import { FileUploader } from "@/components/admin/FileUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { schools } from "@/config/schools";
import { Plus, Pencil, Trash2, X, Loader2, ShieldAlert, Eye, CheckCircle2, XCircle, MessageSquare, Send } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Tab = "homepage" | "sliders" | "pages" | "news" | "gallery" | "toppers" | "persons" | "aicu" | "alumni" | "admissions" | "enquiries" | "social";

export default function SchoolSiteManagement() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const school = schools.find(s => s.slug === slug);
  const [activeTab, setActiveTab] = useState<Tab>("homepage");

  const tabs: { key: Tab; label: string }[] = [
    { key: "homepage", label: "Homepage" },
    { key: "sliders", label: "Hero Sliders" },
    { key: "pages", label: "Pages" },
    { key: "news", label: "News & Notices" },
    { key: "gallery", label: "Gallery" },
    { key: "toppers", label: "Toppers" },
    { key: "persons", label: "People" },
    { key: "aicu", label: "AICU" },
    { key: "alumni", label: "Alumni" },
    { key: "admissions", label: "Admissions" },
    { key: "enquiries", label: "Enquiries" },
    { key: "social", label: "Social Links" },
  ];

  if (!school) {
    return <div className="text-center py-12 text-gray-500">School &quot;{slug}&quot; not found.</div>;
  }

  // Permission check: school_admin/editor can only manage their own school
  const canAccess = user?.role === "superadmin" || user?.schoolSlug === school.slug;
  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <ShieldAlert className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Access Denied</h3>
        <p className="text-sm mt-1">You don&apos;t have permission to manage this school&apos;s content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{school.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Manage all content for this school&apos;s website</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "homepage" && <SchoolHomepage schoolSlug={slug} />}
      {activeTab === "sliders" && <SchoolSliders schoolSlug={slug} />}
      {activeTab === "pages" && <SchoolPages schoolSlug={slug} />}
      {activeTab === "news" && <SchoolNews schoolSlug={slug} />}
      {activeTab === "gallery" && <SchoolGallery schoolSlug={slug} />}
      {activeTab === "toppers" && <SchoolToppers schoolSlug={slug} />}
      {activeTab === "persons" && <SchoolPersons schoolSlug={slug} />}
      {activeTab === "aicu" && <SchoolAICU schoolSlug={slug} />}
      {activeTab === "alumni" && <SchoolAlumni schoolSlug={slug} />}
      {activeTab === "admissions" && <SchoolAdmissions schoolSlug={slug} />}
      {activeTab === "enquiries" && <SchoolEnquiries schoolSlug={slug} />}
      {activeTab === "social" && <SchoolSocialLinks schoolSlug={slug} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SLIDERS
// ═══════════════════════════════════════════════════════════════
function SchoolSliders({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface SliderItem { _id: string; image: string; title: string; subtitle: string; ctaLabel?: string; ctaLink?: string; order: number; isPublished: boolean; }
  const [items, setItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "", order: 0, isPublished: true });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/sliders?scope=school&limit=50&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "", order: items.length, isPublished: true }); setOpen(true); };
  const doEdit = (s: SliderItem) => { setEditId(s._id); setForm({ image: s.image, title: s.title, subtitle: s.subtitle || "", ctaLabel: s.ctaLabel || "", ctaLink: s.ctaLink || "", order: s.order, isPublished: s.isPublished }); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const payload = { ...form, scope: "school" };
    const r = editId ? await api.put(`/api/sliders?school=${schoolSlug}`, { id: editId, ...payload }) : await api.post(`/api/sliders?school=${schoolSlug}`, payload);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/sliders?id=${delId}&school=${schoolSlug}`); setDelId(null); load(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{items.length} slide{items.length !== 1 ? "s" : ""}</p>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Slide</button>
      </div>

      <div className="grid gap-4">
        {items.sort((a, b) => a.order - b.order).map((s) => (
          <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center">
            <div className="w-32 h-20 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {s.image && <Image src={s.image} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{s.title || "Untitled"}</p>
              <p className="text-sm text-gray-500 truncate">{s.subtitle}</p>
              {s.ctaLabel && <p className="text-xs text-emerald-600 mt-1">Button: {s.ctaLabel}</p>}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${s.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {s.isPublished ? "Live" : "Draft"}
            </span>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => doEdit(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => setDelId(s._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No hero sliders yet.</p>}
      </div>

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
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
                  <input value={form.ctaLabel} onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))} placeholder="e.g. Apply Now" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="e.g. /academy/admissions" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.image || !form.title} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Slide" description="Permanently remove this slide?" confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════
function SchoolPages({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface PageItem { _id: string; title: string; slug: string; content: string; featuredImage?: string; isPublished: boolean; }
  const [items, setItems] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", featuredImage: "", isPublished: true });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/pages?limit=50&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ title: "", slug: "", content: "", featuredImage: "", isPublished: true }); setOpen(true); };
  const doEdit = (p: PageItem) => { setEditId(p._id); setForm({ title: p.title, slug: p.slug, content: p.content || "", featuredImage: p.featuredImage || "", isPublished: p.isPublished }); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put(`/api/pages?school=${schoolSlug}`, { id: editId, ...form }) : await api.post(`/api/pages?school=${schoolSlug}`, form);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/pages?id=${delId}&school=${schoolSlug}`); setDelId(null); load(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{items.length} page{items.length !== 1 ? "s" : ""}</p>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Page</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.map((p) => (
          <div key={p._id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{p.title}</p>
              <p className="text-xs text-gray-400">/{p.slug}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {p.isPublished ? "Live" : "Draft"}
            </span>
            <button onClick={() => doEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => setDelId(p._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No pages yet.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Page" : "Add Page"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. about, home-about" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <FileUploader value={form.featuredImage} onChange={url => setForm(f => ({ ...f, featuredImage: url }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <RichTextEditor value={form.content} onChange={val => setForm(f => ({ ...f, content: val }))} /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.title || !form.slug} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Page" description="Permanently remove this page?" confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEWS & NOTICES
// ═══════════════════════════════════════════════════════════════
function SchoolNews({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface NewsItem { _id: string; title: string; slug: string; category: string; excerpt?: string; featuredImage?: string; isPublished: boolean; publishedAt?: string; }
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", category: "announcement", excerpt: "", content: "", featuredImage: "", isPublished: true });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/news?limit=100&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ title: "", slug: "", category: "announcement", excerpt: "", content: "", featuredImage: "", isPublished: true }); setOpen(true); };
  const doEdit = async (n: NewsItem) => {
    // Fetch full content
    const r = await api.get(`/api/news/${n.slug}?school=${schoolSlug}`);
    const full = r.success ? r.data : n;
    setEditId(n._id);
    setForm({ title: full.title, slug: full.slug, category: full.category, excerpt: full.excerpt || "", content: full.content || "", featuredImage: full.featuredImage || "", isPublished: full.isPublished });
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put(`/api/news?school=${schoolSlug}`, { id: editId, ...form }) : await api.post(`/api/news?school=${schoolSlug}`, form);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/news?id=${delId}&school=${schoolSlug}`); setDelId(null); load(); };

  const filtered = catFilter === "all" ? items : items.filter(n => n.category === catFilter);
  const categories = ["all", "announcement", "event", "tour", "notice"];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium ${catFilter === c ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.map((n) => (
          <div key={n._id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
            {n.featuredImage && <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0"><Image src={n.featuredImage} alt="" fill className="object-cover" /></div>}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{n.title}</p>
              <p className="text-xs text-gray-400">{n.category} • {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : "Draft"}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {n.isPublished ? "Live" : "Draft"}
            </span>
            <button onClick={() => doEdit(n)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => setDelId(n._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No news items.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit" : "Add"} News</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if empty" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="announcement">Announcement</option><option value="event">Event</option><option value="tour">Tour</option><option value="notice">Notice (Ticker)</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              {form.category !== "notice" && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  <FileUploader value={form.featuredImage} onChange={url => setForm(f => ({ ...f, featuredImage: url }))} /></div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <RichTextEditor value={form.content} onChange={val => setForm(f => ({ ...f, content: val }))} /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.title} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete News" description="Permanently remove this item?" confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════
function SchoolGallery({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface GalleryItem { _id: string; image: string; title?: string; type: string; category?: string; }
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ image: "", title: "", type: "image", category: "general" });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/gallery?limit=100&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    const r = await api.post(`/api/gallery?school=${schoolSlug}`, form);
    if (r.success) { setOpen(false); setForm({ image: "", title: "", type: "image", category: "general" }); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/gallery?id=${delId}&school=${schoolSlug}`); setDelId(null); load(); };

  const categories = ["all", ...Array.from(new Set(items.map(g => g.category || "general")))];
  const filtered = catFilter === "all" ? items : items.filter(g => (g.category || "general") === catFilter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1 rounded-full text-xs font-medium ${catFilter === c ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Image</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((g) => (
          <div key={g._id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square">
            <Image src={g.image} alt={g.title || ""} fill className="object-cover" />
            <div className="absolute top-1 left-1">
              <span className="px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full">{g.category || "general"}</span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button onClick={() => setDelId(g._id)} className="p-2 bg-red-500 text-white rounded-full"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Image</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <FileUploader value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Caption (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. sports, event, annual function" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" list="gallery-categories" />
                <datalist id="gallery-categories">
                  <option value="sports" /><option value="event" /><option value="annual function" /><option value="cultural" /><option value="infrastructure" /><option value="classroom" /><option value="general" />
                </datalist>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.image} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Upload
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Image" description="Permanently remove this image?" confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPPERS
// ═══════════════════════════════════════════════════════════════
function SchoolToppers({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface TopperItem { _id: string; name: string; photo?: string; percentage?: number; year?: string; exam?: string; rank?: number; isPublished?: boolean; }
  const [items, setItems] = useState<TopperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", photo: "", percentage: 0, year: new Date().getFullYear().toString(), exam: "Board", rank: 1 });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/toppers?limit=100&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ name: "", photo: "", percentage: 0, year: new Date().getFullYear().toString(), exam: "Board", rank: 1 }); setOpen(true); };
  const doEdit = (t: TopperItem) => { setEditId(t._id); setForm({ name: t.name, photo: t.photo || "", percentage: t.percentage || 0, year: t.year || "", exam: t.exam || "Board", rank: t.rank || 1 }); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put(`/api/toppers?school=${schoolSlug}`, { id: editId, ...form }) : await api.post(`/api/toppers?school=${schoolSlug}`, form);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/toppers?id=${delId}&school=${schoolSlug}`); setDelId(null); load(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{items.length} topper{items.length !== 1 ? "s" : ""}</p>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Topper</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((t) => (
          <div key={t._id} className="bg-white rounded-xl border border-gray-200 p-3 text-center relative group">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 overflow-hidden mb-2">
              {t.photo ? <Image src={t.photo} alt={t.name} width={64} height={64} className="object-cover w-full h-full" /> : <span className="text-2xl font-bold text-gray-300 leading-[64px]">{t.name?.charAt(0)}</span>}
            </div>
            <p className="font-medium text-sm text-gray-900 truncate">{t.name}</p>
            <p className="text-xs text-gray-500">{t.percentage}% • {t.year}</p>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => doEdit(t)} className="p-1 bg-white rounded shadow text-gray-500 hover:text-emerald-600"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => setDelId(t._id)} className="p-1 bg-white rounded shadow text-red-500"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit" : "Add"} Topper</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <FileUploader value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">%</label>
                  <input type="number" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Rank</label>
                  <input type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <input value={form.exam} onChange={e => setForm(f => ({ ...f, exam: e.target.value }))} placeholder="Board, NEET, JEE" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.name} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Topper" description="Permanently remove this topper?" confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PERSONS (Principal, Director, Chairman)
// ═══════════════════════════════════════════════════════════════
function SchoolPersons({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface PersonItem { _id: string; name: string; role: string; photo?: string; bio?: string; phone?: string; email?: string; order?: number; }
  const [items, setItems] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", role: "principal", photo: "", bio: "", phone: "", email: "", order: 0 });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/persons?limit=50&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ name: "", role: "principal", photo: "", bio: "", phone: "", email: "", order: 0 }); setOpen(true); };
  const doEdit = (p: PersonItem) => { setEditId(p._id); setForm({ name: p.name, role: p.role, photo: p.photo || "", bio: p.bio || "", phone: p.phone || "", email: p.email || "", order: p.order || 0 }); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put(`/api/persons?school=${schoolSlug}`, { id: editId, ...form }) : await api.post(`/api/persons?school=${schoolSlug}`, form);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/persons?id=${delId}&school=${schoolSlug}`); setDelId(null); load(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{items.length} person{items.length !== 1 ? "s" : ""}</p>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Person</button>
      </div>

      <div className="grid gap-4">
        {items.map((p) => (
          <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0">
              {p.photo ? <Image src={p.photo} alt={p.name} width={56} height={56} className="object-cover w-full h-full" /> : <span className="text-xl font-bold text-gray-300 flex items-center justify-center h-full">{p.name?.charAt(0)}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-500 capitalize">{p.role}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => doEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => setDelId(p._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No people added yet.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit" : "Add"} Person</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <FileUploader value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="principal">Principal</option><option value="director">Director</option><option value="chairman">Chairman</option><option value="teacher">Teacher</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <RichTextEditor value={form.bio} onChange={val => setForm(f => ({ ...f, bio: val }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.name} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Person" description="Permanently remove this person?" confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AICU
// ═══════════════════════════════════════════════════════════════
function SchoolAICU({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface AICUData { _id?: string; title: string; description: string; services: string[]; images: string[]; schedule?: string; }
  const [data, setData] = useState<AICUData>({ title: "", description: "", services: [], images: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/aicu?school=${schoolSlug}`);
    if (r.success && r.data) setData(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    const r = data._id ? await api.put(`/api/aicu?school=${schoolSlug}`, { id: data._id, ...data }) : await api.post(`/api/aicu?school=${schoolSlug}`, data);
    if (r.success) load();
    setSaving(false);
  };

  const addService = () => {
    if (!newService.trim()) return;
    setData(d => ({ ...d, services: [...d.services, newService.trim()] }));
    setNewService("");
  };
  const removeService = (i: number) => setData(d => ({ ...d, services: d.services.filter((_, idx) => idx !== i) }));
  const addImage = (url: string) => setData(d => ({ ...d, images: [...d.images, url] }));
  const removeImage = (i: number) => setData(d => ({ ...d, images: d.images.filter((_, idx) => idx !== i) }));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>

      <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <RichTextEditor value={data.description} onChange={val => setData(d => ({ ...d, description: val }))} /></div>

      <div><label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
        <input value={data.schedule || ""} onChange={e => setData(d => ({ ...d, schedule: e.target.value }))} placeholder="e.g. Monday to Friday, 9 AM - 3 PM" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
        <div className="flex gap-2 mb-2">
          <input value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key === "Enter" && addService()} placeholder="Add a service..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={addService} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.services.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm">
              {s}<button onClick={() => removeService(i)} className="text-emerald-400 hover:text-red-500"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {data.images.map((img, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
              <Image src={img} alt="" fill className="object-cover" />
              <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <FileUploader value="" onChange={addImage} label="Add AICU Image" />
      </div>

      <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save AICU Settings
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOMEPAGE SECTIONS
// ═══════════════════════════════════════════════════════════════
interface FeatureItem { title: string; desc: string; }
interface CtaData { heading: string; body: string; btn1Label: string; btn1Link: string; btn2Label: string; btn2Link: string; }

function SchoolHomepage({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<"about" | "features" | "cta">("about");

  // About
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [aboutTitle, setAboutTitle] = useState("A Legacy of Educational Excellence");
  const [aboutContent, setAboutContent] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [aboutSignoff, setAboutSignoff] = useState("");

  // Features
  const [featuresId, setFeaturesId] = useState<string | null>(null);
  const [features, setFeatures] = useState<FeatureItem[]>([
    { title: "Quality Education", desc: "CBSE-aligned curriculum with experienced faculty." },
    { title: "Smart Classrooms", desc: "Digital learning with interactive boards and e-learning resources." },
    { title: "Advanced Labs", desc: "Fully equipped science, computer, and language labs." },
    { title: "Sports Excellence", desc: "Professional coaching in cricket, football, and athletics." },
    { title: "Arts & Culture", desc: "Music, dance, drama, and fine arts clubs." },
    { title: "Safe Transport", desc: "GPS-enabled school buses covering all major routes." },
    { title: "Safety & Security", desc: "CCTV surveillance, secure campus, and trained security." },
    { title: "Green Campus", desc: "Eco-friendly campus with gardens and solar panels." },
  ]);

  // CTA
  const [ctaId, setCtaId] = useState<string | null>(null);
  const [cta, setCta] = useState<CtaData>({
    heading: "Ready to Begin Your Child's Journey?",
    body: "Join thousands of families who trust us. Admissions are open for the 2026-27 session — limited seats available!",
    btn1Label: "Apply for Admission", btn1Link: "/academy/admissions",
    btn2Label: "Contact Us", btn2Link: "/contact",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await api.get(`/api/pages?limit=50&school=${schoolSlug}`);
      if (r.success && r.data?.length) {
        for (const p of r.data) {
          if (p.slug === "home-about" || p.slug === "about") {
            setAboutId(p._id);
            setAboutTitle(p.title || "A Legacy of Educational Excellence");
            setAboutContent(p.content || "");
            setAboutImage(p.featuredImage || "");
            if (p.seo?.metaDescription) setAboutSignoff(p.seo.metaDescription);
          }
          if (p.slug === "home-features") {
            setFeaturesId(p._id);
            try { const arr = JSON.parse(p.content); if (Array.isArray(arr)) setFeatures(arr); } catch { /* keep defaults */ }
          }
          if (p.slug === "home-cta") {
            setCtaId(p._id);
            try { const obj = JSON.parse(p.content); setCta(prev => ({ ...prev, ...obj })); } catch { /* keep defaults */ }
          }
        }
      }
      setLoading(false);
    };
    if (api.token) load();
  }, [api.token]); // eslint-disable-line

  const saveSection = async (slug: string, title: string, content: string, id: string | null, featuredImage?: string, seo?: { metaDescription?: string }) => {
    setSaving(true);
    const payload = { title, slug, content, isPublished: true, ...(featuredImage !== undefined ? { featuredImage } : {}), ...(seo ? { seo } : {}) };
    const r = id
      ? await api.put(`/api/pages?school=${schoolSlug}`, { id, ...payload })
      : await api.post(`/api/pages?school=${schoolSlug}`, payload);
    setSaving(false);
    return r;
  };

  const saveAbout = async () => {
    const r = await saveSection("home-about", aboutTitle, aboutContent, aboutId, aboutImage, { metaDescription: aboutSignoff });
    if (r.success && r.data?._id) setAboutId(r.data._id);
  };

  const saveFeatures = async () => {
    const r = await saveSection("home-features", "Homepage Features", JSON.stringify(features), featuresId);
    if (r.success && r.data?._id) setFeaturesId(r.data._id);
  };

  const saveCta = async () => {
    const r = await saveSection("home-cta", "CTA Banner", JSON.stringify(cta), ctaId);
    if (r.success && r.data?._id) setCtaId(r.data._id);
  };

  const addFeature = () => setFeatures(f => [...f, { title: "", desc: "" }]);
  const removeFeature = (i: number) => setFeatures(f => f.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, key: "title" | "desc", val: string) => setFeatures(f => f.map((ft, idx) => idx === i ? { ...ft, [key]: val } : ft));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">Manage your homepage sections — About, Features (Why Choose Us), and CTA Banner.</p>

      {/* Sub-sections */}
      <div className="flex gap-2 flex-wrap">
        {([["about", "About Section"], ["features", "Why Choose Us"], ["cta", "CTA Banner"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setSection(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${section === key ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── About Section ── */}
      {section === "about" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">About Section</h3>
          <p className="text-xs text-gray-500">This appears on the homepage under &quot;About Us&quot;. Use the Pages tab slug &quot;home-about&quot; for full control.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
            <input value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
            <FileUploader value={aboutImage} onChange={setAboutImage} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <RichTextEditor value={aboutContent} onChange={setAboutContent} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sign-off / Attribution</label>
            <input value={aboutSignoff} onChange={e => setAboutSignoff(e.target.value)} placeholder="e.g. — Chairman, A.P.S School" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button onClick={saveAbout} disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save About
          </button>
        </div>
      )}

      {/* ── Features / Why Choose Us ── */}
      {section === "features" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Why Choose Us — Features</h3>
              <p className="text-xs text-gray-500 mt-1">Each feature shows as a card on the homepage.</p>
            </div>
            <button onClick={addFeature} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">
              <Plus className="h-3 w-3" /> Add Feature
            </button>
          </div>
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-400 mt-2 shrink-0 w-5">{i + 1}.</span>
                <div className="flex-1 space-y-2">
                  <input value={f.title} onChange={e => updateFeature(i, "title", e.target.value)} placeholder="Feature title"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <textarea value={f.desc} onChange={e => updateFeature(i, "desc", e.target.value)} placeholder="Short description" rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <button onClick={() => removeFeature(i)} className="p-1.5 rounded hover:bg-gray-200 text-red-500 shrink-0 mt-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={saveFeatures} disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Features
          </button>
        </div>
      )}

      {/* ── CTA Banner ── */}
      {section === "cta" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">CTA Banner</h3>
          <p className="text-xs text-gray-500">The call-to-action banner near the bottom of the homepage.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input value={cta.heading} onChange={e => setCta(c => ({ ...c, heading: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
            <textarea value={cta.body} onChange={e => setCta(c => ({ ...c, body: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Label</label>
              <input value={cta.btn1Label} onChange={e => setCta(c => ({ ...c, btn1Label: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Link</label>
              <input value={cta.btn1Link} onChange={e => setCta(c => ({ ...c, btn1Link: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Label</label>
              <input value={cta.btn2Label} onChange={e => setCta(c => ({ ...c, btn2Label: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Link</label>
              <input value={cta.btn2Link} onChange={e => setCta(c => ({ ...c, btn2Link: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
          <button onClick={saveCta} disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save CTA Banner
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL LINKS
// ═══════════════════════════════════════════════════════════════
function SchoolSocialLinks({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolId, setSchoolId] = useState<string>("");
  const [links, setLinks] = useState<Record<string, string>>({
    facebook: "", instagram: "", youtube: "", twitter: "",
    whatsapp: "", linkedin: "", telegram: "", website: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await api.get("/api/schools");
      if (r.success) {
        const arr = Array.isArray(r.data) ? r.data : [r.data];
        const school = arr.find((s: { slug: string }) => s.slug === schoolSlug);
        if (school) {
          setSchoolId(school._id);
          setLinks(prev => ({ ...prev, ...(school.socialLinks || {}) }));
        }
      }
      setLoading(false);
    };
    if (api.token) load();
  }, [api.token]); // eslint-disable-line

  const save = async () => {
    if (!schoolId) return;
    setSaving(true);
    await api.put("/api/schools", { id: schoolId, socialLinks: links });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Manage social media links for this school. These appear in the header and footer.</p>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Social Links</h3>
        <div className="grid grid-cols-2 gap-4">
          {(["facebook", "instagram", "youtube", "twitter", "whatsapp", "linkedin", "telegram", "website"] as const).map(k => (
            <div key={k}>
              <label className="block text-xs text-gray-500 mb-1 capitalize">{k}</label>
              <input
                value={links[k] || ""}
                onChange={e => setLinks(prev => ({ ...prev, [k]: e.target.value }))}
                placeholder={k === "website" ? "https://yoursite.com" : `https://${k}.com/...`}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Social Links
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ALUMNI
// ═══════════════════════════════════════════════════════════════
function SchoolAlumni({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface AlumniItem {
    _id: string; name: string; batch: string; course: string; currentRole: string;
    company?: string; photo?: string; testimonial?: string; isApproved: boolean;
  }
  const [items, setItems] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [detail, setDetail] = useState<AlumniItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/alumni?limit=200&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const toggle = async (id: string, val: boolean) => {
    await api.put(`/api/alumni?school=${schoolSlug}`, { id, isApproved: val });
    load();
    if (detail?._id === id) setDetail(prev => prev ? { ...prev, isApproved: val } : null);
  };

  const remove = async (id: string) => {
    await api.del(`/api/alumni?id=${id}&school=${schoolSlug}`);
    load();
    if (detail?._id === id) setDetail(null);
  };

  const pending = items.filter(i => !i.isApproved);
  const approved = items.filter(i => i.isApproved);
  const list = tab === "pending" ? pending : approved;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Manage alumni registrations and testimonials for this school.</p>

      <div className="flex gap-2">
        <button onClick={() => setTab("pending")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "pending" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab("approved")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "approved" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Approved ({approved.length})
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Batch</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role / Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Testimonial</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map(a => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {a.photo ? (
                      <Image src={a.photo} alt={a.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{a.name.charAt(0)}</div>
                    )}
                    <span className="font-medium text-gray-900">{a.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{a.batch}</td>
                <td className="px-4 py-3 text-gray-500">{a.currentRole}{a.company ? `, ${a.company}` : ""}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{a.testimonial || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setDetail(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="View details"><Pencil className="h-4 w-4" /></button>
                    {!a.isApproved ? (
                      <button onClick={() => toggle(a._id, true)} className="p-1.5 rounded hover:bg-gray-100 text-emerald-600" title="Approve">✓</button>
                    ) : (
                      <button onClick={() => toggle(a._id, false)} className="p-1.5 rounded hover:bg-gray-100 text-amber-600" title="Revoke">✗</button>
                    )}
                    <button onClick={() => remove(a._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No {tab} alumni</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Alumni Details</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                {detail.photo ? (
                  <Image src={detail.photo} alt={detail.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">{detail.name.charAt(0)}</div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{detail.name}</p>
                  <p className="text-sm text-gray-500">Batch {detail.batch} • {detail.course}</p>
                  <p className="text-sm text-gray-500">{detail.currentRole}{detail.company ? ` at ${detail.company}` : ""}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <FileUploader
                  value={detail.photo || ""}
                  onChange={async (url) => {
                    setDetail(prev => prev ? { ...prev, photo: url } : null);
                    await api.put(`/api/alumni?school=${schoolSlug}`, { id: detail._id, photo: url });
                    load();
                  }}
                />
              </div>
              {detail.testimonial && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Testimonial</p>
                  <p className="text-sm text-gray-700 italic">&ldquo;{detail.testimonial}&rdquo;</p>
                </div>
              )}
              <div className="flex gap-2">
                {!detail.isApproved ? (
                  <button onClick={() => toggle(detail._id, true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Approve</button>
                ) : (
                  <button onClick={() => toggle(detail._id, false)} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600">Revoke Approval</button>
                )}
                <button onClick={() => { remove(detail._id); }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMISSIONS
// ═══════════════════════════════════════════════════════════════

function SchoolAdmissions({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface AdmissionItem {
    _id: string; studentName: string; parentName: string; phone: string; email: string;
    class: string; dob: string; gender: string; address: string; previousSchool?: string;
    documents: { name: string; url: string }[]; status: string; createdAt: string;
    sentToSales?: boolean; sentToSalesAt?: string;
  }
  interface SalesPerson { _id: string; name: string; email: string; }
  const [items, setItems] = useState<AdmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<AdmissionItem | null>(null);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [showSalesConfirm, setShowSalesConfirm] = useState(false);
  const [selectedSales, setSelectedSales] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/admissions?limit=200&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);

  // Load sales persons
  const loadSalesPersons = useCallback(async () => {
    const r = await api.get("/api/users?role=sales");
    if (r.success) setSalesPersons(r.data || []);
  }, [api]);

  useEffect(() => { if (api.token) { load(); loadSalesPersons(); } }, [api.token]); // eslint-disable-line

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/api/admissions?school=${schoolSlug}`, { id, status });
    load();
    if (detail?._id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  const handleSendToSales = async () => {
    if (!detail || !selectedSales) return;
    setSending(true);
    const r = await api.post("/api/admissions/send-to-sales", {
      admissionId: detail._id,
      salesUserId: selectedSales,
    });
    setSending(false);
    setShowSalesConfirm(false);
    if (r.success) {
      setDetail(prev => prev ? { ...prev, sentToSales: true, sentToSalesAt: new Date().toISOString() } : null);
      load();
    }
  };

  const statuses = ["", "pending", "reviewed", "accepted", "rejected"];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Review and manage admission applications for this school.</p>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"} ({s ? items.filter(i => i.status === s).length : items.length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sales</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(filter ? items.filter(i => i.status === filter) : items).map(a => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.studentName}</td>
                <td className="px-4 py-3 text-gray-600">{a.class}</td>
                <td className="px-4 py-3 text-gray-600">{a.parentName}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "accepted" ? "bg-green-100 text-green-700" : a.status === "rejected" ? "bg-red-100 text-red-700" : a.status === "reviewed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{a.status}</span></td>
                <td className="px-4 py-3">{a.sentToSales ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Sent</span> : <span className="text-xs text-gray-400">—</span>}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDetail(a)} className="text-gray-400 hover:text-emerald-600"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {(filter ? items.filter(i => i.status === filter) : items).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No admissions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{detail.studentName}</h3>
            <p className="text-xs text-gray-500 mb-4">Lead from: <span className="font-medium text-gray-700">{schoolSlug}</span></p>
            <div className="space-y-2 text-sm">
              <Row label="Parent" value={detail.parentName} />
              <Row label="Phone" value={detail.phone} />
              <Row label="Email" value={detail.email} />
              <Row label="Class" value={detail.class} />
              <Row label="DOB" value={new Date(detail.dob).toLocaleDateString()} />
              <Row label="Gender" value={detail.gender} />
              <Row label="Address" value={detail.address} />
              {detail.previousSchool && <Row label="Prev School" value={detail.previousSchool} />}
              {detail.documents?.length > 0 && (
                <div className="pt-2">
                  <span className="text-gray-500 font-medium">Documents:</span>
                  <ul className="mt-1 space-y-1">
                    {detail.documents.map((d, i) => (
                      <li key={i}><a href={d.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">{d.name}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              <Row label="Status" value={detail.status} />
              <Row label="Applied" value={new Date(detail.createdAt).toLocaleString()} />
              {detail.sentToSales && <Row label="Sent to Sales" value={detail.sentToSalesAt ? new Date(detail.sentToSalesAt).toLocaleString() : "Yes"} />}
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {detail.status !== "accepted" && (
                <button onClick={() => updateStatus(detail._id, "accepted")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Accept</button>
              )}
              {detail.status !== "rejected" && (
                <button onClick={() => updateStatus(detail._id, "rejected")} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center gap-1"><XCircle className="h-4 w-4" /> Reject</button>
              )}
              {detail.status === "pending" && (
                <button onClick={() => updateStatus(detail._id, "reviewed")} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 flex items-center gap-1"><Eye className="h-4 w-4" /> Mark Reviewed</button>
              )}
              <button onClick={() => { setSelectedSales(salesPersons[0]?._id || ""); setShowSalesConfirm(true); }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 flex items-center gap-1">
                <Send className="h-4 w-4" /> Send to Sales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Sales Confirmation Dialog */}
      {showSalesConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowSalesConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Send to Sales Person</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send admission data for <span className="font-medium">{detail?.studentName}</span> to a sales person via email.
            </p>
            {salesPersons.length === 0 ? (
              <p className="text-sm text-red-500 mb-4">No sales persons found. Please create a user with the &quot;sales&quot; role first.</p>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Sales Person</label>
                <select value={selectedSales} onChange={e => setSelectedSales(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  {salesPersons.map(sp => (
                    <option key={sp._id} value={sp._id}>{sp.name} ({sp.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSalesConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={handleSendToSales} disabled={!selectedSales || sending || salesPersons.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-4 py-1"><span className="w-24 text-gray-500 flex-shrink-0 font-medium">{label}</span><span className="text-gray-900">{value}</span></div>;
}

// ═══════════════════════════════════════════════════════════════
// ENQUIRIES
// ═══════════════════════════════════════════════════════════════

function SchoolEnquiries({ schoolSlug }: { schoolSlug: string }) {
  const api = useAdminApi();
  interface EnquiryItem {
    _id: string; name: string; email: string; phone: string; subject: string; message: string; status: string; createdAt: string;
    sentToSales?: boolean; sentToSalesAt?: string;
  }
  interface SalesPerson { _id: string; name: string; email: string; }
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<EnquiryItem | null>(null);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [showSalesConfirm, setShowSalesConfirm] = useState(false);
  const [selectedSales, setSelectedSales] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get(`/api/enquiries?limit=200&school=${schoolSlug}`);
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api, schoolSlug]);

  const loadSalesPersons = useCallback(async () => {
    const r = await api.get("/api/users?role=sales");
    if (r.success) setSalesPersons(r.data || []);
  }, [api]);

  useEffect(() => { if (api.token) { load(); loadSalesPersons(); } }, [api.token]); // eslint-disable-line

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/api/enquiries?school=${schoolSlug}`, { id, status });
    load();
    if (detail?._id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  const handleSendToSales = async () => {
    if (!detail || !selectedSales) return;
    setSending(true);
    const r = await api.post("/api/enquiries/send-to-sales", {
      enquiryId: detail._id,
      salesUserId: selectedSales,
    });
    setSending(false);
    setShowSalesConfirm(false);
    if (r.success) {
      setDetail(prev => prev ? { ...prev, sentToSales: true, sentToSalesAt: new Date().toISOString() } : null);
      load();
    }
  };

  const statuses = ["", "new", "read", "replied"];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Manage contact enquiries submitted to this school.</p>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"} ({s ? items.filter(i => i.status === s).length : items.length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sales</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(filter ? items.filter(i => i.status === filter) : items).map(e => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">{e.subject}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === "replied" ? "bg-green-100 text-green-700" : e.status === "read" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{e.status}</span></td>
                <td className="px-4 py-3">{e.sentToSales ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Sent</span> : <span className="text-xs text-gray-400">—</span>}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setDetail(e); if (e.status === "new") updateStatus(e._id, "read"); }} className="text-gray-400 hover:text-emerald-600"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {(filter ? items.filter(i => i.status === filter) : items).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No enquiries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{detail.name}</h3>
            <p className="text-xs text-gray-500 mb-1">{detail.subject}</p>
            <p className="text-xs text-gray-500 mb-4">Lead from: <span className="font-medium text-gray-700">{schoolSlug}</span></p>
            <div className="space-y-2 text-sm mb-4">
              <Row label="Email" value={detail.email} />
              <Row label="Phone" value={detail.phone} />
              <Row label="Status" value={detail.status} />
              <Row label="Date" value={new Date(detail.createdAt).toLocaleString()} />
              {detail.sentToSales && <Row label="Sent to Sales" value={detail.sentToSalesAt ? new Date(detail.sentToSalesAt).toLocaleString() : "Yes"} />}
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">{detail.message}</div>
            <div className="flex flex-wrap gap-2 mt-6">
              {detail.status !== "replied" && (
                <button onClick={() => updateStatus(detail._id, "replied")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Mark Replied</button>
              )}
              {detail.status === "new" && (
                <button onClick={() => updateStatus(detail._id, "read")} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 flex items-center gap-1"><Eye className="h-4 w-4" /> Mark Read</button>
              )}
              <button onClick={() => { setSelectedSales(salesPersons[0]?._id || ""); setShowSalesConfirm(true); }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 flex items-center gap-1">
                <Send className="h-4 w-4" /> Send to Sales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Sales Confirmation Dialog */}
      {showSalesConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowSalesConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Send to Sales Person</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send enquiry from <span className="font-medium">{detail?.name}</span> to a sales person via email.
            </p>
            {salesPersons.length === 0 ? (
              <p className="text-sm text-red-500 mb-4">No sales persons found. Please create a user with the &quot;sales&quot; role first.</p>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Sales Person</label>
                <select value={selectedSales} onChange={e => setSelectedSales(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  {salesPersons.map(sp => (
                    <option key={sp._id} value={sp._id}>{sp.name} ({sp.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSalesConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={handleSendToSales} disabled={!selectedSales || sending || salesPersons.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
