import { supabaseServer } from "@/lib/supabaseServer";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const supabase = await supabaseServer();

  try {
    // Fetch all bugs
    const { data: bugsData } = await supabase
      .from("bugs")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch all projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("id, name, project_number");

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <ReportsClient
          bugs={bugsData || []}
          projects={projectsData || []}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <ReportsClient bugs={[]} projects={[]} />
      </div>
    );
  }
}
