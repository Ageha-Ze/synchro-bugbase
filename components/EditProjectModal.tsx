"use client";

import { useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

interface EditProjectModalProps {
  project: { id: string; name: string; description: string | null };
  onClose: () => void;
  onUpdated: (updatedProject: any) => void;
}

export default function EditProjectModal({ project, onClose, onUpdated }: EditProjectModalProps) {
  const supabase = supabaseBrowser;
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("projects")
      .update({ name, description })
      .eq("id", project.id);

    setLoading(false);
    if (error) {
      alert("Error updating project: " + error.message);
      return;
    }

    onUpdated({ ...project, name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-800">Edit Project</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
