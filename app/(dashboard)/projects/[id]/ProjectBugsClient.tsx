"use client";

import { UploadCloud } from "lucide-react";
import ImportBugModal from "@/components/ImportBugModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NewBugModal from "@/components/NewBugModal";
import { useToast } from "@/components/ui/use-toast";
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
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

interface Bug {
  project_number?: number;
  id: string;
  bug_number?: number;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  result?: string;
  created_at: string;
}

interface ProjectBugsClientProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  initialBugs?: Bug[];
}

export default function ProjectBugsClient({
  projectId,
  projectName,
  projectDescription,
  initialBugs = [],
}: ProjectBugsClientProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
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


  useEffect(() => {
    filterAndSortBugs();
  }, [bugs, searchQuery, filterSeverity, filterStatus, sortField, sortDirection]);

  const filterAndSortBugs = () => {
  let result = [...bugs];

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter((bug) => {
      const bugId = `${bug.project_number || 1}-${String(bug.bug_number || 0).padStart(3, "0")}`.toLowerCase();
      return (
        bug.title.toLowerCase().includes(q) ||
        bug.description.toLowerCase().includes(q) ||
        bug.status.toLowerCase().includes(q) ||
        bug.result?.toLowerCase().includes(q) ||
        bugId.includes(q)
      );
    });
  }

  if (filterSeverity !== "all")
    result = result.filter((b) => b.severity === filterSeverity);
  if (filterStatus !== "all")
    result = result.filter((b) => b.status === filterStatus);

  result.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === "created_at") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  setFilteredBugs(result);
};

 // Tambahkan di dalam komponen, sebelum return:
const formatBugId = (bug: Bug) => {
  const projectNum = bug.project_number ?? "01"; // default kalau NULL
  const bugNum = String(bug.bug_number ?? 0).padStart(3, "0"); // default kalau NULL
  return `SCB-${projectNum}-${bugNum}`;
};

  const handleSort = (field: keyof Bug) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleImportBugs = async (data: any[]) => {
  try {
    const { error } = await supabase.from("bugs").insert(data)
    if (error) throw error

    setBugs([...data, ...bugs])
    toast({ title: "✅ Bugs imported successfully!" })
  } catch (err) {
    console.error(err)
    toast({ title: "❌ Import failed", description: "Check your file format." })
  }
}
  const handleNewBug = (newBug: Bug) => {
    setBugs([newBug, ...bugs]);
    setShowModal(false);
    toast({
      title: "New Bug Added 🎉",
      description:
        "Your new bug has been successfully created and is visible in the list.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white animate-scaleIn">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Button
                  onClick={() => router.push("/projects")}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm mb-4 cursor-pointer transition-all hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-10 bg-white rounded-full"></div>
                  <h1 className="text-4xl font-bold drop-shadow-md">{projectName}</h1>
                </div>
                <p className="text-indigo-100 text-lg ml-5">{projectDescription}</p>
              </div>

             <div className="flex flex-col items-end gap-3">
  <Button
    onClick={() => setShowModal(true)}
    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm cursor-pointer transition-all hover:scale-105"
  >
    <Plus className="w-5 h-5 mr-2" />
    New Bug
  </Button>

  <Button
    onClick={() => setShowImportModal(true)}
    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm cursor-pointer transition-all hover:scale-105"
  >
    <UploadCloud className="w-5 h-5 mr-2" />
    Import Bugs
  </Button>
</div>

            </div>

            <div className="flex gap-6 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30 hover:bg-white/30 transition-all">
                <span className="text-indigo-100 text-sm">Total Bugs:</span>
                <span className="text-white font-bold text-xl ml-2">{bugs.length}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30 hover:bg-white/30 transition-all">
                <span className="text-indigo-100 text-sm">Showing:</span>
                <span className="text-white font-bold text-xl ml-2">{filteredBugs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 transition-all cursor-pointer hover:shadow-md"
            >
              <option value="all">All Severities</option>
              <option value="Crash/Undoable">🔴 Crash/Undoable</option>
              <option value="High">🟠 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
              <option value="Suggestion">💡 Suggestion</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 transition-all cursor-pointer hover:shadow-md"
            >
              <option value="all">All Status</option>
              <option value="New">🆕 New</option>
              <option value="Open">📂 Open</option>
              <option value="Blocked">🚫 Blocked</option>
              <option value="Fixed">✅ Fixed</option>
              <option value="In Progress">⚙️ In Progress</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b-2 border-indigo-200">
  <tr>
    {[
      { key: "bug_number", label: "Bug ID" },
      { key: "severity", label: "Severity" },
      { key: "title", label: "Title & Location" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
      { key: "result", label: "Result" },
      { key: "created_at", label: "Created" },
      { key: "actions", label: "Actions" },
    ].map(({ key, label }) => (
      <th
        key={key}
        onClick={() =>
          key !== "actions" ? handleSort(key as keyof Bug) : undefined
        }
        className={`px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider transition-all ${
          key !== "actions"
            ? "cursor-pointer hover:bg-indigo-100/50 select-none"
            : ""
        }`}
      >
        <div className="flex items-center gap-1">
          {label}
          {key !== "actions" && <SortIcon field={key as keyof Bug} />}
        </div>
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
        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all group animate-fadeIn"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Bug ID */}
        <td className="px-6 py-5 font-mono font-bold text-gray-900">
  {formatBugId(bug)}
</td>

        {/* Severity */}
        <td className="px-6 py-5">
          <p className="text-sm font-bold text-gray-900">
            {(() => {
              switch (bug.severity) {
                case "Crash/Undoable":
                  return "💥Crash";
                case "High":
                  return "🔥High";
                case "Medium":
                  return "🟡Medium";
                case "Low":
                  return "🟢Low";
                case "Suggestion":
                  return "💡Suggestion";
                default:
                  return bug.severity;
              }
            })()}
          </p>
        </td>

        {/* Title & Description */}
        <td className="px-6 py-5 max-w-md">
          <div className="flex items-center gap-2">
            <p className="text-base tracking-tight font-mono group-hover:text-indigo-600 transition-colors">
              {bug.title}
            </p>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {bug.description}
          </p>
        </td>

        {/* Priority */}
        <td className="px-6 py-5">
        <p className="text-sm font-bold text-gray-900">
            {(() => {
              switch (bug.priority) {
                case "Highest":
                  return "🚨Dire";
                case "High":
                  return "⚠️High";
                case "Medium":
                  return "🟠Mid";
                case "Low":
                  return "🟢Low";
                default:
                  return bug.priority;
              }
            })()}
             </p>
        </td>

        {/* Status */}
        <td className="px-6 py-5">
        <p className="text-sm font-bold text-gray-900">
            {(() => {
              switch (bug.status) {
                case "New":
                  return "🆕New";
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
                  return "⚙️ In Progress";
                default:
                  return bug.status;
              }
            })()}
  </p>
        </td>

        {/* Result */}
        <td className="px-6 py-5">
        <p className="text-sm font-bold text-gray-900">

            {(() => {
              switch (bug.result) {
                case "Confirmed":
                  return "✅Confirmed";
                case "Closed":
                  return "🔒Closed";
                case "Unresolved":
                  return "⚠️Unresolved";
                case "To-Do":
                default:
                  return "📝To-Do";
              }
            })()}
  </p>
        </td>

        {/* Created Date */}
        <td className="px-6 py-5 text-sm text-slate-600">
          {new Date(bug.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </td>

        {/* Actions */}
        <td className="px-6 py-5 text-right">
          <button
            onClick={(e) => handleDeleteBug(bug.id, e)}
            disabled={deletingId === bug.id}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all cursor-pointer hover:scale-105 hover:shadow-md"
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
      <td colSpan={8} className="px-6 py-16 text-center animate-scaleIn">
        <div className="text-gray-400">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-4">
            <BugIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">No bugs found</p>
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

{showImportModal && (
  <ImportBugModal
    projectId={projectId}
    onClose={() => setShowImportModal(false)}
    onImport={(newBugs) => setBugs((prev) => [...newBugs, ...prev])}
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

      

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
    </ClientConnectionHandler>
  );
}
