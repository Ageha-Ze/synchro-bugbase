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
  Filter,
  TrendingUp,
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

    if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter((bug) => {
      const bugId = `${bug.project_id}-${String(bug.bug_number).padStart(3, "0")}`.toLowerCase();
      return (
        bug.title?.toLowerCase().includes(q) ||
        bug.description?.toLowerCase().includes(q) ||
        bug.status?.toLowerCase().includes(q) ||
        bug.result?.toLowerCase().includes(q) ||
        bugId.includes(q)
      );
    });
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
      return `
        bg-red-600/80 
        text-red-900 
        border-l-4 border-red-600 
        hover:bg-red-300 
        dark:bg-red-900/60 
        dark:text-red-200 
        dark:hover:bg-red-900/80 
        dark:border-red-500
      `;

    case "High":
      return `
        bg-orange-500/80 
        text-orange-900 
        border-l-4 border-orange-600 
        hover:bg-orange-300 
        dark:bg-orange-900/60 
        dark:text-orange-200 
        dark:hover:bg-orange-900/80 
        dark:border-orange-500
      `;

    case "Medium":
      return `
        bg-yellow-700/80 
        text-yellow-900 
        border-l-4 border-yellow-600 
        hover:bg-yellow-300 
        dark:bg-yellow-900/60 
        dark:text-yellow-200 
        dark:hover:bg-yellow-900/80 
        dark:border-yellow-500
      `;

    case "Low":
      return `
        bg-green-500/80 
        text-green-900 
        border-l-4 border-green-600 
        hover:bg-green-300 
        dark:bg-green-900/60 
        dark:text-green-200 
        dark:hover:bg-green-900/80 
        dark:border-green-500
      `;

    case "Suggestion":
      return `
        bg-blue-500/80 
        text-blue-900 
        border-l-4 border-blue-600 
        hover:bg-blue-300 
        dark:bg-blue-900/60 
        dark:text-blue-200 
        dark:hover:bg-blue-900/80 
        dark:border-blue-500
      `;

    default:
      return `
        bg-card 
        hover:bg-accent/50 
        border-l-4 border-transparent
      `;
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
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container-base py-6 space-y-6">

          {/* Header with gradient & animation */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 rounded-2xl shadow-2xl p-8 md:p-10 text-white overflow-hidden group">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-float"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-3">
                  <h1 className="font-hero text-white flex items-center gap-4 hero-shadow">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm glow">
                      <BugIcon className="w-10 h-10" />
                    </div>
                    All Bugs
                  </h1>
                  <p className="text-white/90 text-base md:text-lg font-medium">
                    🔍 View and manage bugs from all projects
                  </p>
                </div>

                <Button
                  onClick={handleExportCSV}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <div>
                      <span className="text-white/80 text-xs block">Total Bugs</span>
                      <span className="font-bold text-xl">{bugs.length}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    <div>
                      <span className="text-white/80 text-xs block">Showing</span>
                      <span className="font-bold text-xl">{filteredBugs.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters with glassmorphism */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-4 md:p-6 overflow-x-auto transition-colors duration-300">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-wrap">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 dark:text-indigo-300" />
                <input
                  type="text"
                  placeholder="🔎 Search bugs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 md:py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50/50 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-gray-200 placeholder:text-indigo-300 dark:placeholder:text-indigo-400 text-sm md:text-base transition-all"
                />
              </div>

              {/* Filters with hover effects */}
              <div className="flex gap-3 flex-wrap flex-1">
                {[
                  {
                    val: filterProject,
                    fn: setFilterProject,
                    label: "Project",
                    options: [{ value: "all", label: "All Projects" }, ...projects.map(p => ({ value: p.id, label: p.name }))]
                  },
                  {
                    val: filterSeverity,
                    fn: setFilterSeverity,
                    label: "Severity",
                    options: [
                      { value: "all", label: "All Severities" },
                      { value: "Crash/Undoable", label: "💥 Crash/Undoable" },
                      { value: "High", label: "🔥 High" },
                      { value: "Medium", label: "🟡 Medium" },
                      { value: "Low", label: "🟢 Low" },
                      { value: "Suggestion", label: "💡 Suggestion" }
                    ]
                  },
                  {
                    val: filterStatus,
                    fn: setFilterStatus,
                    label: "Status",
                    options: [
                      { value: "all", label: "All Status" },
                      { value: "New", label: "🎯 New" },
                      { value: "Open", label: "📂 Open" },
                      { value: "Blocked", label: "🚫 Blocked" },
                      { value: "Fixed", label: "✅ Fixed" },
                      { value: "To Fix in Update", label: "🧩 TFU" },
                      { value: "Will Not Fix", label: "🚷 WNF" },
                      { value: "In Progress", label: "⚙️ In Progress" }
                    ]
                  },
                  {
                    val: filterResult,
                    fn: setFilterResult,
                    label: "Result",
                    options: [
                      { value: "all", label: "All Results" },
                      { value: "Confirmed", label: "✅ Confirmed" },
                      { value: "Closed", label: "🔒 Closed" },
                      { value: "Unresolved", label: "⚠️ Unresolved" },
                      { value: "To-Do", label: "📝 To-Do" }
                    ]
                  }
                ].map((f, i) => (
                  <select
                    key={i}
                    value={f.val}
                    onChange={e => f.fn(e.target.value)}
                    className="table-select flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50/50 dark:bg-gray-700/30 text-slate-700 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
                  >
                    {f.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>

          {/* Table with enhanced styling */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 dark:border-gray-700 overflow-x-auto transition-colors duration-300">
            <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base min-w-[700px]">
               <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 border-b border-indigo-200 dark:border-gray-600 backdrop-blur-md transition-colors duration-300">
                  <tr>
                    {["Bug ID", "Project", "Status", "Title", "Priority", "Result", "Created"].map(label => (
                      <th key={label} className="px-6 py-4 text-left font-bold text-foreground uppercase text-xs tracking-wider">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
            <tbody className="divide-y divide-indigo-100 dark:divide-gray-700 transition-colors duration-300">
                  {filteredBugs.length > 0 ? filteredBugs.map(bug => (
                    <tr 
                      key={bug.id} 
                      onClick={() => router.push(`/bug/${bug.id}`)} 
                      className={`cursor-pointer transition-all duration-200 ${getSeverityStyle(bug.severity)}`}
                    >
                    <td className="px-4 md:px-6 py-3 font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatBugId(bug)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                          {bug.project?.name || "Unknown"}
                        </span>
                      </td>
                    <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        switch (bug.status) {
                          case "New":
                            return "🎯New";
                          case "Open":
                            return "📂Open";
                          case "Blocked":
                            return "🚫Blocked";
                          case "Fixed":
                            return "✅Fixed";
                          case "To Fix in Update":
                            return "🧩TFU";
                          case "Will Not Fix":
                            return "🚷WNF";
                          case "In Progress":
                            return "⚙️In Progress";
                          default:
                            return bug.status;
                        }
                      })()}
                    </td>

                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm font-bold truncate mb-1">{bug.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{bug.description}</p>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        switch (bug.priority) {
                          case "Highest":
                            return "🚨 Dire";
                          case "High":
                            return "⚠️ High";
                          case "Medium":
                            return "🟠 Mid";
                          case "Low":
                            return "🟢 Low";
                          default:
                            return bug.priority;
                        }
                      })()}
                    </td>
                      <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        switch (bug.result) {
                          case "Confirmed":
                            return "✅ Confirmed";
                          case "Closed":
                            return "🔒 Closed";
                          case "Unresolved":
                            return "⚠️ Unresolved";
                          case "To-Do":
                          default:
                            return "📝 To-Do";
                        }
                      })()}
                    </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                        {bug.created_at ? new Date(bug.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-6 bg-muted rounded-full">
                            <BugIcon className="w-20 h-20 text-muted-foreground opacity-50" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-foreground mb-2">No bugs found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </ClientConnectionHandler>
  );
}