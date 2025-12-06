"use client";

import { useEffect, useState } from "react";
import supabaseBrowser from "@/lib/supabaseBrowser";
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
  const supabase = supabaseBrowser; // ✅ definisikan di sini

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
        if (!bug.created_at) return;
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
    <div className="w-full h-64">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-center pt-20">No bug data yet</p>
      )}
    </div>
  );
}
