"use client";

import EditProjectModal from "@/components/EditProjectModal";
import ProjectProgress from "@/components/ProjectProgress"; // <--- tambah baris ini
import { Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";
import NewProjectModal from "@/components/NewProjectModal";
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
  const supabase = createBrowserSupabaseClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Project>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchProjects();
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
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 drop-shadow-md">Projects</h1>
              <p className="text-indigo-100 text-lg">
                Manage your bug tracking projects
              </p>
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="font-semibold text-xl">{projects.length}</span>
                  <span className="ml-2 text-indigo-100">Total Projects</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-white hover:bg-indigo-50 text-indigo-600 font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Table with modern design */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-6">
                <FolderOpen className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-8 text-lg">
                Get started by creating your first project
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-base font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-indigo-200">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Project Name
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Created Date
                        <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100">
                  {sortedProjects.map((project, index) => (
                    <tr
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all group"
                      style={{ 
                        animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s backwards` 
                      }}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:scale-150 transition-transform"></div>
                          <div>
  <span className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
    {project.name}
  </span>
  {/* Progress Bar kecil */}
  <ProjectProgress projectId={project.id} />
</div>

                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-md">
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {project.description || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "short", year: "numeric" }
                              )
                            : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right flex justify-end gap-2">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setEditProject(project);
    }}
    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
  >
    <Pencil className="w-4 h-4" />
    <span className="hidden group-hover:inline">Edit</span>
  </button>

  <button
    onClick={(e) => handleDeleteProject(project.id, e)}
    disabled={deletingId === project.id}
    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all"
  >
    {deletingId === project.id ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Deleting...</span>
      </>
    ) : (
      <>
        <Trash2 className="w-4 h-4" />
        <span className="hidden group-hover:inline">Delete</span>
      </>
    )}
  </button>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <NewProjectModal
            onClose={() => setShowModal(false)}
            onNewProject={handleNewProject}
          />
        )}
        {editProject && (
  <EditProjectModal
    project={editProject}
    onClose={() => setEditProject(null)}
    onUpdated={handleUpdateProject}
  />
)}

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
          /* Hover baris tabel project */
  tr.group:hover {
    background: linear-gradient(90deg, #eef2ff, #ede9fe);
    box-shadow: inset 0 0 0 1px #c7d2fe;
    transform: scale(1);
  }

  tr.group {
    transition: all 0.25s ease-in-out;
  }

  /* Hover pada tombol edit dan delete */
  button.text-indigo-600:hover,
  button.text-red-600:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  }

  button.text-red-600:hover {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  }

  /* Efek halus untuk nama project */
  .group:hover .text-gray-900 {
    color: #4f46e5 !important;
  }

  td {
    transition: all 0.25s ease-in-out;
      `}</style>
    </div>
  );
}