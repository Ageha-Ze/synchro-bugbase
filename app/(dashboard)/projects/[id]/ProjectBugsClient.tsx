"use client";

import { UploadCloud } from "lucide-react";
import ImportBugModal from "@/components/ImportBugModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NewBugModal from "@/components/NewBugModal";
import { useToast } from "@/components/ui/use-toast";
import type { Bug, NewBug } from "@/lib/bugs"; // ✅ Import dari bugs.ts
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Bug as BugIcon,
} from "lucide-react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

interface ProjectBugsClientProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  initialBugs?: Bug[];
  projectNumber: number | null; // ✅ Allow null
}

export default function ProjectBugsClient({
  projectId,
  projectName,
  projectDescription,
  projectNumber,
  initialBugs = [],
}: ProjectBugsClientProps) {
  const router = useRouter();
  const supabase = supabaseBrowser;
  const { toast } = useToast();

  const [bugs, setBugs] = useState<Bug[]>(initialBugs);
  const [filteredBugs, setFilteredBugs] = useState<Bug[]>(initialBugs);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<keyof Bug>("bug_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function getSeverityStyle(severity?: string | null) {
  switch (severity) {
    case "Crash/Undoable":
      return "bg-red-700 text-white"; // teks putih di atas hitam
    case "High":
      return "bg-orange-300 text-black"; // teks hitam di atas merah
    case "Medium":
      return "bg-yellow-300 text-black"; // teks hitam di atas kuning
    case "Low":
      return "bg-green-300 text-black"; // teks hitam di atas hijau
    case "Suggestion":
      return "bg-sky-300 text-black"; // teks hitam di atas biru muda
    default:
      return "bg-white text-gray-900"; // fallback aman
  }
};

  useEffect(() => {
    filterAndSortBugs();
  }, [bugs, searchQuery, filterSeverity, filterStatus, sortField, sortDirection]);

  const filterAndSortBugs = () => {
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

    if (filterSeverity !== "all") result = result.filter((b) => b.severity === filterSeverity);
    if (filterStatus !== "all") result = result.filter((b) => b.status === filterStatus);

    result.sort((a, b) => {
      let aVal: string | number = a[sortField] ?? "";
      let bVal: string | number = b[sortField] ?? "";

      if (sortField === "created_at") {
        aVal = aVal ? new Date(aVal as string).getTime() : 0;
        bVal = bVal ? new Date(bVal as string).getTime() : 0;
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredBugs(result);
  };

  const formatBugId = (bug: Bug) => {
    const projectNum = String(projectNumber ?? 1).padStart(2, "0"); // fallback ke 1
    const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
    return `SCB-${projectNum}-${bugNum}`;
  };
  
  const handleSort = (field: keyof Bug) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleImportBugs = async (data: NewBug[]) => {
    try {
      const formattedData = data.map((bug) => ({
        ...bug,
        project_id: bug.project_id ?? projectId,
      }));

      const { data: insertedBugs, error } = await supabase
        .from("bugs")
        .insert(formattedData)
        .select();

      if (error) throw error;
      if (!insertedBugs) throw new Error("No bugs inserted");

      setBugs([...insertedBugs, ...bugs]);
      toast({ title: "✅ Bugs imported successfully!" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "❌ Import failed", description: err.message });
    }
  };

  const handleNewBug = (newBug: Bug) => {
    setBugs([newBug, ...bugs]);
    setShowModal(false);
    toast({
      title: "New Bug Added 🎉",
      description: "Your new bug has been successfully created and is visible in the list.",
    });
  };

  const handleDeleteBug = async (bugId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = confirm("Are you sure you want to delete this bug?");
    if (!confirmed) return;
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


  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      "Crash/Undoable": "from-red-100 to-red-200 text-red-800 border-red-300",
      High: "from-orange-100 to-orange-200 text-orange-800 border-orange-300",
      Medium: "from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
      Low: "from-green-100 to-green-200 text-green-800 border-green-300",
      Suggestion: "from-blue-100 to-blue-200 text-blue-800 border-blue-300",
    };
    return colors[severity] || "from-gray-100 to-gray-200 text-gray-800 border-gray-300";
  };

  const getPriorityColor = (status: string) => {
    const colors: Record<string, string> = {
      Low: "from-green-100 to-green-200 text-green-800 border-green-300",
      High: "from-orange-100 to-orange-200 text-orange-800 border-orange-300",
      Highest: "from-red-100 to-pink-100 text-red-700 border-red-300",
      Medium: "from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
    };
    return colors[status] || "from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      New: "from-red-100 to-red-200 text-red-800 border-red-300",
      Open: "from-red-100 to-red-200 text-red-800 border-red-300",
      Blocked: "from-red-100 to-red-200 text-red-800 border-red-300",
      Fixed: "from-green-100 to-green-200 text-green-800 border-green-300",
      "To Fix in Update": "from-indigo-100 to-purple-100 text-indigo-800 border-indigo-300",
      "Will Not Fix": "from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300",
      "In Progress": "from-blue-100 to-cyan-100 text-blue-700 border-blue-300",
    };
    return colors[status] || "from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  };

  const getResultColor = (result: string) => {
    const colors: Record<string, string> = {
      Confirmed: "from-green-100 to-green-200 text-green-800 border-green-300",
      Closed: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300",
      Unresolved: "from-red-100 to-red-200 text-red-800 border-red-300",
      "To-Do": "bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-300",
    };
    return colors[result] || "from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  };

  const SortIcon = ({ field }: { field: keyof Bug }) => {
    if (sortField !== field)
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-indigo-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-indigo-600" />
    );
  };

  return (
  <ClientConnectionHandler>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden">
          {/* subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/projects")}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm">
                  {projectName}
                </h1>
                {projectDescription && (
                  <p className="text-indigo-100 text-sm md:text-lg">
                    {projectDescription}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Bug
                </Button>
                <Button
                  onClick={() => setShowImportModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm text-sm md:text-base"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Import Bugs
                </Button>
              </div>
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

        {/* Search & Filter */}
<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 p-4 md:p-6">
  <div className="flex flex-col md:flex-row gap-3 md:gap-4">
    {/* Search */}
    <div className="flex-1 relative">
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
    <div className="flex flex-wrap md:flex-nowrap gap-3">
      <select
        value={filterSeverity}
        onChange={(e) => setFilterSeverity(e.target.value)}
        className="flex-1 px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
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
        className="flex-1 px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
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
    </div>
  </div>
</div>


        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 overflow-x-auto">
          <table className="w-full text-sm md:text-base">
          <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-white border-b border-indigo-200 backdrop-blur-md">
              <tr>
                {[
                  "Bug ID",
                  "Severity",
                  "Title & Location",
                  "Priority",
                  "Status",
                  "Result",
                  "Created",
                  "Actions",
                ].map((label, i) => (
                  <th
                    key={i}
                className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-indigo-100">
              {filteredBugs.length > 0 ? (
                filteredBugs.map((bug, index) => (
                  <tr
                    key={bug.id}
                    onClick={() => router.push(`/bug/${bug.id}`)}
                  className={`cursor-pointer transition-colors hover:opacity-90 ${getSeverityStyle(bug.severity)}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="px-4 md:px-6 py-4 font-mono text-gray-900 font-bold">
                      {formatBugId(bug)}
                    </td>

                    {/* Severity */}
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">
                      {(() => {
                        switch (bug.severity) {
                          case "Crash/Undoable":
                            return "💥 Crash";
                          case "High":
                            return "🔥 High";
                          case "Medium":
                            return "🟡 Medium";
                          case "Low":
                            return "🟢 Low";
                          case "Suggestion":
                            return "💡 Suggestion";
                          default:
                            return bug.severity;
                        }
                      })()}
                    </td>

                    {/* Title & Description */}
                    <td className="px-4 md:px-6 py-4 max-w-md">
                      <p className="font-semibold text-gray-900 truncate">
                        {bug.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {bug.description}
                      </p>
                    </td>

                    {/* Priority */}
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">
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

                    {/* Status */}
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">
                      {(() => {
                        switch (bug.status) {
                          case "New":
                            return "🆕 New";
                          case "Open":
                            return "📂 Open";
                          case "Blocked":
                            return "🚫 Blocked";
                          case "Fixed":
                            return "✅ Fixed";
                          case "To Fix in Update":
                            return "🧩 TFU";
                          case "Will Not Fix":
                            return "🚷 WNF";
                          case "In Progress":
                            return "⚙️ In Progress";
                          default:
                            return bug.status;
                        }
                      })()}
                    </td>

                    {/* Result */}
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-900">
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

                    {/* Created */}
                    <td className="px-4 md:px-6 py-4 text-slate-600">
                      {bug.created_at
                        ? new Date(bug.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 md:px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleDeleteBug(bug.id, e)}
                        disabled={deletingId === bug.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-xs md:text-sm transition-all disabled:opacity-50"
                      >
                        {deletingId === bug.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="text-gray-400">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                        <BugIcon className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        No bugs found
                      </p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showImportModal && (
          <ImportBugModal
            projectId={projectId}
            onClose={() => setShowImportModal(false)}
            onImport={handleImportBugs}
          />
        )}

        {showModal && (
          <NewBugModal
            projectId={projectId}
            onClose={() => setShowModal(false)}
            onNewBug={handleNewBug}
          />
        )}
      </div>
    </div>
  </ClientConnectionHandler>
);

}
