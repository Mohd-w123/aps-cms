"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { schools } from "@/config/schools";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  Globe,
  GraduationCap,
  Mail,
  Briefcase,
  UserCheck,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  School,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sitesExpanded, setSitesExpanded] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Build site-based navigation
  const siteNavItems: NavItem[] = [];

  // Group Landing — superadmin OR apsfatehpur school_admin
  if (user?.role === "superadmin" || user?.schoolSlug === "apsfatehpur") {
    siteNavItems.push({ label: "Group Landing", href: "/admin/sites/group", icon: Globe });
  }

  // For superadmin: show all schools except apsfatehpur (it's the group landing above)
  // For school_admin of apsfatehpur: they only manage group landing (already added)
  // For other school_admins: show only their school
  const visibleSchools = user?.role === "superadmin"
    ? schools.filter((s) => s.slug !== "apsfatehpur")
    : user?.schoolSlug === "apsfatehpur"
      ? []
      : schools.filter((s) => s.slug === user?.schoolSlug || s.id === user?.schoolSlug);

  visibleSchools.forEach((s) => {
    siteNavItems.push({
      label: s.name.length > 20 ? s.name.substring(0, 18) + "…" : s.name,
      href: `/admin/sites/${s.slug}`,
      icon: School,
    });
  });

  const sections: NavSection[] = [
    {
      title: "",
      items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
    },
    {
      title: "FORMS & SUBMISSIONS",
      items: [
        { label: "Admissions", href: "/admin/admissions", icon: GraduationCap },
        { label: "Enquiries", href: "/admin/enquiries", icon: Mail },
        { label: "Careers", href: "/admin/careers", icon: Briefcase },
        { label: "Alumni", href: "/admin/alumni", icon: UserCheck },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Users", href: "/admin/users", icon: Users, roles: ["superadmin", "school_admin"] },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Current page title
  const getPageTitle = () => {
    if (pathname.startsWith("/admin/sites/group")) return "Group Landing";
    if (pathname.startsWith("/admin/sites/")) {
      const slug = pathname.split("/")[3];
      const school = schools.find((s) => s.slug === slug);
      return school?.name || "Site";
    }
    const allItems = sections.flatMap((s) => s.items);
    return allItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label || "Admin";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900">APS Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Dashboard */}
          <div className="space-y-1 mb-4">
            {sections[0].items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                  <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* WEBSITES section */}
          <div className="mb-4">
            <button onClick={() => setSitesExpanded(!sitesExpanded)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
              <span>Websites</span>
              {sitesExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {sitesExpanded && (
              <div className="mt-1 space-y-1">
                {siteNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                      <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining sections */}
          {sections.slice(1).map((section) => {
            const visibleItems = section.items.filter((item) => {
              if (!item.roles) return true;
              return user?.role && item.roles.includes(user.role);
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.title} className="mb-4">
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</p>
                <div className="mt-1 space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                        <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded hover:bg-gray-100">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 hidden sm:block">{getPageTitle()}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
