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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg shadow-xl p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-md">Reports & Analytics</h1>
              </div>
              <p className="text-white/90 font-medium text-lg">Overview of your bug tracking metrics</p>
            </div>

            <Button
              onClick={handleExport}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Search & Filters Card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Filters & Date Range</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Colorful Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">Total Bugs</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">Open Bugs</p>
                <p className="text-3xl font-bold text-white">{stats.open}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-white">{stats.resolved}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">Resolution Rate</p>
                <p className="text-3xl font-bold text-white">{stats.resolutionRate}%</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Breakdown */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Bugs by Severity
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.bySeverity).map(([severity, count]) => {
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";
                const barColors = {
                  "Crash/Undoable": "bg-red-600",
                  High: "bg-orange-500",
                  Medium: "bg-yellow-500",
                  Low: "bg-green-600",
                  Suggestion: "bg-blue-600",
                };

                return (
                  <div key={severity}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{severity}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${barColors[severity as keyof typeof barColors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Bugs by Status
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.byStatus)
                .filter(([, count]) => count > 0)
                .map(([status, count]) => {
                  const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";

                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{status}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Bugs by Priority
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.byPriority).map(([priority, count]) => {
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";

                return (
                  <div key={priority}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{priority}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-purple-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total Bugs</span>
                <span className="font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Open Bugs</span>
                <span className="font-semibold text-gray-900">{stats.open}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Resolved</span>
                <span className="font-semibold text-gray-900">{stats.resolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Resolution Rate</span>
                <span className="font-semibold text-gray-900">{stats.resolutionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
     
    </ClientConnectionHandler>
  );
}
