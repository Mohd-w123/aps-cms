"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import { FileUploader } from "@/components/admin/FileUploader";
import { Loader2, Save } from "lucide-react";

interface SchoolSettings {
  _id: string; name: string; slug: string; logo?: string; favicon?: string;
  tagline?: string; description?: string;
  theme: { primaryColor: string; secondaryColor: string; accentColor: string };
  contactInfo: { phone: string; email: string; address: string; mapEmbed?: string; officeHours?: string };
  socialLinks: { facebook?: string; instagram?: string; youtube?: string; twitter?: string };
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
        const arr: SchoolSettings[] = (Array.isArray(r.data) ? r.data : [r.data]).map((s: SchoolSettings) => ({
          ...s,
          theme: s.theme || { primaryColor: "", secondaryColor: "", accentColor: "" },
          contactInfo: s.contactInfo || { phone: "", email: "", address: "", mapEmbed: "", officeHours: "" },
          socialLinks: s.socialLinks || { facebook: "", instagram: "", youtube: "", twitter: "" },
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
      theme: data.theme, contactInfo: data.contactInfo, socialLinks: data.socialLinks, stats: data.stats,
    });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-400">No school data found</div>;

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
          <legend className="text-sm font-medium text-gray-700 px-2">Social Links</legend>
          <div className="grid grid-cols-2 gap-4">
            {(["facebook", "instagram", "youtube", "twitter"] as const).map(k => (
              <div key={k}><label className="block text-xs text-gray-500 mb-1 capitalize">{k}</label>
                <input value={data.socialLinks[k] || ""} onChange={e => setData(p => p ? { ...p, socialLinks: { ...p.socialLinks, [k]: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            ))}
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
