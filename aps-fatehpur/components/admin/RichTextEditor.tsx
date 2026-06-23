"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Register ImageResize module client-side only
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const { default: Quill } = await import("quill");
    const { default: ImageResize } = await import("quill-resize-image");
    Quill.register("modules/imageResize", ImageResize);
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
  imageResize: {
    parchment: {},
    modules: ["Resize", "DisplaySize"],
  },
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <div className="rich-editor">
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={modules} />
      <style jsx global>{`
        .rich-editor .ql-container { min-height: 200px; font-size: 14px; }
        .rich-editor .ql-editor { min-height: 200px; }
        .rich-editor .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .rich-editor .ql-container { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .rich-editor .ql-editor img { max-width: 100%; cursor: pointer; }
      `}</style>
    </div>
  );
}
