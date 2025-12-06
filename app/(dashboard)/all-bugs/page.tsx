import { supabaseServer } from "@/lib/supabaseServer";
import AllBugsClient from "./AllBugsClient";
import type { Bug } from "@/lib/bugs";

type BugWithProject = Bug & {
  project: {
    id: string;
    name: string;
    project_number: number | null;
  } | null;
};

export default async function AllBugsPage() {
  const supabase = await supabaseServer();

  try {
    console.log("🔍 Fetching bugs...");
    
    // Fetch all bugs first
    const { data: bugsData, error: bugsError } = await supabase
      .from("bugs")
      .select("*")
      .order("bug_number", { ascending: false });

    console.log("📦 Bugs data:", bugsData?.length || 0);
    console.log("❌ Bugs error:", bugsError);

    if (bugsError) {
      console.error("Error fetching bugs:", bugsError);
      return <AllBugsClient initialBugs={[]} />;
    }

    if (!bugsData || bugsData.length === 0) {
      console.warn("⚠️ No bugs found in database");
      return <AllBugsClient initialBugs={[]} />;
    }

    // Fetch projects separately
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, project_number");

    console.log("📁 Projects data:", projectsData?.length || 0);
    console.log("❌ Projects error:", projectsError);

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
    }

    // Map bugs with their projects
    const bugs: BugWithProject[] = (bugsData || []).map((bug) => ({
      ...bug,
      project: projectsData?.find((p) => p.id === bug.project_id) || null,
    }));

    console.log("✅ Final bugs with projects:", bugs.length);

    return <AllBugsClient initialBugs={bugs} />;
  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return <AllBugsClient initialBugs={[]} />;
  }
}