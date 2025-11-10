// lib/bugs.ts
import supabaseServer from "@/lib/supabaseServer";
import type { Database } from "@/types/supabase";

// --- Type definition for Bug (dari generated types) ---
export type Bug = Database['public']['Tables']['bugs']['Row'];

// --- Helper types untuk insert/update ---
export type BugInsert = Database['public']['Tables']['bugs']['Insert'];
export type BugUpdate = Database['public']['Tables']['bugs']['Update'];

// --- Type untuk NewBug (tanpa id, untuk create) ---
export type NewBug = Omit<Bug, 'id' | 'created_at' | 'updated_at'>;

// --- Attachment type ---
export type Attachment = {
  id: string;
  bug_id: string;
  type: string | null;
  url: string | null;
  created_at: string | null;
};

// --- Comment type ---
export type Comment = {
  id: string;
  bug_id: string;
  content: string;
  author?: string | null;
  created_at: string | null;
};

// --- Create bug ---
export async function createBug(payload: Partial<BugInsert>): Promise<Bug> {
   const safePayload: BugInsert = {
    project_id: payload.project_id || "default_project_id",
    title: payload.title || "Untitled Bug",
    description: payload.description || "",
    severity: payload.severity || "Medium",
    priority: payload.priority || "Medium",
    status: payload.status || "New",
    result: payload.result || "To-Do",
    steps_to_reproduce: payload.steps_to_reproduce || "",
    expected_result: payload.expected_result || "",
    actual_result: payload.actual_result || "",
    assigned_to: payload.assigned_to || null,
  };
  const { data, error } = await supabaseServer
    .from("bugs")
    .insert([safePayload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Failed to create bug");
  
  return data;
}

//recent bugs
// lib/bugs.ts
// lib/bugs.ts
export type RecentBugs = Bug & {
  project: {
    id: string;
    name: string;
    description: string | null;
  } | null; // bisa null
};


// --- Get all bugs ---
export async function getBugs(): Promise<Bug[]> {
  const { data, error } = await supabaseServer
    .from("bugs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// --- Get bugs by project ---
export async function getBugsByProject(projectId: string): Promise<Bug[]> {
  const { data, error } = await supabaseServer
    .from("bugs")
    .select("*")
    .eq("project_id", projectId)
    .order("bug_number", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// --- Get single bug ---
export async function getBugById(bugId: string): Promise<Bug | null> {
  const { data, error } = await supabaseServer
    .from("bugs")
    .select("*")
    .eq("id", bugId)
    .single();

  if (error) {
    console.error("Error fetching bug:", error);
    return null;
  }
  return data;
}

// --- Update bug ---
export async function updateBug(bugId: string, payload: Partial<BugUpdate>): Promise<Bug> {
  const { data, error } = await supabaseServer
    .from("bugs")
    .update(payload)
    .eq("id", bugId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Failed to update bug");
  
  return data;
}

// --- Delete bug ---
export async function deleteBug(bugId: string): Promise<void> {
  const { error } = await supabaseServer
    .from("bugs")
    .delete()
    .eq("id", bugId);

  if (error) throw new Error(error.message);
}