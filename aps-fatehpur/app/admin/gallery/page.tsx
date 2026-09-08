"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FileUploader } from "@/components/admin/FileUploader";
import { Plus, Trash2, X, Loader2, ImageIcon, Film, Play, Upload, Link as LinkIcon } from "lucide-react";
import { toEmbedUrl, isDirectVideoUrl, getVideoThumbnail } from "@/lib/utils";

interface GalleryItem {
  _id: string;
  type: string;
  category: string;
  image: string;
  title?: string;
  videoUrl?: string;
  order: number;
  isPublished: boolean;
}

interface Form {
  type: string;
  category: string;
  image: string;
  title: string;
  videoUrl: string;
  order: number;
  isPublished: boolean;
}

const empty: Form = {
  type: "image",
  category: "general",
  image: "",
  title: "",
  videoUrl: "",
  order: 0,
  isPublished: true,
};

export default function AdminGalleryPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [videoSource, setVideoSource] = useState<"upload" | "url">("upload");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "image" | "video">("all");
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const load = async () => {
    const r = await api.get("/api/gallery?limit=200");
    if (r.success) setItems(r.data);
    setLoading(false);
  };
  useEffect(() => {
    if (api.token) load();
  }, [api.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false);
    setForm(empty);
    setError(null);
    setVideoSource("upload");
  };

  const handleVideoUrlChange = (url: string) => {
    setForm((prev) => {
      const autoThumb = !prev.image ? getVideoThumbnail(url) : prev.image;
      return { ...prev, videoUrl: url, image: autoThumb };
    });
  };

  const handleVideoUpload = (url: string) => {
    setForm((prev) => {
      const autoThumb = !prev.image ? getVideoThumbnail(url) : prev.image;
      return { ...prev, videoUrl: url, image: autoThumb };
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    let finalImage = form.image;
    if (form.type === "video" && !finalImage && form.videoUrl) {
      finalImage = getVideoThumbnail(form.videoUrl);
    }

    const body = {
      ...form,
      image: finalImage,
      category: form.category.trim().toLowerCase() || "general",
      videoUrl: form.type === "video" && form.videoUrl ? form.videoUrl.trim() : undefined,
    };

    const r = await api.post("/api/gallery", body);
    if (r.success) {
      close();
      load();
    } else {
      setError(r.error || "Failed to save item");
    }
    setSaving(false);
  };

  const togglePublish = async (item: GalleryItem) => {
    await api.put("/api/gallery", { id: item._id, isPublished: !item.isPublished });
    load();
  };

  const remove = async () => {
    if (!delId) return;
    await api.del(`/api/gallery?id=${delId}`);
    setDelId(null);
    load();
  };

  const filtered = tab === "all" ? items : items.filter((i) => i.type === tab);
  const existingCategories = Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort();

  const isFormValid =
    form.type === "image"
      ? Boolean(form.image)
      : Boolean(form.videoUrl || form.image);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500 mt-1">Manage photos & videos</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "image", "video"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "all" ? "All" : t === "image" ? "Photos" : "Videos"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
              <div
                className="aspect-square relative bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setPreviewItem(item)}
              >
                {item.image ? (
                  <Image src={item.image} alt={item.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {item.type === "video" ? <Film className="h-8 w-8 text-gray-400" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                      <Play className="h-5 w-5 ml-0.5 text-emerald-600" />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded-full backdrop-blur-xs uppercase tracking-wide">
                    {item.category || "general"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 flex items-center justify-between gap-2 border-t border-gray-100">
                <div className="truncate">
                  {item.title ? (
                    <p className="text-xs font-medium text-gray-800 truncate" title={item.title}>
                      {item.title}
                    </p>
                  ) : (
                    <span className="text-[11px] text-gray-400 capitalize">{item.type}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => togglePublish(item)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.isPublished ? "Published" : "Draft"}
                  </button>
                  <button
                    onClick={() => setDelId(item._id)}
                    className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No items found</div>}
        </div>
      )}

      {/* Add Item Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Item</h3>
              <button onClick={close} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {/* Item Type Switcher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "image" }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${
                      form.type === "image"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" /> Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: "video" }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-all ${
                      form.type === "video"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Film className="h-4 w-4" /> Video
                  </button>
                </div>
              </div>

              {/* Title / Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title / Caption <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Sports Day 2026 Opening Ceremony"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  list="gallery-categories"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. annual function, sports, events"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="gallery-categories">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Select an existing category or enter a new one.</p>
              </div>

              {/* Photo Mode */}
              {form.type === "image" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                  <FileUploader
                    value={form.image}
                    onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                    accept="image/*"
                    label="Upload Photo"
                  />
                </div>
              )}

              {/* Video Mode */}
              {form.type === "video" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Video Source
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoSource("upload")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                          videoSource === "upload"
                            ? "bg-white border-emerald-500 text-emerald-700 shadow-xs font-semibold"
                            : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Video File
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSource("url")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                          videoSource === "url"
                            ? "bg-white border-emerald-500 text-emerald-700 shadow-xs font-semibold"
                            : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <LinkIcon className="h-3.5 w-3.5" /> YouTube / Video URL
                      </button>
                    </div>
                  </div>

                  {videoSource === "upload" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video File * <span className="text-xs text-gray-400 font-normal">(MP4, WebM, MOV up to 50MB)</span>
                      </label>
                      <FileUploader
                        value={form.videoUrl}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        label="Upload Video"
                        hideLibrary
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL * <span className="text-xs text-gray-400 font-normal">(YouTube, Vimeo, or direct link)</span>
                      </label>
                      <input
                        type="url"
                        value={form.videoUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  )}

                  {/* Thumbnail Preview / Custom Poster */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">
                        Poster / Thumbnail <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                      </label>
                      {form.image && (
                        <span className="text-[11px] text-emerald-600 font-medium">✓ Thumbnail set</span>
                      )}
                    </div>
                    <FileUploader
                      value={form.image}
                      onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                      accept="image/*"
                      label="Upload Custom Thumbnail"
                    />
                    {!form.image && (
                      <p className="text-xs text-gray-500 mt-1">
                        {form.videoUrl
                          ? "Thumbnail will be automatically extracted from your video."
                          : "A poster frame will be generated automatically once a video is selected."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order & Published */}
              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Published</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
              <button
                onClick={close}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !isFormValid}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Add to Gallery"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview / Playback Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {previewItem.type === "video" && previewItem.videoUrl ? (
              isDirectVideoUrl(previewItem.videoUrl) ? (
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                  <video
                    src={previewItem.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full">
                  <iframe
                    src={toEmbedUrl(previewItem.videoUrl)}
                    title={previewItem.title || "Video"}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )
            ) : previewItem.image ? (
              <div className="relative aspect-video w-full bg-black">
                <Image
                  src={previewItem.image}
                  alt={previewItem.title || "Gallery"}
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}

            {previewItem.title && (
              <div className="p-4 bg-gray-900 text-white text-sm">
                <p className="font-medium">{previewItem.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  Category: {previewItem.category || "General"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!delId}
        onOpenChange={() => setDelId(null)}
        title="Delete Item"
        description="This will permanently delete this gallery item."
        confirmLabel="Delete"
        onConfirm={remove}
        destructive
      />
    </div>
  );
}
