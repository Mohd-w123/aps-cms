"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MediaItem {
  url: string;
  publicId: string;
  createdAt: string;
  size: number;
}

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  hideLibrary?: boolean;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*",
  label = "Upload Image",
  hideLibrary = false,
}: FileUploaderProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const isVideo =
    value &&
    (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(value) ||
      value.includes("/video/upload/"));

  const isVideoMode = accept.includes("video");

  const upload = async (file: File) => {
    if (!token) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        onChange(json.data.url);
      } else {
        setError(json.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const openLibrary = useCallback(async () => {
    setShowLibrary(true);
    if (libraryImages.length > 0) return; // already loaded
    setLibraryLoading(true);
    try {
      const res = await fetch("/api/media", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setLibraryImages(json.data.images || []);
      }
    } catch {
      // silently fail
    } finally {
      setLibraryLoading(false);
    }
  }, [token, libraryImages.length]);

  const selectFromLibrary = (url: string) => {
    onChange(url);
    setShowLibrary(false);
  };

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          {isVideo ? (
            <video
              src={value}
              controls
              className="w-48 h-32 rounded-lg border border-gray-200 object-cover bg-black"
            />
          ) : (
            <Image
              src={value}
              alt="Uploaded"
              width={160}
              height={120}
              className="rounded-lg border border-gray-200 object-cover"
            />
          )}
          <button
            onClick={() => {
              onChange("");
              setError(null);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragOver ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {uploading ? (
              <div className="py-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                <p className="text-xs text-gray-500">Uploading{isVideoMode ? " video (up to 50MB)..." : "..."}</p>
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Drag & drop or click to browse {isVideoMode ? "(MP4, WebM, MOV up to 50MB)" : "(PNG, JPG, WebP up to 5MB)"}
                </p>
              </>
            )}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {!hideLibrary && !isVideoMode && (
            <button
              type="button"
              onClick={openLibrary}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
              Choose from Library
            </button>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />

      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowLibrary(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Media Library</h3>
              <button onClick={() => setShowLibrary(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {libraryLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : libraryImages.length === 0 ? (
                <p className="text-center text-gray-400 py-12">No images found. Upload your first image above.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {libraryImages.map((img) => (
                    <button
                      key={img.publicId}
                      onClick={() => selectFromLibrary(img.url)}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-colors focus:outline-none focus:border-emerald-500"
                    >
                      <Image
                        src={img.url}
                        alt=""
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
