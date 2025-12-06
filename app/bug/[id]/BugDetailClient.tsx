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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/90 via-blue-50/90 to-pink-50/90 backdrop-blur-sm">
    <div className="text-center space-y-2">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
      <p className="text-indigo-600 font-semibold">{label}</p>
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
        "Crash/Undoable": "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200",
        High: "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200",
        Medium: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-200",
        Low: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200",
        Suggestion: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200",
      },
      priority: {
        Highest: "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-200",
        High: "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-200",
        Medium: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200",
        Low: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200",
      },
      status: {
        New: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200",
        Open: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-200",
        Blocked: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200",
        Fixed: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200",
        "To Fix in Update": "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200",
        "Will Not Fix": "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-200",
        "In Progress": "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200",
      },
      result: {
        Confirmed: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200",
        Unresolved: "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200",
        "To-Do": "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200",
      },
    };
    return map[type]?.[value] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200";
  };

  const getRoleBadge = (role: string | null | undefined) => {
    const roleColors: Record<string, string> = {
      QA: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md",
      Developer: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md",
      Manager: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md",
    };

    if (!role) return null;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
          roleColors[role] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="md:col-span-2 space-y-6">
              {loading && <LoaderCentered label="Fetching Data..." />}

              {/* Header */}
              <div className="pb-4 border-b-2 border-gradient-to-r from-purple-300 via-blue-300 to-pink-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                      {bug.bug_number ? (
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          SCB-{String(bug.project?.project_number ?? 1).padStart(2, "0")}-{String(bug.bug_number ?? 0).padStart(3, "0")}
                        </span>
                      ) : null} {bug.title}
                    </h1>
                    {bug.project && (
                      <p className="text-indigo-600 mt-1 font-medium">Project: {bug.project.name}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.replace(`/projects/${projectId}`);
                        router.refresh();
                      }}
                      className="border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {editing ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setFormData(bug);
                        }}
                        disabled={saving}
                        className="border-2 border-rose-300 hover:bg-rose-50 hover:border-rose-400 transition-all"
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    ) : null}

                    <Button
                      onClick={editing ? handleSave : () => setEditing(true)}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 transition-all"
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
              </div>

              {/* Title & Description in Edit Mode */}
              {editing && (
                <div className="border-2 border-purple-200 p-6 bg-gradient-to-br from-white to-purple-50 shadow-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={(formData.title as string) || ""}
                        onChange={handleChange}
                        placeholder="Bug title"
                        className="w-full px-4 py-3 border-2 border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-purple-700 mb-2">
                        Bug Location <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={(formData.description as string) || ""}
                        onChange={handleChange}
                        placeholder="Where did this bug occur?"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bug Details */}
              <div className="space-y-6">
                {[
                  ["Steps to Reproduce", "steps_to_reproduce", "from-blue-500 to-cyan-500"],
                  ["Expected Result", "expected_result", "from-green-500 to-emerald-500"],
                  ["Actual Result", "actual_result", "from-rose-500 to-pink-500"]
                ].map(([label, field, gradient]) => (
                  <div key={field} className="border-2 border-purple-200 p-6 bg-white shadow-lg hover:shadow-xl transition-all">
                    <label className={`block text-sm font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
                      {label} {field === "steps_to_reproduce" && <span className="text-red-500">*</span>}
                    </label>
                    {editing ? (
                      <textarea
                        name={field}
                        value={(formData as any)[field] || ""}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none transition-all"
                        required={field === "steps_to_reproduce"}
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 min-h-[80px]">
                        {(bug as any)[field] ? (
                          <div className="text-gray-800 whitespace-pre-wrap">{(bug as any)[field]}</div>
                        ) : (
                          <div className="text-gray-400 italic">No data provided</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Attachment Link */}
                {editing && (
                  <div className="border-2 border-indigo-200 p-6 bg-gradient-to-br from-white to-indigo-50 shadow-lg">
                    <label className="block text-sm font-semibold text-indigo-700 mb-2">
                      Add Attachment Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter URL..."
                        value={newAttachment.url}
                        onChange={(e) => setNewAttachment((prev) => ({ ...prev, url: e.target.value }))}
                        className="flex-1 px-4 py-3 border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all bg-white"
                      />
                      <Button
                        onClick={handleAddAttachment}
                        disabled={!newAttachment.url.trim()}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all"
                      >
                        Add Link
                      </Button>
                    </div>
                  </div>
                )}

                {/* Attachments Display */}
                <div className="border-2 border-cyan-200 p-6 bg-white shadow-lg">
                  <label className="block text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
                    Attachments
                  </label>
                  {bug.attachments?.length ? (
                    <div className="grid gap-3">
                      {bug.attachments.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-100 hover:border-cyan-300 transition-all">
                          <div className="flex-shrink-0">
                            {a.type === "image" && <span className="text-2xl">🖼️</span>}
                            {a.type === "video" && <span className="text-2xl">🎥</span>}
                            {(a.type === "link" || !a.type) && <span className="text-2xl">🔗</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            {a.type === "image" && a.url && (
                              <button
                                onClick={() => openPreview("image", a.url || "")}
                                className="text-cyan-600 hover:text-cyan-700 font-medium underline text-left"
                              >
                                View Image
                              </button>
                            )}
                            {a.type === "video" && a.url && (
                              <button
                                onClick={() => openPreview("video", a.url || "")}
                                className="text-cyan-600 hover:text-cyan-700 font-medium underline text-left"
                              >
                                View Video
                              </button>
                            )}
                            {(a.type === "link" || !a.type) && a.url && (
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-600 hover:text-cyan-700 font-medium underline break-all"
                              >
                                {a.url}
                              </a>
                            )}
                          </div>
                          {editing && (
                            <button
                              onClick={() => handleDeleteAttachment(a.id)}
                              className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50">
                      No attachments yet
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="border-2 border-pink-200 p-6 bg-white shadow-lg">
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                  Comments ({comments.length})
                </h2>

                <div className="mb-8 border-2 border-pink-200 p-4 bg-gradient-to-br from-pink-50 to-rose-50 shadow-md">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-pink-200 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none resize-none bg-white transition-all"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-200 transition-all"
                    >
                      <Send className="w-4 h-4 mr-2" /> Post Comment
                    </Button>
                  </div>
                </div>

                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div key={c.id} className="border-2 border-purple-100 p-4 bg-gradient-to-br from-white to-purple-50 shadow-md hover:shadow-lg transition-all">
                        <div className="flex gap-3 mb-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {c.profiles?.avatar_url ? (
                              <img
                                src={c.profiles.avatar_url}
                                alt={c.profiles.full_name || "User"}
                                className="w-10 h-10 object-cover ring-2 ring-purple-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-md">
                                {(c.profiles?.full_name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-gray-900">
                                    {c.profiles?.full_name || "Anonymous"}
                                  </p>
                                  {getRoleBadge(c.profiles?.role ?? null)}
                                </div>
                                <p className="text-sm text-indigo-600 font-medium">
                                  {c.created_at ? new Date(c.created_at).toLocaleString("id-ID") : ""}
                                </p>
                              </div>

                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12 bg-gradient-to-br from-gray-50 to-purple-50">
                    No comments yet
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="border-2 border-indigo-200 p-6 bg-gradient-to-br from-white to-indigo-50 shadow-lg sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Status & Priority</h2>
                  {!editing && (
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 font-semibold">
                      Read-only
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {["status", "severity", "priority", "result"].map((k) => (
                    <div key={k}>
                      <label className="block text-sm font-semibold text-indigo-700 mb-2 capitalize">{k}</label>
                      {editing ? (
                        <select
                          name={k}
                          value={(formData as any)[k] ?? ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border-2 border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all bg-white"
                        >
                          {k === "status" && ["Open", "New", "Blocked", "Fixed", "To Fix in Update", "Will Not Fix", "In Progress"].map((v) => <option key={v} value={v}>{v}</option>)}
                          {k === "severity" && ["Crash/Undoable", "High", "Medium", "Low", "Suggestion"].map((v) => <option key={v} value={v}>{v}</option>)}
                          {k === "priority" && ["Highest", "High", "Medium", "Low"].map((v) => <option key={v} value={v}>{v}</option>)}
                          {k === "result" && ["Confirmed", "Closed", "Unresolved", "To-Do"].map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      ) : (
                        <div className={`inline-flex px-3 py-1.5 text-sm font-semibold ${getBadgeColor(k, (bug as any)[k] || "To-Do")}`}>
                          {(bug as any)[k] || "To-Do"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {editing && (
                  <div className="mt-6 pt-4 border-t-2 border-indigo-200">
                    <p className="text-xs text-indigo-600 text-center font-medium">Changes will be saved when you click "Save Changes"</p>
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
              <button onClick={closePreview} className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-full p-2 z-50 shadow-xl">
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