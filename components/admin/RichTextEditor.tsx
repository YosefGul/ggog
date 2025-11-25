"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef, useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [hasSetInitialValue, setHasSetInitialValue] = useState(false);

  // Force re-render when value changes from empty to non-empty (for edit mode)
  useEffect(() => {
    if (!hasSetInitialValue && value && value.trim() !== "") {
      setEditorKey((prev) => prev + 1);
      setHasSetInitialValue(true);
    }
  }, [value, hasSetInitialValue]);

  // Update editor content when value changes after initialization
  useEffect(() => {
    if (editorRef.current && isInitialized) {
      const currentContent = editorRef.current.getContent();
      // Only update if content is different to avoid unnecessary updates
      if (value !== undefined && currentContent !== value) {
        editorRef.current.setContent(value || "");
      }
    }
  }, [value, isInitialized]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <Editor
        key={editorKey}
        apiKey="g9vuwetv1ta1u4jenq9dva7ch9sbuihz49twofoah8h6ilg0"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          setIsInitialized(true);
          // Set initial content if value exists
          if (value && value.trim() !== "") {
            editor.setContent(value);
            setHasSetInitialValue(true);
          }
        }}
        initialValue={value || ""}
        onEditorChange={(content) => {
          if (isInitialized) {
            onChange(content);
          }
        }}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help | link image | code",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          language: "tr",
        }}
      />
    </div>
  );
}

