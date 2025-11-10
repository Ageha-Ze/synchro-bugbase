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
        .single();

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
      setError(err?.message || "Failed to create bug.");
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
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white/90 dark:bg-neutral-900/90 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-900 border-b border-gray-100 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            🐞 Report New Bug
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 animate-fadeIn">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-800 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., App crashes when clicking Save"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Severity",
                name: "severity",
                options: ["Crash/Undoable", "High", "Medium", "Low", "Suggestion"],
              },
              {
                label: "Priority",
                name: "priority",
                options: ["Highest", "High", "Medium", "Low"],
              },
              {
                label: "Status",
                name: "status",
                options: ["New", "Open", "Fixed"],
              },
            ].map(({ label, name, options }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {label}
                </label>
                <select
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Textareas */}
          {[
            { name: "description", label: "Bug Location", rows: 2 },
            {
              name: "steps_to_reproduce",
              label: "Steps to Reproduce",
              rows: 5,
              placeholder: "1. Go to... 2. Click... 3. Error appears",
            },
            { name: "expected_result", label: "Expected Result", rows: 3 },
            { name: "actual_result", label: "Actual Result", rows: 3 },
          ].map(({ name, label, rows, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
              </label>
              <textarea
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                rows={rows}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                disabled={loading}
              />
            </div>
          ))}

          {/* Attachments Section */}
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      🔗 Insert an Attachment Link
    </label>
    <input
      type="url"
      name="link"
      value={formData.link}
      onChange={handleChange}
      placeholder="https://example.com/screenshot-or-video"
      className="w-full px-4 py-2.5 bg-white/80 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      disabled={loading}
    />
  </div>

  {/* Image Upload */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      🖼️ Upload Image (Optional)
    </label>
    <div
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
          handleImageChange({ target: { files: [file] } } as any);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 
        ${imageFile
          ? "border-green-400 bg-green-50/60 dark:bg-green-900/10"
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-neutral-800/40"} 
        hover:scale-[1.01]`}
      onClick={() => !loading && document.getElementById("imageUpload")?.click()}
    >
      {imageFile ? (
        <div className="flex flex-col items-center gap-2 animate-fadeIn">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-36 h-36 object-cover rounded-lg border border-gray-200 dark:border-neutral-700 shadow-md"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
            {imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setImageFile(null);
            }}
            className="text-red-500 hover:text-red-600 mt-1"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click or drag an image here
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            PNG, JPG, WEBP, or GIF (max 5 MB)
          </p>
        </div>
      )}
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        disabled={loading}
      />
    </div>
  </div>

  {/* Video Upload */}
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      🎥 Upload Video (Optional)
    </label>
    <div
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("video/")) {
          handleVideoChange({ target: { files: [file] } } as any);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 
        ${videoFile
          ? "border-green-400 bg-green-50/60 dark:bg-green-900/10"
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-neutral-800/40"} 
        hover:scale-[1.01]`}
      onClick={() => !loading && document.getElementById("videoUpload")?.click()}
    >
      {videoFile ? (
        <div className="flex flex-col items-center gap-2 animate-fadeIn">
          <video
            src={URL.createObjectURL(videoFile)}
            className="w-44 h-28 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-md"
            controls
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
            {videoFile.name} · {(videoFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setVideoFile(null);
            }}
            className="text-red-500 hover:text-red-600 mt-1"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click or drag a video here
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            MP4, MOV, AVI, MKV (max 50 MB)
          </p>
        </div>
      )}
      <input
        id="videoUpload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoChange}
        disabled={loading}
      />
    </div>
  </div>
</div>


          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={loading}
              className="rounded-lg border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Bug"
              )}
            </Button>
          </div>
          {alertMessage && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
      <p className="text-red-600 dark:text-red-400 mb-4">{alertMessage}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => setAlertMessage(null)}
      >
        OK
      </button>
    </div>
  </div>
)}
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
