import { supabaseServer } from "@/lib/supabaseServer";
import ProjectBugsClient from "./ProjectBugsClient";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  const supabase = await supabaseServer();

  // ======================
  // Fetch Project
  // ======================
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  // ======================
  // Handle Error
  // ======================
  if (projectError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background text-gray-700 dark:text-foreground px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-xl font-semibold mb-4 text-red-500">Database Error</h1>
          <p className="mb-2">Error: {projectError.message}</p>
          <p className="text-sm mb-4">Code: {projectError.code}</p>

          <pre className="mt-4 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(projectError, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // ======================
  // Not Found
  // ======================
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background text-gray-600 dark:text-gray-300 px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-4">Project not found</h1>

          <p className="text-sm mb-2">Looking for ID: {id}</p>

          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
              Debug Info
            </summary>
            <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto">
              ID: {id}
              Type: {typeof id}
              Length: {id?.length}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // ======================
  // Fetch Bugs
  // ======================
  const { data: bugsRaw, error: bugsError } = await supabase
    .from("bugs")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (bugsError) {
    console.error("🐞 Error fetching bugs:", bugsError.message);
  }

  const bugs = bugsRaw ?? [];

  // ======================
  // Page Render
  // ======================
  return (
    <ClientConnectionHandler>
      <ProjectBugsClient
        projectId={project.id}
        projectNumber={project.project_number}
        projectName={project.name ?? "Untitled Project"}
        projectDescription={project.description ?? ""}
        initialBugs={bugs}
      />
    </ClientConnectionHandler>
  );
}