"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Bug, Project } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowUpDown, Eye } from "lucide-react";

type BugWithProject = Bug & { project: Project | null };

export default function AllBugsClient() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const { toast } = useToast();

  const [bugs, setBugs] = useState<BugWithProject[]>([]);
  const [sortField, setSortField] = useState<keyof BugWithProject>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchBugs = async () => {
      const { data, error } = await supabase.from("bugs").select("*, project(*)");

      if (error) {
        toast({
          title: "Gagal memuat data bug",
          description: error.message,
          type: "error",
        });
      } else {
        setBugs(data as BugWithProject[]);
      }
    };
    fetchBugs();
  }, [supabase, toast]);

  const sortedBugs = useMemo(() => {
    return [...bugs].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [bugs, sortField, sortDirection]);

  const handleSort = (field: keyof BugWithProject) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof BugWithProject }) => {
    if (sortField !== field) return <ArrowUpDown className="inline w-4 h-4 ml-1 opacity-30" />;
    return (
      <ArrowUpDown
        className={`inline w-4 h-4 ml-1 transition-transform ${
          sortDirection === "asc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold">All Bugs</h1>
          <p className="text-sm text-white/80 mt-1">Daftar semua laporan bug di proyek Anda</p>
        </div>
      </div>

      {/* Tabel Bugs */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-gray-700 dark:text-gray-200">
              <th
                className="p-3 cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Judul <SortIcon field="title" />
              </th>
              <th className="p-3">Project</th>
              <th
                className="p-3 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status <SortIcon field="status" />
              </th>
              <th
                className="p-3 cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Dibuat <SortIcon field="created_at" />
              </th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedBugs.map((bug) => {
              const projectNum = String(bug.project?.project_number ?? 1).padStart(2, "0");
              const bugNum = String(bug.bug_number ?? 0).padStart(3, "0");
              const bugCode = `SCB-${projectNum}-${bugNum}`;

              return (
                <tr
                  key={bug.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="p-3 font-medium">{bug.title}</td>
                  <td className="p-3">{bug.project?.name ?? "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bug.status === "open"
                          ? "bg-red-100 text-red-700"
                          : bug.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {bug.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(bug.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => router.push(`/bug/${bug.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> Detail
                    </button>
                  </td>
                </tr>
              );
            })}
            {sortedBugs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-5 text-center text-gray-400">
                  Belum ada bug yang tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}