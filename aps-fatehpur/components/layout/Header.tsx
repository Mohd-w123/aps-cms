"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Menu,
  GraduationCap,
} from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { navigation as defaultNavigation, NavItem } from "@/config/navigation";
import { MobileNav } from "./MobileNav";
import { SocialIcon, socialPlatforms } from "@/components/shared/SocialIcons";

export function Header() {
  const { school } = useSchool();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "", address: "" });
  const [tagline, setTagline] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavigation);

  useEffect(() => {
    fetch("/api/schools")
      .then(r => r.json())
      .then(r => {
        if (r.success && r.data?.length) {
          const arr = Array.isArray(r.data) ? r.data : [r.data];
          // Find current school by slug from cookie
          const slug = document.cookie.match(/school-slug=([^;]+)/)?.[1] || "apsfatehpur";
          const s = arr.find((sc: { slug: string }) => sc.slug === slug) || arr[0];
          if (s?.contactInfo) {
            setContactInfo({
              phone: s.contactInfo.phone || "",
              email: s.contactInfo.email || "",
              address: s.contactInfo.address || "",
            });
          }
          if (s?.tagline) setTagline(s.tagline);
          if (s?.socialLinks) setSocialLinks(s.socialLinks);
          if (s?.headerNav?.length) setNavItems(s.headerNav);
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* ── Top Info Bar ── */}
      <div
        className="hidden md:block text-white text-sm"
        style={{ backgroundColor: "var(--text-dark, #22235b)" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            {contactInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {contactInfo.phone}
              </span>
            )}
            {contactInfo.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {contactInfo.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {contactInfo.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {contactInfo.address}
              </span>
            )}
            {socialPlatforms.filter(p => socialLinks[p.key]).length > 0 && (
              <span className="flex items-center gap-2 ml-2">
                {socialPlatforms.filter(p => socialLinks[p.key]).map(p => (
                  <a
                    key={p.key}
                    href={socialLinks[p.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={p.label}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <SocialIcon platform={p.key} />
                  </a>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav
        className="text-white"
        style={{ backgroundColor: "var(--school-primary, #499f42)" }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo + School Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {school?.logo ? (
              <Image
                src={school.logo}
                alt={school.name}
                width={44}
                height={44}
                className="rounded-full bg-white p-0.5"
              />
            ) : (
              <GraduationCap className="h-10 w-10" />
            )}
            <div className="hidden sm:block">
              <p className="font-bold text-lg leading-tight">
                {school?.name || "APS Fatehpur"}
              </p>
              <p className="text-xs opacity-80">{tagline || school?.name || ""}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavDesktopItem
                key={item.label}
                item={item}
                isActive={isActive}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            ))}
            <li>
              <Link
                href="/academy/admissions"
                className="ml-2 inline-block rounded-full px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: "var(--accent-yellow, #d4e96e)",
                  color: "var(--text-dark, #22235b)",
                }}
              >
                Apply Now
              </Link>
            </li>
          </ul>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Nav Sheet */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} />
    </header>
  );
}

/* ── Desktop nav item with optional dropdown ── */
function NavDesktopItem({
  item,
  isActive,
  openDropdown,
  setOpenDropdown,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  openDropdown: string | null;
  setOpenDropdown: (v: string | null) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const active = isActive(item.href);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-white/15 ${
            active ? "bg-white/20" : ""
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpenDropdown(item.label)}
      onMouseLeave={() => setOpenDropdown(null)}
    >
      <button
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-white/15 ${
          active ? "bg-white/20" : ""
        }`}
      >
        {item.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            openDropdown === item.label ? "rotate-180" : ""
          }`}
        />
      </button>

      {openDropdown === item.label && (
        <ul className="absolute left-0 top-full mt-0.5 w-52 rounded-lg bg-white text-gray-800 shadow-xl py-1 z-50">
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block px-4 py-2.5 text-sm hover:bg-gray-100 transition-colors"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
