import { useMemo, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Task } from '../types';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';
import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

interface AnalyticsProps {
  tasks: Task[];
}

type GoalState = {
  label: string;
  target: number;
};

const difficultyScore: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3
};

export const Analytics: React.FC<AnalyticsProps> = ({ tasks }) => {
  const [goal, setGoal] = useState<GoalState>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('cs-progress-goal');
      if (stored) {
        return JSON.parse(stored) as GoalState;
      }
    }
    return { label: 'Solve 30 problems this month', target: 30 };
  });

  const totalCount = useMemo(() => tasks.reduce((sum, task) => sum + (task.count ?? 0), 0), [tasks]);

  const programmingCount = useMemo(
    () => tasks.filter((task) => task.task_type === 'programming').reduce((sum, task) => sum + (task.count ?? 0), 0),
    [tasks]
  );

  const videoCount = useMemo(
    () => tasks.filter((task) => task.task_type === 'video').reduce((sum, task) => sum + (task.count ?? 0), 0),
    [tasks]
  );

  const goalProgress = useMemo(() => {
    const now = new Date();
    const monthTasks = tasks.filter((task) => {
      const date = parseISO(task.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const completed = monthTasks.reduce((sum, task) => sum + (task.count ?? 0), 0);
    return { completed, percent: Math.min(100, Math.round((completed / goal.target) * 100)) };
  }, [tasks, goal]);

  const streak = useMemo(() => {
    if (tasks.length === 0) return 0;
    const sortedDates = Array.from(new Set(tasks.map((task) => task.date))).sort((a, b) => (a > b ? -1 : 1));
    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = parseISO(sortedDates[i]);
      const nextDate = parseISO(sortedDates[i + 1]);
      const diff = differenceInCalendarDays(currentDate, nextDate);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        break;
      }
    }
    return currentStreak;
  }, [tasks]);

  const barData = useMemo(() => {
    const byPlatform = tasks.reduce<Record<string, number>>((acc, task) => {
      const key = task.platform ?? 'Other';
      acc[key] = (acc[key] ?? 0) + (task.count ?? 0);
      return acc;
    }, {});

    return {
      labels: Object.keys(byPlatform),
      datasets: [
        {
          label: 'Questions Solved',
          data: Object.values(byPlatform),
          backgroundColor: 'rgba(34, 211, 238, 0.6)',
          borderRadius: 12
        }
      ]
    };
  }, [tasks]);

  const pieData = useMemo(() => {
    const byDifficulty = tasks.reduce<Record<string, number>>((acc, task) => {
      const key = task.difficulty ?? 'N/A';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return {
      labels: Object.keys(byDifficulty),
      datasets: [
        {
          label: 'Difficulty Share',
          data: Object.values(byDifficulty),
          backgroundColor: ['#22d3ee', '#818cf8', '#f97316', '#0ea5e9']
        }
      ]
    };
  }, [tasks]);

  const lineData = useMemo(() => {
    const byDate = tasks
      .slice()
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .reduce<Record<string, number>>((acc, task) => {
        acc[task.date] = (acc[task.date] ?? 0) + (task.count ?? 0);
        return acc;
      }, {});
    const labels = Object.keys(byDate);
    return {
      labels,
      datasets: [
        {
          label: 'Tasks Completed',
          data: labels.map((label) => byDate[label]),
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34, 211, 238, 0.3)'
        }
      ]
    };
  }, [tasks]);

  const heatmapValues = useMemo(() => {
    if (tasks.length === 0) return [];
    const dates = tasks.map((task) => task.date);
    const minDate = parseISO(dates.reduce((min, curr) => (curr < min ? curr : min), dates[0]));
    const maxDate = parseISO(dates.reduce((max, curr) => (curr > max ? curr : max), dates[0]));
    const range = eachDayOfInterval({ start: minDate, end: maxDate });

    return range.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const count = tasks
        .filter((task) => task.date === dateKey)
        .reduce((sum, task) => sum + (task.count ?? 0), 0);
      return { date: dateKey, count };
    });
  }, [tasks]);

  const averageDifficultyByWeek = useMemo(() => {
    const byWeek = tasks.reduce<Record<string, { total: number; entries: number }>>((acc, task) => {
      const score = difficultyScore[task.difficulty ?? ''] ?? 0;
      if (!score) return acc;
      const weekLabel = format(parseISO(task.date), 'yyyy-ww');
      const entry = acc[weekLabel] ?? { total: 0, entries: 0 };
      entry.total += score;
      entry.entries += 1;
      acc[weekLabel] = entry;
      return acc;
    }, {});

    return Object.entries(byWeek)
      .map(([week, { total, entries }]) => ({
        week,
        average: (total / entries).toFixed(2)
      }))
      .sort((a, b) => (a.week > b.week ? 1 : -1));
  }, [tasks]);

  const handleSaveGoal = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cs-progress-goal', JSON.stringify(goal));
    }
  };

  return (
    <motion.section className="grid xl:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">🔥 {streak}-day streak</h2>
            <p className="text-sm text-slate-400">Consistency is key. Keep logging your wins!</p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase text-slate-400">Monthly Goal</p>
            <p className="text-lg font-semibold">{goal.label}</p>
            <div className="w-48 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: `${goalProgress.percent}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {goalProgress.completed} / {goal.target} tasks completed ({goalProgress.percent}%)
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm flex flex-col gap-2">
            Goal Description
            <input
              value={goal.label}
              onChange={(event) => setGoal((prev) => ({ ...prev, label: event.target.value }))}
              onBlur={handleSaveGoal}
              className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
            />
          </label>
          <label className="text-sm flex flex-col gap-2">
            Target Count
            <input
              type="number"
              value={goal.target}
              onChange={(event) => setGoal((prev) => ({ ...prev, target: Number(event.target.value) }))}
              onBlur={handleSaveGoal}
              className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-white/5">
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">Total logged</p>
            <p className="text-xl font-semibold">{totalCount}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">Programming</p>
            <p className="text-xl font-semibold">{programmingCount}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">Videos</p>
            <p className="text-xl font-semibold">{videoCount}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Consistency Heatmap</h2>
        <CalendarHeatmap
          startDate={heatmapValues[0] ? parseISO(heatmapValues[0].date) : new Date()}
          endDate={
            heatmapValues[heatmapValues.length - 1]
              ? parseISO(heatmapValues[heatmapValues.length - 1].date)
              : new Date()
          }
          values={heatmapValues}
          showWeekdayLabels
          classForValue={(value) => {
            if (!value || value.count === 0) {
              return 'color-empty';
            }
            if (value.count < 2) return 'color-github-1';
            if (value.count < 4) return 'color-github-2';
            if (value.count < 6) return 'color-github-3';
            return 'color-github-4';
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) return {};
            return { 'data-tip': `${value.date}: ${value.count} tasks` };
          }}
        />
        <p className="text-xs text-slate-500 mt-2">Hover a cell to see details for that day.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Tasks per Platform</h2>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Difficulty Distribution</h2>
        <Pie data={pieData} options={{ responsive: true }} />
      </div>

      <div className="glass-card p-6 xl:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Progress Over Time</h2>
        <Line
          data={lineData}
          options={{
            responsive: true,
            elements: { point: { radius: 4 } },
            plugins: { legend: { display: false } }
          }}
        />
      </div>

      <div className="glass-card p-6 xl:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Average Difficulty per Week</h2>
        <div className="space-y-3">
          {averageDifficultyByWeek.length === 0 && <p className="text-sm text-slate-400">Not enough data yet.</p>}
          {averageDifficultyByWeek.map((entry) => (
            <div key={entry.week} className="flex items-center justify-between border border-white/5 rounded-2xl px-4 py-3">
              <span className="font-medium">Week {entry.week}</span>
              <span className="text-primary-200">Score {entry.average}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Difficulty scores: Easy=1, Medium=2, Hard=3. Higher score indicates tougher study weeks.
        </p>
      </div>
    </motion.section>
  );
};
