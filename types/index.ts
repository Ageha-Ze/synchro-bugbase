export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Bug {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'new' | 'fixed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  bug_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  action_type: ActivityActionType;
  entity_type: ActivityEntityType;
  entity_id: string;
  title: string;
  description: string | null;
  metadata: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export type ActivityActionType =
  | 'bug_created'
  | 'bug_updated'
  | 'bug_deleted'
  | 'comment_added'
  | 'status_changed';

export type ActivityEntityType = 'bug' | 'comment' | 'project';

/**
 * Type guard untuk memeriksa apakah entity adalah Bug
 */
export function isBug(entity: Bug | Comment): entity is Bug {
  return 'priority' in entity;
}

/**
 * Contoh penggunaan
 */
const someEntity: Bug | Comment = {
  id: '1',
  bug_id: 'b1', // untuk Comment
  user_id: 'u1',
  content: 'test', // untuk Comment
  title: 'Bug title', // untuk Bug
  description: 'desc', // untuk Bug
  status: 'open', // untuk Bug
  priority: 'medium', // untuk Bug
  project_id: null, // untuk Bug
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Gunakan type guard
if (isBug(someEntity)) {
  console.log(someEntity.priority); // ✅ aman
} else {
  console.log(someEntity.content); // ✅ Comment
}
