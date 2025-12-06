"use client";

import { useState, useMemo } from "react";
import { Bug } from "@/lib/bugs";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";

interface ReportsClientProps {
  bugs: Bug[];
  projects: { id: string; name: string; project_number: number | null }[];
}

export default function ReportsClient({ bugs, projects }: ReportsClientProps) {
  const [dateRange, setDateRange] = useState("all"); // all, week, month, year
  const [selectedProject, setSelectedProject] = useState("all");

  // Filter bugs by date range
  const filteredBugs = useMemo(() => {
    let result = [...bugs];

    // Filter by project
    if (selectedProject !== "all") {
      result = result.filter((b) => b.project_id === selectedProject);
    }

    // Filter by date
    if (dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter((b) => {
        if (!b.created_at) return false;
        return new Date(b.created_at) >= cutoffDate;
      });
    }

    return result;
  }, [bugs, dateRange, selectedProject]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredBugs.length;
    const bySeverity = {
      "Crash/Undoable": 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Suggestion: 0,
    };
    const byStatus = {
      New: 0,
      Open: 0,
      Blocked: 0,
      Fixed: 0,
      "To Fix in Update": 0,
      "Will Not Fix": 0,
      "In Progress": 0,
    };
    const byPriority = {
      Highest: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    filteredBugs.forEach((bug) => {
      if (bug.severity && bug.severity in bySeverity) {
        bySeverity[bug.severity as keyof typeof bySeverity]++;
      }
      if (bug.status && bug.status in byStatus) {
        byStatus[bug.status as keyof typeof byStatus]++;
      }
      if (bug.priority && bug.priority in byPriority) {
        byPriority[bug.priority as keyof typeof byPriority]++;
      }
    });

    const resolved = byStatus.Fixed + (byStatus["Will Not Fix"] || 0);
    const open = byStatus.New + byStatus.Open + byStatus.Blocked + byStatus["In Progress"];

    return {
      total,
      bySeverity,
      byStatus,
      byPriority,
      resolved,
      open,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : "0",
    };
  }, [filteredBugs]);

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "Bug ID",
      "Project",
      "Title",
      "Severity",
      "Priority",
      "Status",
      "Result",
      "Created At",
    ];

    const rows = filteredBugs.map((bug) => {
      const project = projects.find((p) => p.id === bug.project_id);
      const projectNum = String(project?.project_number ?? 1).padStart(2, "0");
      const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
      const bugId = `SCB-${projectNum}-${bugNum}`;

      return [
        bugId,
        project?.name || "Unknown",
        bug.title || "",
        bug.severity || "",
        bug.priority || "",
        bug.status || "",
        bug.result || "",
        bug.created_at ? new Date(bug.created_at).toLocaleString("id-ID") : "",
      ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`);
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bug_reports_${dateRange}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
  <ClientConnectionHandler>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-900 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 dark:bg-white/20 rounded-full blur-3xl -ml-24 -mb-24"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  Bug Reports & Analytics
                </h1>
                <p className="text-indigo-100 dark:text-indigo-200 text-sm md:text-lg">
                  Comprehensive overview of your bug tracking metrics
                </p>
              </div>

              <Button
                onClick={handleExport}
                className="bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-600/30 text-white border border-white/30 dark:border-gray-600/50 backdrop-blur-sm text-sm md:text-base transition-colors duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-4 md:p-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50/50 dark:bg-gray-700/30 text-slate-700 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-3 border border-indigo-200 dark:border-gray-600 rounded-lg bg-indigo-50/50 dark:bg-gray-700/30 text-slate-700 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Bugs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-200" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-red-100 dark:border-red-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Open Bugs</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.open}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-200" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-green-100 dark:border-green-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.resolved}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-200" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-purple-100 dark:border-purple-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Resolution Rate</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.resolutionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-400 rounded-full"></div>
              Bugs by Severity
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.bySeverity).map(([severity, count]) => {
                const colors = {
                  "Crash/Undoable": "from-red-500 to-red-600",
                  High: "from-orange-400 to-orange-500",
                  Medium: "from-yellow-400 to-yellow-500",
                  Low: "from-green-400 to-green-500",
                  Suggestion: "from-blue-400 to-blue-500",
                };
                const percentage =
                  stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";

                return (
                  <div key={severity}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{severity}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${colors[severity as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
              Bugs by Status
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.byStatus)
                .filter(([, count]) => count > 0)
                .map(([status, count]) => {
                  const percentage =
                    stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";

                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{status}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 p-6 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-400 rounded-full"></div>
              Bugs by Priority
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.byPriority).map(([priority, count]) => {
                const percentage =
                  stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";

                return (
                  <div key={priority}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{priority}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-2xl shadow-lg p-6 text-white transition-colors duration-300">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Quick Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-sm opacity-90">Total Bugs</span>
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-sm opacity-90">Open Bugs</span>
                <span className="text-2xl font-bold">{stats.open}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/20">
                <span className="text-sm opacity-90">Resolved</span>
                <span className="text-2xl font-bold">{stats.resolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">Resolution Rate</span>
                <span className="text-2xl font-bold">{stats.resolutionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientConnectionHandler>
);
}