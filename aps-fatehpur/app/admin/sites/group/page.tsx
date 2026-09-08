"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import { FileUploader } from "@/components/admin/FileUploader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Pencil, Trash2, X, Loader2, GripVertical, ShieldAlert, Film, Play, Upload, Link as LinkIcon } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { toEmbedUrl, isDirectVideoUrl, getVideoThumbnail } from "@/lib/utils";

// ─── Types ───
interface SliderItem {
  _id: string; image: string; title: string; subtitle: string;
  ctaLabel?: string; ctaLink?: string; order: number; isPublished: boolean;
}
interface BranchItem {
  _id: string; name: string; slug: string; logo?: string; description?: string;
  cardImage?: string; cardBgColor?: string; websiteUrl?: string;
  contactInfo?: { address?: string; phone?: string; email?: string };
  stats?: { students?: number; teachers?: number; yearsRunning?: number };
  theme?: { primary?: string; primaryColor?: string };
}
interface GalleryItem { _id: string; image: string; title?: string; type: string; category?: string; videoUrl?: string; }
interface TopperItem { _id: string; name: string; photo?: string; percentage?: number; year?: string; exam?: string; rank?: number; }

type Tab = "homepage" | "sliders" | "branches" | "gallery" | "toppers" | "social";

export default function GroupSiteManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("homepage");

  // Superadmin or apsfatehpur school_admin can manage the group landing page
  if (user?.role !== "superadmin" && user?.schoolSlug !== "apsfatehpur") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <ShieldAlert className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Access Denied</h3>
        <p className="text-sm mt-1">Only superadmins can manage the group landing page.</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "homepage", label: "Homepage" },
    { key: "sliders", label: "Hero Sliders" },
    { key: "branches", label: "Branches" },
    { key: "gallery", label: "Gallery" },
    { key: "toppers", label: "Toppers" },
    { key: "social", label: "Social Links" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Group Landing Page</h2>
        <p className="text-sm text-gray-500 mt-1">Manage all content for the group homepage</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "homepage" && <GroupHomepageTab />}
      {activeTab === "sliders" && <SlidersTab />}
      {activeTab === "branches" && <BranchesTab />}
      {activeTab === "gallery" && <GalleryTab />}
      {activeTab === "toppers" && <ToppersTab />}
      {activeTab === "social" && <GroupSocialLinksTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SLIDERS TAB
// ═══════════════════════════════════════════════════════════════
function SlidersTab() {
  const api = useAdminApi();
  const [items, setItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "", order: 0, isPublished: true });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await api.get("/api/sliders?scope=group&limit=50");
    if (r.success) setItems(r.data);
    setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "", order: items.length, isPublished: true }); setOpen(true); };
  const doEdit = (s: SliderItem) => { setEditId(s._id); setForm({ image: s.image, title: s.title, subtitle: s.subtitle || "", ctaLabel: s.ctaLabel || "", ctaLink: s.ctaLink || "", order: s.order, isPublished: s.isPublished }); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const payload = { ...form, scope: "group" };
    const r = editId ? await api.put("/api/sliders", { id: editId, ...payload }) : await api.post("/api/sliders", payload);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/sliders?id=${delId}`); setDelId(null); load(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{items.length} slide{items.length !== 1 ? "s" : ""}</p>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Slide
        </button>
      </div>

      <div className="grid gap-4">
        {items.sort((a, b) => a.order - b.order).map((s) => (
          <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-center">
            <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
            <div className="w-32 h-20 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {s.image && <Image src={s.image} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{s.title || "Untitled"}</p>
              <p className="text-sm text-gray-500 truncate">{s.subtitle}</p>
              {s.ctaLabel && <p className="text-xs text-emerald-600 mt-1">CTA: {s.ctaLabel} → {s.ctaLink}</p>}
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
        {items.length === 0 && <p className="text-center text-gray-400 py-8">No hero sliders yet. Add your first slide.</p>}
      </div>

      {/* Slider Modal */}
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
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
                  <input value={form.ctaLabel} onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))} placeholder="e.g. Learn More" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="e.g. /about" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Published (visible on site)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.image} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Slide" description="This will permanently remove this slide." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BRANCHES TAB
// ═══════════════════════════════════════════════════════════════
function BranchesTab() {
  const api = useAdminApi();
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<BranchItem | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await api.get("/api/schools");
    if (r.success) setBranches(r.data);
    setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const save = async () => {
    if (!editItem) return;
    setSaving(true);
    const r = await api.put("/api/schools", {
      id: editItem._id, name: editItem.name, logo: editItem.logo,
      cardImage: editItem.cardImage, cardBgColor: editItem.cardBgColor,
      websiteUrl: editItem.websiteUrl,
      description: editItem.description, contactInfo: editItem.contactInfo,
      stats: editItem.stats,
      theme: editItem.theme?.primary ? { primaryColor: editItem.theme.primary } : undefined,
    });
    if (r.success) { setEditItem(null); load(); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Edit branch schools displayed on the group landing page.</p>

      <div className="grid gap-4">
        {branches.map((b) => (
          <div key={b._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              {b.logo ? <Image src={b.logo} alt="" width={48} height={48} className="object-contain" /> : <span className="text-lg font-bold text-gray-400">{b.name?.charAt(0)}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{b.name}</p>
              <p className="text-xs text-gray-500">{b.slug} • {b.contactInfo?.phone || "No phone"}</p>
            </div>
            <button onClick={() => setEditItem({ ...b, theme: { primary: b.theme?.primaryColor || b.theme?.primary || "#3FA34D" } })} className="px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50">Edit</button>
          </div>
        ))}
      </div>

      {/* Edit Branch Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Edit Branch: {editItem.name}</h3>
              <button onClick={() => setEditItem(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <FileUploader value={editItem.logo || ""} onChange={url => setEditItem({ ...editItem, logo: url })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Card Background Image</label>
                <p className="text-xs text-gray-400 mb-1">Shown as the branch card background on the group landing page</p>
                <FileUploader value={editItem.cardImage || ""} onChange={url => setEditItem({ ...editItem, cardImage: url })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Card Background Color</label>
                <p className="text-xs text-gray-400 mb-1">Used as card bg when no image is set, or as overlay tint</p>
                <input type="color" value={editItem.cardBgColor || "#1a2556"} onChange={e => setEditItem({ ...editItem, cardBgColor: e.target.value })} className="h-10 w-20 rounded cursor-pointer" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input value={editItem.websiteUrl || ""} onChange={e => setEditItem({ ...editItem, websiteUrl: e.target.value })} placeholder="https://apsgirls.com" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editItem.description || ""} onChange={e => setEditItem({ ...editItem, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                <input type="color" value={editItem.theme?.primary || "#3FA34D"} onChange={e => setEditItem({ ...editItem, theme: { ...editItem.theme, primary: e.target.value } })} className="h-10 w-20 rounded cursor-pointer" /></div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Contact Info</p>
              <div className="grid grid-cols-1 gap-3">
                <input value={editItem.contactInfo?.address || ""} onChange={e => setEditItem({ ...editItem, contactInfo: { ...editItem.contactInfo, address: e.target.value } })} placeholder="Address" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={editItem.contactInfo?.phone || ""} onChange={e => setEditItem({ ...editItem, contactInfo: { ...editItem.contactInfo, phone: e.target.value } })} placeholder="Phone" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={editItem.contactInfo?.email || ""} onChange={e => setEditItem({ ...editItem, contactInfo: { ...editItem.contactInfo, email: e.target.value } })} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Stats</p>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Students</label>
                  <input type="number" value={editItem.stats?.students || ""} onChange={e => setEditItem({ ...editItem, stats: { ...editItem.stats, students: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Teachers</label>
                  <input type="number" value={editItem.stats?.teachers || ""} onChange={e => setEditItem({ ...editItem, stats: { ...editItem.stats, teachers: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Years</label>
                  <input type="number" value={editItem.stats?.yearsRunning || ""} onChange={e => setEditItem({ ...editItem, stats: { ...editItem.stats, yearsRunning: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setEditItem(null)} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GALLERY TAB
// ═══════════════════════════════════════════════════════════════
function GalleryTab() {
  const api = useAdminApi();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ image: "", title: "", type: "image", category: "general", videoUrl: "" });
  const [videoSource, setVideoSource] = useState<"upload" | "url">("upload");
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("all");
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await api.get("/api/gallery?scope=all&limit=100");
    if (r.success) setItems(r.data);
    setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const close = () => {
    setOpen(false);
    setForm({ image: "", title: "", type: "image", category: "general", videoUrl: "" });
    setVideoSource("upload");
  };

  const save = async () => {
    setSaving(true);
    let finalImage = form.image;
    if (form.type === "video" && !finalImage && form.videoUrl) {
      finalImage = getVideoThumbnail(form.videoUrl);
    }
    const payload = {
      ...form,
      image: finalImage,
      videoUrl: form.type === "video" && form.videoUrl ? form.videoUrl.trim() : undefined,
    };
    const r = await api.post("/api/gallery", payload);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/gallery?id=${delId}`); setDelId(null); load(); };

  const categories = ["all", ...Array.from(new Set(items.map(g => g.category || "general")))];
  const filtered = catFilter === "all" ? items : items.filter(g => (g.category || "general") === catFilter);

  const isFormValid =
    form.type === "image"
      ? Boolean(form.image)
      : Boolean(form.videoUrl || form.image);

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
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((g) => (
          <div key={g._id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square shadow-xs">
            <div className="w-full h-full cursor-pointer relative" onClick={() => setPreviewItem(g)}>
              {g.image ? (
                <Image src={g.image} alt={g.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                  <Film className="h-8 w-8" />
                </div>
              )}
              {g.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                    <Play className="h-5 w-5 ml-0.5 text-emerald-600" />
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-1 left-1">
              <span className="px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-full uppercase tracking-wider">{g.category || "general"}</span>
            </div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setDelId(g._id)} className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700 shadow-xs"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {g.title && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">{g.title}</div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No items found</div>}
      </div>

      {/* Upload Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Item</h3>
              <button onClick={close} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Type Switcher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "image" }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${
                      form.type === "image"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "video" }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${
                      form.type === "video"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Film className="h-4 w-4" /> Video
                  </button>
                </div>
              </div>

              {/* Photo Mode */}
              {form.type === "image" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                  <FileUploader value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} accept="image/*" label="Upload Photo" />
                </div>
              )}

              {/* Video Mode */}
              {form.type === "video" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Video Source</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoSource("upload")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                          videoSource === "upload" ? "bg-white border-emerald-500 text-emerald-700 shadow-xs font-semibold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Video File
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSource("url")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                          videoSource === "url" ? "bg-white border-emerald-500 text-emerald-700 shadow-xs font-semibold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <LinkIcon className="h-3.5 w-3.5" /> YouTube / Video URL
                      </button>
                    </div>
                  </div>

                  {videoSource === "upload" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video File * <span className="text-xs text-gray-400 font-normal">(MP4, WebM, MOV up to 50MB)</span>
                      </label>
                      <FileUploader
                        value={form.videoUrl}
                        onChange={(url) => {
                          setForm(f => {
                            const autoThumb = !f.image && url.includes("/video/upload/") ? url.replace(/\.[^/.]+$/, ".jpg") : f.image;
                            return { ...f, videoUrl: url, image: autoThumb };
                          });
                        }}
                        accept="video/*"
                        label="Upload Video"
                        hideLibrary
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL * <span className="text-xs text-gray-400 font-normal">(YouTube, Vimeo, or direct link)</span>
                      </label>
                      <input
                        type="url"
                        value={form.videoUrl}
                        onChange={(e) => {
                          const url = e.target.value;
                          setForm(f => {
                            const autoThumb = !f.image ? getVideoThumbnail(url) : f.image;
                            return { ...f, videoUrl: url, image: autoThumb };
                          });
                        }}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poster / Thumbnail <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <FileUploader
                      value={form.image}
                      onChange={url => setForm(f => ({ ...f, image: url }))}
                      accept="image/*"
                      label="Upload Custom Thumbnail"
                    />
                    {!form.image && (
                      <p className="text-xs text-gray-500 mt-1">
                        {form.videoUrl ? "Thumbnail will be auto-generated from your video." : "A poster frame will be generated automatically once a video is selected."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Caption (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. sports, event, annual function" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" list="gallery-categories-group" />
                <datalist id="gallery-categories-group">
                  <option value="sports" /><option value="event" /><option value="annual function" /><option value="cultural" /><option value="infrastructure" /><option value="classroom" /><option value="general" />
                </datalist>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-white">Cancel</button>
              <button onClick={save} disabled={saving || !isFormValid} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-sm">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Add to Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="relative max-w-3xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white">
              <X className="h-5 w-5" />
            </button>
            {previewItem.type === "video" && previewItem.videoUrl ? (
              isDirectVideoUrl(previewItem.videoUrl) ? (
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                  <video src={previewItem.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="aspect-video w-full">
                  <iframe src={toEmbedUrl(previewItem.videoUrl)} title={previewItem.title || "Video"} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              )
            ) : previewItem.image ? (
              <div className="relative aspect-video w-full bg-black">
                <Image src={previewItem.image} alt={previewItem.title || ""} fill className="object-contain" />
              </div>
            ) : null}
            {previewItem.title && (
              <div className="p-4 bg-gray-900 text-white text-sm">
                <p className="font-medium">{previewItem.title}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Item" description="This will permanently remove this gallery item." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOPPERS TAB
// ═══════════════════════════════════════════════════════════════
function ToppersTab() {
  const api = useAdminApi();
  const [items, setItems] = useState<TopperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", photo: "", percentage: 0, year: new Date().getFullYear().toString(), exam: "Board", rank: 1 });
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await api.get("/api/toppers?limit=50");
    if (r.success) setItems(r.data);
    setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line

  const doCreate = () => { setEditId(null); setForm({ name: "", photo: "", percentage: 0, year: new Date().getFullYear().toString(), exam: "Board", rank: 1 }); setOpen(true); };
  const doEdit = (t: TopperItem) => { setEditId(t._id); setForm({ name: t.name, photo: t.photo || "", percentage: t.percentage || 0, year: t.year || "", exam: t.exam || "Board", rank: t.rank || 1 }); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  const save = async () => {
    setSaving(true);
    const r = editId ? await api.put("/api/toppers", { id: editId, ...form }) : await api.post("/api/toppers", form);
    if (r.success) { close(); load(); }
    setSaving(false);
  };
  const remove = async () => { if (!delId) return; await api.del(`/api/toppers?id=${delId}`); setDelId(null); load(); };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{items.length} topper{items.length !== 1 ? "s" : ""}</p>
        <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Topper
        </button>
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

      {/* Topper Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Topper" : "Add Topper"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <FileUploader value={form.photo} onChange={url => setForm(f => ({ ...f, photo: url }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Percentage</label>
                  <input type="number" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Rank</label>
                  <input type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <input value={form.exam} onChange={e => setForm(f => ({ ...f, exam: e.target.value }))} placeholder="e.g. Board, NEET, JEE" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
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

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Topper" description="This will permanently remove this topper." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GROUP HOMEPAGE
// ═══════════════════════════════════════════════════════════════
function GroupHomepageTab() {
  const api = useAdminApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // About
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [aboutTitle, setAboutTitle] = useState("A Legacy of Educational Excellence");
  const [aboutContent, setAboutContent] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [aboutSignoff, setAboutSignoff] = useState("— Chairman, A.P.S School");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await api.get("/api/pages?limit=50&school=apsfatehpur");
      if (r.success && r.data?.length) {
        for (const p of r.data) {
          if (p.slug === "group-about") {
            setAboutId(p._id);
            setAboutTitle(p.title || "A Legacy of Educational Excellence");
            setAboutContent(p.content || "");
            setAboutImage(p.featuredImage || "");
            if (p.seo?.metaDescription) setAboutSignoff(p.seo.metaDescription);
          }
        }
      }
      setLoading(false);
    };
    if (api.token) load();
  }, [api.token]); // eslint-disable-line

  const saveAbout = async () => {
    setSaving(true);
    const payload = {
      slug: "group-about", title: aboutTitle, content: aboutContent,
      featuredImage: aboutImage, isPublished: true,
      seo: { metaDescription: aboutSignoff },
    };
    const r = aboutId
      ? await api.put(`/api/pages?school=apsfatehpur`, { id: aboutId, ...payload })
      : await api.post(`/api/pages?school=apsfatehpur`, payload);
    if (r.success && r.data?._id) setAboutId(r.data._id);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">Manage the group landing page sections.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">About Us Section</h3>
        <p className="text-xs text-gray-500">This appears on the group landing page under &quot;About Us&quot;.</p>
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
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save About Section
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL LINKS (Group)
// ═══════════════════════════════════════════════════════════════
function GroupSocialLinksTab() {
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
        // Group page uses the "apsfatehpur" school as the main/group entity
        const school = arr.find((s: { slug: string }) => s.slug === "apsfatehpur");
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
      <p className="text-sm text-gray-600">Manage social media links for the group. These appear in the header and footer of the group landing page.</p>
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
