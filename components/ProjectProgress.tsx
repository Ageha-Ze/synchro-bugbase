"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

export default function ProjectProgress({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState<number | null>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchProgress = async () => {
      const { count: total } = await supabase
        .from("bugs")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      const { count: closed } = await supabase
        .from("bugs")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .in("status", ["Confirmed", "Closed"]);

      if (total && total > 0) {
        setProgress(Math.round((closed! / total) * 100));
      } else {
        setProgress(0);
      }
    };

    fetchProgress();
  }, [projectId]);

  return (
    <div className="mt-1 w-32 bg-gray-200 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
        style={{ width: `${progress ?? 0}%` }}
      ></div>
    </div>
  );
}
