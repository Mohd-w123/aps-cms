"use client";

import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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
