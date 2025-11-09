// components/BugForm.tsx (client component)
'use client'
import { useState } from 'react';
import { createBug } from '@/lib/bugs';

export default function BugForm({ onCreated }: { onCreated: ()=>void }){
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  async function submit(e:any){
    e.preventDefault();
    await createBug({ title, description: desc, priority: 3 });
    setTitle(''); setDesc('');
    onCreated();
  }

  return (
    <form onSubmit={submit} className="p-4 border rounded space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul bug" required className="w-full p-2 border rounded"/>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Deskripsi" className="w-full p-2 border rounded"/>
      <button className="px-3 py-2 rounded bg-green-600 text-white">Laporkan</button>
    </form>
  );
}
