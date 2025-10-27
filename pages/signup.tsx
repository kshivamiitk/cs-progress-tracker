import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess('Account created! Please check your inbox to confirm your email.');
      void router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-400">Join the CS Progress Tracker and stay consistent.</p>
        </div>
        <label className="text-sm flex flex-col gap-2">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
          />
        </label>
        <label className="text-sm flex flex-col gap-2">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-primary-200">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-full bg-primary-500 text-white hover:bg-primary-400"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="text-sm text-slate-400 text-center">
          Already registered?{' '}
          <Link href="/login" className="text-primary-200 hover:text-primary-100">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
