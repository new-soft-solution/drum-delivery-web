"use client";

import JoditEditor from "jodit-react";
import { useRef } from "react";

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
}: Props) {
  const editor = useRef(null);

  return (
    <JoditEditor
      ref={editor}
      value={value}
      onBlur={(newContent) => onChange(newContent)}
      config={{
        readonly: false,
        placeholder: placeholder,
        height: 400,
      }}
    />
  );
}
