import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { TaskForm } from '../components/TaskForm';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function AddTaskPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      void router.push('/login');
    }
  }, [loading, user, router]);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-semibold">Add Task</h2>
        <p className="text-sm text-slate-400">Log a new programming or video task.</p>
      </div>
      <TaskForm user={user} onTaskCreated={() => void router.push('/history')} />
    </div>
  );
}
