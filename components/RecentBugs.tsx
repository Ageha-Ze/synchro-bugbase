"use client";

import { useEffect, useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { Bug } from "@/lib/bugs";
import { Bug as BugIcon, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RecentBugsSection() {
  const [recentBugs, setRecentBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRecentBugs();
  }, []);

  const fetchRecentBugs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser
        .from("bugs")
        .select(`
          *,
          project:project_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentBugs(data || []);
    } catch (err) {
      console.error("Error fetching recent bugs:", err);
      setRecentBugs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading recent bugs...
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900">Recent Bugs</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/bugs")}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {recentBugs.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mb-4">
            <BugIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="font-bold text-gray-900 mb-1">No bugs yet</p>
          <p className="text-sm">Create your first bug to get started</p>
        </div>
      ) : (
        <ul className="divide-y divide-indigo-100">
          {recentBugs.map((bug) => (
            <li
              key={bug.id}
              className="py-3 flex justify-between items-center cursor-pointer hover:bg-indigo-50/50 rounded-lg transition-all"
              onClick={() => router.push(`/bug/${bug.id}`)}
            >
              <div className="flex flex-col">
                <span className="font-mono font-bold text-gray-900">{bug.title}</span>
                <span className="text-sm text-gray-500">
                  {bug.project?.name || "Unknown Project"}
                </span>
              </div>
              <span className="text-sm text-slate-600">
                {bug.created_at
                  ? new Date(bug.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
