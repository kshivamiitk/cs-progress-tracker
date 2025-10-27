import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { AnimatePresence, motion } from 'framer-motion';

export default function App({ Component, pageProps, router }: AppProps) {
  const { user } = useSupabaseAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = window.localStorage.getItem('cs-progress-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } else {
      document.documentElement.dataset.theme = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cs-progress-theme', nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    }
  };

  const isAuthPage = ['/login', '/signup'].includes(router.pathname);

  return (
    <div className={`flex min-h-screen ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {!isAuthPage && <Sidebar user={user} onToggleTheme={toggleTheme} theme={theme} />}
      <div className="flex-1 flex flex-col">
        {!isAuthPage && <Navbar user={user} onToggleTheme={toggleTheme} theme={theme} />}
        <main className="flex-1 px-4 md:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
