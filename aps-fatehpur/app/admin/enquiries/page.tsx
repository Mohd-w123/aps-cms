"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Loader2, Eye, X } from "lucide-react";

interface Enquiry {
  _id: string; name: string; email: string; phone: string; subject: string; message: string; status: string; createdAt: string;
}

export default function AdminEnquiriesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<Enquiry | null>(null);

  const load = async () => {
    const url = `/api/enquiries?limit=100${filter ? `&status=${filter}` : ""}`;
    const r = await api.get(url); if (r.success) setItems(r.data); setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await api.put("/api/enquiries", { id, status });
    load(); if (detail?._id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Enquiries</h2><p className="text-sm text-gray-500 mt-1">Manage contact enquiries</p></div>

      <div className="flex gap-2">
        {["", "new", "read", "replied"].map(s => (
          <button key={s} onClick={() => { setFilter(s); setLoading(true); }} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(e => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{e.subject}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setDetail(e); if (e.status === "new") updateStatus(e._id, "read"); }}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No enquiries found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Enquiry from {detail.name}</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex gap-4"><span className="w-20 text-gray-500">Email</span><span className="text-gray-900">{detail.email}</span></div>
              <div className="flex gap-4"><span className="w-20 text-gray-500">Phone</span><span className="text-gray-900">{detail.phone}</span></div>
              <div className="flex gap-4"><span className="w-20 text-gray-500">Subject</span><span className="text-gray-900 font-medium">{detail.subject}</span></div>
              <div className="flex gap-4"><span className="w-20 text-gray-500">Status</span><StatusBadge status={detail.status} /></div>
              <div className="pt-2 border-t border-gray-100"><p className="text-gray-500 mb-1">Message:</p><p className="text-gray-900 whitespace-pre-wrap">{detail.message}</p></div>
              <div className="flex gap-2 pt-3">
                <button onClick={() => updateStatus(detail._id, "read")} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Mark Read</button>
                <button onClick={() => updateStatus(detail._id, "replied")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Mark Replied</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
