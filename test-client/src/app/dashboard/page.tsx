import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const { name, email, image } = session.user;

  return (
    <main>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name ?? 'User avatar'}
            width={64}
            height={64}
            style={{ borderRadius: '50%' }}
          />
        )}
        <div>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{name}</p>
          <p style={{ margin: 0, color: '#666' }}>{email}</p>
        </div>
      </div>

      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
      >
        <button type="submit" style={{
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          cursor: 'pointer',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
        }}>
          Sign Out
        </button>
      </form>
    </main>
  );
}
