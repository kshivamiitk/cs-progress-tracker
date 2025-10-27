export type Task = {
  id: string;
  user_id: string;
  task_type: 'programming' | 'video';
  platform: string | null;
  topic: string | null;
  count: number;
  difficulty: string | null;
  date: string;
};
