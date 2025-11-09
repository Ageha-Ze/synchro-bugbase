export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Bug {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: "New" | "Open" | "In Progress" | "Blocked" | "Closed";
  severity: "Critical" | "High" | "Medium" | "Low" | "Trivial";
  priority: "Highest" | "High" | "Medium" | "Low" | "Lowest";
  created_at: string;
}
