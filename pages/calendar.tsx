import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CalendarView } from '../components/CalendarView';
import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function CalendarPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      void router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      setTasks(data ?? []);
    };

    void fetchTasks();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-semibold">Calendar</h2>
        <p className="text-sm text-slate-400">Visualize your tasks across the calendar.</p>
      </div>
      <CalendarView tasks={tasks} />
    </div>
  );
}
