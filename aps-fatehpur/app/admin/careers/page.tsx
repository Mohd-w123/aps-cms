"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Plus, Pencil, Trash2, X, Loader2, Eye } from "lucide-react";

/* ── Types ── */
interface Career {
  _id: string; title: string; department: string; description: string; qualifications: string;
  experience?: string; salary?: string; isActive: boolean; deadline?: string;
}
interface Application {
  _id: string; careerId: string; name: string; email: string; phone: string;
  resume: string; coverLetter?: string; status: string; appliedAt: string;
}
interface Form { title: string; department: string; description: string; qualifications: string; experience: string; salary: string; isActive: boolean; deadline: string; }
const empty: Form = { title: "", department: "", description: "", qualifications: "", experience: "", salary: "", isActive: true, deadline: "" };

export default function AdminCareersPage() {
  const api = useAdminApi();
  const [tab, setTab] = useState<"jobs" | "apps">("jobs");

  // Jobs state
  const [jobs, setJobs] = useState<Career[]>([]);
  const [jobLoading, setJobLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  // Applications state
  const [apps, setApps] = useState<Application[]>([]);
  const [appLoading, setAppLoading] = useState(true);
  const [appDetail, setAppDetail] = useState<Application | null>(null);

  const loadJobs = async () => { const r = await api.get("/api/careers?limit=100"); if (r.success) setJobs(r.data); setJobLoading(false); };
  const loadApps = async () => { const r = await api.get("/api/careers/apply?limit=200"); if (r.success) setApps(Array.isArray(r.data) ? r.data : []); setAppLoading(false); };

  useEffect(() => { if (api.token) { loadJobs(); loadApps(); } }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const doCreate = () => { setEditId(null); setForm(empty); setOpen(true); };
  const doEdit = (c: Career) => {
    setEditId(c._id); setForm({ title: c.title, department: c.department, description: c.description, qualifications: c.qualifications,
      experience: c.experience || "", salary: c.salary || "", isActive: c.isActive, deadline: c.deadline ? c.deadline.slice(0, 10) : "" }); setOpen(true);
  };
  const close = () => { setOpen(false); setEditId(null); setForm(empty); };

  const save = async () => {
    setSaving(true);
    const body = { ...form, deadline: form.deadline || undefined };
    const r = editId ? await api.put("/api/careers", { id: editId, ...body }) : await api.post("/api/careers", body);
    if (r.success) { close(); loadJobs(); } setSaving(false);
  };

  const remove = async () => { if (!delId) return; await api.del(`/api/careers?id=${delId}`); setDelId(null); loadJobs(); };

  const updateAppStatus = async (id: string, status: string) => {
    await api.put("/api/careers/apply", { id, status });
    loadApps(); if (appDetail?._id === id) setAppDetail(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-900">Careers</h2><p className="text-sm text-gray-500 mt-1">Manage job postings & applications</p></div>
        {tab === "jobs" && <button onClick={doCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add Job</button>}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("jobs")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "jobs" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Job Postings</button>
        <button onClick={() => setTab("apps")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "apps" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Applications ({apps.length})</button>
      </div>

      {/* Job Postings Table */}
      {tab === "jobs" && (
        jobLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Deadline</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map(j => (
                  <tr key={j._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{j.title}</td>
                    <td className="px-4 py-3 text-gray-500">{j.department}</td>
                    <td className="px-4 py-3"><StatusBadge status={j.isActive ? "active" : "inactive"} /></td>
                    <td className="px-4 py-3 text-gray-500">{j.deadline ? new Date(j.deadline).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => doEdit(j)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDelId(j._id)} className="p-1.5 rounded hover:bg-gray-100 text-red-500 ml-1"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>))}
                {jobs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No job postings</td></tr>}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Applications Table */}
      {tab === "apps" && (
        appLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Applicant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {apps.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(a.appliedAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setAppDetail(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                    </td>
                  </tr>))}
                {apps.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No applications</td></tr>}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Create/Edit Job Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editId ? "Edit Job" : "Create Job"}</h3>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <RichTextEditor value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <RichTextEditor value={form.qualifications} onChange={v => setForm(f => ({ ...f, qualifications: v }))} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="e.g. 2-3 years" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. ₹25,000/month" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={close} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.title || !form.department} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {appDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Application from {appDetail.name}</h3>
              <button onClick={() => setAppDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex gap-4"><span className="w-24 text-gray-500">Email</span><span className="text-gray-900">{appDetail.email}</span></div>
              <div className="flex gap-4"><span className="w-24 text-gray-500">Phone</span><span className="text-gray-900">{appDetail.phone}</span></div>
              <div className="flex gap-4"><span className="w-24 text-gray-500">Status</span><StatusBadge status={appDetail.status} /></div>
              {appDetail.resume && (
                <div className="flex gap-4"><span className="w-24 text-gray-500">Resume</span><a href={appDetail.resume} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">View Resume</a></div>
              )}
              {appDetail.coverLetter && <div className="pt-2 border-t border-gray-100"><p className="text-gray-500 mb-1">Cover Letter:</p><p className="text-gray-900 whitespace-pre-wrap">{appDetail.coverLetter}</p></div>}
              <div className="flex gap-2 pt-3">
                <button onClick={() => updateAppStatus(appDetail._id, "shortlisted")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Shortlist</button>
                <button onClick={() => updateAppStatus(appDetail._id, "rejected")} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!delId} onOpenChange={() => setDelId(null)} title="Delete Job" description="This will permanently delete this job posting." confirmLabel="Delete" onConfirm={remove} destructive />
    </div>
  );
}
