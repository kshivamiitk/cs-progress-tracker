import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

export function useSupabaseAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ session: null, user: null, loading: true });

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_, session) => {
      setState({ session, user: session?.user ?? null, loading: false });
    });

    void supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, user: data.session?.user ?? null, loading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
