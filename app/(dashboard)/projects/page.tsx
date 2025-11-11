"use client";

import EditProjectModal from "@/components/EditProjectModal";
import ProjectProgress from "@/components/ProjectProgress"; // <--- tambah baris ini
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabaseBrowser from "@/lib/supabaseBrowser";
import NewProjectModal from "@/components/NewProjectModal";
import type { Bug, NewBug,RecentBugs } from "@/lib/bugs"; // ✅ Import dari bugs.ts
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser;

  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Project>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [recentBugs, setRecentBugs] = useState<RecentBugs[]>([]);

const fetchRecentBugs = async (): Promise<RecentBugs[]> => {
  try {
    const { data, error } = await supabase
      .from("bugs")
      .select("*, project_id") // ambil project_id saja
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!data) return [];

    // Fetch project info manual
    const projectIds = Array.from(new Set(data.map(b => b.project_id)));
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, description")
      .in("id", projectIds);

    const mapped: RecentBugs[] = data.map(bug => ({
      ...bug,
      project: projects?.find(p => p.id === bug.project_id) ?? null,
    }));

    return mapped;
  } catch (err: any) {
    console.error("Error fetching recent bugs:", err.message || err);
    return [];
  }
};

  useEffect(() => {
    fetchProjects();
    fetchRecentBugs().then(setRecentBugs);
  }, []);

  
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data as Project[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = confirm(
      "Are you sure you want to delete this project? This will also delete all related bugs."
    );
    if (!confirmed) return;

    setDeletingId(projectId);

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      alert("Project deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting project:", error);
      alert("Error deleting project: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleNewProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setShowModal(false);
  };

  const handleUpdateProject = (updatedProject: Project) => {
  setProjects((prev) =>
    prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
  );
};


  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: keyof Project }) => {
    if (sortField !== field)
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-red-400 rounded-2xl shadow-md p-5 sm:p-8 text-white relative overflow-hidden">          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-1">Projects</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Manage and track all your projects easily
              </p>
              <div className="mt-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm">
                  <strong className="text-xl">{projects.length}</strong> total
                  projects
                </span>
              </div>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-white hover:bg-indigo-50 text-indigo-600 font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" /> New Project
            </Button>
          </div>
        </div>

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-indigo-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
              <FolderOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first project to start tracking bugs
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5 mr-2" /> Create Project
            </Button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-indigo-200">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase cursor-pointer hover:bg-indigo-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Project <SortIcon field="name" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase">
                      Description
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase cursor-pointer hover:bg-indigo-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Created <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {sortedProjects.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/projects/${p.id}`)}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all group"
                    >
                      <td className="px-6 py-5 font-medium text-gray-900 group-hover:text-indigo-600">
                        {p.name}
                        <ProjectProgress projectId={p.id} />
                      </td>
                      <td className="px-6 py-5 text-gray-600 text-sm line-clamp-2">
                        {p.description || "—"}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditProject(p);
                            }}
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="hidden xl:inline">Edit</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(p.id, e)}
                            disabled={deletingId === p.id}
                            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                          >
                            {deletingId === p.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden xl:inline">Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid gap-4 p-4">
              {sortedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {p.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {p.description || "—"}
                  </p>
                  <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditProject(p);
                        }}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        disabled={deletingId === p.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <NewProjectModal
            onClose={() => setShowModal(false)}
            onNewProject={(p) => setProjects((prev) => [p, ...prev])}
          />
        )}
        {editProject && (
          <EditProjectModal
            project={editProject}
            onClose={() => setEditProject(null)}
            onUpdated={(p) =>
              setProjects((prev) =>
                prev.map((item) => (item.id === p.id ? p : item))
              )
            }
          />
        )}
      </div>
    </div>
  );
}