"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import "react-quill/dist/quill.snow.css";

let isQuillConfigured = false;

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const { default: Quill } = await import("quill");

    if (!isQuillConfigured && typeof window !== "undefined") {
      isQuillConfigured = true;
      try {
        const BaseImage = Quill.import("formats/image");
        const ATTRIBUTES = ["alt", "height", "width", "style"];

        class CustomImage extends BaseImage {
          static formats(domNode: HTMLElement) {
            return ATTRIBUTES.reduce((formats: Record<string, string>, attribute: string) => {
              if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute) || "";
              }
              return formats;
            }, {});
          }
          format(name: string, value: string | null) {
            if (ATTRIBUTES.includes(name)) {
              if (value) {
                this.domNode.setAttribute(name, value);
              } else {
                this.domNode.removeAttribute(name);
              }
            } else {
              super.format(name, value);
            }
          }
        }
        Quill.register(CustomImage, true);
      } catch (e) {
        console.warn("Quill image format extension note:", e);
      }
    }

    return RQ;
  },
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["blockquote", "code-block"],
    [{ align: [] }],
    ["clean"],
  ],
};

interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Synchronize overlay position with selected image
  const updateOverlay = useCallback(() => {
    if (!selectedImg || !containerRef.current) {
      setOverlayRect(null);
      return;
    }
    const imgRect = selectedImg.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setOverlayRect({
      top: imgRect.top - containerRect.top,
      left: imgRect.left - containerRect.left,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, [selectedImg]);

  // Commit changes to Quill
  const commitChange = useCallback(() => {
    if (!containerRef.current) return;
    const editor = containerRef.current.querySelector(".ql-editor");
    if (editor) {
      onChange(editor.innerHTML);
    }
  }, [onChange]);

  // Listen to clicks on images inside the editor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === "IMG" && container.contains(target)) {
        e.stopPropagation();
        setSelectedImg(target as HTMLImageElement);
      } else if (!isDragging) {
        // Deselect if clicking outside
        const isClickingOverlay = target.closest(".image-resizer-overlay");
        if (!isClickingOverlay) {
          setSelectedImg(null);
          setOverlayRect(null);
        }
      }
    };

    const handleScroll = () => {
      if (selectedImg && !isDragging) {
        updateOverlay();
      }
    };

    container.addEventListener("click", handleClick);
    const editorScroll = container.querySelector(".ql-editor");
    editorScroll?.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateOverlay);

    return () => {
      container.removeEventListener("click", handleClick);
      editorScroll?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateOverlay);
    };
  }, [selectedImg, isDragging, updateOverlay]);

  // Update overlay when selected image changes
  useEffect(() => {
    updateOverlay();
  }, [selectedImg, updateOverlay]);

  // Apply width preset (e.g., 25%, 50%, 75%, 100%)
  const applyWidthPreset = (percent: string) => {
    if (!selectedImg) return;
    selectedImg.style.width = percent;
    selectedImg.setAttribute("width", percent);
    selectedImg.style.height = "auto";
    updateOverlay();
    commitChange();
  };

  // Apply alignment
  const applyAlignment = (align: "left" | "center" | "right" | "inline") => {
    if (!selectedImg) return;
    if (align === "center") {
      selectedImg.style.display = "block";
      selectedImg.style.margin = "16px auto";
      selectedImg.style.float = "none";
    } else if (align === "left") {
      selectedImg.style.display = "inline-block";
      selectedImg.style.float = "left";
      selectedImg.style.margin = "0 16px 16px 0";
    } else if (align === "right") {
      selectedImg.style.display = "inline-block";
      selectedImg.style.float = "right";
      selectedImg.style.margin = "0 0 16px 16px";
    } else {
      selectedImg.style.display = "inline-block";
      selectedImg.style.float = "none";
      selectedImg.style.margin = "0";
    }
    updateOverlay();
    commitChange();
  };

  // Delete selected image
  const deleteSelectedImage = () => {
    if (!selectedImg) return;
    selectedImg.remove();
    setSelectedImg(null);
    setOverlayRect(null);
    commitChange();
  };

  // Corner drag-to-resize
  const handleCornerMouseDown = (e: React.MouseEvent, corner: "se" | "sw" | "ne" | "nw") => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedImg || !containerRef.current) return;

    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = selectedImg.offsetWidth;
    const aspectRatio = selectedImg.naturalWidth / (selectedImg.naturalHeight || 1);
    const containerWidth = containerRef.current.offsetWidth - 32;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth;

      if (corner === "se" || corner === "ne") {
        newWidth = startWidth + deltaX;
      } else {
        newWidth = startWidth - deltaX;
      }

      // Clamp dimensions
      newWidth = Math.max(60, Math.min(newWidth, containerWidth));

      selectedImg.style.width = `${Math.round(newWidth)}px`;
      selectedImg.style.height = `${Math.round(newWidth / aspectRatio)}px`;
      selectedImg.setAttribute("width", `${Math.round(newWidth)}`);
      updateOverlay();
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      commitChange();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="rich-editor relative" ref={containerRef}>
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} />

      {/* Floating Image Resizer Overlay */}
      {overlayRect && selectedImg && (
        <div
          className="image-resizer-overlay absolute pointer-events-none z-20"
          style={{
            top: overlayRect.top,
            left: overlayRect.left,
            width: overlayRect.width,
            height: overlayRect.height,
            border: "2px solid #10b981",
          }}
        >
          {/* Floating Controls Bar */}
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white shadow-xl rounded-lg px-3 py-1.5 flex items-center gap-2 pointer-events-auto text-xs whitespace-nowrap select-none"
            style={{ zIndex: 30 }}
          >
            <span className="text-gray-400 font-medium mr-1 text-[11px]">Size:</span>
            <button
              type="button"
              onClick={() => applyWidthPreset("25%")}
              className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-emerald-600 font-medium transition-colors"
              title="25% width"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => applyWidthPreset("50%")}
              className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-emerald-600 font-medium transition-colors"
              title="50% width"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => applyWidthPreset("75%")}
              className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-emerald-600 font-medium transition-colors"
              title="75% width"
            >
              75%
            </button>
            <button
              type="button"
              onClick={() => applyWidthPreset("100%")}
              className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-emerald-600 font-medium transition-colors"
              title="Full width"
            >
              100%
            </button>

            <span className="w-px h-4 bg-gray-700 mx-1" />

            <button
              type="button"
              onClick={() => applyAlignment("left")}
              className="p-1 rounded hover:bg-gray-800 text-gray-300 hover:text-white"
              title="Align Left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment("center")}
              className="p-1 rounded hover:bg-gray-800 text-gray-300 hover:text-white"
              title="Align Center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment("right")}
              className="p-1 rounded hover:bg-gray-800 text-gray-300 hover:text-white"
              title="Align Right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>

            <span className="w-px h-4 bg-gray-700 mx-1" />

            <button
              type="button"
              onClick={deleteSelectedImage}
              className="p-1 rounded hover:bg-red-600 text-red-400 hover:text-white transition-colors"
              title="Delete Image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 4 Corner Drag Handles */}
          <div
            onMouseDown={(e) => handleCornerMouseDown(e, "nw")}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-sm cursor-nwse-resize pointer-events-auto shadow-sm"
          />
          <div
            onMouseDown={(e) => handleCornerMouseDown(e, "ne")}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-sm cursor-nesw-resize pointer-events-auto shadow-sm"
          />
          <div
            onMouseDown={(e) => handleCornerMouseDown(e, "se")}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-sm cursor-nwse-resize pointer-events-auto shadow-sm"
          />
          <div
            onMouseDown={(e) => handleCornerMouseDown(e, "sw")}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-sm cursor-nesw-resize pointer-events-auto shadow-sm"
          />
        </div>
      )}

      <style jsx global>{`
        .rich-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
        }
        .rich-editor .ql-editor {
          min-height: 200px;
        }
        .rich-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .rich-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .rich-editor .ql-editor img {
          max-width: 100%;
          cursor: pointer;
          border-radius: 4px;
          transition: outline 0.15s ease;
        }
        .rich-editor .ql-editor img:hover {
          outline: 2px dashed #10b981;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
