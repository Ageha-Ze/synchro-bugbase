import {supabaseServer} from "@/lib/supabaseServer";
import ProjectBugsClient from "./ProjectBugsClient";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import Link from "next/link";
import { AlertCircle, FileQuestion, ArrowLeft } from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  console.log("📌 Page received project id from URL:", id);
  console.log("📌 ID type:", typeof id);
  console.log("📌 ID length:", id?.length);

  const supabase = await supabaseServer();
  
  // Debug query
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  console.log("📊 Query result:", { project, error: projectError });

  // Show error if any
  if (projectError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          {/* Error Card - Full Width */}
          <div className="bg-white rounded-lg border-2 border-red-200 shadow-lg p-8">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-md">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Database Error
                </h1>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">Error Message:</p>
                    <p className="text-sm text-red-600">{projectError.message}</p>
                  </div>
                  
                  {projectError.code && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">Error Code:</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-gray-600">
                        {projectError.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Technical Details */}
                <details className="mt-6">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 select-none inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Show technical details
                  </summary>
                  <pre className="mt-4 text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 border border-gray-700">
{JSON.stringify(projectError, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          {/* Not Found Card - Full Width */}
          <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg p-8">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                <FileQuestion className="w-12 h-12 text-gray-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Project Not Found
                </h1>
                <p className="text-base text-gray-600 mb-6">
                  The project you're looking for doesn't exist or has been removed from the system.
                </p>

                {/* Debug Info */}
                <details className="mb-6">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 select-none inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Debug information
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">ID:</span>
                        <span className="px-3 py-1 bg-white rounded border border-gray-200 font-mono text-xs block">
                          {id}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Type:</span>
                        <span className="px-3 py-1 bg-white rounded border border-gray-200 font-mono text-xs block">
                          {typeof id}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Length:</span>
                        <span className="px-3 py-1 bg-white rounded border border-gray-200 font-mono text-xs block">
                          {id?.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Action Button */}
                <Link 
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ambil bug list
  const { data: bugsRaw, error: bugsError } = await supabase
    .from("bugs")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (bugsError) {
    console.error("🐞 Error fetching bugs:", bugsError.message);
  }

  const bugs = bugsRaw ?? [];

  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto p-6">
          <ProjectBugsClient
            projectId={project.id}
            projectNumber={project.project_number}
            projectName={project.name ?? "Untitled Project"}
            projectDescription={project.description ?? ""}
            initialBugs={bugs}
          />
        </div>
      </div>
    </ClientConnectionHandler>
  );
}