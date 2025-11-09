"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AddBug({ projectId }: { projectId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const { error } = await supabase.from("bugs").insert({
      project_id: projectId,
      title,
      description,
      severity: "Medium",
      priority: "Medium",
      status: "New",
    });

    if (error) toast.error("Gagal menambahkan bug");
    else toast.success("Bug berhasil ditambahkan!");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Judul bug"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Deskripsi"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Tambah Bug
      </button>
    </div>
  );
}
