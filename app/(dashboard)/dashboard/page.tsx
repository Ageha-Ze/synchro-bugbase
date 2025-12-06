import BugTrendChart from "@/components/BugTrendChart";
import QuickActions from "@/components/QuickActions";
import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";
import { Bug as BugIcon, CheckCircle, Clock, TrendingUp } from "lucide-react";
import type { Bug } from "@/lib/bugs";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";



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

  // ✅ Gunakan spread operator - otomatis include semua properties
  const mappedBugs: RecentBugWithProject[] = (bugsData || []).map((bug) => ({
    ...bug, // ✅ Spread semua properties dari bug
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
      "Crash/Undoable": "from-red-400 to-red-500",
      High: "from-orange-400 to-orange-500",
      Medium: "from-yellow-300 to-yellow-400",
      Low: "from-green-400 to-green-500",
      Suggestion: "from-blue-400 to-blue-500",
    };
    return colors[severity] || "from-gray-400 to-gray-500";
  };

  const getSeverityBadge = (severity: string | null) => {
    const badges: Record<string, string> = {
      "Crash/Undoable": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
      High: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700",
      Low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
      Suggestion: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
    };
    return badges[severity ?? ""] || "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  };

  const getStatusBadge = (status: string | null) => {
    const badges: Record<string, string> = {
      New: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      Open: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      Blocked: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      Confirmed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      Closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    };
    return badges[status ?? ""] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  };

  const getSeverityStyle = (severity?: string | null) => {
    switch (severity) {
      case "Crash/Undoable":
        return "bg-red-700 text-white border-red-800 dark:bg-red-900 dark:text-white dark:border-red-700";
      case "High":
        return "bg-orange-300 text-black border-orange-400 dark:bg-orange-800 dark:text-orange-200 dark:border-orange-700";
      case "Medium":
        return "bg-yellow-300 text-black border-yellow-400 dark:bg-yellow-800 dark:text-yellow-200 dark:border-yellow-700";
      case "Low":
        return "bg-green-300 text-black border-green-400 dark:bg-green-800 dark:text-green-200 dark:border-green-700";
      case "Suggestion":
        return "bg-sky-300 text-black border-sky-400 dark:bg-sky-800 dark:text-sky-200 dark:border-sky-700";
      default:
        return "bg-white text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700";
    }
  };

  

  return (
  <ClientConnectionHandler>
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 text-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-red-400 dark:from-indigo-700 dark:to-red-700 rounded-2xl shadow-md p-5 sm:p-8 text-white relative overflow-hidden">
          {/* Hapus overlay blur untuk performa */}
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-bold">Dashboard</h1>
            <p className="text-white/80 mt-1 text-sm sm:text-base">
              Welcome back! Here's your bug tracking overview.
            </p>

            {/* Stat Cards */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                ["Total Projects", stats.projects],
                ["Total Bugs", stats.totalBugs],
                ["Open Bugs", stats.openBugs],
                ["Resolved", stats.resolved],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white/20 rounded-xl p-3 sm:p-4 text-center shadow-inner border border-white/30 hover:bg-white/30 dark:bg-black/30 dark:hover:bg-black/40 transition-colors"
                >
                  <p className="text-xs sm:text-sm text-white/90 font-medium">{label}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats & Recent Bugs */}
        <div className="space-y-6">

          {/* Recent Bugs */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-400 rounded-full"></div>
                Recent Bugs
              </h2>
              <Link
                href="/projects"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
              >
                View All <TrendingUp className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {mappedBugs.length > 0 ? (
                mappedBugs.map((bug) => {
                  const projectNum = String(bug.project?.project_number ?? 1).padStart(2, "0");
                  const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
                  const bugId = `SCB-${projectNum}-${bugNum}`;

                  return (
                    <Link
                      key={bug.id}
                      href={`/bug/${bug.id}`}
                      className={`block p-4 rounded-xl border hover:opacity-90 group ${getSeverityStyle(bug.severity)}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold opacity-90">{bugId}</span>
                            <span className="text-xs opacity-60">•</span>
                            <span className="text-xs opacity-80 truncate">{bug.project?.name ?? "Unknown Project"}</span>
                          </div>

                          <h3 className="font-semibold truncate group-hover:underline">{bug.title}</h3>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(bug.severity)}`}>
                              {bug.severity ?? "Unknown"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(bug.status)}`}>
                              {bug.status ?? "Unknown"}
                            </span>
                          </div>

                          <p className="text-xs mt-2 flex items-center gap-1 opacity-70">
                            <Clock className="w-3 h-3" />
                            {bug.created_at ? new Date(bug.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) : "Unknown date"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <BugIcon className="w-14 h-14 mx-auto mb-3 opacity-40" />
                  <p className="text-base font-medium">No bugs yet</p>
                  <p className="text-xs">Create your first bug to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Severity Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-400 rounded-full"></div>
              Open Bugs by Severity
            </h2>

            <div className="space-y-4">
              {Object.entries(severityCounts).length > 0 ? (
                Object.entries(severityCounts)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([severity, count]) => {
                    const percentage =
                      stats.totalBugs > 0 ? ((count as number) / stats.totalBugs * 100).toFixed(1) : "0";

                    return (
                      <div key={severity} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{severity}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${getSeverityColor(severity)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No open bugs 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bug Trend Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-400 rounded-full"></div>
            Bug Trend (Last 30 Days)
          </h2>
          <BugTrendChart />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  </ClientConnectionHandler>
);
}