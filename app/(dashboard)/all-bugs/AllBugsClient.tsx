"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Bug } from "@/lib/bugs";
import {
  Search,
  Trash2,
  Loader2,
  Bug as BugIcon,
  Download,
} from "lucide-react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { useToast } from "@/components/ui/use-toast";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

type BugWithProject = Bug & {
  project: {
    id: string;
    name: string;
    project_number: number | null;
  } | null;
};

interface AllBugsClientProps {
  initialBugs: BugWithProject[];
}

export default function AllBugsClient({ initialBugs }: AllBugsClientProps) {
  const router = useRouter();
  const supabase = supabaseBrowser;
  const { toast } = useToast();

  const [bugs, setBugs] = useState<BugWithProject[]>(initialBugs);
  const [filteredBugs, setFilteredBugs] = useState<BugWithProject[]>(initialBugs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get unique projects for filter
  const projects = Array.from(
    new Map(bugs.map((b) => [b.project?.id, b.project])).values()
  ).filter(Boolean);

  useEffect(() => {
    filterBugs();
  }, [bugs, searchQuery, filterProject, filterSeverity, filterStatus, filterResult]);

  const filterBugs = () => {
  let result = [...bugs];
  
  console.log("🔍 Filtering bugs, total:", bugs.length);
  console.log("📊 Search query:", searchQuery);
  console.log("📊 Filter project:", filterProject);

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (bug) =>
        bug.title?.toLowerCase().includes(q) ||
        bug.description?.toLowerCase().includes(q) ||
        bug.project?.name?.toLowerCase().includes(q)
    );
  }

  if (filterProject !== "all") {
    result = result.filter((b) => b.project?.id === filterProject);
  }
  if (filterSeverity !== "all") {
    result = result.filter((b) => b.severity === filterSeverity);
  }
  if (filterStatus !== "all") {
    result = result.filter((b) => b.status === filterStatus);
  }
  if (filterResult !== "all") {
    result = result.filter((b) => b.result === filterResult);
  }

  console.log("✅ Filtered bugs:", result.length);
  setFilteredBugs(result);
};

  const formatBugId = (bug: BugWithProject) => {
    const projectNum = String(bug.project?.project_number ?? 1).padStart(2, "0");
    const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
    return `SCB-${projectNum}-${bugNum}`;
  };

  const getSeverityStyle = (severity?: string | null) => {
    switch (severity) {
      case "Crash/Undoable":
        return "bg-red-700 text-white";
      case "High":
        return "bg-orange-300 text-black";
      case "Medium":
        return "bg-yellow-300 text-black";
      case "Low":
        return "bg-green-300 text-black";
      case "Suggestion":
        return "bg-sky-300 text-black";
      default:
        return "bg-white text-gray-900";
    }
  };

  const handleDeleteBug = async (bugId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this bug?")) return;
    
    setDeletingId(bugId);
    try {
      const { error } = await supabase.from("bugs").delete().eq("id", bugId);
      if (error) throw error;
      
      setBugs(bugs.filter((b) => b.id !== bugId));
      toast({ title: "Bug deleted 🗑️", description: "Bug has been removed." });
    } catch (error: any) {
      console.error("Error deleting bug:", error);
      alert("Failed to delete bug: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Bug ID",
      "Project",
      "Title",
      "Description",
      "Severity",
      "Priority",
      "Status",
      "Result",
      "Created At",
    ];

    const rows = filteredBugs.map((bug) => [
      formatBugId(bug),
      bug.project?.name || "",
      bug.title || "",
      bug.description || "",
      bug.severity || "",
      bug.priority || "",
      bug.status || "",
      bug.result || "",
      bug.created_at ? new Date(bug.created_at).toLocaleString("id-ID") : "",
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`));

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `all_bugs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exported! 📥",
      description: `${filteredBugs.length} bugs exported successfully.`,
    });
  };

  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm flex items-center gap-3">
                    <BugIcon className="w-8 h-8" />
                    All Bugs
                  </h1>
                  <p className="text-indigo-100 text-sm md:text-lg">
                    View and manage bugs from all projects
                  </p>
                </div>

                <Button
                  onClick={handleExportCSV}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm text-sm md:text-base"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-xl px-4 py-2 border border-white/30 text-sm">
                  <span className="opacity-80">Total Bugs:</span>{" "}
                  <span className="font-bold">{bugs.length}</span>
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 border border-white/30 text-sm">
                  <span className="opacity-80">Showing:</span>{" "}
                  <span className="font-bold">{filteredBugs.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-wrap">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 placeholder:text-indigo-300 text-sm md:text-base transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap flex-1">
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project) => (
                    <option key={project!.id} value={project!.id}>
                      {project!.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
                >
                  <option value="all">All Severities</option>
                  <option value="Crash/Undoable">💥 Crash/Undoable</option>
                  <option value="High">🔥 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                  <option value="Suggestion">💡 Suggestion</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="New">🆕 New</option>
                  <option value="Open">📂 Open</option>
                  <option value="Blocked">🚫 Blocked</option>
                  <option value="Fixed">✅ Fixed</option>
                  <option value="To Fix in Update">🧩 TFU</option>
                  <option value="Will Not Fix">🚷 WNF</option>
                  <option value="In Progress">⚙️ In Progress</option>
                </select>

                <select
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
                >
                  <option value="all">All Results</option>
                  <option value="Confirmed">✅ Confirmed</option>
                  <option value="Closed">🔒 Closed</option>
                  <option value="Unresolved">⚠️ Unresolved</option>
                  <option value="To-Do">📝 To-Do</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 overflow-x-auto">
            <table className="w-full text-sm md:text-base min-w-[700px]">
              <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-white border-b border-indigo-200 backdrop-blur-md">
                <tr>
                  {["Bug ID", "Project", "Status", "Title", "Priority", "Result", "Created"].map((label) => (
                    <th
                      key={label}
                      className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-indigo-100">
                {filteredBugs.length > 0 ? (
                  filteredBugs.map((bug) => (
                    <tr
        key={bug.id}
        onClick={() => router.push(`/bug/${bug.id}`)}
        className={`cursor-pointer transition-colors hover:opacity-90 ${getSeverityStyle(bug.severity)}`}
      >
        <td className="px-4 md:px-6 py-3 font-mono text-xs font-bold text-gray-900">
          {formatBugId(bug)}
        </td>

        <td className="px-4 md:px-6 py-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
            {bug.project?.name || "Unknown"}
          </span>
        </td>

        <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900">
          {(() => {
            switch (bug.status) {
              case "New": return "🆕New";
              case "Open": return "📂Open";
              case "Blocked": return "🚫Blocked";
              case "Fixed": return "✅Fixed";
              case "To Fix in Update": return "🧩TFU";
              case "Will Not Fix": return "🚷WNF";
              case "In Progress": return "⚙️In Progress";
              default: return bug.status;
            }
          })()}
        </td>

        <td className="px-4 md:px-6 py-3 max-w-md">
          <p className="text-xs font-semibold text-gray-900 truncate">{bug.title}</p>
          <p className="text-[10px] text-gray-500 line-clamp-2">{bug.description}</p>
        </td>

        <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900">
          {(() => {
            switch (bug.priority) {
              case "Highest": return "🚨 Dire";
              case "High": return "⚠️ High";
              case "Medium": return "🟠 Mid";
              case "Low": return "🟢 Low";
              default: return bug.priority;
            }
          })()}
        </td>

        <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900">
          {(() => {
            switch (bug.result) {
              case "Confirmed": return "✅ Confirmed";
              case "Closed": return "🔒 Closed";
              case "Unresolved": return "⚠️ Unresolved";
              default: return "📝 To-Do";
            }
          })()}
        </td>

        <td className="px-4 md:px-6 py-3 text-xs text-slate-600">
          {bug.created_at
            ? new Date(bug.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="text-gray-400">
                        <BugIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-bold text-gray-900">No bugs found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClientConnectionHandler>
  );
}
