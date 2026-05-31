"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import { FileUploader } from "@/components/admin/FileUploader";
import { Loader2, Save } from "lucide-react";
import { getSchoolBySlug } from "@/config/schools";

interface SchoolSettings {
  _id: string; name: string; slug: string; logo?: string; favicon?: string;
  tagline?: string; description?: string;
  theme: {
    primaryColor: string; primaryDarkColor: string; secondaryColor: string;
    accentColor: string; accentBlueColor: string; accentLimeColor: string;
    bgLightColor: string; textDarkColor: string; textMutedColor: string;
  };
  contactInfo: { phone: string; email: string; address: string; mapEmbed?: string; officeHours?: string };
  stats: { students: number; teachers: number; years: number; awards: number };
}

export default function AdminSettingsPage() {
  const api = useAdminApi();
  const { user } = useAuth();
  const [allSchools, setAllSchools] = useState<SchoolSettings[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [data, setData] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!api.token) return;
    api.get("/api/schools").then(r => {
      if (r.success) {
        const emptyTheme = { primaryColor: "", primaryDarkColor: "", secondaryColor: "", accentColor: "", accentBlueColor: "", accentLimeColor: "", bgLightColor: "", textDarkColor: "", textMutedColor: "" };
        const arr: SchoolSettings[] = (Array.isArray(r.data) ? r.data : [r.data]).map((s: SchoolSettings) => ({
          ...s,
          theme: { ...emptyTheme, ...(s.theme || {}) },
          contactInfo: s.contactInfo || { phone: "", email: "", address: "", mapEmbed: "", officeHours: "" },
          stats: s.stats || { students: 0, teachers: 0, years: 0, awards: 0 },
        }));
        setAllSchools(arr);
        // Auto-select: school_admin sees only their school, superadmin sees first
        const match = user?.schoolSlug ? arr.find(s => s.slug === user.schoolSlug) : null;
        const initial = match || arr[0];
        if (initial) { setSelectedId(initial._id); setData(initial); }
      }
      setLoading(false);
    });
  }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSchoolChange = (id: string) => {
    setSelectedId(id);
    const found = allSchools.find(s => s._id === id);
    if (found) setData(found);
  };

  const save = async () => {
    if (!data) return; setSaving(true);
    await api.put("/api/schools", {
      id: data._id, name: data.name, logo: data.logo, favicon: data.favicon,
      tagline: data.tagline, description: data.description,
      theme: data.theme, contactInfo: data.contactInfo, stats: data.stats,
    });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-400">No school data found</div>;

  // Get static config fallback colors for the current school
  const staticConfig = getSchoolBySlug(data.slug);
  const themeFallbacks: Record<string, string> = {
    primaryColor: staticConfig?.theme.primary || "#499f42",
    primaryDarkColor: staticConfig?.theme.primaryDark || "#3d8a37",
    secondaryColor: staticConfig?.theme.textDark || "#22235b",
    accentColor: staticConfig?.theme.accentYellow || "#d4e96e",
    accentBlueColor: staticConfig?.theme.accentBlue || "#9ab5db",
    accentLimeColor: staticConfig?.theme.accentYellow || "#d4e96e",
    bgLightColor: staticConfig?.theme.bgLight || "#f6faf5",
    textDarkColor: staticConfig?.theme.textDark || "#22235b",
    textMutedColor: staticConfig?.theme.textMuted || "#6B7280",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Settings</h2><p className="text-sm text-gray-500 mt-1">School profile: {data.name}</p></div>
        {user?.role === "superadmin" && allSchools.length > 1 && (
          <select value={selectedId} onChange={e => handleSchoolChange(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {allSchools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
            <input value={data.name} onChange={e => setData(p => p ? { ...p, name: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value={data.slug} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input value={data.tagline || ""} onChange={e => setData(p => p ? { ...p, tagline: e.target.value } : p)} placeholder="e.g. Excellence in Education" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={data.description || ""} onChange={e => setData(p => p ? { ...p, description: e.target.value } : p)} placeholder="Short description for footer" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <FileUploader value={data.logo || ""} onChange={url => setData(p => p ? { ...p, logo: url } : p)} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
            <FileUploader value={data.favicon || ""} onChange={url => setData(p => p ? { ...p, favicon: url } : p)} /></div>
        </div>

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">🎨 Theme Colors</legend>
          <p className="text-xs text-gray-400 mb-4">Customize website colors. Leave empty to use default theme. Changes apply site-wide after save.</p>
          <div className="grid grid-cols-3 gap-4">
            {([
              { key: "primaryColor", label: "Primary", desc: "Main brand color (buttons, nav)" },
              { key: "primaryDarkColor", label: "Primary Dark", desc: "Top bar, hover states" },
              { key: "secondaryColor", label: "Secondary (Navy)", desc: "Headings, footer bg" },
              { key: "accentColor", label: "Accent (Lime)", desc: "Highlights, badges" },
              { key: "accentBlueColor", label: "Accent Blue", desc: "Soft accents, blobs" },
              { key: "accentLimeColor", label: "Accent Lime", desc: "CTA gradients" },
              { key: "bgLightColor", label: "Background Light", desc: "Section backgrounds" },
              { key: "textDarkColor", label: "Text Dark", desc: "Main heading color" },
              { key: "textMutedColor", label: "Text Muted", desc: "Body text, subtitles" },
            ] as const).map(({ key, label, desc }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.theme[key] || themeFallbacks[key] || "#000000"}
                    onChange={e => setData(p => p ? { ...p, theme: { ...p.theme, [key]: e.target.value } } : p)}
                    className="h-9 w-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={data.theme[key] || ""}
                    onChange={e => setData(p => p ? { ...p, theme: { ...p.theme, [key]: e.target.value } } : p)}
                    placeholder={themeFallbacks[key] || "#000000"}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
          {/* Live Preview */}
          <div className="mt-4 p-4 rounded-xl border border-gray-100" style={{ backgroundColor: data.theme.bgLightColor || "#f6faf5" }}>
            <p className="text-xs text-gray-400 mb-2">Preview</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: data.theme.primaryColor }}>Primary</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: data.theme.primaryDarkColor }}>Primary Dark</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: data.theme.secondaryColor }}>Secondary</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: data.theme.accentColor, color: data.theme.textDarkColor }}>Accent</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: data.theme.accentBlueColor }}>Blue</span>
            </div>
            <p className="mt-2 text-sm font-semibold" style={{ color: data.theme.textDarkColor }}>Sample Heading</p>
            <p className="text-xs" style={{ color: data.theme.textMutedColor }}>Sample body text with muted color</p>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">Contact Info</legend>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input value={data.contactInfo.phone} onChange={e => setData(p => p ? { ...p, contactInfo: { ...p.contactInfo, phone: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Email</label>
              <input value={data.contactInfo.email} onChange={e => setData(p => p ? { ...p, contactInfo: { ...p.contactInfo, email: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Address</label>
              <input value={data.contactInfo.address} onChange={e => setData(p => p ? { ...p, contactInfo: { ...p.contactInfo, address: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Office Hours</label>
              <input value={data.contactInfo.officeHours || ""} onChange={e => setData(p => p ? { ...p, contactInfo: { ...p.contactInfo, officeHours: e.target.value } } : p)} placeholder="e.g. Mon - Sat: 8:00 AM - 3:00 PM" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Map Embed URL</label>
              <input value={data.contactInfo.mapEmbed || ""} onChange={e => setData(p => p ? { ...p, contactInfo: { ...p.contactInfo, mapEmbed: e.target.value } } : p)} placeholder="Google Maps embed URL" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium text-gray-700 px-2">Stats</legend>
          <div className="grid grid-cols-4 gap-4">
            {(["students", "teachers", "years", "awards"] as const).map(k => (
              <div key={k}><label className="block text-xs text-gray-500 mb-1 capitalize">{k}</label>
                <input type="number" value={data.stats[k]} onChange={e => setData(p => p ? { ...p, stats: { ...p.stats, [k]: parseInt(e.target.value) || 0 } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings</button>
        </div>
      </div>
    </div>
  );
}
