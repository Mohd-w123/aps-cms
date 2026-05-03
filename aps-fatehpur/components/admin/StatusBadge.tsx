"use client";

import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  new: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  read: "bg-blue-100 text-blue-700",
  reviewed: "bg-blue-100 text-blue-700",
  replied: "bg-emerald-100 text-emerald-700",
  accepted: "bg-emerald-100 text-emerald-700",
  shortlisted: "bg-emerald-100 text-emerald-700",
  approved: "bg-emerald-100 text-emerald-700",
  published: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-500",
  draft: "bg-gray-100 text-gray-600",
  true: "bg-emerald-100 text-emerald-700",
  false: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colors = colorMap[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors} ${className}`}>
      {status === "true" ? "Yes" : status === "false" ? "No" : status}
    </span>
  );
}
