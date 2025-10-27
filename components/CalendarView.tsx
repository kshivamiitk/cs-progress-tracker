import { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task } from '../types';
import { format } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tasksByDate = useMemo(() => {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const key = task.date;
      acc[key] = acc[key] ? [...acc[key], task] : [task];
      return acc;
    }, {});
  }, [tasks]);

  const selectedTasks = selectedDate ? tasksByDate[format(selectedDate, 'yyyy-MM-dd')] ?? [] : [];

  return (
    <section className="glass-card p-6 space-y-4">
      <div className="grid lg:grid-cols-2 gap-6">
        <Calendar
          onChange={(value) => setSelectedDate(value as Date)}
          value={selectedDate ?? new Date()}
          tileClassName={({ date }) => {
            const key = format(date, 'yyyy-MM-dd');
            if (tasksByDate[key]) {
              return 'bg-primary-500/20 rounded-full';
            }
            return undefined;
          }}
        />
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}</h3>
          {selectedTasks.length === 0 && <p className="text-sm text-slate-400">No tasks recorded for this day.</p>}
          {selectedTasks.map((task) => (
            <div key={task.id} className="border border-white/5 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold">{task.task_type.toUpperCase()}</p>
              <p className="text-xs text-slate-400">{task.platform ?? task.topic}</p>
              <p className="text-xs text-slate-400">Count: {task.count}</p>
              <p className="text-xs text-slate-400">Difficulty: {task.difficulty}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
