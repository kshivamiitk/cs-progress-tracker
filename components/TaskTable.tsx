import { useMemo, useState } from 'react';
import { Task } from '../types';
import { supabase } from '../lib/supabaseClient';
import { CSVLink } from 'react-csv';

interface TaskTableProps {
  tasks: Task[];
  onRefresh: () => void;
}

type FilterState = {
  platform: string;
  taskType: string;
  topic: string;
};

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onRefresh }) => {
  const [filters, setFilters] = useState<FilterState>({ platform: 'All', taskType: 'All', topic: 'All' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesPlatform = filters.platform === 'All' || task.platform === filters.platform;
      const matchesType = filters.taskType === 'All' || task.task_type === filters.taskType;
      const matchesTopic = filters.topic === 'All' || task.topic === filters.topic;
      return matchesPlatform && matchesType && matchesTopic;
    });
  }, [tasks, filters]);

  const platforms = Array.from(new Set(tasks.map((task) => task.platform).filter(Boolean)));
  const topics = Array.from(new Set(tasks.map((task) => task.topic).filter(Boolean)));

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      console.error('Failed to delete task', error.message);
      return;
    }
    onRefresh();
  };

  const handleSave = async () => {
    if (!editingTask) return;
    setSaving(true);
    const { id, ...payload } = editingTask;
    const { error } = await supabase.from('tasks').update(payload).eq('id', id);
    if (error) {
      console.error('Failed to update task', error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditingTask(null);
    onRefresh();
  };

  const csvData = tasks.map((task) => ({
    Date: task.date,
    Type: task.task_type,
    Platform: task.platform,
    Topic: task.topic,
    Count: task.count,
    Difficulty: task.difficulty
  }));

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.platform}
          onChange={(event) => setFilters((prev) => ({ ...prev, platform: event.target.value }))}
          className="rounded-full px-4 py-2 bg-white/5 border border-white/10"
        >
          <option value="All">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform ?? ''}>
              {platform}
            </option>
          ))}
        </select>
        <select
          value={filters.taskType}
          onChange={(event) => setFilters((prev) => ({ ...prev, taskType: event.target.value }))}
          className="rounded-full px-4 py-2 bg-white/5 border border-white/10"
        >
          <option value="All">All Types</option>
          <option value="programming">Programming</option>
          <option value="video">Video</option>
        </select>
        <select
          value={filters.topic}
          onChange={(event) => setFilters((prev) => ({ ...prev, topic: event.target.value }))}
          className="rounded-full px-4 py-2 bg-white/5 border border-white/10"
        >
          <option value="All">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic ?? ''}>
              {topic}
            </option>
          ))}
        </select>
        <CSVLink
          data={csvData}
          filename="cs-progress-tasks.csv"
          className="ml-auto px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-400 transition"
        >
          Export CSV
        </CSVLink>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-slate-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Count</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="text-sm">
                <td className="px-4 py-3">{task.date}</td>
                <td className="px-4 py-3 capitalize">{task.task_type}</td>
                <td className="px-4 py-3">{task.platform}</td>
                <td className="px-4 py-3">{task.topic}</td>
                <td className="px-4 py-3">{task.count}</td>
                <td className="px-4 py-3">{task.difficulty}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-3 py-1 rounded-full border border-white/10 hover:border-primary-500/40"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-3 py-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                  No tasks found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingTask && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Edit Task</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Platform
              <input
                value={editingTask.platform ?? ''}
                onChange={(event) => setEditingTask((prev) => (prev ? { ...prev, platform: event.target.value } : prev))}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Topic
              <input
                value={editingTask.topic ?? ''}
                onChange={(event) => setEditingTask((prev) => (prev ? { ...prev, topic: event.target.value } : prev))}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Count
              <input
                type="number"
                value={editingTask.count}
                onChange={(event) => setEditingTask((prev) =>
                  prev ? { ...prev, count: Number(event.target.value) } : prev
                )}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Difficulty
              <input
                value={editingTask.difficulty ?? ''}
                onChange={(event) => setEditingTask((prev) => (prev ? { ...prev, difficulty: event.target.value } : prev))}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Date
              <input
                type="date"
                value={editingTask.date}
                onChange={(event) => setEditingTask((prev) => (prev ? { ...prev, date: event.target.value } : prev))}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditingTask(null)} className="px-4 py-2 rounded-full border border-white/10">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
