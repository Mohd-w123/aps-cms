"use client";

import React, { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { PageBanner } from "@/components/layout/PageBanner";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: FormData = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage() {
  const { slug: schoolSlug } = useSchool();
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-school-slug": schoolSlug,
        },
        body: JSON.stringify(form),
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
        title="Contact Us"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Contact info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              { icon: MapPin, label: "Address", value: "Fatehpur Shekhawati, Rajasthan, India" },
              { icon: Phone, label: "Phone", value: "+91-XXXX-XXXXXX" },
              { icon: Mail, label: "Email", value: "info@apsfatehpur.com" },
              { icon: Clock, label: "Office Hours", value: "Mon - Sat: 8:00 AM - 3:00 PM" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--school-primary)", color: "white" }}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-dark)" }}>
                  {item.label}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Google Maps */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 h-[400px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28288.2!2d75.05!3d27.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396b9f4c7c3e0001%3A0x1!2sFatehpur%20Shekhawati!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="School Location"
              />
            </div>

            {/* Enquiry Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
                Send us a Message
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Have a question? Fill out the form and we&apos;ll get back to you shortly.
              </p>

              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="h-14 w-14 mx-auto mb-4" style={{ color: "var(--school-primary)" }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>
                    Thank you!
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Your enquiry has been submitted. We will contact you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: "var(--school-primary)" }}
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full Name *"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] focus:border-transparent"
                    />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address *"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone Number *"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Subject *"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] focus:border-transparent"
                    />
                  </div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Your Message *"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] focus:border-transparent resize-none"
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--school-primary)" }}
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Social links */}
          <div className="text-center mt-14">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-dark)" }}>
              Follow Us
            </h3>
            <div className="flex justify-center gap-4">
              {[
                { label: "Facebook", href: "#", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { label: "Instagram", href: "#", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
                { label: "YouTube", href: "#", path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full flex items-center justify-center border-2 text-gray-500 hover:text-white transition-all"
                  style={{
                    borderColor: "var(--school-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--school-primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "";
                  }}
                  aria-label={social.label}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
