import { redirect } from 'next/navigation';

import { auth } from '../../(auth)/auth';
import { listPatientsForProvider } from '@/lib/db/queries-ehr';

export default async function ClientsPage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const providerId = session.user.id;
  const patients = await listPatientsForProvider({ providerId });

  return (
    <main className="p-6 space-y-2">
      <h1 className="text-xl font-semibold mb-4">Clients</h1>
      {patients.length === 0 ? (
        <p className="text-muted-foreground">No clients yet.</p>
      ) : (
        <ul className="space-y-1">
          {patients.map((p) => (
            <li key={p.id} className="border rounded p-3">
              {p.firstName} {p.lastName} – {p.diagnoses?.join(', ') ?? 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
} 