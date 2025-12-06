import dynamic from "next/dynamic";
import Link from "next/link";
import { Bug as BugIcon, CheckCircle, Clock, TrendingUp, FolderKanban } from "lucide-react";
import { supabaseServer } from "@/lib/supabaseServer";
import type { Bug } from "@/lib/bugs";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import QuickActions from "@/components/QuickActions";

const BugTrendChart = dynamic(() => import("@/components/BugTrendChart"), {
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
    </div>
  ),
});

type Project = {
  id: string;
  name: string;
  project_number: string | number | null;
};

type RecentBugWithProject = Bug & {
  project: Project | null;
};

export default async function DashboardPage() {
const supabase = await supabaseServer();

    const [
    { data: allProjectsData },
    { count: bugCount },
    { count: openCount },
    { count: resolvedCount },
    { data: bugsData },
    { data: severityStats },
    { data: allProjects }
  ] = await Promise.all([
    supabase.from("projects").select("id"),
    supabase.from("bugs").select("*", { count: "exact", head: true }),
    supabase.from("bugs").select("*", { count: "exact", head: true }).in("status", ["New", "Open", "Blocked", "In Progress"]),
    supabase.from("bugs").select("*", { count: "exact", head: true }).in("status", ["Fixed", "Will Not Fix"]),
    supabase.from("bugs").select("*").order("bug_number", { ascending: false }).limit(5),
    supabase.from("bugs").select("severity").in("status", ["New", "Open", "Blocked", "In Progress"]),
    supabase.from("projects").select("id, name, project_number")
  ]);

  const mappedBugs: RecentBugWithProject[] = (bugsData || []).map((bug) => ({
    ...bug,
    project: allProjects?.find((p) => p.id === bug.project_id) || null,
  })) as RecentBugWithProject[];

  const severityCounts = (severityStats || []).reduce(
    (acc: Record<string, number>, bug: { severity: string | null }) => {
      const key = bug.severity ?? "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = {
    projects: allProjectsData?.length ?? 0,
    totalBugs: bugCount ?? 0,
    openBugs: openCount ?? 0,
    resolved: resolvedCount ?? 0,
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      "Crash/Undoable": "from-red-500 to-rose-600",
      High: "from-orange-500 to-amber-600",
      Medium: "from-yellow-400 to-amber-500",
      Low: "from-green-500 to-emerald-600",
      Suggestion: "from-blue-500 to-cyan-600",
    };
    return colors[severity] || "from-gray-400 to-gray-500";
  };

  const getSeverityBadge = (severity: string | null) => {
    const badges: Record<string, string> = {
      "Crash/Undoable": "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md",
      High: "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md",
      Medium: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md",
      Low: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md",
      Suggestion: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md",
    };
    return badges[severity ?? ""] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md";
  };

  const getStatusBadge = (status: string | null) => {
    const badges: Record<string, string> = {
      New: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md",
      Open: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md",
      Blocked: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md",
      Confirmed: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md",
      Closed: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md",
    };
    return badges[status ?? ""] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md";
  };

  const getSeverityStyle = (severity?: string | null) => {
    switch (severity) {
      case "Crash/Undoable":
        return "bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-300 hover:shadow-lg hover:border-red-400";
      case "High":
        return "bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-300 hover:shadow-lg hover:border-orange-400";
      case "Medium":
        return "bg-gradient-to-br from-yellow-50 to-amber-100 border-2 border-yellow-300 hover:shadow-lg hover:border-yellow-400";
      case "Low":
        return "bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 hover:shadow-lg hover:border-green-400";
      case "Suggestion":
        return "bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-300 hover:shadow-lg hover:border-blue-400";
      default:
        return "bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300 hover:shadow-lg hover:border-gray-400";
    }
  };

  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="pb-3 sm:pb-4 border-b-4 border-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-indigo-600 mt-1 font-medium text-sm sm:text-base">Overview of your bug tracking activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { 
                label: "Total Projects", 
                value: stats.projects, 
                icon: FolderKanban, 
                gradient: "from-blue-500 to-cyan-600",
                shadow: "shadow-blue-200"
              },
              { 
                label: "Total Bugs", 
                value: stats.totalBugs, 
                icon: BugIcon, 
                gradient: "from-purple-500 to-indigo-600",
                shadow: "shadow-purple-200"
              },
              { 
                label: "Open Bugs", 
                value: stats.openBugs, 
                icon: Clock, 
                gradient: "from-orange-500 to-red-600",
                shadow: "shadow-orange-200"
              },
              { 
                label: "Resolved", 
                value: stats.resolved, 
                icon: CheckCircle, 
                gradient: "from-green-500 to-emerald-600",
                shadow: "shadow-green-200"
              },
            ].map(({ label, value, icon: Icon, gradient, shadow }) => (
              <div 
                key={label} 
                className={`p-4 sm:p-6 bg-gradient-to-br ${gradient} border-2 border-white/50 hover:shadow-xl transition-all relative overflow-hidden group ${shadow}`}
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-all"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white/90">{label}</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-white">{value}</p>
                    </div>
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

            {/* Recent Bugs */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recent Bugs
                </h2>
                <Link 
                  href="/all-bugs" 
                  className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 flex items-center gap-1"
                >
                  View all <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </Link>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {mappedBugs.length > 0 ? (
                  mappedBugs.map((bug) => {
                    const projectNum = String(bug.project?.project_number ?? 1).padStart(2, "0");
                    const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
                    const bugId = `SCB-${projectNum}-${bugNum}`;

                    return (
                      <Link 
                        key={bug.id} 
                        href={`/bug/${bug.id}`} 
                        className={`block p-3 sm:p-4 transition-all shadow-md hover:shadow-xl ${getSeverityStyle(bug.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-1">
                                {bugId}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs font-semibold text-purple-600 truncate">
                                {bug.project?.name ?? "Unknown"}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1 sm:mb-2">{bug.title}</h3>
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                              <span className={`px-2 py-1 text-xs font-bold ${getSeverityBadge(bug.severity)}`}>
                                {bug.severity}
                              </span>
                              <span className={`px-2 py-1 text-xs font-bold ${getStatusBadge(bug.status)}`}>
                                {bug.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-200">
                    <BugIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 font-medium">No recent bugs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bug Trend Chart */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Bug Trend
              </h2>
              <div className="p-4 sm:p-6 border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 shadow-lg hover:shadow-xl transition-all">
                <BugTrendChart />
              </div>
            </div>

          </div>

          {/* Severity Overview */}
          <div className="border-2 border-pink-200 p-4 sm:p-6 bg-white shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              Open Bugs by Severity
            </h2>
            <div className="grid gap-3 sm:gap-4">
              {Object.entries(severityCounts).length > 0 ? (
                Object.entries(severityCounts)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([severity, count]) => {
                    const percentage = stats.totalBugs > 0 ? ((count as number) / stats.totalBugs * 100).toFixed(1) : "0";

                    return (
                      <div 
                        key={severity} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <span className="text-sm font-bold text-gray-800 min-w-[100px]">{severity}</span>
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                          <div className="flex-1 sm:w-32 bg-gray-200 h-3 relative overflow-hidden">
                            <div
                              className={`h-3 bg-gradient-to-r ${getSeverityColor(severity)} shadow-lg`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 min-w-[3rem] bg-white px-2 sm:px-3 py-1 border-2 border-gray-200 text-center">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-green-500" />
                  <p className="font-bold text-green-700">All bugs resolved! 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </ClientConnectionHandler>
  );
}