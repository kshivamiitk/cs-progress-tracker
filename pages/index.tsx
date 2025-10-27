import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';
import { Analytics } from '../components/Analytics';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function DashboardPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      void router.push('/login');
    }
  }, [loading, user, router]);

  const fetchTasks = async () => {
    if (!user) return;
    setIsLoadingTasks(true);
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setTasks(data ?? []);
    setIsLoadingTasks(false);
  };

  useEffect(() => {
    void fetchTasks();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-400">Track your progress with beautiful insights.</p>
      </div>
      {isLoadingTasks ? <p className="text-sm text-slate-400">Loading analytics...</p> : <Analytics tasks={tasks} />}
    </div>
  );
}
