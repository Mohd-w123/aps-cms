"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Loader2, Eye, X, Send, CheckCircle2, XCircle, Download } from "lucide-react";

interface Admission {
  _id: string; studentName: string; parentName: string; phone: string; email: string;
  class: string; dob: string; gender: string; address: string; previousSchool?: string;
  documents: { name: string; url: string }[]; status: string; createdAt: string;
  sentToSales?: boolean; sentToSalesAt?: string;
}
interface SalesPerson { _id: string; name: string; email: string; }

export default function AdminAdmissionsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<Admission | null>(null);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [showSalesConfirm, setShowSalesConfirm] = useState(false);
  const [selectedSales, setSelectedSales] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get("/api/admissions?limit=200");
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api]);

  const loadSalesPersons = useCallback(async () => {
    const r = await api.get("/api/users?role=sales");
    if (r.success) setSalesPersons(r.data || []);
  }, [api]);

  useEffect(() => { if (api.token) { load(); loadSalesPersons(); } }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await api.put("/api/admissions", { id, status });
    load(); if (detail?._id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  // Bulk send all filtered items to sales
  const handleBulkSendToSales = async () => {
    if (!selectedSales || filtered.length === 0) return;
    setSending(true);
    const r = await api.post("/api/admissions/send-to-sales", {
      admissionIds: filtered.map(a => a._id),
      salesUserId: selectedSales,
    });
    setSending(false);
    setShowSalesConfirm(false);
    if (r.success) load();
  };

  // Export to Excel (CSV)
  const exportToExcel = () => {
    const headers = ["Student Name", "Parent Name", "Phone", "Email", "Class", "DOB", "Gender", "Address", "Previous School", "Status", "Sent to Sales", "Applied Date"];
    const rows = filtered.map(a => [
      a.studentName, a.parentName, a.phone, a.email, a.class,
      new Date(a.dob).toLocaleDateString("en-IN"), a.gender, a.address,
      a.previousSchool || "", a.status, a.sentToSales ? "Yes" : "No",
      new Date(a.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `admissions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statuses = ["", "pending", "reviewed", "accepted", "rejected"];
  const filtered = filter ? items.filter(i => i.status === filter) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-bold text-gray-900">Admissions</h2><p className="text-sm text-gray-500 mt-1">Review admission applications</p></div>
        <div className="flex gap-2">
          <button onClick={() => { setSelectedSales(salesPersons[0]?._id || ""); setShowSalesConfirm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700">
            <Send className="h-4 w-4" /> Send to Sales ({filtered.length})
          </button>
          <button onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
            <Download className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${filter === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s || "All"} ({s ? items.filter(i => i.status === s).length : items.length})
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sales</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{a.class}</td>
                  <td className="px-4 py-3 text-gray-500">{a.parentName}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">{a.sentToSales ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Sent</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDetail(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No admissions found</td></tr>}
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
              {detail.sentToSales && <Row label="Sent to Sales" value={detail.sentToSalesAt ? new Date(detail.sentToSalesAt).toLocaleString() : "Yes"} />}
              {detail.documents.length > 0 && (
                <div className="pt-2">
                  <p className="font-medium text-gray-700 mb-1">Documents:</p>
                  {detail.documents.map((d, i) => (
                    <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="block text-emerald-600 underline text-xs">{d.name}</a>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-3">
                {detail.status !== "accepted" && (
                  <button onClick={() => updateStatus(detail._id, "accepted")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Accept</button>
                )}
                {detail.status !== "rejected" && (
                  <button onClick={() => updateStatus(detail._id, "rejected")} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 flex items-center gap-1"><XCircle className="h-4 w-4" /> Reject</button>
                )}
                {detail.status === "pending" && (
                  <button onClick={() => updateStatus(detail._id, "reviewed")} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"><Eye className="h-4 w-4" /> Mark Reviewed</button>
                )}
              </div>
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
              Send <span className="font-medium">{filtered.length} admission(s)</span> {filter ? `(${filter})` : "(all)"} to a sales person via email.
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
              <button onClick={handleBulkSendToSales} disabled={!selectedSales || sending || salesPersons.length === 0 || filtered.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending..." : `Confirm & Send (${filtered.length})`}
              </button>
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
