"use client";

import { useEffect, useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";

export default function ProjectProgress({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState<number | null>(null);
  const supabase = supabaseBrowser;

  useEffect(() => {
    const fetchProgress = async () => {
      const { count: total } = await supabase
        .from("bugs")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      const { count: Fixed } = await supabase
        .from("bugs")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .in("status", ["Fixed"]);

      if (total && total > 0) {
        setProgress(Math.round((Fixed! / total) * 100));
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
