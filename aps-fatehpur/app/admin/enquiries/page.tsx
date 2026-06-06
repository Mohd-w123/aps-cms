"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Loader2, Eye, X, Send, MessageSquare } from "lucide-react";

interface Enquiry {
  _id: string; name: string; email: string; phone: string; subject: string; message: string; status: string; createdAt: string;
  sentToSales?: boolean; sentToSalesAt?: string;
}
interface SalesPerson { _id: string; name: string; email: string; }

export default function AdminEnquiriesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<Enquiry | null>(null);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [showSalesConfirm, setShowSalesConfirm] = useState(false);
  const [selectedSales, setSelectedSales] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get("/api/enquiries?limit=200");
    if (r.success) setItems(r.data);
    setLoading(false);
  }, [api]);

  const loadSalesPersons = useCallback(async () => {
    const r = await api.get("/api/users?role=sales");
    if (r.success) setSalesPersons(r.data || []);
  }, [api]);

  useEffect(() => { if (api.token) { load(); loadSalesPersons(); } }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await api.put("/api/enquiries", { id, status });
    load(); if (detail?._id === id) setDetail(prev => prev ? { ...prev, status } : null);
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
  const filtered = filter ? items.filter(i => i.status === filter) : items;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-900">Enquiries</h2><p className="text-sm text-gray-500 mt-1">Manage contact enquiries</p></div>

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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sales</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(e => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{e.subject}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">{e.sentToSales ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Sent</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setDetail(e); if (e.status === "new") updateStatus(e._id, "read"); }}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No enquiries found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Enquiry from {detail.name}</h3>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex gap-4"><span className="w-20 text-gray-500">Email</span><span className="text-gray-900">{detail.email}</span></div>
              <div className="flex gap-4"><span className="w-20 text-gray-500">Phone</span><span className="text-gray-900">{detail.phone}</span></div>
              <div className="flex gap-4"><span className="w-20 text-gray-500">Subject</span><span className="text-gray-900 font-medium">{detail.subject}</span></div>
              <div className="flex gap-4"><span className="w-20 text-gray-500">Status</span><StatusBadge status={detail.status} /></div>
              {detail.sentToSales && <div className="flex gap-4"><span className="w-20 text-gray-500">Sales</span><span className="text-purple-700 font-medium">Sent {detail.sentToSalesAt ? `on ${new Date(detail.sentToSalesAt).toLocaleString()}` : ""}</span></div>}
              <div className="pt-2 border-t border-gray-100"><p className="text-gray-500 mb-1">Message:</p><p className="text-gray-900 whitespace-pre-wrap">{detail.message}</p></div>
              <div className="flex flex-wrap gap-2 pt-3">
                {detail.status === "new" && (
                  <button onClick={() => updateStatus(detail._id, "read")} className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"><Eye className="h-4 w-4" /> Mark Read</button>
                )}
                {detail.status !== "replied" && (
                  <button onClick={() => updateStatus(detail._id, "replied")} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Mark Replied</button>
                )}
                <button onClick={() => { setSelectedSales(salesPersons[0]?._id || ""); setShowSalesConfirm(true); }}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 flex items-center gap-1">
                  <Send className="h-4 w-4" /> Send to Sales
                </button>
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
