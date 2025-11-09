// components/BugList.tsx (client component)
'use client'
import { useEffect, useState } from 'react';
import { getBugs } from '@/lib/bugs';

export default function BugList(){
  const [bugs, setBugs] = useState<any[]>([]);
  async function load(){ setBugs(await getBugs()); }
  useEffect(()=>{ load(); }, []);
  return (
    <div className="space-y-3">
      {bugs.map(b=>(
        <div key={b.id} className="p-3 border rounded">
          <div className="flex justify-between">
            <h3 className="font-semibold">{b.title}</h3>
            <span className="text-sm italic">{b.status}</span>
          </div>
          <p className="text-sm">{b.description}</p>
          <div className="text-xs text-gray-500">#{b.priority} • {new Date(b.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
