"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { useSchool } from "@/hooks/useSchool";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Admissions", href: "/academy/admissions" },
  { label: "Facilities", href: "/facilities" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

const academicLinks = [
  { label: "Curriculum", href: "/academy/curriculum" },
  { label: "Toppers", href: "/toppers" },
  { label: "AICU", href: "/aicu" },
  { label: "Alumni", href: "/alumni" },
  { label: "Careers", href: "/careers" },
  { label: "Calendar", href: "/structure/calendar" },
];

export function Footer() {
  const { school } = useSchool();
  const year = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "", address: "" });
  const [socialLinks, setSocialLinks] = useState({ facebook: "", instagram: "", youtube: "", twitter: "" });
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/schools")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const arr = Array.isArray(r.data) ? r.data : [r.data];
          const slug = document.cookie.match(/school-slug=([^;]+)/)?.[1] || "apsfatehpur";
          const s = arr.find((sc: { slug: string }) => sc.slug === slug) || arr[0];
          if (s?.contactInfo) setContactInfo({ phone: s.contactInfo.phone || "", email: s.contactInfo.email || "", address: s.contactInfo.address || "" });
          if (s?.socialLinks) setSocialLinks({ facebook: s.socialLinks.facebook || "", instagram: s.socialLinks.instagram || "", youtube: s.socialLinks.youtube || "", twitter: s.socialLinks.twitter || "" });
          if (s?.description) setDescription(s.description);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
              <h3 className="text-white font-bold text-lg">
                {school?.name || "APS Fatehpur"}
              </h3>
            </div>
            {description && (
              <p className="text-sm leading-relaxed mb-4">
                {description}
              </p>
            )}
            <div className="flex gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Academics */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">
              Academics
            </h4>
            <ul className="space-y-2">
              {academicLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              {contactInfo.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{contactInfo.phone}</span>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{contactInfo.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-4 text-xs text-gray-400 gap-2">
          <span>
            © {year} {school?.name || "APS Fatehpur"}. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
