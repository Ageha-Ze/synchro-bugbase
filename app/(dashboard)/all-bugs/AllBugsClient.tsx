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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-900 rounded-2xl shadow-lg p-6 md:p-8 text-white overflow-hidden transition-colors duration-300">
          {/* Hapus overlay blur untuk performa */}
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm flex items-center gap-3">
                  <BugIcon className="w-8 h-8" />
                  All Bugs
                </h1>
                <p className="text-indigo-100 dark:text-indigo-200 text-sm md:text-lg">
                  View and manage bugs from all projects
                </p>
              </div>

              <Button
                onClick={handleExportCSV}
                className="bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-600/30 text-white border border-white/30 dark:border-gray-600/50 text-sm md:text-base transition-colors duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 dark:bg-gray-700/30 rounded-xl px-4 py-2 border border-white/30 dark:border-gray-600/50 text-sm transition-colors duration-300">
                <span className="opacity-80">Total Bugs:</span>{" "}
                <span className="font-bold">{bugs.length}</span>
              </div>
              <div className="bg-white/20 dark:bg-gray-700/30 rounded-xl px-4 py-2 border border-white/30 dark:border-gray-600/50 text-sm transition-colors duration-300">
                <span className="opacity-80">Showing:</span>{" "}
                <span className="font-bold">{filteredBugs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-4 md:p-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-wrap">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 dark:text-indigo-300" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 md:py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50/50 dark:bg-gray-700/30 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-gray-200 placeholder:text-indigo-300 dark:placeholder:text-indigo-400 text-sm md:text-base transition-colors"
              />
            </div>

            {/* Filters */}
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
                  className="flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50/50 dark:bg-gray-700/30 text-slate-700 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 transition-colors text-sm md:text-base"
                >
                  {f.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 overflow-x-auto transition-colors duration-300">
          <table className="w-full text-sm md:text-base min-w-[700px]">
            <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 border-b border-indigo-200 dark:border-gray-600 transition-colors duration-300">
              <tr>
                {["Bug ID", "Project", "Status", "Title", "Priority", "Result", "Created"].map(label => (
                  <th key={label} className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 dark:text-indigo-200 uppercase text-xs md:text-sm tracking-wide transition-colors duration-300">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100 dark:divide-gray-700">
              {filteredBugs.length > 0 ? filteredBugs.map(bug => (
                <tr key={bug.id} onClick={() => router.push(`/bug/${bug.id}`)} className={`cursor-pointer ${getSeverityStyle(bug.severity)}`}>
                  <td className="px-4 md:px-6 py-3 font-mono text-xs font-bold text-gray-900 dark:text-gray-100">{formatBugId(bug)}</td>
                  <td className="px-4 md:px-6 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-gray-600">
                      {bug.project?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">{bug.status}</td>
                  <td className="px-4 md:px-6 py-3 max-w-md">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{bug.title}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">{bug.description}</p>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">{bug.priority}</td>
                  <td className="px-4 md:px-6 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">{bug.result || "📝 To-Do"}</td>
                  <td className="px-4 md:px-6 py-3 text-xs text-slate-600 dark:text-gray-400">{bug.created_at ? new Date(bug.created_at).toLocaleDateString("id-ID") : "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400 dark:text-gray-300">
                    <BugIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">No bugs found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
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
