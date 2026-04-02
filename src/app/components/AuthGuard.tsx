import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { getSupabaseClient } from '../lib/supabase';

type GuardState = 'loading' | 'authenticated' | 'unauthenticated';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GuardState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();

      if (!cancelled) {
        setState(data.session ? 'authenticated' : 'unauthenticated');
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#FAF8F3' }}
      >
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
          Loading…
        </p>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
