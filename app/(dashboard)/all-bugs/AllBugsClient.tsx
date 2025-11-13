
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
Search,
ChevronDown,
ChevronUp,
Download,
Bug as BugIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { Bug } from "@/lib/bugs";
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
const { toast } = useToast();
const [bugs, setBugs] = useState<BugWithProject[]>(initialBugs);
const [filteredBugs, setFilteredBugs] = useState<BugWithProject[]>(initialBugs);
const [searchQuery, setSearchQuery] = useState("");
const [filterProject, setFilterProject] = useState("all");
const [filterSeverity, setFilterSeverity] = useState("all");
const [filterStatus, setFilterStatus] = useState("all");
const [filterResult, setFilterResult] = useState("all");
const [sortField, setSortField] = useState("bug_number");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
// Get unique projects for filter dropdown and count
const uniqueProjects = Array.from(
new Map(
bugs
.filter((b) => b.project)
.map((b) => [b.project!.id, b.project!])
).values()
);
// Count total projects dynamically
const totalProjects = uniqueProjects.length;
useEffect(() => {
filterAndSortBugs();
}, [bugs, searchQuery, filterProject, filterSeverity, filterStatus, filterResult, sortField, sortDirection]);
const filterAndSortBugs = () => {
let result = [...bugs];
// Search filter
if (searchQuery) {
  const q = searchQuery.toLowerCase().trim();
  result = result.filter((bug) => {
    const bugId = formatBugId(bug).toLowerCase();
    const projectName = bug.project?.name?.toLowerCase() || "";
    return (
      bug.title?.toLowerCase().includes(q) ||
      bug.description?.toLowerCase().includes(q) ||
      bug.status?.toLowerCase().includes(q) ||
      bug.result?.toLowerCase().includes(q) ||
      projectName.includes(q) ||
      bugId.includes(q)
    );
  });
}

// Project filter
if (filterProject !== "all") {
  result = result.filter((b) => b.project?.id === filterProject);
}

// Other filters
if (filterSeverity !== "all") result = result.filter((b) => b.severity === filterSeverity);
if (filterStatus !== "all") result = result.filter((b) => b.status === filterStatus);
if (filterResult !== "all") result = result.filter((b) => b.result === filterResult);

// Sorting
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

setFilteredBugs(result);
};
const formatBugId = (bug: BugWithProject) => {
const projectNum = String(bug.project?.project_number ?? 1).padStart(2, "0");
const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
return SCB-${projectNum}-${bugNum};
};
const handleSort = (field: keyof BugWithProject) => {
if (sortField === field) {
setSortDirection(sortDirection === "asc" ? "desc" : "asc");
} else {
setSortField(field);
setSortDirection("asc");
}
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
"Steps to Reproduce",
"Expected Result",
"Actual Result",
"Created At",
];
const rows = filteredBugs.map((bug) => {
  const bugId = formatBugId(bug);
  return [
    bugId,
    bug.project?.name || "No Project",
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

const fileName = `all_bugs_${new Date().toISOString().split("T")[0]}.csv`;

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
const SortIcon = ({ field }: { field: keyof BugWithProject }) => {
if (sortField !== field)
return ;
return sortDirection === "asc" ? (

) : (

);
};
return (


{/* Header */}
    <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm">
              All Bugs Across Projects
            </h1>
            <p className="text-indigo-100 text-sm md:text-lg">
              View and manage all bugs from every project in one place
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
          <div className="bg-white/20 rounded-xl px-4 py-2 border border-white/30 text-sm">
            <span className="opacity-80">Projects:</span>{" "}
            <span className="font-bold">{totalProjects}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Search & Filter */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 p-4 md:p-6 overflow-x-auto">
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
          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 md:py-3 border border-indigo-200 rounded-lg bg-indigo-50/50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm md:text-base"
          >
            <option value="all">All Projects ({totalProjects})</option>
            {uniqueProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
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
      <table className="w-full text-sm md:text-base min-w-[900px]">
        <thead className="bg-gradient-to-r from-indigo-100 via-indigo-50 to-white border-b border-indigo-200 backdrop-blur-md">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Bug ID
            </th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Project
            </th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Status
            </th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Title & Description
            </th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Priority
            </th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Result
            </th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold text-indigo-800 uppercase text-xs md:text-sm tracking-wide">
              Created
            </th>
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

                <td className="px-4 md:px-6 py-4">
                  <span className="inline-block px-2 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-medium">
                    {bug.project?.name || "No Project"}
                  </span>
                </td>

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

                <td className="px-4 md:px-6 py-4 max-w-md">
                  <p className="font-semibold text-gray-900 truncate">
                    {bug.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {bug.description}
                  </p>
                </td>

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
                        return "📝 To-Do";
                      default:
                        return bug.result;
                    }
                  })()}
                </td>

                <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                  {bug.created_at
                    ? new Date(bug.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <BugIcon className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500 text-lg">No bugs found</p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your filters or search query
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
);
}
