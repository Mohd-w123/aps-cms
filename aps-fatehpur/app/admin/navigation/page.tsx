"use client";

import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
} from "lucide-react";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  children: NavChild[];
}

interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

interface SchoolNav {
  _id: string;
  name: string;
  slug: string;
  headerNav: NavItem[];
  footerLinks: FooterLinkGroup[];
}

export default function AdminNavigationPage() {
  const api = useAdminApi();
  const { user } = useAuth();
  const [allSchools, setAllSchools] = useState<SchoolNav[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [headerNav, setHeaderNav] = useState<NavItem[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLinkGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");

  useEffect(() => {
    if (!api.token) return;
    api.get("/api/schools").then((r) => {
      if (r.success) {
        const arr: SchoolNav[] = (Array.isArray(r.data) ? r.data : [r.data]).map(
          (s: SchoolNav) => ({
            ...s,
            headerNav: s.headerNav || [],
            footerLinks: s.footerLinks || [],
          })
        );
        setAllSchools(arr);
        const match = user?.schoolSlug
          ? arr.find((s) => s.slug === user.schoolSlug)
          : null;
        const initial = match || arr[0];
        if (initial) {
          setSelectedId(initial._id);
          setHeaderNav(initial.headerNav);
          setFooterLinks(initial.footerLinks);
        }
      }
      setLoading(false);
    });
  }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSchoolChange = (id: string) => {
    setSelectedId(id);
    const found = allSchools.find((s) => s._id === id);
    if (found) {
      setHeaderNav(found.headerNav);
      setFooterLinks(found.footerLinks);
    }
  };

  const save = async () => {
    setSaving(true);
    await api.put("/api/schools", {
      id: selectedId,
      headerNav,
      footerLinks,
    });
    setSaving(false);
  };

  const toggleExpand = (idx: number) =>
    setExpandedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  // ── Header Nav helpers ──
  const addNavItem = () =>
    setHeaderNav((prev) => [...prev, { label: "", href: "/", children: [] }]);

  const updateNavItem = (idx: number, field: keyof NavItem, value: string) =>
    setHeaderNav((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  const removeNavItem = (idx: number) =>
    setHeaderNav((prev) => prev.filter((_, i) => i !== idx));

  const moveNavItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= headerNav.length) return;
    setHeaderNav((prev) => {
      const arr = [...prev];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const addChild = (parentIdx: number) =>
    setHeaderNav((prev) =>
      prev.map((item, i) =>
        i === parentIdx
          ? { ...item, children: [...item.children, { label: "", href: "/" }] }
          : item
      )
    );

  const updateChild = (
    parentIdx: number,
    childIdx: number,
    field: "label" | "href",
    value: string
  ) =>
    setHeaderNav((prev) =>
      prev.map((item, i) =>
        i === parentIdx
          ? {
              ...item,
              children: item.children.map((c, ci) =>
                ci === childIdx ? { ...c, [field]: value } : c
              ),
            }
          : item
      )
    );

  const removeChild = (parentIdx: number, childIdx: number) =>
    setHeaderNav((prev) =>
      prev.map((item, i) =>
        i === parentIdx
          ? { ...item, children: item.children.filter((_, ci) => ci !== childIdx) }
          : item
      )
    );

  // ── Footer Links helpers ──
  const addFooterGroup = () =>
    setFooterLinks((prev) => [...prev, { title: "", links: [] }]);

  const updateFooterGroupTitle = (idx: number, title: string) =>
    setFooterLinks((prev) =>
      prev.map((g, i) => (i === idx ? { ...g, title } : g))
    );

  const removeFooterGroup = (idx: number) =>
    setFooterLinks((prev) => prev.filter((_, i) => i !== idx));

  const addFooterLink = (groupIdx: number) =>
    setFooterLinks((prev) =>
      prev.map((g, i) =>
        i === groupIdx ? { ...g, links: [...g.links, { label: "", href: "/" }] } : g
      )
    );

  const updateFooterLink = (
    groupIdx: number,
    linkIdx: number,
    field: "label" | "href",
    value: string
  ) =>
    setFooterLinks((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? {
              ...g,
              links: g.links.map((l, li) =>
                li === linkIdx ? { ...l, [field]: value } : l
              ),
            }
          : g
      )
    );

  const removeFooterLink = (groupIdx: number, linkIdx: number) =>
    setFooterLinks((prev) =>
      prev.map((g, i) =>
        i === groupIdx
          ? { ...g, links: g.links.filter((_, li) => li !== linkIdx) }
          : g
      )
    );

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );

  const currentSchool = allSchools.find((s) => s._id === selectedId);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Title + School Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Navigation</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage header &amp; footer links for {currentSchool?.name}
          </p>
        </div>
        {user?.role === "superadmin" && allSchools.length > 1 && (
          <select
            value={selectedId}
            onChange={(e) => handleSchoolChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {allSchools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(["header", "footer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "header" ? "Header Navigation" : "Footer Links"}
          </button>
        ))}
      </div>

      {/* ── Header Nav Editor ── */}
      {activeTab === "header" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Add menu items for the site header. Items with children show as dropdowns.
            </p>
            <button
              onClick={addNavItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          {headerNav.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">
              No navigation items yet. Click &quot;Add Item&quot; or save with an empty list to use the default navigation.
            </p>
          )}

          {headerNav.map((item, idx) => {
            const isExpanded = expandedItems.includes(idx);
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Item header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                  <GripVertical className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      value={item.label}
                      onChange={(e) => updateNavItem(idx, "label", e.target.value)}
                      placeholder="Label"
                      className="w-40 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      value={item.href}
                      onChange={(e) => updateNavItem(idx, "href", e.target.value)}
                      placeholder="/path"
                      className="w-40 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveNavItem(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-500"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveNavItem(idx, 1)}
                      disabled={idx === headerNav.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-500"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="p-1 rounded hover:bg-gray-200 text-gray-500"
                      title="Toggle children"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeNavItem(idx)}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {isExpanded && (
                  <div className="px-4 py-3 space-y-2 bg-white">
                    <p className="text-xs text-gray-500 mb-1">
                      Dropdown items (leave empty for a simple link):
                    </p>
                    {item.children.map((child, ci) => (
                      <div key={ci} className="flex items-center gap-2 pl-6">
                        <input
                          value={child.label}
                          onChange={(e) =>
                            updateChild(idx, ci, "label", e.target.value)
                          }
                          placeholder="Sub-label"
                          className="w-40 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          value={child.href}
                          onChange={(e) =>
                            updateChild(idx, ci, "href", e.target.value)
                          }
                          placeholder="/sub-path"
                          className="w-40 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => removeChild(idx, ci)}
                          className="p-1 rounded hover:bg-red-50 text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addChild(idx)}
                      className="ml-6 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add sub-item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Links Editor ── */}
      {activeTab === "footer" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Add link groups that appear in the footer columns.
            </p>
            <button
              onClick={addFooterGroup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" /> Add Group
            </button>
          </div>

          {footerLinks.length === 0 && (
            <p className="text-center py-8 text-gray-400 text-sm">
              No footer link groups yet. Click &quot;Add Group&quot; or save empty to use default links.
            </p>
          )}

          {footerLinks.map((group, gi) => (
            <div
              key={gi}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                <input
                  value={group.title}
                  onChange={(e) => updateFooterGroupTitle(gi, e.target.value)}
                  placeholder="Group Title (e.g. Quick Links)"
                  className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => removeFooterGroup(gi)}
                  className="p-1 rounded hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 py-3 space-y-2 bg-white">
                {group.links.map((link, li) => (
                  <div key={li} className="flex items-center gap-2 pl-4">
                    <input
                      value={link.label}
                      onChange={(e) =>
                        updateFooterLink(gi, li, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="w-40 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      value={link.href}
                      onChange={(e) =>
                        updateFooterLink(gi, li, "href", e.target.value)
                      }
                      placeholder="/path"
                      className="w-40 px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => removeFooterLink(gi, li)}
                      className="p-1 rounded hover:bg-red-50 text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addFooterLink(gi)}
                  className="ml-4 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Add link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Navigation
      </button>
    </div>
  );
}
