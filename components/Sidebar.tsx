import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import { CalendarDays, History, Home, LogOut, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SidebarProps {
  user: User | null;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Add Task', href: '/add-task', icon: PlusCircle },
  { name: 'History', href: '/history', icon: History },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays }
];

export const Sidebar: React.FC<SidebarProps> = ({ user, onToggleTheme, theme }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    void router.push('/login');
  };

  return (
    <aside className="hidden lg:flex lg:w-72 xl:w-80 glass-card flex-col p-6 m-6 rounded-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welcome back{user ? `, ${user.email?.split('@')[0]}` : ''}!</h2>
        <p className="text-sm text-slate-400">Track your CS journey with clarity.</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition border border-transparent hover:border-primary-500/40 ${
                isActive ? 'bg-primary-500/20 text-primary-200' : 'text-slate-200'
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={onToggleTheme}
        className="w-full px-4 py-3 rounded-2xl border border-white/10 hover:border-primary-500/40 transition"
      >
        Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
      </button>
      <button
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary-500 hover:bg-primary-400 transition text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
      <div className="text-xs text-slate-500">
        <p className="font-semibold mb-1">Quick Tips</p>
        <p>• Log your wins daily to maintain streaks.</p>
        <p>• Review analytics weekly to stay on track.</p>
      </div>
    </aside>
  );
};
