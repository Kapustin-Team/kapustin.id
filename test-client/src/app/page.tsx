import { auth, signIn } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <main>
      <h1>Kapustin ID — Test Client</h1>
      {session?.user ? (
        <div>
          <p>Signed in as <strong>{session.user.email}</strong></p>
          <a href="/dashboard">Go to Dashboard →</a>
        </div>
      ) : (
        <form
          action={async () => {
            'use server';
            await signIn('kapustin', { redirectTo: '/dashboard' });
          }}
        >
          <button type="submit" style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
          }}>
            Sign in with Kapustin ID
          </button>
        </form>
      )}
    </main>
  );
}
