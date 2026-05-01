"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { schools } from "@/config/schools";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Image as ImageIcon,
  Trophy,
  Heart,
  Users,
  GraduationCap,
  Mail,
  Briefcase,
  UserCheck,
  School,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "News", href: "/admin/news", icon: Newspaper },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Toppers", href: "/admin/toppers", icon: Trophy },
  { label: "AICU", href: "/admin/aicu", icon: Heart },
  { label: "Persons", href: "/admin/persons", icon: Users },
  { label: "Admissions", href: "/admin/admissions", icon: GraduationCap },
  { label: "Enquiries", href: "/admin/enquiries", icon: Mail },
  { label: "Careers", href: "/admin/careers", icon: Briefcase },
  { label: "Alumni", href: "/admin/alumni", icon: UserCheck },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["superadmin", "school_admin"] },
  { label: "Schools", href: "/admin/schools", icon: School, roles: ["superadmin"] },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("");

  const isLoginPage = pathname === "/admin/login";

  // Redirect to login if not authenticated (skip if already on login page)
  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router, isLoginPage]);

  // Set selected school from user
  useEffect(() => {
    if (user) {
      const userSchool = schools.find((s) => s.id === user.schoolId || s.slug === user.schoolId);
      setSelectedSchool(userSchool?.slug || schools[0]?.slug || "");
    }
  }, [user]);

  // Login page renders without shell
  if (isLoginPage) return <>{children}</>;

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const currentSchool = schools.find((s) => s.slug === selectedSchool);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Not authenticated — will redirect
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar ─── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900">APS Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar footer — user */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900 hidden sm:block">
              {filteredNav.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* School selector */}
            <div className="relative">
              <button
                onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
              >
                <School className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 max-w-[150px] truncate">
                  {currentSchool?.name || "Select School"}
                </span>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {schoolDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSchoolDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                    {(user?.role === "superadmin" ? schools : schools.filter((s) => s.slug === selectedSchool)).map(
                      (s) => (
                        <button
                          key={s.slug}
                          onClick={() => {
                            setSelectedSchool(s.slug);
                            setSchoolDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            selectedSchool === s.slug ? "bg-emerald-50 text-emerald-700 font-medium" : "text-gray-700"
                          }`}
                        >
                          {s.name}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
