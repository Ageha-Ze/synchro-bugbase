import { createServerSupabaseClient } from "@/lib/supabaseServer";
import ProjectBugsClient from "./ProjectBugsClient";
import ClientConnectionHandler from '@/components/ClientConnectionHandler';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  console.log("📌 Page received project id from URL:", id);
  console.log("📌 ID type:", typeof id);
  console.log("📌 ID length:", id?.length);

  const supabase = createServerSupabaseClient();

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
      <div className="p-6 text-center text-red-500">
        <h1 className="text-xl font-semibold mb-4">Database Error</h1>
        <p className="mb-2">Error: {projectError.message}</p>
        <p className="text-sm">Code: {projectError.code}</p>
        <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-xs">
          {JSON.stringify(projectError, null, 2)}
        </pre>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-gray-500">
        <h1 className="text-xl font-semibold mb-4">Project not found</h1>
        <p className="text-sm mb-2">Looking for ID: {id}</p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-blue-600">Debug Info</summary>
          <pre className="mt-2 bg-gray-100 p-4 rounded text-xs">
            ID: {id}
            Type: {typeof id}
            Length: {id?.length}
          </pre>
        </details>
      </div>
    );
  }

  const { data: bugs = [] } = await supabase
    .from("bugs")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <ClientConnectionHandler>
    <ProjectBugsClient
      projectId={project.id}
      projectName={project.name}
      projectDescription={project.description}
      initialBugs={bugs}
    />
    </ClientConnectionHandler>
  );
}