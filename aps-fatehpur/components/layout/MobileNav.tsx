"use client";

import React, { useState } from "react";
import { SchoolLink } from "@/components/shared/SchoolLink";
import { usePathname } from "next/navigation";
import { X, ChevronDown, GraduationCap } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSchool } from "@/hooks/useSchool";
import { navigation as defaultNavigation, NavItem } from "@/config/navigation";
import { GoogleTranslate } from "@/components/shared/GoogleTranslate";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  navItems?: NavItem[];
}

export function MobileNav({ open, onClose, navItems }: MobileNavProps) {
  const navigation = navItems?.length ? navItems : defaultNavigation;
  const { school } = useSchool();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggle = (label: string) =>
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-[300px] p-0">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 text-white"
          style={{ backgroundColor: "var(--school-primary)" }}
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            <span className="font-bold text-lg">
              {school?.name || "APS Fatehpur"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/15 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="overflow-y-auto h-[calc(100vh-80px)] py-2">
          {navigation.map((item: NavItem) => {
            const hasChildren = item.children && item.children.length > 0;
            const expanded = expandedItems.includes(item.label);
            const active = isActive(item.href);

            return (
              <div key={item.label}>
                {hasChildren ? (
                  <button
                    onClick={() => toggle(item.label)}
                    className={`flex w-full items-center justify-between px-5 py-3 text-sm font-medium transition-colors hover:bg-gray-100 ${
                      active ? "text-[var(--school-primary)] font-semibold" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <SchoolLink
                    href={item.href}
                    onClick={onClose}
                    className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-gray-100 ${
                      active ? "text-[var(--school-primary)] font-semibold" : "text-gray-700"
                    }`}
                  >
                    {item.label}
                  </SchoolLink>
                )}

                {/* Sub Items */}
                {hasChildren && expanded && (
                  <div className="bg-gray-50">
                    {item.children!.map((child) => (
                      <SchoolLink
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`block pl-10 pr-5 py-2.5 text-sm transition-colors hover:bg-gray-100 ${
                          pathname === child.href
                            ? "text-[var(--school-primary)] font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {child.label}
                      </SchoolLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Apply CTA */}
          <div className="px-5 pt-4 space-y-3">
            <SchoolLink
              href="/academy/admissions"
              onClick={onClose}
              className="block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors shadow-sm"
              style={{
                backgroundColor: "var(--accent-yellow)",
                color: "var(--text-dark)",
              }}
            >
              Apply Now
            </SchoolLink>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Language:</span>
              <GoogleTranslate variant="light" />
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
