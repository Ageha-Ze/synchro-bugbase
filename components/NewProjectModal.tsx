"use client";

import { useState, useEffect } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

interface NewProjectModalProps {
  onClose: () => void;
  onNewProject: (project: any) => void;
}

export default function NewProjectModal({ onClose, onNewProject }: NewProjectModalProps) {
  const supabase = supabaseBrowser;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false); // untuk animasi masuk/keluar

  useEffect(() => {
    setIsVisible(true); // trigger animasi masuk saat komponen mount
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);

    try {
      // Ambil project_number terakhir
      const { data: lastProject } = await supabase
        .from("projects")
        .select("project_number")
        .order("project_number", { ascending: false })
        .limit(1)
        .single();

  const newProjectNumber = lastProject ? (lastProject.project_number ?? 0) + 1 : 1;

      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          description: description.trim(),
          project_number: newProjectNumber,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onNewProject(data);
      handleClose();
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false); // trigger animasi keluar
    setTimeout(() => {
      onClose(); // baru panggil onClose setelah animasi selesai
    }, 300); // durasi animasi sama dengan CSS
  };

  return (
    <ClientConnectionHandler>
      <div
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
          !isVisible ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Project
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ClientConnectionHandler>
  );
}
