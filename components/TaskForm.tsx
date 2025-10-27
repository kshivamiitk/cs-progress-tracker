import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

type TaskType = 'programming' | 'video';

type Props = {
  user: User | null;
  onTaskCreated?: () => void;
};

const difficultyOptions = ['Easy', 'Medium', 'Hard'];

export const TaskForm: React.FC<Props> = ({ user, onTaskCreated }) => {
  const [taskType, setTaskType] = useState<TaskType>('programming');
  const [platform, setPlatform] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(1);
  const [difficulty, setDifficulty] = useState('Easy');
  const [date, setDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setMessage('You need to be logged in to add tasks.');
      return;
    }

    setLoading(true);

    const payload = {
      user_id: user.id,
      task_type: taskType,
      platform: platform || null,
      topic: topic || null,
      count,
      difficulty: taskType === 'programming' ? difficulty : 'N/A',
      date: date || new Date().toISOString().slice(0, 10)
    };

    const { error } = await supabase.from('tasks').insert(payload);

    if (error) {
      setMessage(`Error saving task: ${error.message}`);
    } else {
      setMessage('Task recorded successfully!');
      setCount(1);
      setTopic('');
      setPlatform('');
      setDifficulty('Easy');
      setDate('');
      onTaskCreated?.();
    }

    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setTaskType('programming')}
          className={`px-4 py-2 rounded-full border transition ${
            taskType === 'programming' ? 'bg-primary-500 text-white border-primary-500' : 'border-white/20'
          }`}
        >
          Programming Task
        </button>
        <button
          type="button"
          onClick={() => setTaskType('video')}
          className={`px-4 py-2 rounded-full border transition ${
            taskType === 'video' ? 'bg-primary-500 text-white border-primary-500' : 'border-white/20'
          }`}
        >
          Video Task
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {taskType === 'programming' ? (
          <>
            <label className="flex flex-col gap-2 text-sm">
              Platform
              <input
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
                placeholder="LeetCode"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Topic
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
                placeholder="Dynamic Programming"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Questions Solved
              <input
                type="number"
                min={1}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Difficulty / Rating
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-2 text-sm">
              Topic
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
                placeholder="Operating Systems"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Videos Watched
              <input
                type="number"
                min={1}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Platform / Source
              <input
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
                placeholder="YouTube"
              />
            </label>
          </>
        )}
        <label className="flex flex-col gap-2 text-sm">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:border-primary-400"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-400 transition text-white"
      >
        {loading ? 'Saving...' : 'Submit Task'}
      </button>

      {message && <p className="text-sm text-primary-200">{message}</p>}
    </motion.form>
  );
};
