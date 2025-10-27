import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { TaskTable } from '../components/TaskTable';
import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function HistoryPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      void router.push('/login');
    }
  }, [loading, user, router]);

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setTasks(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchTasks();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-semibold">History</h2>
        <p className="text-sm text-slate-400">Review your logged tasks and make adjustments.</p>
      </div>
      {isLoading ? <p className="text-sm text-slate-400">Loading tasks...</p> : <TaskTable tasks={tasks} onRefresh={fetchTasks} />}
    </div>
  );
}
