"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Loader2, Eye, X } from "lucide-react";

interface Admission {
  _id: string; studentName: string; parentName: string; phone: string; email: string;
  class: string; dob: string; gender: string; address: string; previousSchool?: string;
  documents: { name: string; url: string }[]; status: string; createdAt: string;
}

export default function AdminAdmissionsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<Admission | null>(null);

  const load = async () => {
    const url = `/api/admissions?limit=100${filter ? `&status=${filter}` : ""}`;
    const r = await api.get(url); if (r.success) setItems(r.data); setLoading(false);
  };
  useEffect(() => { if (api.token) load(); }, [api.token, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await api.put("/api/admissions", { id, status });
    load(); if (detail?._id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  const statuses = ["", "pending", "reviewed", "accepted", "rejected"];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Admissions</h2><p className="text-sm text-gray-500 mt-1">Review admission applications</p></div>

      <div className="flex gap-2">
        {statuses.map(s => (
          <button key={s} onClick={() => { setFilter(s); setLoading(true); }} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{a.class}</td>
                  <td className="px-4 py-3 text-gray-500">{a.parentName}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                    <button onClick={() => setDetail(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                    {a.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(a._id, "accepted")} className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Accept</button>
                        <button onClick={() => updateStatus(a._id, "rejected")} className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200">Reject</button>
                      </>
                    )}
                  </td>
                </tr>))}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No admissions found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Admission Details</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <Row label="Student" value={detail.studentName} />
              <Row label="DOB" value={new Date(detail.dob).toLocaleDateString("en-IN")} />
              <Row label="Gender" value={detail.gender} />
              <Row label="Class" value={detail.class} />
              <Row label="Parent" value={detail.parentName} />
              <Row label="Phone" value={detail.phone} />
              <Row label="Email" value={detail.email} />
              <Row label="Address" value={detail.address} />
              {detail.previousSchool && <Row label="Prev School" value={detail.previousSchool} />}
              <Row label="Status" value={detail.status} />
              {detail.documents.length > 0 && (
                <div className="pt-2">
                  <p className="font-medium text-gray-700 mb-1">Documents:</p>
                  {detail.documents.map((d, i) => (
                    <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="block text-emerald-600 underline text-xs">{d.name}</a>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-3">
                <button onClick={() => updateStatus(detail._id, "accepted")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Accept</button>
                <button onClick={() => updateStatus(detail._id, "rejected")} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Reject</button>
                <button onClick={() => updateStatus(detail._id, "reviewed")} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50">Mark Reviewed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-4"><span className="w-24 text-gray-500 flex-shrink-0">{label}</span><span className="text-gray-900">{value}</span></div>;
}
