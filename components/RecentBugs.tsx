'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Bug } from 'lucide-react';

type BugType = {
  id: string;
  bug_number: number;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  projects: { id: string; name: string; project_number: number } | null;
};

interface RecentBugsProps {
  bugs: BugType[];
}

export default function RecentBugs({ bugs }: RecentBugsProps) {
  const [projectFilter, setProjectFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('created_at_desc');

  // Generate unique projects
  const projects = useMemo(() => {
    const map = new Map(bugs.map(b => b.projects).filter(Boolean).map(p => [p!.id, p!]));
    return Array.from(map.values());
  }, [bugs]);

  // Filter & sort bugs
// Filter & sort bugs
const filteredBugs = useMemo(() => {
  let result = [...bugs];

  const normalize = (str?: string) => str?.toLowerCase().trim() || '';

  if (projectFilter) {
    result = result.filter(b => normalize(b.projects?.id) === normalize(projectFilter));
  }
  if (severityFilter) {
    result = result.filter(b => normalize(b.severity) === normalize(severityFilter));
  }
  if (statusFilter) {
    result = result.filter(b => normalize(b.status) === normalize(statusFilter));
  }

  const severityRankDesc = ['crash/undoable','high','medium','low','suggestion'];
  const severityRankAsc = [...severityRankDesc].reverse();

  switch (sortOrder) {
    case 'created_at_desc':
      result.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'created_at_asc':
      result.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;
    case 'severity_desc':
      result.sort((a,b) => severityRankDesc.indexOf(normalize(a.severity)) - severityRankDesc.indexOf(normalize(b.severity)));
      break;
    case 'severity_asc':
      result.sort((a,b) => severityRankAsc.indexOf(normalize(a.severity)) - severityRankAsc.indexOf(normalize(b.severity)));
      break;
  }

  return result;
}, [bugs, projectFilter, severityFilter, statusFilter, sortOrder]);


  const getSeverityBadge = (severity: string) => {
    const badges: Record<string,string> = {
      "Crash/Undoable": "from-red-100 to-red-200 text-red-800 border-red-300",
      "High": "from-orange-100 to-orange-200 text-orange-800 border-orange-300",
      "Medium": "from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
      "Low": "from-green-100 to-green-200 text-green-800 border-green-300",
      "Suggestion": "from-blue-100 to-blue-200 text-blue-800 border-blue-300",
    };
    return badges[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string,string> = {
      "New": "from-red-100 to-red-200 text-red-800 border-red-300",
      "Open": "from-red-100 to-red-200 text-red-800 border-red-300",
      "Blocked": "from-red-100 to-red-200 text-red-800 border-red-300",
      "Fixed": "from-green-100 to-green-200 text-green-800 border-green-300",
      "To Fix in Update": "from-indigo-100 to-purple-100 text-indigo-800 border-indigo-300",
      "Will Not Fix": "from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300",
      "In Progress": "from-blue-100 to-cyan-100 text-blue-700 border-blue-300",
      "Confirmed": "from-green-100 to-green-200 text-green-800 border-green-300",
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div>
      {/* FILTER & SORT */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select className="border rounded px-2 py-1 text-sm" onChange={e=>setProjectFilter(e.target.value)} value={projectFilter}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select className="border rounded px-2 py-1 text-sm" onChange={e=>setSeverityFilter(e.target.value)} value={severityFilter}>
          <option value="">All Severities</option>
          {["Crash/Undoable","High","Medium","Low","Suggestion"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="border rounded px-2 py-1 text-sm" onChange={e=>setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="">All Status</option>
          {["New","Open","Blocked","Fixed","To Fix in Update","Will Not Fix","In Progress"].map(st => <option key={st} value={st}>{st}</option>)}
        </select>

        <select className="border rounded px-2 py-1 text-sm" onChange={e=>setSortOrder(e.target.value)} value={sortOrder}>
          <option value="created_at_desc">Newest</option>
          <option value="created_at_asc">Oldest</option>
          <option value="severity_desc">Severity High → Low</option>
          <option value="severity_asc">Severity Low → High</option>
        </select>
      </div>

      {/* BUG LIST */}
      <div className="space-y-3">
        {filteredBugs.length > 0 ? filteredBugs.map((bug,index) => (
          <Link
            key={bug.id}
            href={`/bug/${bug.id}`}
            className="block p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group animate-fadeInUp"
            style={{ animationDelay: `${index*0.05}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-xs text-gray-500 truncate" title={bug.projects?.name || "Unknown Project"}>{bug.projects?.name || "Unknown Project"}</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">SCB-{bug.projects?.project_number || "01"}-{String(bug.bug_number).padStart(3,"0")}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-1 sm:mt-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(bug.severity)}`}>{bug.severity}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(bug.status)}`}>{bug.status}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate" title={bug.title}>{bug.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(bug.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                </p>
              </div>
              <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">→</div>
            </div>
          </Link>
        )) : (
          <div className="text-center py-12 text-gray-400">
            <Bug className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No bugs yet</p>
            <p className="text-sm">Create your first bug to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
