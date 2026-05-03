"use client";

import React, { useEffect, useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import {
  Briefcase,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Career {
  _id: string;
  title: string;
  department: string;
  description: string;
  qualifications: string;
  experience: string;
  salary?: string;
  deadline?: string;
}

interface ApplyForm {
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
}

const initialApplyForm: ApplyForm = {
  name: "",
  email: "",
  phone: "",
  resume: "",
  coverLetter: "",
};

export default function CareersPage() {
  const { slug: schoolSlug } = useSchool();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Apply modal
  const [applyTo, setApplyTo] = useState<Career | null>(null);
  const [form, setForm] = useState<ApplyForm>(initialApplyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await fetch(`/api/careers?limit=50`, {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success) setCareers(json.data);
      } catch {
        console.error("Failed to fetch careers");
      } finally {
        setLoading(false);
      }
    };
    if (schoolSlug) fetchCareers();
  }, [schoolSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyTo) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-school-slug": schoolSlug,
        },
        body: JSON.stringify({
          careerId: applyTo._id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          resume: form.resume,
          ...(form.coverLetter ? { coverLetter: form.coverLetter } : {}),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setForm(initialApplyForm);
      } else {
        setError(json.error || "Failed to submit application.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <PageBanner
        title="Careers"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
              Join Our Team
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              We are always looking for passionate educators and staff to join our school family.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : careers.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-14 w-14 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>
                No open positions at the moment.
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                Check back later or contact us for more information.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {careers.map((career) => {
                const isOpen = expanded === career._id;
                const deadlineStr = formatDate(career.deadline);
                const isPastDeadline = career.deadline
                  ? new Date(career.deadline) < new Date()
                  : false;

                return (
                  <div
                    key={career._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Header row */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : career._id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base" style={{ color: "var(--text-dark)" }}>
                          {career.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          {career.department && (
                            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                              <MapPin className="h-3 w-3" /> {career.department}
                            </span>
                          )}
                          {career.experience && (
                            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                              <Briefcase className="h-3 w-3" /> {career.experience}
                            </span>
                          )}
                          {deadlineStr && (
                            <span
                              className={`inline-flex items-center gap-1 text-xs ${isPastDeadline ? "text-red-500" : ""}`}
                              style={!isPastDeadline ? { color: "var(--text-muted)" } : undefined}
                            >
                              <Clock className="h-3 w-3" /> Deadline: {deadlineStr}
                            </span>
                          )}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: "var(--text-muted)" }} />
                      ) : (
                        <ChevronDown className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: "var(--text-muted)" }} />
                      )}
                    </button>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-gray-100">
                        <div className="pt-4 space-y-3">
                          {career.description && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text-dark)" }}>
                                Description
                              </h4>
                              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                {career.description}
                              </p>
                            </div>
                          )}
                          {career.qualifications && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text-dark)" }}>
                                Qualifications
                              </h4>
                              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                {career.qualifications}
                              </p>
                            </div>
                          )}
                          {career.salary && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text-dark)" }}>
                                Salary
                              </h4>
                              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                {career.salary}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setApplyTo(career);
                              setSubmitted(false);
                              setError("");
                            }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 mt-2 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
                            style={{ backgroundColor: "var(--school-primary)" }}
                          >
                            <Send className="h-4 w-4" />
                            Apply Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Apply Modal */}
      {applyTo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
                  Apply for Position
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--school-primary)" }}>
                  {applyTo.title}
                </p>
              </div>
              <button
                onClick={() => setApplyTo(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2
                    className="h-14 w-14 mx-auto mb-4"
                    style={{ color: "var(--school-primary)" }}
                  />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
                    Application Submitted!
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    We&apos;ll review your application and get back to you soon.
                  </p>
                  <button
                    onClick={() => setApplyTo(null)}
                    className="mt-6 px-6 py-2 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: "var(--school-primary)" }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                      Resume URL * <span className="font-normal text-gray-400">(Upload to Google Drive / Cloudinary and paste link)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        name="resume"
                        value={form.resume}
                        onChange={handleChange}
                        required
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                      Cover Letter <span className="font-normal text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      name="coverLetter"
                      value={form.coverLetter}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us why you'd be a great fit..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] resize-none"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
                    style={{ backgroundColor: "var(--school-primary)" }}
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
