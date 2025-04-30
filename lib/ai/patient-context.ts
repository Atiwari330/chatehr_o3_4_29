import 'server-only';
import { format } from 'date-fns';
import { getPatientById, listProgressNotesForPatient } from '@/lib/db/queries-ehr';

/**
 * Builds a formatted context string containing patient information for LLM context
 */
export async function buildPatientContext(patientId: string, providerId: string): Promise<string> {
  try {
    // Fetch patient and their notes
    const patient = await getPatientById(patientId, providerId);
    if (!patient) return '';
    
    const notes = await listProgressNotesForPatient(patientId);
    const profile = patient.profile as Record<string, any> | null | undefined;
    
    // Format patient data into a structured context
    let context = `
CLIENT INFORMATION:
Name: ${patient.firstName} ${patient.lastName}
DOB: ${patient.dob ? format(new Date(patient.dob), 'MMM d, yyyy') : 'Unknown'}
Gender: ${patient.gender || 'Not specified'}
Diagnoses: ${patient.diagnoses?.join(', ') || 'None recorded'}
`;

    // Add profile data if available
    if (profile) {
      context += `
Contact Information:
${profile.email ? `Email: ${profile.email}` : ''}
${profile.phone ? `Phone: ${profile.phone}` : ''}
${profile.address ? `Address: ${profile.address}` : ''}

${profile.chiefComplaint || profile.socialHistory || 
  (Array.isArray(profile.medications) && profile.medications.length > 0) ||
  (Array.isArray(profile.allergies) && profile.allergies.length > 0) ||
  (Array.isArray(profile.riskFactors) && profile.riskFactors.length > 0) ?
`Clinical Information:
${profile.chiefComplaint ? `Chief Complaint: ${profile.chiefComplaint}` : ''}
${profile.socialHistory ? `Social History: ${profile.socialHistory}` : ''}
${Array.isArray(profile.medications) && profile.medications.length > 0 ? 
  `Medications: ${profile.medications.join(', ')}` : ''}
${Array.isArray(profile.allergies) && profile.allergies.length > 0 ? 
  `Allergies: ${profile.allergies.join(', ')}` : ''}
${Array.isArray(profile.riskFactors) && profile.riskFactors.length > 0 ? 
  `Risk Factors: ${profile.riskFactors.join(', ')}` : ''}
` : ''}

${profile.emergencyContactName || profile.emergencyContactPhone ?
`Emergency Contact:
${profile.emergencyContactName ? `Name: ${profile.emergencyContactName}` : ''}
${profile.emergencyContactPhone ? `Phone: ${profile.emergencyContactPhone}` : ''}` : ''}
`;
    }

    // Add recent notes (limit to 3 most recent)
    if (notes.length > 0) {
      context += '\nRECENT PROGRESS NOTES:\n';
      // Sort notes by createdAt in descending order and take the 3 most recent
      const recentNotes = [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 3);
      
      recentNotes.forEach(note => {
        context += `${format(new Date(note.createdAt), 'MMM d, yyyy')}: ${
          note.content.length > 500 ? `${note.content.substring(0, 500)}...` : note.content
        }\n\n`;
      });
    }

    return context.trim();
  } catch (error) {
    console.error('Error building patient context:', error);
    return '';
  }
}
