"use client";

import React, { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import { schools as allSchools } from "@/config/schools";
import {
  User,
  Users,
  GraduationCap,
  FileText,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  Trash2,
  ExternalLink,
  Plus,
  FileIcon,
  ImageIcon,
} from "lucide-react";

/* ─── Types ─── */
interface DocumentItem {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

interface FormData {
  // Target school (for group mode)
  targetSchoolSlug?: string;
  // Step 1 — Student
  studentName: string;
  dob: string;
  gender: string;
  class: string;
  // Step 2 — Parent / Guardian
  parentName: string;
  phone: string;
  email: string;
  address: string;
  // Step 3 — Previous School
  previousSchool: string;
  // Step 4 — Documents
  documents: DocumentItem[];
}

const initialForm: FormData = {
  targetSchoolSlug: "apsgirls",
  studentName: "",
  dob: "",
  gender: "",
  class: "",
  parentName: "",
  phone: "",
  email: "",
  address: "",
  previousSchool: "",
  documents: [],
};

const steps = [
  { label: "Student", icon: User },
  { label: "Parent", icon: Users },
  { label: "Previous School", icon: GraduationCap },
  { label: "Documents", icon: FileText },
  { label: "Review", icon: ClipboardCheck },
];

const genderOptions = ["Male", "Female", "Other"];
const classOptions = [
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "10",
  "11 (Science)", "11 (Commerce)", "11 (Arts)",
  "12 (Science)", "12 (Commerce)", "12 (Arts)",
];

const docPresets = [
  "Birth Certificate",
  "Aadhaar Card",
  "Previous Marksheet",
  "Transfer Certificate (TC)",
  "Passport Photo",
  "Other Document",
];

export default function ApplyPage() {
  const { slug: schoolSlug } = useSchool();
  const isGroup = schoolSlug === "apsfatehpur";
  const branchSchools = allSchools.filter((s) => s.slug !== "apsfatehpur");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedDocType, setSelectedDocType] = useState(docPresets[0]);
  const [customDocName, setCustomDocName] = useState("");

  // Optional manual URL entry state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualDocName, setManualDocName] = useState("");
  const [manualDocUrl, setManualDocUrl] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStepErrors([]);
  };

  /* ─── Validation per step ─── */
  const validateStep = (s: number): string[] => {
    const errs: string[] = [];
    switch (s) {
      case 0:
        if (!form.studentName.trim()) errs.push("Student name is required.");
        if (!form.dob) errs.push("Date of birth is required.");
        if (!form.gender) errs.push("Gender is required.");
        if (!form.class) errs.push("Class is required.");
        break;
      case 1:
        if (!form.parentName.trim()) errs.push("Parent/Guardian name is required.");
        if (!form.phone.trim() || form.phone.trim().length < 10)
          errs.push("Valid phone number (at least 10 digits) is required.");
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
          errs.push("Valid email address is required.");
        if (!form.address.trim()) errs.push("Address is required.");
        break;
    }
    return errs;
  };

  const goNext = () => {
    const errs = validateStep(step);
    if (errs.length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors([]);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepErrors([]);
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ─── File Upload Handler ─── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be under 10MB");
      return;
    }

    setUploadingDoc(true);
    setUploadError("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const targetSlug = isGroup ? form.targetSchoolSlug || "apsgirls" : schoolSlug;
      const res = await fetch("/api/admissions/upload", {
        method: "POST",
        headers: {
          "x-school-slug": targetSlug,
        },
        body: fd,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        const docTitle =
          selectedDocType === "Other Document" && customDocName.trim()
            ? customDocName.trim()
            : selectedDocType;

        setForm((prev) => ({
          ...prev,
          documents: [
            ...prev.documents,
            {
              name: docTitle,
              url: json.data.url,
              size: file.size,
              type: file.type,
            },
          ],
        }));

        setCustomDocName("");
        if (e.target) e.target.value = "";
      } else {
        setUploadError(json.error || "Failed to upload document. Please try again.");
      }
    } catch {
      setUploadError("Network error while uploading. Please try again.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const addManualUrlDocument = () => {
    if (!manualDocName.trim() || !manualDocUrl.trim()) {
      setUploadError("Please provide both document name and a valid URL.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      documents: [
        ...prev.documents,
        { name: manualDocName.trim(), url: manualDocUrl.trim() },
      ],
    }));
    setManualDocName("");
    setManualDocUrl("");
    setShowUrlInput(false);
    setUploadError("");
  };

  const removeDocument = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== idx),
    }));
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const targetSlug = isGroup ? form.targetSchoolSlug || "apsgirls" : schoolSlug;
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-school-slug": targetSlug,
        },
        body: JSON.stringify({
          studentName: form.studentName,
          parentName: form.parentName,
          phone: form.phone,
          email: form.email,
          class: form.class,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          ...(form.previousSchool ? { previousSchool: form.previousSchool } : {}),
          documents: form.documents.map((d) => ({ name: d.name, url: d.url })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
      } else {
        setError(json.error || "Failed to submit application.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Step content ─── */
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
              Student Information
            </h3>

            {/* School selector for group mode */}
            {isGroup && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 mb-4">
                <label className="block text-sm font-bold mb-1 text-emerald-950">
                  Select School to Apply For *
                </label>
                <select
                  name="targetSchoolSlug"
                  value={form.targetSchoolSlug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  {branchSchools.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({s.domain})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-emerald-700 mt-1">
                  Choose which institution in the Ashraful Uloom network you wish to enroll in.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Student Full Name *</label>
              <input
                type="text"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="e.g. Ayesha Khan"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender *</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] bg-white"
                >
                  <option value="">Select</option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Applying for Class *</label>
                <select
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] bg-white"
                >
                  <option value="">Select</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
              Parent / Guardian Details
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">Parent/Guardian Name *</label>
              <input
                type="text"
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                placeholder="e.g. Mohammed Rafiq"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="parent@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Residential Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="Full residential address, City, PIN"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] resize-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
              Previous School
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Optional — leave blank if applying for kindergarten or first-time admission.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Previous School Name</label>
              <input
                type="text"
                name="previousSchool"
                value={form.previousSchool}
                onChange={handleChange}
                placeholder="e.g. St. Joseph Public School, Sikar"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
                Upload Documents & Attachments
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Attach supporting documents such as Birth Certificate, Aadhaar Card, Previous Marksheet, or Transfer Certificate (PDF, PNG, JPG up to 10MB).
              </p>
            </div>

            {/* Document Type Selector & Upload Box */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 hover:bg-gray-50 transition-colors">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    1. Select Document Type:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {docPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSelectedDocType(preset)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedDocType === preset
                            ? "bg-[#22235b] text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDocType === "Other Document" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Specify Document Name *
                    </label>
                    <input
                      type="text"
                      value={customDocName}
                      onChange={(e) => setCustomDocName(e.target.value)}
                      placeholder="e.g. Domicile / Caste Certificate"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                    />
                  </div>
                )}

                {/* Upload Action */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    2. Choose File to Attach:
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label
                      className={`cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:scale-102 ${
                        uploadingDoc ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      style={{ backgroundColor: "var(--school-primary, #499f42)" }}
                    >
                      {uploadingDoc ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading Document...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-5 w-5" />
                          Upload {selectedDocType}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500">
                      PDF, JPG, PNG, DOC (Max 10MB)
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attached Documents List */}
            <div>
              <h4 className="text-sm font-bold mb-3 flex items-center justify-between" style={{ color: "var(--text-dark)" }}>
                <span>Attached Documents ({form.documents.length})</span>
                {form.documents.length === 0 && (
                  <span className="text-xs font-normal text-gray-400">Optional for initial application</span>
                )}
              </h4>

              {form.documents.length === 0 ? (
                <div className="text-center py-6 border border-gray-100 rounded-xl bg-white text-gray-400 text-xs">
                  No documents attached yet. You can attach documents above or skip to the next step.
                </div>
              ) : (
                <div className="space-y-2">
                  {form.documents.map((doc, idx) => {
                    const isPdf = doc.url.toLowerCase().endsWith(".pdf") || doc.type === "application/pdf";
                    const isImg = doc.type?.startsWith("image/") || doc.url.match(/\.(jpg|jpeg|png|webp)$/i);

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#499f42] flex items-center justify-center shrink-0">
                            {isImg ? (
                              <ImageIcon className="h-5 w-5" />
                            ) : (
                              <FileIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate text-[#22235b]">
                              {doc.name}
                            </p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#499f42] hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              View Attachment <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDocument(idx)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove attachment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Optional URL manual link accordion */}
            <div className="pt-2 border-t border-gray-100">
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-800 inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Have a Google Drive or Cloud Link instead?
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700">Paste Document Cloud Link</p>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={manualDocName}
                      onChange={(e) => setManualDocName(e.target.value)}
                      placeholder="Document Name (e.g. Aadhaar)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                    />
                    <input
                      type="url"
                      value={manualDocUrl}
                      onChange={(e) => setManualDocUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addManualUrlDocument}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#22235b] text-white"
                  >
                    Add Link
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
              Review Your Application
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Please review all details before submitting.
            </p>

            <div className="space-y-4">
              {/* Target school in group mode */}
              {isGroup && (
                <ReviewSection title="Target Institution">
                  <ReviewRow
                    label="School"
                    value={
                      branchSchools.find((s) => s.slug === form.targetSchoolSlug)?.name ||
                      "APS Girls School"
                    }
                  />
                </ReviewSection>
              )}

              {/* Student */}
              <ReviewSection title="Student Information">
                <ReviewRow label="Name" value={form.studentName} />
                <ReviewRow label="Date of Birth" value={form.dob} />
                <ReviewRow label="Gender" value={form.gender} />
                <ReviewRow label="Class" value={form.class} />
              </ReviewSection>

              {/* Parent */}
              <ReviewSection title="Parent / Guardian">
                <ReviewRow label="Name" value={form.parentName} />
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Email" value={form.email} />
                <ReviewRow label="Address" value={form.address} />
              </ReviewSection>

              {/* Previous */}
              {form.previousSchool && (
                <ReviewSection title="Previous School">
                  <ReviewRow label="School" value={form.previousSchool} />
                </ReviewSection>
              )}

              {/* Documents */}
              <ReviewSection title="Attached Documents">
                {form.documents.length === 0 ? (
                  <p className="text-sm text-gray-400">None uploaded</p>
                ) : (
                  <ul className="space-y-1.5">
                    {form.documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-800">{doc.name}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#499f42] hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </ReviewSection>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageBanner
        title="Apply Online for Admission"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Apply Now" },
        ]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {submitted ? (
            /* ─── Success screen ─── */
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm text-center border border-gray-100">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-dark)" }}>
                Application Submitted Successfully!
              </h2>
              <p className="text-base max-w-md mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
                Thank you for applying to{" "}
                {isGroup
                  ? branchSchools.find((s) => s.slug === form.targetSchoolSlug)?.name || "APS"
                  : "our institution"}
                . Our admissions office will review your application and contact you soon.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm(initialForm);
                  setStep(0);
                }}
                className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            /* ─── Form Card ─── */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Step indicator */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  {steps.map((st, i) => {
                    const Icon = st.icon;
                    const isCurrent = i === step;
                    const isDone = i < step;

                    return (
                      <div key={st.label} className="flex flex-col items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (i < step) setStep(i);
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isCurrent
                              ? "text-white shadow-md scale-110"
                              : isDone
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-400"
                          }`}
                          style={
                            isCurrent
                              ? { backgroundColor: "var(--school-primary, #499f42)" }
                              : undefined
                          }
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                        <span
                          className={`text-xs hidden sm:block ${
                            isCurrent
                              ? "font-bold text-[#22235b]"
                              : isDone
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step content */}
              <div className="p-6 md:p-8">
                {stepErrors.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-1">
                      <AlertCircle className="h-4 w-4" />
                      Please fix the following:
                    </div>
                    <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                      {stepErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {renderStepContent()}

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Nav buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex items-center gap-1 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105 shadow-sm"
                      style={{ backgroundColor: "var(--school-primary, #499f42)" }}
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-white transition-transform hover:scale-105 shadow-md disabled:opacity-60"
                      style={{ backgroundColor: "var(--school-primary, #499f42)" }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/* ─── Review subcomponents ─── */
function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-0.5">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value || "—"}</span>
    </div>
  );
}
