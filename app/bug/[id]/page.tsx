import {supabaseServer} from "@/lib/supabaseServer";
import BugDetailClient from "./BugDetailClient";
import { AlertCircle, XCircle } from "lucide-react";
import ClientConnectionHandler from '@/components/ClientConnectionHandler';

interface BugDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BugDetailPage({ params }: BugDetailPageProps) {
  const { id } = await params;

  console.log("🐛 Bug Detail Page - bugId:", id);

  const supabase = await supabaseServer();

  try {
    // Fetch bug with attachments
    const { data: bug, error: bugError } = await supabase
      .from("bugs")
      .select(`
        *,
        attachments (
          id,
          type,
          url,
          created_at
        )
      `)
      .eq("id", id)
      .single();

    if (bugError || !bug) {
      console.warn("⚠️ Bug not found:", bugError);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Bug Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {bugError?.message || "This bug does not exist or has been deleted"}
              </p>
              <a
                href="/projects"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Back to Projects
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Fetch comments
    const { data: comments = [], error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("bug_id", id)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.warn("⚠️ Comments fetch error:", commentsError);
    }

    // Ensure attachments is an array
    if (!bug.attachments) {
      bug.attachments = [];
    }

    return (
      <BugDetailClient
        bug={bug}
        initialComments={comments ?? []} // fallback to empty array
        projectId={bug.project_id ?? ""}
      />
    );
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    return (
      <ClientConnectionHandler>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex-shrink-0">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Server Error
                </h2>
                <p className="text-gray-600">
                  Something went wrong while loading the bug details.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
              <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
              <pre className="text-xs text-red-700 overflow-x-auto whitespace-pre-wrap break-words">
                {String(err?.message || err)}
              </pre>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href="/projects"
                className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Back to Projects
              </a>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
      </ClientConnectionHandler>
    );
  }
}