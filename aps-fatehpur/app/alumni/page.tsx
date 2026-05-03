"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import {
  Users,
  GraduationCap,
  Building2,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";

interface AlumniMember {
  _id: string;
  name: string;
  batch: string;
  course: string;
  currentRole?: string;
  company?: string;
  photo?: string;
  testimonial?: string;
}

interface FormData {
  name: string;
  batch: string;
  course: string;
  currentRole: string;
  company: string;
  photo: string;
  testimonial: string;
}

const initialForm: FormData = {
  name: "",
  batch: "",
  course: "",
  currentRole: "",
  company: "",
  photo: "",
  testimonial: "",
};

export default function AlumniPage() {
  const { slug: schoolSlug } = useSchool();
  const [alumni, setAlumni] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await fetch(`/api/alumni?limit=50`, {
          headers: { "x-school-slug": schoolSlug },
        });
        const json = await res.json();
        if (json.success) setAlumni(json.data);
      } catch {
        console.error("Failed to fetch alumni");
      } finally {
        setLoading(false);
      }
    };
    if (schoolSlug) fetchAlumni();
  }, [schoolSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload: Record<string, string> = {
        name: form.name,
        batch: form.batch,
      };
      if (form.course) payload.course = form.course;
      if (form.currentRole) payload.currentRole = form.currentRole;
      if (form.company) payload.company = form.company;
      if (form.photo) payload.photo = form.photo;
      if (form.testimonial) payload.testimonial = form.testimonial;

      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-school-slug": schoolSlug,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setForm(initialForm);
      } else {
        setError(json.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageBanner
        title="Our Alumni"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Alumni" }]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Header + Register Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-dark)" }}>
                Alumni Network
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Connecting our past, present, and future — proud alumni of our school family.
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setSubmitted(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--school-primary)" }}
            >
              <Users className="h-4 w-4" />
              Register as Alumni
            </button>
          </div>

          {/* Alumni Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="h-14 w-14 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>
                No alumni registered yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {alumni.map((member) => (
                <div
                  key={member._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-48 relative bg-gray-100">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <span
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: "var(--school-primary)" }}
                    >
                      Batch {member.batch}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm mb-1" style={{ color: "var(--text-dark)" }}>
                      {member.name}
                    </h3>
                    {member.course && (
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                        <GraduationCap className="inline h-3 w-3 mr-1" />
                        {member.course}
                      </p>
                    )}
                    {(member.currentRole || member.company) && (
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        <Building2 className="inline h-3 w-3 mr-1" />
                        {[member.currentRole, member.company].filter(Boolean).join(" at ")}
                      </p>
                    )}
                    {member.testimonial && (
                      <p className="text-xs italic mt-2 line-clamp-3" style={{ color: "var(--text-muted)" }}>
                        &quot;{member.testimonial}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold" style={{ color: "var(--text-dark)" }}>
                Alumni Registration
              </h3>
              <button
                onClick={() => setShowForm(false)}
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
                    Registration Submitted!
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Your profile will be visible after admin approval. Thank you!
                  </p>
                  <button
                    onClick={() => setShowForm(false)}
                    className="mt-6 px-6 py-2 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: "var(--school-primary)" }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        Batch Year *
                      </label>
                      <input
                        type="text"
                        name="batch"
                        value={form.batch}
                        onChange={handleChange}
                        placeholder="e.g. 2015"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                        Course
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={form.course}
                        onChange={handleChange}
                        placeholder="e.g. Science"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                        Current Role
                      </label>
                      <input
                        type="text"
                        name="currentRole"
                        value={form.currentRole}
                        onChange={handleChange}
                        placeholder="e.g. Software Engineer"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="e.g. Google"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                      Photo URL
                    </label>
                    <input
                      type="url"
                      name="photo"
                      value={form.photo}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-dark)" }}>
                      Testimonial
                    </label>
                    <textarea
                      name="testimonial"
                      value={form.testimonial}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Share your experience..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] resize-none"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
                    style={{ backgroundColor: "var(--school-primary)" }}
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Registration"}
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
