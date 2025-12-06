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
      <ReportsClient 
        bugs={bugsData || []} 
        projects={projectsData || []}
      />
    );
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return <ReportsClient bugs={[]} projects={[]} />;
  }
}