import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import {
  listProgressNotesForPatient,
  getPatientById,
} from '@/lib/db/queries-ehr';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Pencil1Icon } from '@radix-ui/react-icons';

// Type for profile data to help TypeScript
type PatientProfile = Record<string, any> | null | undefined;

type PageProps = { params: { id: string } };

// Helper to safely get profile data
const getProfileValue = (profile: PatientProfile, key: string): string => {
  if (!profile || typeof profile !== 'object') return '—';
  return profile[key] ? String(profile[key]) : '—';
};

// Helper for array values
const getProfileArray = (profile: PatientProfile, key: string): string[] => {
  if (!profile || typeof profile !== 'object') return [];
  return Array.isArray(profile[key]) ? profile[key] : [];
};

export default async function ClientProfilePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const patient = await getPatientById(params.id, session.user.id);
  if (!patient) redirect('/clients');

  const notes = await listProgressNotesForPatient(params.id);
  
  // Helper to get profile data or fallback
  const profile = patient.profile as PatientProfile;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Client Profile</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil1Icon className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Demographics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h3 className="text-lg font-medium">{patient.firstName} {patient.lastName}</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>DOB: {patient.dob ? format(new Date(patient.dob), 'MMM d, yyyy') : '—'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p>{patient.gender || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pronouns</p>
                <p>{getProfileValue(profile, 'pronouns')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p>{getProfileValue(profile, 'email')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>{getProfileValue(profile, 'phone')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Address</p>
              <p>{getProfileValue(profile, 'address')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Provider</p>
              <p>{getProfileValue(profile, 'insuranceName')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Policy #</p>
                <p>{getProfileValue(profile, 'insurancePolicyNumber')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Group #</p>
                <p>{getProfileValue(profile, 'insuranceGroupNumber')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Clinical Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Chief Complaint</p>
              <p>{getProfileValue(profile, 'chiefComplaint')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Social History</p>
              <p>{getProfileValue(profile, 'socialHistory')}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Diagnoses</p>
              <ul className="list-disc list-inside">
                {patient.diagnoses && patient.diagnoses.length > 0 ? (
                  patient.diagnoses.map((dx, i) => <li key={i}>{dx}</li>)
                ) : (
                  <li>No diagnoses recorded</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-muted-foreground">Medications</p>
              <ul className="list-disc list-inside">
                {getProfileArray(profile, 'medications').length > 0 ? (
                  getProfileArray(profile, 'medications').map((med, i) => <li key={i}>{med}</li>)
                ) : (
                  <li>No medications recorded</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Allergies</p>
              <p>
                {getProfileArray(profile, 'allergies').length > 0
                  ? getProfileArray(profile, 'allergies').join(', ')
                  : 'None reported'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Risk Factors</p>
              <p>
                {getProfileArray(profile, 'riskFactors').length > 0
                  ? getProfileArray(profile, 'riskFactors').join(', ')
                  : 'None reported'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p>{getProfileValue(profile, 'emergencyContactName')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{getProfileValue(profile, 'emergencyContactPhone')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Notes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Progress Notes</h2>
          <Button size="sm">Add Note</Button>
        </div>
        
        <div className="space-y-4">
          {notes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No progress notes yet. Add a note to track client progress.
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap">
                  {note.content}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
