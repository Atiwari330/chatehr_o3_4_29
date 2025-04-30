import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../(auth)/auth';
import { listPatientsForProvider } from '@/lib/db/queries-ehr';
import { ClientIntakeWizard } from '@/components/client-intake-wizard';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Define type for profile data to help TypeScript
type PatientProfile = Record<string, any> | null | undefined;

export default async function ClientsPage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const providerId = session.user.id;
  const patients = await listPatientsForProvider({ providerId });

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <ClientIntakeWizard />
      </div>

      {patients.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">No clients yet. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <Link href={`/clients/${p.id}`} key={p.id}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {p.firstName} {p.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>DOB: {p.dob ? format(new Date(p.dob), 'MMM d, yyyy') : '—'}</p>
                    {p.diagnoses && p.diagnoses.length > 0 && (
                      <p className="truncate">Dx: {p.diagnoses.join(', ')}</p>
                    )}
                    {/* Show chief complaint if available */}
                    {p.profile && typeof p.profile === 'object' && p.profile !== null && 
                     'chiefComplaint' in p.profile && (p.profile as any).chiefComplaint && (
                      <p className="truncate mt-1">CC: {String((p.profile as any).chiefComplaint)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
