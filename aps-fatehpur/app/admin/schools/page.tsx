"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FileUploader } from "@/components/admin/FileUploader";
import { Pencil, X, Loader2, Save } from "lucide-react";

interface School {
  _id: string; name: string; slug: string; domain?: string; subdomain?: string;
  logo?: string; favicon?: string;
  theme: { primaryColor: string; secondaryColor: string; accentColor: string };
  contactInfo: { phone: string; email: string; address: string; mapEmbed?: string };
  socialLinks: { facebook?: string; instagram?: string; youtube?: string; twitter?: string };
  stats: { students: number; teachers: number; years: number; awards: number };
  isActive: boolean;
}

export default function AdminSchoolsPage() {
  const api = useAdminApi();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<School | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => { const r = await api.get("/api/schools"); if (r.success) setSchools(Array.isArray(r.data) ? r.data : []); setLoading(false); };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!edit) return; setSaving(true); setMsg("");
    const r = await api.put("/api/schools", { id: edit._id, name: edit.name, logo: edit.logo, favicon: edit.favicon,
      theme: edit.theme, contactInfo: edit.contactInfo, socialLinks: edit.socialLinks, stats: edit.stats, isActive: edit.isActive });
    if (r.success) { setMsg("Saved!"); load(); }
    setSaving(false); setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Schools</h2><p className="text-sm text-gray-500 mt-1">Manage school profiles (superadmin)</p></div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <>
          {!edit ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Active</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {schools.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.slug}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.isActive ? "active" : "inactive"} /></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEdit({ ...s })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Edit: {edit.name}</h3>
                <button onClick={() => { setEdit(null); setMsg(""); }} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input value={edit.name} onChange={e => setEdit(p => p ? { ...p, name: e.target.value } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug (read-only)</label>
                  <input value={edit.slug} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <FileUploader value={edit.logo || ""} onChange={url => setEdit(p => p ? { ...p, logo: url } : p)} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Favicon</label>
                  <FileUploader value={edit.favicon || ""} onChange={url => setEdit(p => p ? { ...p, favicon: url } : p)} /></div>
              </div>

              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">Theme Colors</legend>
                <div className="grid grid-cols-3 gap-4">
                  {(["primaryColor", "secondaryColor", "accentColor"] as const).map(k => (
                    <div key={k}><label className="block text-xs text-gray-500 mb-1 capitalize">{k.replace("Color", "")}</label>
                      <input value={edit.theme[k]} onChange={e => setEdit(p => p ? { ...p, theme: { ...p.theme, [k]: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">Contact Info</legend>
                <div className="grid grid-cols-2 gap-4">
                  {(["phone", "email", "address"] as const).map(k => (
                    <div key={k}><label className="block text-xs text-gray-500 mb-1 capitalize">{k}</label>
                      <input value={edit.contactInfo[k]} onChange={e => setEdit(p => p ? { ...p, contactInfo: { ...p.contactInfo, [k]: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  ))}
                  <div><label className="block text-xs text-gray-500 mb-1">Map Embed</label>
                    <input value={edit.contactInfo.mapEmbed || ""} onChange={e => setEdit(p => p ? { ...p, contactInfo: { ...p.contactInfo, mapEmbed: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                </div>
              </fieldset>

              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">Social Links</legend>
                <div className="grid grid-cols-2 gap-4">
                  {(["facebook", "instagram", "youtube", "twitter"] as const).map(k => (
                    <div key={k}><label className="block text-xs text-gray-500 mb-1 capitalize">{k}</label>
                      <input value={edit.socialLinks[k] || ""} onChange={e => setEdit(p => p ? { ...p, socialLinks: { ...p.socialLinks, [k]: e.target.value } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border border-gray-200 rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">Stats</legend>
                <div className="grid grid-cols-4 gap-4">
                  {(["students", "teachers", "years", "awards"] as const).map(k => (
                    <div key={k}><label className="block text-xs text-gray-500 mb-1 capitalize">{k}</label>
                      <input type="number" value={edit.stats[k]} onChange={e => setEdit(p => p ? { ...p, stats: { ...p.stats, [k]: parseInt(e.target.value) || 0 } } : p)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={edit.isActive} onChange={e => setEdit(p => p ? { ...p, isActive: e.target.checked } : p)} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <div className="flex items-center gap-3">
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
                <button onClick={() => { setEdit(null); setMsg(""); }} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                {msg && <span className="text-sm text-emerald-600 font-medium">{msg}</span>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
