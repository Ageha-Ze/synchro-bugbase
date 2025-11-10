import BugTrendChart from '@/components/BugTrendChart';
import QuickActions from '@/components/QuickActions';
import supabaseServer from "@/lib/supabaseServer";
import Link from 'next/link';
import { Bug as BugIcon, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { Bug } from '@/lib/bugs'; // pakai type Bug dari lib/bugs
import ClientConnectionHandler from '@/components/ClientConnectionHandler';

type Project = {
  id: string;
  name: string;
  project_number: string | number | null;
};

type RecentBugWithProject = Bug & {
  project: Project | null;
};

export default async function DashboardPage() {
  const supabase = supabaseServer;

  // --- Stats ---
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  const { count: bugCount } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true });

  const { count: openCount } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true })
    .in('status', ['New', 'Open', 'Blocked']);

  const { count: closedCount } = await supabase
    .from('bugs')
    .select('*', { count: 'exact', head: true })
    .in('result', ['Confirmed', 'Closed']);

  // --- Recent Bugs ---
  const { data: bugsData } = await supabase
    .from("bugs")
    .select("*")
    .order("bug_number", { ascending: false })
    .limit(5);

  const recentBugs: RecentBugWithProject[] = bugsData || [];

  // Ambil project_id unik
  const projectIds = Array.from(new Set(recentBugs.map(b => b.project_id)));

  // Fetch semua project terkait
  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, project_number")
    .in("id", projectIds);

  // Map project ke bugs
  const mappedBugs: RecentBugWithProject[] = recentBugs.map(bug => ({
    ...bug,
    project: projectsData?.find(p => p.id === bug.project_id) ?? null,
  }));

  // --- Bugs by severity ---
  const { data: severityStats } = await supabase
    .from('bugs')
    .select('severity')
    .in('status', ['New', 'Open', 'Blocked']);

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

  // --- Helper functions for badges ---
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'Crash/Undoable': 'from-red-500 to-red-600',
      'High': 'from-orange-500 to-orange-600',
      'Medium': 'from-yellow-500 to-yellow-600',
      'Low': 'from-green-500 to-green-600',
      'Suggestion': 'from-blue-500 to-blue-600',
    };
    return colors[severity] || 'from-gray-500 to-gray-600';
  };

  const getSeverityBadge = (severity: string | null) => {
    const badges: Record<string, string> = {
      'Crash/Undoable': 'bg-red-100 text-red-800 border-red-300',
      'High': 'bg-orange-100 text-orange-800 border-orange-300',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Low': 'bg-green-100 text-green-800 border-green-300',
      'Suggestion': 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return badges[severity ?? ''] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBadge = (status: string | null) => {
    const badges: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Open': 'bg-yellow-100 text-yellow-800',
      'Blocked': 'bg-red-100 text-red-800',
      'Confirmed': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
    };
    return badges[status ?? ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 animate-scaleIn">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Dashboard</h1>
              </div>
              <p className="text-indigo-100 text-lg ml-5">
                Welcome back! Here's your bug tracking overview
              </p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-indigo-100 text-sm font-medium">Total Projects</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.projects}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-indigo-100 text-sm font-medium">Total Bugs</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.totalBugs}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-indigo-100 text-sm font-medium">Open Bugs</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.openBugs}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                  <p className="text-indigo-100 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.closedBugs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {/* Bugs by Severity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Open Bugs by Severity</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(severityCounts).length > 0 ? (
                  Object.entries(severityCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSeverityColor(severity)}`}></div>
                          <span className="text-sm font-medium text-gray-700">{severity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${getSeverityColor(severity)}`}
                              style={{
                                width: `${((count as number) / (stats.openBugs || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-gray-900 w-8 text-right">
                            {count as number}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No open bugs! 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Bugs */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Bugs</h2>
                </div>
                <Link
                  href="/projects"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  View All
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {mappedBugs.length > 0 ? (
                  mappedBugs.map((bug, index) => (
                    <Link
                      key={bug.id}
                      href={`/bug/${bug.id}`}
                      className="block p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                      style={{ animation: `fadeIn 0.3s ease-in-out ${index * 0.1}s backwards` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1 mb-2">
                            <span className="text-xs text-gray-500 truncate" title={bug.project?.name ?? "Unknown Project"}>
                              {bug.project?.name ?? "Unknown Project"}
                            </span>

                            <span className="text-xs font-mono font-bold text-indigo-600">
                              SCB-{String(bug.project?.project_number ?? "01").padStart(2, "0")}-
                              {String(bug.bug_number ?? 0).padStart(3, "0")}
                            </span>

                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(bug.severity)}`}>
                                {bug.severity ?? 'Unknown'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(bug.status)}`}>
                                {bug.status ?? 'Unknown'}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate" title={bug.title}>
                            {bug.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {bug.created_at
                              ? new Date(bug.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Unknown date'}
                          </p>
                        </div>
                        <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
                          →
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <BugIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No bugs yet</p>
                    <p className="text-sm">Create your first bug to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bug Trend Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Bug Trend (Last 30 Days)</h2>
            </div>
            <BugTrendChart />
          </div>

          <QuickActions />
        </div>
      </div>
    </ClientConnectionHandler>
  );
}
