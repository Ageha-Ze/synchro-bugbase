"use client";

import EditProjectModal from "@/components/EditProjectModal";
import ProjectProgress from "@/components/ProjectProgress";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import { Pencil, FolderOpen, Plus, Trash2, Calendar, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabaseBrowser from "@/lib/supabaseBrowser";
import NewProjectModal from "@/components/NewProjectModal";
import { Button } from "@/components/ui/button";

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
    if (!confirm("Are you sure you want to delete this project? This will also delete all related bugs.")) return;

    setDeletingId(projectId);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error: any) {
      console.error("Error deleting project:", error.message);
      alert("Error deleting project: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Projects
                </h1>
                <p className="text-gray-600 mb-3">Manage and track all your projects</p>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
                    {projects.length} Projects
                  </div>
                  <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                    Active Tracking
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Projects List View */}
          <div className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project, index) => {
                const colors = [
                  { gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', hover: 'hover:border-blue-300' },
                  { gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', hover: 'hover:border-green-300' },
                  { gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', hover: 'hover:border-purple-300' },
                  { gradient: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50', border: 'border-orange-200', hover: 'hover:border-orange-300' },
                  { gradient: 'from-indigo-500 to-purple-500', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200', hover: 'hover:border-indigo-300' },
                  { gradient: 'from-teal-500 to-cyan-500', bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200', hover: 'hover:border-teal-300' },
                ];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="cursor-pointer group"
                  >
                    <div className={`bg-white rounded-lg border-2 ${color.border} ${color.hover} p-6 hover:shadow-xl transition-all duration-300`}>
                      
                      {/* Main Content - Horizontal Layout */}
                      <div className="flex items-start justify-between gap-6">
                        
                        {/* Left: Icon & Content */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Gradient Icon */}
                          <div className={`flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br ${color.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                            <FolderOpen className="w-7 h-7 text-white" />
                          </div>

                          {/* Project Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                              {project.description || "No description provided"}
                            </p>
                            
                            {/* Progress Indicator */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-gray-700">Progress:</span>
                              <ProjectProgress projectId={project.id} />
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions & Status */}
                        <div className="flex flex-col items-end gap-3">
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditProject(project);
                              }}
                              className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-200"
                              title="Edit Project"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              disabled={deletingId === project.id}
                              className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* View Arrow */}
                          <div className="mt-auto">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${color.gradient} text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md`}>
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer - Created Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Created: {project.created_at
                              ? new Date(project.created_at).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Unknown date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty State
              <div className="bg-white rounded-lg border-2 border-gray-200 p-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <FolderOpen className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Projects Yet</h3>
                  <p className="text-gray-600 mb-8">
                    Create your first project and begin tracking bugs with precision
                  </p>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Project
                  </Button>
                </div>
              </div>
            )}
          </div>

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
    </ClientConnectionHandler>
  );
}