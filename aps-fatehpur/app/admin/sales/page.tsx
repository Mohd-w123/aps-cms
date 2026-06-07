"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Loader2, Eye, X, GraduationCap, Mail } from "lucide-react";

interface Admission {
  _id: string; studentName: string; parentName: string; phone: string; email: string;
  class: string; dob: string; gender: string; address: string; previousSchool?: string;
  status: string; createdAt: string; sentToSalesAt?: string;
}
interface Enquiry {
  _id: string; name: string; email: string; phone: string; subject: string; message: string;
  status: string; createdAt: string; sentToSalesAt?: string;
}

type Tab = "admissions" | "enquiries";

export default function SalesPortalPage() {
  const api = useAdminApi();
  const [tab, setTab] = useState<Tab>("admissions");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissionDetail, setAdmissionDetail] = useState<Admission | null>(null);
  const [enquiryDetail, setEnquiryDetail] = useState<Enquiry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [admRes, enqRes] = await Promise.all([
      api.get("/api/admissions?limit=200"),
      api.get("/api/enquiries?limit=200"),
    ]);
    if (admRes.success) setAdmissions(admRes.data || []);
    if (enqRes.success) setEnquiries(enqRes.data || []);
    setLoading(false);
  }, [api]);

  useEffect(() => { if (api.token) load(); }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sales Portal</h2>
        <p className="text-sm text-gray-500 mt-1">Leads assigned to you by the admin team</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("admissions")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "admissions" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <GraduationCap className="h-4 w-4" /> Admissions ({admissions.length})
        </button>
        <button onClick={() => setTab("enquiries")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${tab === "enquiries" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          <Mail className="h-4 w-4" /> Enquiries ({enquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
      ) : tab === "admissions" ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {admissions.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{a.class}</td>
                  <td className="px-4 py-3 text-gray-500">{a.parentName}</td>
                  <td className="px-4 py-3 text-gray-500">{a.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{a.sentToSalesAt ? new Date(a.sentToSalesAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setAdmissionDetail(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {admissions.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No admission leads assigned yet</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.map(e => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{e.subject}</td>
                  <td className="px-4 py-3 text-gray-500">{e.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{e.sentToSalesAt ? new Date(e.sentToSalesAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEnquiryDetail(e)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No enquiry leads assigned yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {admissionDetail && (
        <DetailModal title={`Admission: ${admissionDetail.studentName}`} onClose={() => setAdmissionDetail(null)}>
          <Row label="Student" value={admissionDetail.studentName} />
          <Row label="Class" value={admissionDetail.class} />
          <Row label="DOB" value={new Date(admissionDetail.dob).toLocaleDateString("en-IN")} />
          <Row label="Gender" value={admissionDetail.gender} />
          <Row label="Parent" value={admissionDetail.parentName} />
          <Row label="Phone" value={admissionDetail.phone} />
          <Row label="Email" value={admissionDetail.email} />
          <Row label="Address" value={admissionDetail.address} />
          {admissionDetail.previousSchool && <Row label="Prev School" value={admissionDetail.previousSchool} />}
          <Row label="Status" value={admissionDetail.status} />
        </DetailModal>
      )}

      {enquiryDetail && (
        <DetailModal title={`Enquiry: ${enquiryDetail.name}`} onClose={() => setEnquiryDetail(null)}>
          <Row label="Name" value={enquiryDetail.name} />
          <Row label="Email" value={enquiryDetail.email} />
          <Row label="Phone" value={enquiryDetail.phone} />
          <Row label="Subject" value={enquiryDetail.subject} />
          <Row label="Status" value={enquiryDetail.status} />
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-500 mb-1">Message:</p>
            <p className="text-gray-900 whitespace-pre-wrap">{enquiryDetail.message}</p>
          </div>
        </DetailModal>
      )}
    </div>
  );
}

function DetailModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-3 text-sm">{children}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-4"><span className="w-24 text-gray-500 flex-shrink-0">{label}</span><span className="text-gray-900">{value}</span></div>;
}
