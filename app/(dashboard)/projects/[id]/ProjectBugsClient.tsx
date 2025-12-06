"use client";

import { UploadCloud } from "lucide-react";
import ImportBugModal from "@/components/ImportBugModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NewBugModal from "@/components/NewBugModal";
import { useToast } from "@/components/ui/use-toast";
import type { Bug, NewBug } from "@/lib/bugs";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Bug as BugIcon,
  Download,
  Filter,
} from "lucide-react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

interface ProjectBugsClientProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  initialBugs?: Bug[];
  projectNumber: number | null;
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
  const [filterResult, setFilterResult] = useState("all");

  const ITEMS_PER_PAGE = 50;
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  function getSeverityStyle(severity?: string | null) {
    switch (severity) {
      case "Crash/Undoable":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-300 hover:from-red-600 hover:to-rose-700";
      case "High":
        return "bg-gradient-to-r from-orange-400 to-amber-500 text-white border-orange-300 hover:from-orange-500 hover:to-amber-600";
      case "Medium":
        return "bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 border-yellow-300 hover:from-yellow-500 hover:to-amber-500";
      case "Low":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300 hover:from-green-500 hover:to-emerald-600";
      case "Suggestion":
        return "bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-blue-300 hover:from-blue-500 hover:to-indigo-600";
      default:
        return "bg-white text-gray-900 border-gray-200 hover:bg-gray-50";
    }
  }

  useEffect(() => {
    setBugs(initialBugs.slice(0, ITEMS_PER_PAGE));
    setLoadedCount(ITEMS_PER_PAGE);
    setHasMore(initialBugs.length > ITEMS_PER_PAGE);
  }, [initialBugs]);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        const { data, error } = await supabase
          .from("bugs")
          .select("*")
          .eq("project_id", projectId)
          .order("bug_number", { ascending: false });

        if (error) throw error;
        setBugs(data ?? []);
      } catch (err) {
        console.error("Failed to fetch bugs:", err);
      }
    };

    if (bugs.length > initialBugs.length) {
      fetchBugs();
    }
  }, [projectId, supabase, bugs.length, initialBugs.length]);

  useEffect(() => {
    filterAndSortBugs();
  }, [bugs, loadedCount, searchQuery, filterSeverity, filterStatus, filterResult, sortField, sortDirection]);

  const loadMoreBugs = () => {
    setLoadingMore(true);
    setLoadedCount(loadedCount + ITEMS_PER_PAGE);
    setHasMore(loadedCount + ITEMS_PER_PAGE < initialBugs.length);
    setLoadingMore(false);
  };

  useEffect(() => {
    const channel = supabase
      .channel("project-bugs-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bugs", filter: `project_id=eq.${projectId}` },
        async () => {
          try {
            const { data, error } = await supabase
              .from("bugs")
              .select("*")
              .eq("project_id", projectId)
              .order("bug_number", { ascending: false });

            if (error) throw error;
            setBugs(data ?? []);
          } catch (err) {
            console.error("Failed to refetch bugs:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

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
    if (filterResult !== "all") result = result.filter((b) => b.result === filterResult);

    result.sort((a, b) => {
      let aVal: string | number = a[sortField] ?? "";
      let bVal: string | number = b[sortField] ?? "";

      if (sortField === "created_at") {
        aVal = aVal ? new Date(aVal as string).getTime() : 0;
        bVal = bVal ? new Date(bVal as string).getTime() : 0;
      }

      if (sortField === "bug_number") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    const startIndex = 0;
    const endIndex = loadedCount;
    result = result.slice(startIndex, endIndex);

    setFilteredBugs(result);
  };

  const formatBugId = (bug: Bug) => {
    const projectNum = String(projectNumber ?? 1).padStart(2, "0");
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
      await supabase.from("attachments").delete().eq("bug_id", bugId);
      await supabase.from("comments").delete().eq("bug_id", bugId);

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
      "Title",
      "Description",
      "Severity",
      "Priority",
      "Status",
      "Result",
      "Steps to Reproduce",
      "Expected Result",
      "Actual Result",
      "Created At",
    ];

    const rows = filteredBugs.map((bug) => {
      const bugId = formatBugId(bug);
      return [
        bugId,
        bug.title || "",
        bug.description || "",
        bug.severity || "",
        bug.priority || "",
        bug.status || "",
        bug.result || "",
        bug.steps_to_reproduce || "",
        bug.expected_result || "",
        bug.actual_result || "",
        bug.created_at ? new Date(bug.created_at).toLocaleString("id-ID") : "",
      ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fileName = `${projectName.replace(/\s+/g, "_")}_bugs_${new Date().toISOString().split("T")[0]}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
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
      <div className="space-y-6">

        {/* Colorful Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg shadow-xl p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <BugIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-md">Project Bugs</h1>
              </div>
              <p className="text-white/90 font-medium text-lg">{projectName}</p>
              {projectDescription && (
                <p className="text-white/80 text-sm max-w-2xl">{projectDescription}</p>
              )}
            </div>
            <Button 
              onClick={handleExportCSV} 
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Colorful Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative">
              <div className="text-sm font-medium text-white/90 mb-1">Total Bugs</div>
              <div className="text-3xl font-bold text-white">{initialBugs.length}</div>
            </div>
          </div>
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative">
              <div className="text-sm font-medium text-white/90 mb-1">Showing</div>
              <div className="text-3xl font-bold text-white">{filteredBugs.length}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions with Gradient Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Bug
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Import Bugs
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/projects")}
            className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        {/* Search & Filters Card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Search & Filters</h3>
          </div>
          
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bugs by ID, title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              >
                <option value="all">All Severities</option>
                <option value="Crash/Undoable">🔴 Crash</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
                <option value="Suggestion">🔵 Suggestion</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              >
                <option value="all">All Status</option>
                <option value="New">🎯 New</option>
                <option value="Open">📂 Open</option>
                <option value="Blocked">🚫 Blocked</option>
                <option value="Fixed">✅ Fixed</option>
                <option value="In Progress">⚙️ In Progress</option>
              </select>

              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              >
                <option value="all">All Results</option>
                <option value="Confirmed">✅ Confirmed</option>
                <option value="To-Do">📝 To-Do</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bug Table */}
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  {["Bug ID", "Status", "Title & Location", "Priority", "Result", "Created", "Actions"].map(label => (
                    <th key={label} className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredBugs.length > 0 ? (
                  filteredBugs.map((bug, index) => (
                    <tr
                      key={bug.id}
                      onClick={() => router.push(`/bug/${bug.id}`)}
                      className={`cursor-pointer transition-all duration-300 border-l-4 ${getSeverityStyle(bug.severity)}`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold">
                        {formatBugId(bug)}
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold">
                        {(() => {
                          switch (bug.status) {
                            case "New": return "🎯 New";
                            case "Open": return "📂 Open";
                            case "Blocked": return "🚫 Blocked";
                            case "Fixed": return "✅ Fixed";
                            case "To Fix in Update": return "🧩 TFU";
                            case "Will Not Fix": return "🚷 WNF";
                            case "In Progress": return "⚙️ In Progress";
                            default: return bug.status;
                          }
                        })()}
                      </td>

                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm font-semibold truncate mb-1">
                          {bug.title}
                        </p>
                        <p className="text-xs opacity-75 line-clamp-2">
                          {bug.description}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold">
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

                      <td className="px-6 py-4 text-xs font-semibold">
                        {(() => {
                          switch (bug.result) {
                            case "Confirmed": return "✅ Confirmed";
                            case "Closed": return "🔒 Closed";
                            case "Unresolved": return "⚠️ Unresolved";
                            case "To-Do":
                            default: return "📝 To-Do";
                          }
                        })()}
                      </td>

                      <td className="px-6 py-4 text-xs opacity-75">
                        {bug.created_at
                          ? new Date(bug.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => handleDeleteBug(bug.id, e)}
                          disabled={deletingId === bug.id}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
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
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                          <BugIcon className="w-10 h-10 text-purple-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-2">
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
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              onClick={loadMoreBugs}
              disabled={loadingMore}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading more bugs...
                </>
              ) : (
                <>
                  Load More Bugs ({initialBugs.length - loadedCount} remaining)
                </>
              )}
            </Button>
          </div>
        )}

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
    </ClientConnectionHandler>
  );
}