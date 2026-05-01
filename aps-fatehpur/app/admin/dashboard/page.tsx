"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  GraduationCap,
  Mail,
  Briefcase,
  Newspaper,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  FileText,
  Users,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  admissions: number;
  enquiries: number;
  careers: number;
  news: number;
  gallery: number;
}

interface ActivityItem {
  _id: string;
  type: "enquiry" | "admission";
  name: string;
  subject?: string;
  class?: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    admissions: 0,
    enquiries: 0,
    careers: 0,
    news: 0,
    gallery: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchStats = async () => {
      try {
        const [admRes, enqRes, carRes, newsRes, galRes] = await Promise.all([
          fetch("/api/admissions?limit=1", { headers }).then((r) => r.json()),
          fetch("/api/enquiries?limit=1", { headers }).then((r) => r.json()),
          fetch("/api/careers?limit=1", { headers }).then((r) => r.json()),
          fetch("/api/news?limit=1", { headers }).then((r) => r.json()),
          fetch("/api/gallery?limit=1", { headers }).then((r) => r.json()),
        ]);

        setStats({
          admissions: admRes.pagination?.total || 0,
          enquiries: enqRes.pagination?.total || 0,
          careers: carRes.pagination?.total || 0,
          news: newsRes.pagination?.total || 0,
          gallery: galRes.pagination?.total || 0,
        });

        // Build recent activity from enquiries + admissions
        const recentItems: ActivityItem[] = [];

        if (enqRes.success && enqRes.data) {
          // Fetch more for activity
          const enqFull = await fetch("/api/enquiries?limit=5", { headers }).then((r) => r.json());
          (enqFull.data || []).forEach((e: { _id: string; name: string; subject: string; status: string; createdAt: string }) => {
            recentItems.push({
              _id: e._id,
              type: "enquiry",
              name: e.name,
              subject: e.subject,
              status: e.status,
              createdAt: e.createdAt,
            });
          });
        }

        if (admRes.success && admRes.data) {
          const admFull = await fetch("/api/admissions?limit=5", { headers }).then((r) => r.json());
          (admFull.data || []).forEach((a: { _id: string; studentName: string; class: string; status: string; createdAt: string }) => {
            recentItems.push({
              _id: a._id,
              type: "admission",
              name: a.studentName,
              class: a.class,
              status: a.status,
              createdAt: a.createdAt,
            });
          });
        }

        // Sort by date, take 10
        recentItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivity(recentItems.slice(0, 10));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const statCards = [
    { label: "Admissions", value: stats.admissions, icon: GraduationCap, color: "bg-blue-500", href: "/admin/admissions" },
    { label: "Enquiries", value: stats.enquiries, icon: Mail, color: "bg-amber-500", href: "/admin/enquiries" },
    { label: "Active Careers", value: stats.careers, icon: Briefcase, color: "bg-purple-500", href: "/admin/careers" },
    { label: "Published News", value: stats.news, icon: Newspaper, color: "bg-emerald-500", href: "/admin/news" },
    { label: "Gallery Items", value: stats.gallery, icon: ImageIcon, color: "bg-rose-500", href: "/admin/gallery" },
  ];

  const quickActions = [
    { label: "New Page", href: "/admin/pages", icon: FileText },
    { label: "Add News", href: "/admin/news", icon: Newspaper },
    { label: "Upload Gallery", href: "/admin/gallery", icon: ImageIcon },
    { label: "Manage Users", href: "/admin/users", icon: Users },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "new":
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "read":
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      case "replied":
      case "accepted":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of your school&apos;s activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {activity.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">
                No recent activity
              </div>
            ) : (
              activity.map((item) => (
                <div key={`${item.type}-${item._id}`} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === "enquiry" ? "bg-amber-50" : "bg-blue-50"
                      }`}
                    >
                      {item.type === "enquiry" ? (
                        <Mail className="h-3.5 w-3.5 text-amber-600" />
                      ) : (
                        <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.type === "enquiry" ? item.subject : `Class ${item.class}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <action.icon className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                <ArrowRight className="h-3 w-3 text-gray-300 ml-auto group-hover:text-emerald-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
