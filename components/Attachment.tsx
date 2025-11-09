"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Attachments({ bugId }: { bugId: number }) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    // Supabase storage upload logic
    // supabase.storage.from('attachments').upload(...)
    alert(`Uploaded ${file.name} (simulate)`);
  };

  return (
    <div className="mt-2">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        className="mt-1 px-2 py-1 bg-purple-500 text-white rounded"
        onClick={handleUpload}
      >
        Upload
      </button>
    </div>
  );
}
