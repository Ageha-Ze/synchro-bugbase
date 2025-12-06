'use client'
import { useEffect, useState, memo } from 'react';
import { getBugs } from '@/lib/bugs';
import { Bug } from '@/lib/bugs';

const BugItem = memo(({ bug }: { bug: any }) => (
  <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
    <div className="flex justify-between">
      <h3 className="font-semibold">{bug.title}</h3>
      <span className="text-sm italic">{bug.status}</span>
    </div>
    <p className="text-sm">{bug.description}</p>
    <div className="text-xs text-gray-500">#{bug.priority} • {new Date(bug.created_at).toLocaleString()}</div>
  </div>
));

const BugList = memo(function BugList(){
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBugs = async () => {
      setLoading(true);
      try {
        const data = await getBugs();
        setBugs(data || []);
      } catch (error) {
        console.error('Error loading bugs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBugs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!bugs.length) {
    return <div className="text-center py-8 text-gray-500">No bugs found</div>;
  }

  return (
    <div className="space-y-3">
      {bugs.map(bug => (
        <BugItem key={bug.id} bug={bug} />
      ))}
    </div>
  );
});

export default BugList;
