"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BugTrendData {
  date: string;
  count: number;
}

export default function BugTrendChart() {
  const [data, setData] = useState<BugTrendData[]>([]);
  const supabase = createBrowserSupabaseClient(); // ✅ definisikan di sini

  useEffect(() => {
    const fetchData = async () => {
      const { data: bugs } = await supabase
        .from("bugs")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true });

      if (!bugs) return;

      // Group by date
      const grouped: Record<string, number> = {};
      bugs.forEach((bug) => {
        const date = new Date(bug.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
        grouped[date] = (grouped[date] || 0) + 1;
      });

      const formattedData = Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      }));

      setData(formattedData);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-72">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-center pt-24">No bug data yet</p>
      )}
    </div>
  );
}
