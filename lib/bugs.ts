// lib/bugs.ts
import { supabase } from './supabase';

export async function createBug(payload: {
  title:string,
  description?:string,
  priority?:number,
  tags?:string[],
  steps?:string
}) {
  const { data, error } = await supabase
    .from('bugs')
    .insert([{ ...payload }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getBugs() {
  const { data, error } = await supabase
    .from('bugs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}


