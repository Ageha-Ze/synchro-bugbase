"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit2,
  Save,
  MessageSquare,
  Send,
  Trash2,
  Calendar,
  X,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import type { Bug } from "@/lib/bugs";

/**
 * Types
 */
type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type CommentWithProfile = {
  id: string;
  bug_id: string;
  content: string;
  created_at: string | null;
  created_by: string | null;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
};


interface Attachment {
  id: string;
  type: string | null;
  url: string | null;
  created_at: string | null;
  bug_id?: string | null;
}

interface BugWithAttachments extends Bug {
  attachments?: Attachment[];
  project: {
    id: string;
    name: string;
    project_number: string | number | null;
  } | null;
}

interface BugDetailClientProps {
  bug: BugWithAttachments;
  initialComments: CommentWithProfile[];
  projectId: string;
}

/**
 * Helper components / small utilities
 */
const LoaderCentered = ({ label = "Loading..." }: { label?: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm">
    <div className="text-center space-y-2">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 dark:text-indigo-400" />
      <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{label}</p>
    </div>
  </div>
);

/**
 * Main component
 */
export default function BugDetailClient({
  bug: initialBug,
  initialComments = [],
  projectId,
}: BugDetailClientProps) {
  const supabase = supabaseBrowser;
  const router = useRouter();

  // state
  const [bug, setBug] = useState<BugWithAttachments>(initialBug);
  const [comments, setComments] = useState<CommentWithProfile[]>(initialComments || []);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BugWithAttachments>>(initialBug);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [newAttachment, setNewAttachment] = useState<{ type: string; url: string }>({
    type: "link",
    url: "",
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalMounted, setModalMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setModalMounted(true), []);

  // handle generic form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openPreview = (type: "image" | "video", url: string) => {
    setPreviewType(type);
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    if (previewType === "video") {
      const fullscreenVideo = document.getElementById("fullscreen-video") as HTMLVideoElement | null;
      if (fullscreenVideo) {
        fullscreenVideo.pause();
        fullscreenVideo.src = "";
        fullscreenVideo.load();
      }
    }
    setPreviewOpen(false);
    setTimeout(() => {
      setPreviewUrl(null);
      setPreviewType(null);
    }, 200);
  };

  /**
   * Fetch bug, attachments, comments (with profiles)
   */
  const fetchBugAndComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // fetch bug + attachments + comments in parallel
      const [bugRes, attachmentsRes, commentsRes] = await Promise.all([
        supabase.from("bugs").select(`
          *,
          project:projects!fk_project (
            id,
            name,
            project_number
          )
        `).eq("id", initialBug.id).single(),
        supabase.from("attachments").select("*").eq("bug_id", initialBug.id),
        supabase
          .from("comments")
          .select(`
    id,
    bug_id,
    content,
    created_at,
    created_by,
    profiles:profiles!fk_comments_profiles (
      id,
      full_name,
      avatar_url,
      role
    )
  `)
  .eq("bug_id", bug.id)
  .order("created_at", { ascending: false }),
      ]);

      if (bugRes.error) {
        console.warn("Failed to fetch main bug:", bugRes.error);
        setError(bugRes.error.message || "Failed to fetch bug");
      }

      const bugData = bugRes.data ?? initialBug;
      const attachmentsData = attachmentsRes.data ?? [];
      const commentsData = commentsRes.data ?? [];

      // Convert attachments to public URLs when stored as path
      const attachmentsWithPublicUrl: Attachment[] = (attachmentsData || []).map((a: any) => {
        const url = a?.url ?? null;
        if (!url) return { ...a, url: null };
        if (typeof url === "string" && url.startsWith("http")) return { ...a, url };
        try {
          const res = supabase.storage.from("bug_attachments").getPublicUrl(url);
          const publicUrl = (res as any)?.data?.publicUrl ?? url;
          return { ...a, url: publicUrl };
        } catch {
          return { ...a, url };
        }
      });

      setBug((prev) => ({ ...(bugData ?? prev), attachments: attachmentsWithPublicUrl }));
      setFormData((prev) => ({ ...(bugData ?? prev) }));
if (!Array.isArray(commentsData)) {
  console.error("Unexpected response:", commentsData);
  return;
}

setComments(commentsData as unknown as CommentWithProfile[]);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [initialBug.id, supabase]);

  useEffect(() => {
    if (!navigator.onLine) {
      setError("You are offline. Please check your internet connection.");
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchBugAndComments();

    // realtime channel for bug changes and comments
    const channel = (supabase as any)
      .channel?.("realtime-bug-updates")
      ?.on?.(
        "postgres_changes",
        { event: "*", schema: "public", table: "bugs", filter: `id=eq.${initialBug.id}` },
        async () => {
          if (mounted) await fetchBugAndComments();
        }
      )
      ?.on?.(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `bug_id=eq.${initialBug.id}` },
        async () => {
          if (mounted) await fetchBugAndComments();
        }
      )
      ?.subscribe?.();

    return () => {
      mounted = false;
      if (channel && (supabase as any).removeChannel) {
        try {
          (supabase as any).removeChannel(channel);
        } catch {}
      }
    };
  }, [fetchBugAndComments, initialBug.id, supabase]);

  /**
   * Save bug update
   */
// Tidak perlu ubah code client, langsung test
const handleSave = async () => {
  setSaving(true);
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      alert("You must be logged in to update bugs");
      return;
    }

    const updateData = {
      title: formData.title,
      description: formData.description,
      steps_to_reproduce: formData.steps_to_reproduce,
      expected_result: formData.expected_result,
      actual_result: formData.actual_result,
      status: formData.status,
      severity: formData.severity,
      priority: formData.priority,
      result: formData.result?.trim() ? formData.result : "To-Do",
      assigned_to: formData.assigned_to,
    };

    const { data, error } = await supabase
      .from("bugs")
      .update(updateData)
      .eq("id", bug.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    console.log("✅ Updated successfully:", data);

    await fetchBugAndComments();
    setEditing(false);
    alert("Bug updated successfully!");
    
  } catch (err: any) {
    console.error("Failed to update bug:", err);
    alert("Failed to update bug: " + (err?.message || "Unknown error"));
  } finally {
    setSaving(false);
  }
};
  /**
   * Attachments handlers
   */
  const handleAddAttachment = async () => {
    if (!newAttachment.url.trim()) return;
    try {
      const { data, error } = await supabase
        .from("attachments")
        .insert([{ bug_id: bug.id, type: newAttachment.type, url: newAttachment.url }])
        .select()
        .single();
      if (error) throw error;

      setBug((prev) => ({ ...prev, attachments: [...(prev.attachments || []), data] }));
      setNewAttachment({ type: "link", url: "" });
    } catch (err: any) {
      console.error(err);
      alert("Failed to add attachment: " + (err?.message || "Unknown error"));
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!confirm("Delete this attachment?")) return;
    try {
      const { error } = await supabase.from("attachments").delete().eq("id", id);
      if (error) throw error;
      setBug((prev) => ({ ...prev, attachments: (prev.attachments || []).filter((a) => a.id !== id) }));
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete attachment: " + (err?.message || "Unknown error"));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setPreviewFile(file);

      const folder = newAttachment.type === "image" ? "images" : "videos";
      const cleanFileName = file.name.replace(/\s+/g, "_");
      const uniqueName = `${bug.id}-${Date.now()}-${cleanFileName}`;

      const { data: upload, error: uploadError } = await supabase.storage
        .from("bug_attachments")
        .upload(`${folder}/${uniqueName}`, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const res = supabase.storage.from("bug_attachments").getPublicUrl(upload.path);
      const publicUrl = (res as any)?.data?.publicUrl ?? `/${upload.path}`;

      const { data, error } = await supabase
        .from("attachments")
        .insert([{ bug_id: bug.id, type: newAttachment.type, url: publicUrl }])
        .select()
        .single();
      if (error) throw error;

      setBug((prev) => ({ ...prev, attachments: [...(prev.attachments || []), data] }));
      setPreviewFile(null);
      setNewAttachment({ type: "link", url: "" });
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Comments handlers (insert & delete)
   */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        alert("You must be logged in to comment");
        return;
      }
      const user = authData?.user;
      if (!user?.id) {
        alert("User info missing");
        return;
      }

      const payload = {
        bug_id: bug.id,
        content: newComment.trim(),
        created_by: user.id,
      };

      const { data: newCommentData, error: insertError } = await supabase
  .from("comments")
  .insert({
    bug_id: bug.id,
    content: newComment,
    created_by: user.id
  })
  .select(`
    id,
    bug_id,
    content,
    created_at,
    created_by,
    profiles:profiles!fk_comments_profiles (
      id,
      full_name,
      avatar_url,
      role
    )
  `)
  .single();


      if (insertError) {
        console.error("Insert comment error:", insertError);
        alert("Failed to add comment: " + (insertError.message || "Unknown error"));
        return;
      }

      if (!newCommentData || (newCommentData as any)?.error) {
        console.error("Invalid insert response:", newCommentData);
        return;
      }

if (!newCommentData || typeof newCommentData !== "object") {
  console.error("Invalid new comment:", newCommentData);
  return;
}

setComments((prev) => [
  newCommentData as unknown as CommentWithProfile,
  ...prev,
]);
      setNewComment("");
    } catch (err: any) {
      console.error("Comment add error:", err);
      alert("Failed to add comment: " + (err?.message || "Unknown error"));
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete comment: " + (err?.message || "Unknown error"));
    }
  };

  /**
   * UI helpers
   */
  const getBadgeColor = (type: string, value: string) => {
    const map: Record<string, Record<string, string>> = {
      severity: {
        "Crash/Undoable": "bg-red-100 text-red-800 border-red-300",
        High: "bg-orange-100 text-orange-800 border-orange-300",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Low: "bg-green-100 text-green-800 border-green-300",
        Suggestion: "bg-blue-100 text-blue-800 border-blue-300",
      },
      priority: {
        Highest: "bg-red-100 text-red-800 border-red-300",
        High: "bg-pink-100 text-pink-800 border-pink-300",
        Medium: "bg-purple-100 text-purple-800 border-purple-300",
        Low: "bg-blue-100 text-blue-800 border-blue-300",
      },
      status: {
        New: "bg-blue-100 text-blue-800 border-blue-300",
        Open: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Blocked: "bg-red-100 text-red-800 border-red-300",
        Fixed: "bg-green-100 text-green-800 border-green-300",
        "To Fix in Update": "bg-indigo-100 text-indigo-800 border-indigo-300",
        "Will Not Fix": "bg-rose-100 text-rose-800 border-rose-300",
        "In Progress": "bg-teal-100 text-teal-800 border-teal-300",
      },
      result: {
        Confirmed: "bg-green-100 text-green-800 border-green-300",
        Unresolved: "bg-orange-100 text-orange-800 border-orange-300",
        "To-Do": "bg-indigo-100 text-indigo-800 border-indigo-300",
      },
    };
    return map[type]?.[value] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRoleBadge = (role: string | null | undefined) => {
    const roleColors: Record<string, string> = {
      QA: "bg-blue-100 text-blue-800 border-blue-300",
      Developer: "bg-purple-100 text-purple-800 border-purple-300",
      Manager: "bg-green-100 text-green-800 border-green-300",
    };

    if (!role) return null;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
          roleColors[role] || "bg-gray-100 text-gray-800 border-gray-300"
        }`}
      >
        {role}
      </span>
    );
  };

  /**
   * Render
   */
  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {loading && <LoaderCentered label="Fetching Data..." />}

              {/* Header */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-200 dark:border-neutral-700 p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <Button
                    onClick={() => {
                      router.replace(`/projects/${projectId}`);
                      router.refresh();
                    }}
                    className="bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-200 dark:border-indigo-700 w-full sm:w-auto"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>

                  <div className="flex gap-2 w-full sm:w-auto">
                    {editing && (
                      <Button
                        onClick={() => {
                          setEditing(false);
                          setFormData(bug);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        <X className="w-4 h-4 mr-2" />Cancel
                      </Button>
                    )}
                    <Button
                      onClick={editing ? handleSave : () => setEditing(true)}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg flex-1 sm:flex-none"
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : editing ? (
                        <Save className="w-4 h-4 mr-2" />
                      ) : (
                        <Edit2 className="w-4 h-4 mr-2" />
                      )}
                      {editing ? "Save Changes" : "Edit Bug"}
                    </Button>
                  </div>
                </div>

                {/* Title & Description */}
                {editing ? (
                  <div className="space-y-4">
                    <input
                      name="title"
                      value={(formData.title as string) || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-3 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
                      placeholder="Title"
                    />
                    <textarea
                      name="description"
                      value={(formData.description as string) || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-3 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
                      placeholder="Bug Location"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {bug.bug_number ? (
                        <span className="text-indigo-600 dark:text-indigo-400">
                          SCB-{String(bug.project?.project_number ?? 1).padStart(2, "0")}-{String(bug.bug_number ?? 0).padStart(3, "0")} :{" "}
                        </span>
                      ) : null}
                      {bug.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{bug.description}</p>
                    {bug.project && (
                      <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                        <span className="font-medium">Project:</span>
                        <span>{bug.project.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                      <Calendar className="w-4 h-4" /> Created:{" "}
                      {bug.created_at ? new Date(bug.created_at).toLocaleString("id-ID") : "—"}
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-200 dark:border-neutral-700 p-8 space-y-6">
                {["steps_to_reproduce", "expected_result", "actual_result"].map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      {f.replaceAll("_", " ")}
                    </label>
                    {editing ? (
                      <textarea
                        name={f}
                        value={(formData as any)[f] || ""}
                        onChange={handleChange}
                        className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-4 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white"
                        rows={4}
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-indigo-100 dark:border-neutral-700 text-gray-900 dark:text-white">
                        {(bug as any)[f] ? (
                          (bug as any)[f].split("\n").map((line: string, i: number) => <p key={i}>{line}</p>)
                        ) : (
                          <p className="text-gray-400 dark:text-gray-400 italic">No data provided</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800 dark:text-gray-100">Attachments</label>
                  {/* Form tambah attachment saat editing */}
  {editing && (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <select
        value={newAttachment.type}
        onChange={(e) => setNewAttachment((prev) => ({ ...prev, type: e.target.value }))}
        className="border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
      >
        <option value="link">Link</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      {newAttachment.type === "link" ? (
        <>
          <input
            type="text"
            placeholder="Enter URL..."
            value={newAttachment.url}
            onChange={(e) => setNewAttachment((prev) => ({ ...prev, url: e.target.value }))}
            className="border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-2 flex-1 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
          />
          <Button
            onClick={handleAddAttachment}
            className="bg-indigo-600 text-white"
            disabled={!newAttachment.url.trim()}
          >
            Add
          </Button>
        </>
      ) : (
        <input
          type="file"
          accept={newAttachment.type === "image" ? "image/*" : "video/*"}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
          }}
          className="border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-2 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
        />
      )}
    </div>
  )}
                  {bug.attachments?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {bug.attachments!.map((a) => (
                        <div
                          key={a.id}
                          className="relative border-2 border-indigo-100 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm hover:shadow-lg transition-all group"
                        >
                          {a.type === "image" && a.url && (
                            <img
                              src={a.url}
                              alt="Bug Attachment"
                              onClick={() => openPreview("image", a.url || "")}
                              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105"
                            />
                          )}

                          {a.type === "video" && a.url && (
                            <div className="relative group">
                              <video
                                key={a.url}
                                src={a.url}
                                crossOrigin="anonymous"
                                controls
                                playsInline
                                onError={(e) => console.error("Video error:", e)}
                                style={{
                                  width: "100%",
                                  height: "160px",
                                  borderRadius: "0.5rem",
                                  backgroundColor: "black",
                                  objectFit: "cover",
                                }}
                                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg bg-black"
                              />
                            </div>
                          )}

                          {(!a.type || a.type === "link") && a.url && (
                            <div className="p-4">
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-2 break-all"
                              >
                                <LinkIcon className="w-4 h-4" /> {a.url}
                              </a>
                            </div>
                          )}
                          {editing && (
                            <button
                              onClick={() => handleDeleteAttachment(a.id)}
                              className="absolute top-2 right-2 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900 p-2 rounded-full transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-400 italic bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-700 rounded-xl p-5 border border-indigo-100 dark:border-neutral-700">
                      No attachments yet
                    </p>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-200 dark:border-neutral-700 p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Comments ({comments.length})
                </h2>

                <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border-2 border-indigo-200 dark:border-indigo-700">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-xl p-4 resize-none bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
                    >
                      <Send className="w-4 h-4 mr-2" /> Post Comment
                    </Button>
                  </div>
                </div>

                {comments.length > 0 ? (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="border-2 border-indigo-100 dark:border-neutral-700 rounded-xl p-5 mb-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all"
                    >
                      <div className="flex gap-4 mb-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {c.profiles?.avatar_url ? (
                            <img
                              src={c.profiles.avatar_url}
                              alt={c.profiles.full_name || "User"}
                              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-700"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 border-indigo-200 dark:border-indigo-700">
                              {(c.profiles?.full_name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-bold text-gray-900 dark:text-gray-100">
                                  {c.profiles?.full_name || "Anonymous"}
                                </p>
                                {getRoleBadge(c.profiles?.role ?? null)}
                              </div>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                {c.created_at ? new Date(c.created_at).toLocaleString("id-ID") : ""}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 p-2 rounded-lg transition-all flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 dark:text-gray-500 py-12">No comments yet</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-200 dark:border-neutral-700 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Status & Priority</h2>
                  {!editing && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      Read-only
                    </span>
                  )}
                </div>

                {["status", "severity", "priority", "result"].map((k) => (
                  <div key={k} className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">{k}</label>
                    {editing ? (
                      <select
                        name={k}
                        value={(formData as any)[k] ?? ""}
                        onChange={handleChange}
                        className="w-full border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-2.5 text-sm font-medium bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        {k === "status" && ["Open", "New", "Blocked", "Fixed", "To Fix in Update", "Will Not Fix", "In Progress"].map((v) => <option key={v} value={v}>{v}</option>)}
                        {k === "severity" && ["Crash/Undoable", "High", "Medium", "Low", "Suggestion"].map((v) => <option key={v} value={v}>{v}</option>)}
                        {k === "priority" && ["Highest", "High", "Medium", "Low"].map((v) => <option key={v} value={v}>{v}</option>)}
                        {k === "result" && ["Confirmed", "Closed", "Unresolved", "To-Do"].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold border ${getBadgeColor(k, (bug as any)[k] || "To-Do")}`}>
                          {(bug as any)[k] || "To-Do"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {editing && (
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">💡 Changes will be saved when you click "Save Changes"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {previewOpen && previewUrl && modalMounted && (
          <div onClick={closePreview} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full h-full flex items-center justify-center">
              <button onClick={closePreview} className="absolute top-4 right-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full p-2 z-50 shadow-lg">
                <X className="w-5 h-5" />
              </button>

              {previewType === "image" && <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />}

              {previewType === "video" && (
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                  <video
                    id="fullscreen-video"
                    key={previewUrl}
                    src={previewUrl}
                    controls
                    playsInline
                    autoPlay
                    muted
                    crossOrigin="anonymous"
                    preload="metadata"
                    style={{ width: "100%", maxWidth: "90vw", maxHeight: "80vh", backgroundColor: "black", objectFit: "contain" }}
                    onError={(e) => console.error("Video failed to load:", e)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ClientConnectionHandler>
  );
}
