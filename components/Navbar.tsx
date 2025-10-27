import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Moon, Sun } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onToggleTheme: () => void;
  theme: 'dark' | 'light';
}

export const Navbar: React.FC<NavbarProps> = ({ user, onToggleTheme, theme }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CS Progress Tracker</h1>
        <p className="text-sm text-slate-400">Visualize and optimize your CS learning journey.</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleTheme}
          className="glass-card neo-brutal p-2 rounded-full text-primary-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user ? (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-400 transition"
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-2">
            <Link
              className="px-4 py-2 rounded-full bg-primary-500 text-white hover:bg-primary-400 transition"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="px-4 py-2 rounded-full border border-primary-500 text-primary-300 hover:bg-primary-500/10 transition"
              href="/signup"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
