"use client";

import React from "react";
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
            <p className="text-sm leading-relaxed mb-4">
              Committed to nurturing young minds with academic excellence,
              moral values, and holistic development since 1995.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, href: "#", label: "Facebook" },
                { icon: ExternalLink, href: "#", label: "Twitter" },
                { icon: Globe, href: "#", label: "Instagram" },
                { icon: ExternalLink, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
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
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Fatehpur, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91-123-456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@apsfatehpur.com</span>
              </li>
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
