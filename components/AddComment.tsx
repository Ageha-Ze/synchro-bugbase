"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddComment({ bugId }: { bugId: number }) {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content) return;
    await supabase.from("comments").insert({ bug_id: bugId, content });
    setContent("");
  };

  return (
    <div className="mt-2">
      <textarea
        className="w-full border rounded p-1"
        placeholder="Add comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className="mt-1 px-2 py-1 bg-green-500 text-white rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
