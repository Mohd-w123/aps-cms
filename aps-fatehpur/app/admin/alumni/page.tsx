"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Loader2, CheckCircle, XCircle, Eye, X } from "lucide-react";

interface AlumniItem {
  _id: string; name: string; batch: string; course: string; currentRole: string;
  company?: string; photo?: string; testimonial?: string; isApproved: boolean; createdAt: string;
}

export default function AdminAlumniPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AlumniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [detail, setDetail] = useState<AlumniItem | null>(null);

  const load = async () => {
    const r = await api.get("/api/alumni?limit=200");
    if (r.success) setItems(r.data); setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (id: string, val: boolean) => {
    await api.put("/api/alumni", { id, isApproved: val }); load();
    if (detail?._id === id) setDetail(prev => prev ? { ...prev, isApproved: val } : null);
  };

  const pending = items.filter(i => !i.isApproved);
  const approved = items.filter(i => i.isApproved);
  const list = tab === "pending" ? pending : approved;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Alumni</h2><p className="text-sm text-gray-500 mt-1">Manage alumni registrations</p></div>

      <div className="flex gap-2">
        <button onClick={() => setTab("pending")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "pending" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Pending ({pending.length})</button>
        <button onClick={() => setTab("approved")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === "approved" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Approved ({approved.length})</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Batch</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role / Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {list.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.batch}</td>
                  <td className="px-4 py-3 text-gray-500">{a.currentRole}{a.company ? `, ${a.company}` : ""}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.isApproved ? "approved" : "pending"} /></td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <button onClick={() => setDetail(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                    {!a.isApproved ? (
                      <button onClick={() => toggle(a._id, true)} className="p-1.5 rounded hover:bg-gray-100 text-emerald-600"><CheckCircle className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => toggle(a._id, false)} className="p-1.5 rounded hover:bg-gray-100 text-red-500"><XCircle className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>))}
              {list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No {tab} alumni</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">{detail.name}</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {detail.photo && <div className="relative w-20 h-20 rounded-full overflow-hidden"><Image src={detail.photo} alt="" fill className="object-cover" /></div>}
              <div className="flex gap-4"><span className="w-24 text-gray-500">Batch</span><span className="text-gray-900">{detail.batch}</span></div>
              <div className="flex gap-4"><span className="w-24 text-gray-500">Course</span><span className="text-gray-900">{detail.course}</span></div>
              <div className="flex gap-4"><span className="w-24 text-gray-500">Current Role</span><span className="text-gray-900">{detail.currentRole}</span></div>
              {detail.company && <div className="flex gap-4"><span className="w-24 text-gray-500">Company</span><span className="text-gray-900">{detail.company}</span></div>}
              {detail.testimonial && <div className="pt-2 border-t border-gray-100"><p className="text-gray-500 mb-1">Testimonial:</p><p className="text-gray-900 italic">&ldquo;{detail.testimonial}&rdquo;</p></div>}
              <div className="flex gap-2 pt-3">
                {!detail.isApproved ? (
                  <button onClick={() => toggle(detail._id, true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Approve</button>
                ) : (
                  <button onClick={() => toggle(detail._id, false)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Revoke</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
