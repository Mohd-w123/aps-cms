"use client";

import React, { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
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
} from "lucide-react";

/* ─── Types ─── */
interface DocumentItem {
  name: string;
  url: string;
}

interface FormData {
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

export default function ApplyPage() {
  const { slug: schoolSlug } = useSchool();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // Document temp fields
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");

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
        if (!form.phone.trim() || form.phone.trim().length < 10) errs.push("Valid phone number is required.");
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
          errs.push("Valid email is required.");
        if (!form.address.trim()) errs.push("Address is required.");
        break;
      // Step 2 (previous school) and 3 (documents) are optional
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

  const addDocument = () => {
    if (!docName.trim() || !docUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, { name: docName.trim(), url: docUrl.trim() }],
    }));
    setDocName("");
    setDocUrl("");
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
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-school-slug": schoolSlug,
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
          documents: form.documents,
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
            <div>
              <label className="block text-sm font-medium mb-1">Student Full Name *</label>
              <input
                type="text"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
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
              Optional — leave blank if applying for the first time.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Previous School Name</label>
              <input
                type="text"
                name="previousSchool"
                value={form.previousSchool}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
              Documents
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Upload documents (Aadhaar, birth certificate, marksheet, etc.) to Google Drive or any cloud service and paste the links below.
            </p>
            {/* Added docs */}
            {form.documents.length > 0 && (
              <div className="space-y-2">
                {form.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "var(--school-primary)" }} />
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-dark)" }}>
                        {doc.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDocument(i)}
                      className="text-red-500 hover:text-red-700 text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add doc form */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Document Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Birth Certificate"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Document URL</label>
                <input
                  type="url"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                />
              </div>
              <button
                onClick={addDocument}
                type="button"
                className="px-4 py-3 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                Add
              </button>
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
              {form.documents.length > 0 && (
                <ReviewSection title="Documents">
                  {form.documents.map((doc, i) => (
                    <ReviewRow key={i} label={doc.name} value={doc.url} isLink />
                  ))}
                </ReviewSection>
              )}
            </div>
          </div>
        );
    }
  };

  /* ─── Success Screen ─── */
  if (submitted) {
    return (
      <>
        <PageBanner
          title="Apply for Admission"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Apply" }]}
        />
        <section className="py-16">
          <div className="container mx-auto px-4 text-center max-w-md">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-6" style={{ color: "var(--school-primary)" }} />
            <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-dark)" }}>
              Application Submitted!
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              Thank you for applying. Our team will review your application and contact you soon. You can also visit the school office for any queries.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setForm(initialForm);
              }}
              className="px-8 py-3 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--school-primary)" }}
            >
              Submit Another Application
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title="Apply for Admission"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Apply" }]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < step
                        ? "text-white"
                        : i === step
                        ? "text-white ring-4 ring-opacity-30"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    style={{
                      backgroundColor: i <= step ? "var(--school-primary)" : undefined,
                      ...(i === step ? { ringColor: "var(--school-primary)" } : {}),
                    }}
                  >
                    {i < step ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span
                    className="text-xs mt-1.5 hidden sm:block"
                    style={{ color: i <= step ? "var(--school-primary)" : "var(--text-muted)" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress track */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: "var(--school-primary)",
                  width: `${(step / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[300px]">
            {renderStepContent()}

            {/* Errors */}
            {stepErrors.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                {stepErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {err}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "var(--text-dark)" }}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: "var(--school-primary)" }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
                  style={{ backgroundColor: "var(--school-primary)" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Helper components ─── */

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <h4 className="text-sm font-semibold" style={{ color: "var(--text-dark)" }}>
          {title}
        </h4>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
      <span className="text-xs font-medium w-28 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline break-all"
          style={{ color: "var(--school-primary)" }}
        >
          {value}
        </a>
      ) : (
        <span className="text-sm" style={{ color: "var(--text-dark)" }}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}
