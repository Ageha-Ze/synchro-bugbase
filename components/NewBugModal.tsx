"use client";

import { useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import type { Bug } from "@/lib/bugs"; // ✅ Import dari bugs.ts

interface NewBugModalProps {
  projectId: string;
  onClose: () => void;
  onNewBug: (bug: Bug) => void;
}

export default function NewBugModal({
  projectId,
  onClose,
  onNewBug,
}: NewBugModalProps) {
  const supabase = supabaseBrowser;
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Medium" as NonNullable<Bug["severity"]>,
    priority: "Medium" as NonNullable<Bug["priority"]>,
    status: "New" as NonNullable<Bug["status"]>,
    steps_to_reproduce: "",
    expected_result: "",
    actual_result: "",
    link: "",
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Only PNG, JPG, WEBP, or GIF images are allowed.");
      return;
    }

    if (file.name.length > 50) {
      setAlertMessage("File name too long. Please use a shorter name.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlertMessage("Image file too large (max 5 MB).");
      return;
    }

    setImageFile(file);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["video/mp4", "video/mkv", "video/quicktime", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      setError("Only MP4, MKV, MOV, or AVI videos are allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Video file too large (max 50 MB).");
      return;
    }

    setVideoFile(file);
  };


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) return setError("Bug Title is required");
    if (!formData.description.trim()) return setError("Bug Location is required");
    if (!formData.steps_to_reproduce.trim()) return setError("Steps are required");

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a bug");

      // 1️⃣ Dapatkan nomor bug terakhir
      const { data: lastBug } = await supabase
        .from("bugs")
        .select("bug_number")
        .eq("project_id", projectId)
        .order("bug_number", { ascending: false })
        .limit(1)
        .single();

      const nextBugNumber = lastBug ? (lastBug as any).bug_number + 1 : 1;

      const bugData = {
        project_id: projectId,
        bug_number: nextBugNumber,
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        priority: formData.priority,
        status:formData.status, // ✅ Tidak perlu convert "Closed" lagi
        steps_to_reproduce: formData.steps_to_reproduce.trim() || null,
        expected_result: formData.expected_result.trim() || null,
        actual_result: formData.actual_result.trim() || null,
        created_by: user.id,
      };

      // 2️⃣ Insert bug
      const { data: insertedData, error: insertError } = await supabase
        .from("bugs")
        .insert([bugData])
        .select()
        .single< Bug >(); // ✅ beri generic type

      if (insertError) throw insertError;
      if (!insertedData) throw new Error("Failed to create bug");

      // 3️⃣ Upload gambar (jika ada)
      if (imageFile) {
        const uniqueName = `${insertedData.id}-${Date.now()}-${encodeURIComponent(
          imageFile.name
        )}`;
        const { data: imgUpload, error: imgError } = await supabase.storage
          .from("bug_attachments")
          .upload(`images/${uniqueName}`, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type || "image/png",
          });

        if (imgError) throw new Error(`Image upload failed: ${imgError.message}`);

        const { data: imgPublic } = supabase.storage
          .from("bug_attachments")
          .getPublicUrl(imgUpload.path);

        await supabase.from("attachments").insert([
          {
            bug_id: insertedData.id,
            type: "image",
            url: imgPublic.publicUrl,
          },
        ]);
      }

      // 4️⃣ Upload video (jika ada)
      if (videoFile) {
        const safeFileName = videoFile.name.replace(/[^\w.\-]/g, "_");
        const uniqueName = `${insertedData.id}-${Date.now()}-${safeFileName}`;

        const { data: vidUpload, error: vidError } = await supabase.storage
          .from("bug_attachments")
          .upload(`videos/${uniqueName}`, videoFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: videoFile.type || "video/mp4",
          });

        if (vidError) throw new Error(`Video upload failed: ${vidError.message}`);

        const { data: vidPublic } = supabase.storage
          .from("bug_attachments")
          .getPublicUrl(`videos/${uniqueName}`);

        await supabase.from("attachments").insert([
          {
            bug_id: insertedData.id,
            type: "video",
            url: vidPublic.publicUrl,
          },
        ]);
      }

      // 5️⃣ Link eksternal
      if (formData.link.trim()) {
        const type = formData.link.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          ? "image"
          : formData.link.match(/\.(mp4|mov|avi|mkv)$/i)
          ? "video"
          : "link";

        await supabase.from("attachments").insert([
          { bug_id: insertedData.id, type, url: formData.link.trim() },
        ]);
      }

      onNewBug(insertedData as Bug);
      handleClose();
    } catch (err: any) {
      console.error("❌ Error creating bug:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      setError(err?.message || err?.details || "Failed to create bug.");
    } finally {
      setLoading(false);
      setImageFile(null);
      setVideoFile(null);
    }
  };  
  
  return (
    <ClientConnectionHandler>
    <div
      onClick={handleOverlayClick}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Report New Bug
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., App crashes when clicking Save"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
              required
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loading}
              >
                <option value="Crash/Undoable">Crash</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Suggestion">Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loading}
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loading}
              >
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bug Location <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Where did this bug occur?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              disabled={loading}
              required
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steps to Reproduce <span className="text-red-500">*</span>
            </label>
            <textarea
              name="steps_to_reproduce"
              value={formData.steps_to_reproduce}
              onChange={handleChange}
              rows={4}
              placeholder="1. Go to... 2. Click... 3. Error appears"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              disabled={loading}
              required
            />
          </div>

          {/* Expected & Actual Results */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Result
              </label>
              <textarea
                name="expected_result"
                value={formData.expected_result}
                onChange={handleChange}
                rows={3}
                placeholder="What should happen?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Result
              </label>
              <textarea
                name="actual_result"
                value={formData.actual_result}
                onChange={handleChange}
                rows={3}
                placeholder="What actually happened?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Attachment Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment Link (Optional)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com/screenshot-or-video"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video (Optional)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Bug"
              )}
            </Button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
    </ClientConnectionHandler>
  );
}
