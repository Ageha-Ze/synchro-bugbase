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

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { count: bugCount } = await supabase
    .from("bugs")
    .select("*", { count: "exact", head: true });

  const { count: openCount } = await supabase
    .from("bugs")
    .select("*", { count: "exact", head: true })
    .in("status", ["New", "Open", "Blocked"]);

  const { count: closedCount } = await supabase
    .from("bugs")
    .select("*", { count: "exact", head: true })
    .in("result", ["Confirmed", "Closed"]);

  const { data: bugsData } = await supabase
    .from("bugs")
    .select("*")
    .order("bug_number", { ascending: false })
    .limit(5);

  const recentBugs: RecentBugWithProject[] = (bugsData || []).map((bug) => ({
    ...bug,
    project: null,
  }));

  const projectIds = Array.from(new Set(recentBugs.map((b) => b.project_id)));

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, project_number")
    .in("id", projectIds);

  const mappedBugs: RecentBugWithProject[] = recentBugs.map((bug) => ({
    ...bug,
    project: projectsData?.find((p) => p.id === bug.project_id) ?? null,
  }));

  const { data: severityStats } = await supabase
    .from("bugs")
    .select("severity")
    .in("status", ["New", "Open", "Blocked"]);

  const severityCounts = (severityStats || []).reduce(
    (acc: Record<string, number>, bug: { severity: string | null }) => {
      const key = bug.severity ?? "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = {
    projects: projectCount ?? 0,
    totalBugs: bugCount ?? 0,
    openBugs: openCount ?? 0,
    closedBugs: closedCount ?? 0,
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
      "Crash/Undoable": "bg-red-100 text-red-700 border-red-200",
      High: "bg-orange-100 text-orange-700 border-orange-200",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Low: "bg-green-100 text-green-700 border-green-200",
      Suggestion: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return badges[severity ?? ""] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getStatusBadge = (status: string | null) => {
    const badges: Record<string, string> = {
      New: "bg-blue-100 text-blue-700",
      Open: "bg-yellow-100 text-yellow-700",
      Blocked: "bg-red-100 text-red-700",
      Confirmed: "bg-green-100 text-green-700",
      Closed: "bg-gray-100 text-gray-600",
    };
    return badges[status ?? ""] || "bg-gray-100 text-gray-600";
  };

  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 text-gray-800">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-red-400 rounded-2xl shadow-md p-5 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
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
                  ["Resolved", stats.closedBugs],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center shadow-inner border border-white/30 hover:bg-white/30 transition-all"
                  >
                    <p className="text-xs sm:text-sm text-white/90 font-medium">{label}</p>
                    <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats & Recent Bugs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Severity Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-400 rounded-full"></div>
                Open Bugs by Severity
              </h2>

              <div className="space-y-4">
                {Object.entries(severityCounts).length > 0 ? (
                  Object.entries(severityCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([severity, count]) => (
                      <div
                        key={severity}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSeverityColor(
                              severity
                            )}`}
                          ></div>
                          <span className="text-sm text-gray-700">{severity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${getSeverityColor(
                                severity
                              )}`}
                              style={{
                                width: `${((count as number) / (stats.openBugs || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-6 text-right">
                            {count as number}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No open bugs 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Bugs */}
<div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-md">
  <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-400 rounded-full"></div>
      Recent Bugs
    </h2>
    <Link
      href="/projects"
      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
    >
      View All <TrendingUp className="w-4 h-4" />
    </Link>
  </div>

  <div className="space-y-3">
    {mappedBugs.length > 0 ? (
      mappedBugs.map((bug) => {
        const severityColors: Record<string, string> = {
          "Crash/Undoable": "bg-gray-900 text-white border-gray-800",
          High: "bg-red-100 text-gray-900 border-red-200",
          Medium: "bg-yellow-100 text-gray-900 border-yellow-200",
          Low: "bg-green-100 text-gray-900 border-green-200",
          Suggestion: "bg-blue-100 text-gray-900 border-blue-200",
        };

        const severityStyle =
          severityColors[bug.severity ?? ""] || "bg-gray-100 text-gray-800 border-gray-200";

        return (
          <Link
            key={bug.id}
            href={`/bug/${bug.id}`}
            className={`block p-4 rounded-xl border hover:opacity-90 transition-all duration-200 group ${severityStyle}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs opacity-80 truncate block mb-1">
                  {bug.project?.name ?? "Unknown Project"}
                </span>
                <h3 className="font-semibold truncate group-hover:underline">
                  {bug.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(
                      bug.severity
                    )}`}
                  >
                    {bug.severity ?? "Unknown"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(
                      bug.status
                    )}`}
                  >
                    {bug.status ?? "Unknown"}
                  </span>
                </div>
                <p className="text-xs mt-2 flex items-center gap-1 opacity-70">
                  <Clock className="w-3 h-3" />
                  {bug.created_at
                    ? new Date(bug.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown date"}
                </p>
              </div>
            </div>
          </Link>
        );
      })
    ) : (
      <div className="text-center py-10 text-gray-500">
        <BugIcon className="w-14 h-14 mx-auto mb-3 opacity-40" />
        <p className="text-base font-medium">No bugs yet</p>
        <p className="text-xs">Create your first bug to get started</p>
      </div>
    )}
  </div>
</div>
          </div>

          {/* Bug Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
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
