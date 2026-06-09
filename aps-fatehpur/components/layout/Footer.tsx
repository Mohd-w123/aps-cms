"use client";

import React, { useEffect, useState } from "react";
import { SchoolLink } from "@/components/shared/SchoolLink";
import {
  Phone,
  Mail,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { SocialLinksBar } from "@/components/shared/SocialIcons";

const defaultFooterLinks = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Admissions", href: "/academy/admissions" },
      { label: "Facilities", href: "/facilities" },
      { label: "News", href: "/news" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Academics",
    links: [
      { label: "Curriculum", href: "/academy/curriculum" },
      { label: "Toppers", href: "/toppers" },
      { label: "AICU", href: "/aicu" },
      { label: "Alumni", href: "/alumni" },
      { label: "Careers", href: "/careers" },
      { label: "Calendar", href: "/structure/calendar" },
    ],
  },
];

export function Footer() {
  const { school } = useSchool();
  const year = new Date().getFullYear();
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "", address: "" });
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [description, setDescription] = useState("");
  const [footerLinkGroups, setFooterLinkGroups] = useState(defaultFooterLinks);

  useEffect(() => {
    fetch("/api/schools")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const arr = Array.isArray(r.data) ? r.data : [r.data];
          const slug = document.cookie.match(/school-slug=([^;]+)/)?.[1] || "apsfatehpur";
          const s = arr.find((sc: { slug: string }) => sc.slug === slug) || arr[0];
          if (s?.contactInfo) setContactInfo({ phone: s.contactInfo.phone || "", email: s.contactInfo.email || "", address: s.contactInfo.address || "" });
          if (s?.socialLinks) setSocialLinks(s.socialLinks);
          if (s?.description) setDescription(s.description);
          if (s?.footerLinks?.length) setFooterLinkGroups(s.footerLinks);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="text-gray-300" style={{ backgroundColor: "var(--text-dark, #22235b)" }}>
      {/* Wave Top Divider */}
      <div className="w-full overflow-hidden leading-none bg-[var(--bg-light,#f6faf5)]">
        <svg className="relative block w-full h-12 md:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V92.65A600.21,600.21,0,0,0,321.39,56.44Z" fill="var(--text-dark, #22235b)" />
        </svg>
      </div>
      {/* Main Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-8 w-8" style={{ color: "var(--accent-yellow, #d4e96e)" }} />
              <h3 className="text-white font-heading font-bold text-lg">
                {school?.name || "APS Fatehpur"}
              </h3>
            </div>
            {description && (
              <p className="text-sm leading-relaxed mb-4">
                {description}
              </p>
            )}
            <SocialLinksBar links={socialLinks} variant="dark" />
          </div>

          {/* Dynamic footer link columns */}
          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-heading font-semibold text-base mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <SchoolLink
                      href={link.href}
                      className="text-sm hover:text-[var(--accent-yellow,#d4e96e)] transition-colors"
                    >
                      {link.label}
                    </SchoolLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Col: Contact */}
          <div>
            <h4 className="text-white font-heading font-semibold text-base mb-4">
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
            <SchoolLink href="/privacy" className="hover:text-[var(--accent-yellow,#d4e96e)] transition-colors">
              Privacy Policy
            </SchoolLink>
            <SchoolLink href="/terms" className="hover:text-[var(--accent-yellow,#d4e96e)] transition-colors">
              Terms of Use
            </SchoolLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
