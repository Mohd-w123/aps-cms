"use client";

import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useAdminApi() {
  const { token, logout } = useAuth();

  const handle = useCallback(
    async (res: Response) => {
      if (res.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
        window.location.href = "/admin/login";
        return { success: false, error: "Unauthorized" };
      }
      const text = await res.text();
      if (!text) {
        toast.error("Empty response from server");
        return { success: false, error: "Empty response" };
      }
      try {
        const json = JSON.parse(text);
        if (!json.success && json.error) {
          toast.error(json.error);
        }
        return json;
      } catch {
        toast.error("Invalid response from server");
        return { success: false, error: "Invalid response" };
      }
    },
    [logout]
  );

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const get = useCallback(
    async (url: string) => {
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        return handle(res);
      } catch {
        toast.error("Network error. Please check your connection.");
        return { success: false, error: "Network error" };
      }
    },
    [token, handle]
  );

  const post = useCallback(
    async (url: string, body: unknown) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await handle(res);
        if (result.success) toast.success("Created successfully");
        return result;
      } catch {
        toast.error("Network error. Please check your connection.");
        return { success: false, error: "Network error" };
      }
    },
    [headers, handle]
  );

  const put = useCallback(
    async (url: string, body: unknown) => {
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await handle(res);
        if (result.success) toast.success("Updated successfully");
        return result;
      } catch {
        toast.error("Network error. Please check your connection.");
        return { success: false, error: "Network error" };
      }
    },
    [headers, handle]
  );

  const del = useCallback(
    async (url: string) => {
      try {
        const res = await fetch(url, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await handle(res);
        if (result.success) toast.success("Deleted successfully");
        return result;
      } catch {
        toast.error("Network error. Please check your connection.");
        return { success: false, error: "Network error" };
      }
    },
    [token, handle]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const result = await handle(res);
        if (result.success) toast.success("File uploaded");
        return result;
      } catch {
        toast.error("Upload failed. Please check your connection.");
        return { success: false, error: "Network error" };
      }
    },
    [token, handle]
  );

  return { get, post, put, del, uploadFile, token };
}
