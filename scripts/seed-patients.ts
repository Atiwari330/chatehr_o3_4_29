require('dotenv/config');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { patient, progressNote } = require('../lib/db/schema');

// Sample data for mock patients
const MOCK_PATIENTS = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    dob: '1985-06-14',
    gender: 'Female',
    diagnoses: ['Major Depressive Disorder', 'Generalized Anxiety Disorder'],
    profile: {
      pronouns: 'she/her',
      email: 'sarah.johnson@example.com',
      phone: '(555) 123-4567',
      address: '123 Oak St, Portland, OR 97201',
      emergencyContactName: 'Michael Johnson',
      emergencyContactPhone: '(555) 987-6543',
      insuranceName: 'Blue Cross Blue Shield',
      insurancePolicyNumber: 'BCBS12345678',
      insuranceGroupNumber: 'GRP9876',
      chiefComplaint: 'Depression and difficulty sleeping',
      primaryDiagnosis: 'Major Depressive Disorder',
      otherDiagnoses: ['Generalized Anxiety Disorder'],
      medications: ['Sertraline (Zoloft) 50mg daily', 'Trazodone 50mg at bedtime'],
      allergies: ['Penicillin'],
      riskFactors: ['Passive SI without plan'],
      socialHistory: 'Divorced 2 years ago, two children, works as teacher'
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    dob: '1990-12-03',
    gender: 'Male',
    diagnoses: ['ADHD', 'Substance Use Disorder'],
    profile: {
      pronouns: 'he/him',
      email: 'mchen@example.com',
      phone: '(555) 234-5678',
      address: '456 Pine Ave, Seattle, WA 98101',
      emergencyContactName: 'Wei Chen',
      emergencyContactPhone: '(555) 876-5432',
      insuranceName: 'Aetna',
      insurancePolicyNumber: 'AET98765432',
      insuranceGroupNumber: 'A12345',
      chiefComplaint: 'Difficulty concentrating at work',
      primaryDiagnosis: 'ADHD',
      otherDiagnoses: ['Substance Use Disorder - Alcohol'],
      medications: ['Adderall 20mg daily'],
      allergies: [],
      riskFactors: ['Alcohol use - 3-4 drinks daily'],
      socialHistory: 'Software engineer, single, lives alone'
    }
  },
  {
    firstName: 'Emily',
    lastName: 'Martinez',
    dob: '1978-09-22',
    gender: 'Female',
    diagnoses: ['PTSD', 'Insomnia'],
    profile: {
      pronouns: 'she/her',
      email: 'emartinez@example.com',
      phone: '(555) 345-6789',
      address: '789 Maple Dr, Austin, TX 78701',
      emergencyContactName: 'Carlos Martinez',
      emergencyContactPhone: '(555) 765-4321',
      insuranceName: 'UnitedHealthcare',
      insurancePolicyNumber: 'UHC87654321',
      insuranceGroupNumber: 'UG54321',
      chiefComplaint: 'Nightmares and anxiety',
      primaryDiagnosis: 'PTSD',
      otherDiagnoses: ['Insomnia'],
      medications: ['Prazosin 2mg at bedtime', 'Escitalopram (Lexapro) 10mg daily'],
      allergies: ['Sulfa drugs'],
      riskFactors: [],
      socialHistory: 'Veteran, married, works as nurse'
    }
  },
  {
    firstName: 'James',
    lastName: 'Wilson',
    dob: '1965-03-17',
    gender: 'Male',
    diagnoses: ['Bipolar Disorder', 'Hypertension'],
    profile: {
      pronouns: 'he/him',
      email: 'jwilson@example.com',
      phone: '(555) 456-7890',
      address: '101 Elm Ct, Chicago, IL 60601',
      emergencyContactName: 'Linda Wilson',
      emergencyContactPhone: '(555) 654-3210',
      insuranceName: 'Medicare',
      insurancePolicyNumber: 'MED76543210',
      insuranceGroupNumber: '',
      chiefComplaint: 'Mood swings and irritability',
      primaryDiagnosis: 'Bipolar Disorder Type II',
      otherDiagnoses: ['Hypertension'],
      medications: ['Lithium 600mg daily', 'Lisinopril 10mg daily'],
      allergies: ['Latex'],
      riskFactors: [],
      socialHistory: 'Retired teacher, married, three adult children'
    }
  },
  {
    firstName: 'Olivia',
    lastName: 'Taylor',
    dob: '1998-11-29',
    gender: 'Female',
    diagnoses: ['Anorexia Nervosa', 'Depression'],
    profile: {
      pronouns: 'she/her',
      email: 'otaylor@example.com',
      phone: '(555) 567-8901',
      address: '222 Cedar Ln, Boston, MA 02108',
      emergencyContactName: 'Robert Taylor',
      emergencyContactPhone: '(555) 543-2109',
      insuranceName: 'Blue Cross Blue Shield',
      insurancePolicyNumber: 'BCBS98765432',
      insuranceGroupNumber: 'BG12345',
      chiefComplaint: 'Body image concerns, low mood',
      primaryDiagnosis: 'Anorexia Nervosa',
      otherDiagnoses: ['Major Depressive Disorder'],
      medications: ['Fluoxetine (Prozac) 40mg daily'],
      allergies: [],
      riskFactors: ['Low BMI 17.2', 'Passive SI'],
      socialHistory: 'College student, lives with roommates'
    }
  },
  {
    firstName: 'David',
    lastName: 'Washington',
    dob: '1982-07-09',
    gender: 'Male',
    diagnoses: ['Generalized Anxiety Disorder', 'Panic Disorder'],
    profile: {
      pronouns: 'he/him',
      email: 'dwashington@example.com',
      phone: '(555) 678-9012',
      address: '333 Birch St, Atlanta, GA 30301',
      emergencyContactName: 'Tasha Washington',
      emergencyContactPhone: '(555) 432-1098',
      insuranceName: 'Aetna',
      insurancePolicyNumber: 'AET10987654',
      insuranceGroupNumber: 'AG67890',
      chiefComplaint: 'Frequent panic attacks',
      primaryDiagnosis: 'Panic Disorder',
      otherDiagnoses: ['Generalized Anxiety Disorder'],
      medications: ['Alprazolam (Xanax) 0.5mg as needed', 'Escitalopram (Lexapro) 20mg daily'],
      allergies: ['Shellfish'],
      riskFactors: [],
      socialHistory: 'Marketing executive, married, one child'
    }
  },
  {
    firstName: 'Sophia',
    lastName: 'Kim',
    dob: '1973-05-11',
    gender: 'Female',
    diagnoses: ['Fibromyalgia', 'Depression'],
    profile: {
      pronouns: 'she/her',
      email: 'skim@example.com',
      phone: '(555) 789-0123',
      address: '444 Spruce Ave, Denver, CO 80201',
      emergencyContactName: 'Jung Kim',
      emergencyContactPhone: '(555) 321-0987',
      insuranceName: 'UnitedHealthcare',
      insurancePolicyNumber: 'UHC21098765',
      insuranceGroupNumber: 'U78901',
      chiefComplaint: 'Chronic pain and fatigue',
      primaryDiagnosis: 'Fibromyalgia',
      otherDiagnoses: ['Major Depressive Disorder'],
      medications: ['Duloxetine (Cymbalta) 60mg daily', 'Cyclobenzaprine 10mg at bedtime'],
      allergies: ['NSAIDs'],
      riskFactors: [],
      socialHistory: 'Accountant, divorced, two children'
    }
  },
  {
    firstName: 'Ethan',
    lastName: 'Brown',
    dob: '1995-02-25',
    gender: 'Male',
    diagnoses: ['Social Anxiety Disorder', 'OCD'],
    profile: {
      pronouns: 'he/him',
      email: 'ebrown@example.com',
      phone: '(555) 890-1234',
      address: '555 Walnut Blvd, San Francisco, CA 94101',
      emergencyContactName: 'Janet Brown',
      emergencyContactPhone: '(555) 210-9876',
      insuranceName: 'Kaiser Permanente',
      insurancePolicyNumber: 'KP32109876',
      insuranceGroupNumber: 'K89012',
      chiefComplaint: 'Difficulty in social situations, intrusive thoughts',
      primaryDiagnosis: 'Social Anxiety Disorder',
      otherDiagnoses: ['Obsessive-Compulsive Disorder'],
      medications: ['Sertraline (Zoloft) 100mg daily'],
      allergies: [],
      riskFactors: ['Social isolation'],
      socialHistory: 'Graphic designer, single, works remotely'
    }
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    dob: '1987-08-19',
    gender: 'Female',
    diagnoses: ['Postpartum Depression'],
    profile: {
      pronouns: 'she/her',
      email: 'mgarcia@example.com',
      phone: '(555) 901-2345',
      address: '666 Aspen Ct, Miami, FL 33101',
      emergencyContactName: 'Luis Garcia',
      emergencyContactPhone: '(555) 109-8765',
      insuranceName: 'Cigna',
      insurancePolicyNumber: 'CIG43210987',
      insuranceGroupNumber: 'C90123',
      chiefComplaint: 'Low mood and anxiety since childbirth',
      primaryDiagnosis: 'Postpartum Depression',
      otherDiagnoses: [],
      medications: ['Sertraline (Zoloft) 75mg daily'],
      allergies: [],
      riskFactors: [],
      socialHistory: 'Teacher on maternity leave, married, newborn'
    }
  },
  {
    firstName: 'Alex',
    lastName: 'Patel',
    dob: '1992-10-07',
    gender: 'Non-binary',
    diagnoses: ['Gender Dysphoria', 'Anxiety'],
    profile: {
      pronouns: 'they/them',
      email: 'apatel@example.com',
      phone: '(555) 012-3456',
      address: '777 Redwood St, Philadelphia, PA 19101',
      emergencyContactName: 'Sam Rivera',
      emergencyContactPhone: '(555) 098-7654',
      insuranceName: 'Aetna',
      insurancePolicyNumber: 'AET54321098',
      insuranceGroupNumber: 'A01234',
      chiefComplaint: 'Identity concerns and anxiety',
      primaryDiagnosis: 'Gender Dysphoria',
      otherDiagnoses: ['Generalized Anxiety Disorder'],
      medications: ['Bupropion (Wellbutrin) 150mg daily'],
      allergies: [],
      riskFactors: ['Discrimination experiences'],
      socialHistory: 'IT professional, single, active in LGBTQ+ community'
    }
  }
];

// Sample progress notes data
const generateMockNotes = (patientId: string, providerId: string) => {
  const noteTemplates = [
    {
      content: "Initial assessment: Client presents with symptoms of {primaryDiagnosis}. They report {chiefComplaint}. Affect is {affect}. Mood is {mood}. No current SI/HI. Plan: Begin weekly therapy, consider medication referral.",
      daysAgo: 30
    },
    {
      content: "Follow-up: Client reports {improvement} since last session. Still experiencing some {symptom}. Discussed coping strategies including {strategy1} and {strategy2}. Continue with current treatment plan.",
      daysAgo: 23
    },
    {
      content: "Session focused on {topic}. Client identified {trigger} as a significant stressor. Practiced {technique} in session with good engagement. Homework: Practice {technique} daily and track mood.",
      daysAgo: 16
    },
    {
      content: "Client reports medication {medEffect}. Sleep has {sleep}. Discussed progress on goals. Client showing {progress} in {area}. Plan: Continue weekly sessions, medication seems to be {medStatus}.",
      daysAgo: 9
    },
    {
      content: "Today we reviewed progress since beginning treatment. Client reports {overallChange} in symptoms. Notable improvements in {improvement1} and {improvement2}. Continuing challenges with {challenge}. Adjusted goals to focus on {newFocus}.",
      daysAgo: 2
    }
  ];

  const affects = ['constricted', 'flat', 'blunted', 'full range', 'appropriate'];
  const moods = ['depressed', 'anxious', 'irritable', 'euthymic', 'dysphoric', 'improved', 'stable'];
  const improvements = ['slight improvement', 'significant improvement', 'no change', 'mixed improvement', 'good progress'];
  const symptoms = ['low mood', 'anxiety', 'sleep disturbance', 'rumination', 'avoidance behaviors', 'irritability'];
  const strategies = ['mindfulness', 'cognitive restructuring', 'behavioral activation', 'exposure', 'deep breathing', 'progressive muscle relaxation', 'thought records', 'activity scheduling'];
  const topics = ['family relationships', 'work stress', 'self-esteem', 'trauma processing', 'medication management', 'boundary setting', 'communication skills'];
  const triggers = ['work deadlines', 'family conflict', 'financial stress', 'social situations', 'health concerns', 'past trauma reminders'];
  const techniques = ['CBT exercises', 'mindfulness meditation', 'grounding techniques', 'role-playing', 'empty chair technique', 'thought challenging'];
  const medEffects = ['tolerating well', 'reporting some side effects', 'seeing benefits from', 'having mixed response to'];
  const sleepStates = ['improved', 'remains disrupted', 'stabilized', 'shows variable pattern'];
  const progress = ['good progress', 'steady progress', 'incremental gains', 'breakthrough progress', 'mixed progress'];
  const areas = ['interpersonal relationships', 'work functioning', 'self-care', 'emotional regulation', 'thought patterns'];
  const medStatuses = ['effective', 'needs adjustment', 'being tolerated well', 'helping with targeted symptoms'];
  const overallChanges = ['significant reduction', 'moderate improvement', 'variable but trending positive', 'steady improvement'];
  const challenges = ['social anxiety', 'perfectionism', 'avoidance behaviors', 'negative thought patterns', 'interpersonal conflicts'];
  const newFocuses = ['emotional regulation', 'interpersonal effectiveness', 'distress tolerance', 'cognitive flexibility', 'trauma processing'];

  const getRandomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];

  return noteTemplates.map(template => {
    // Get some data about the patient
    let primaryDiagnosis = "depression";
    let chiefComplaint = "low mood";
    
    // Create a date object
    const date = new Date();
    date.setDate(date.getDate() - template.daysAgo);
    
    // Replace placeholders with random content
    let content = template.content
      .replace('{primaryDiagnosis}', primaryDiagnosis)
      .replace('{chiefComplaint}', chiefComplaint)
      .replace('{affect}', getRandomItem(affects))
      .replace('{mood}', getRandomItem(moods))
      .replace('{improvement}', getRandomItem(improvements))
      .replace('{symptom}', getRandomItem(symptoms))
      .replace('{strategy1}', getRandomItem(strategies))
      .replace('{strategy2}', getRandomItem(strategies))
      .replace('{topic}', getRandomItem(topics))
      .replace('{trigger}', getRandomItem(triggers))
      .replace('{technique}', getRandomItem(techniques))
      .replace('{medEffect}', getRandomItem(medEffects))
      .replace('{sleep}', getRandomItem(sleepStates))
      .replace('{progress}', getRandomItem(progress))
      .replace('{area}', getRandomItem(areas))
      .replace('{medStatus}', getRandomItem(medStatuses))
      .replace('{overallChange}', getRandomItem(overallChanges))
      .replace('{improvement1}', getRandomItem(areas))
      .replace('{improvement2}', getRandomItem(areas))
      .replace('{challenge}', getRandomItem(challenges))
      .replace('{newFocus}', getRandomItem(newFocuses));

    return {
      patientId,
      authorId: providerId,
      content,
      draft: false,
      createdAt: date
    };
  });
};

async function main() {
  console.log('⏳ Connecting to database...');
  
  // biome-ignore lint: Forbidden non-null assertion.
  const client = postgres(process.env.POSTGRES_URL!);
  const db = drizzle(client);
  
  try {
    console.log('🌱 Seeding database with mock patient data...');
    
    // We need a provider ID to associate with the patients
    // For demo purposes, we'll use a fixed UUID, which would be replaced by the actual provider ID in prod
    const providerId = '00000000-0000-0000-0000-000000000000'; // Demo provider ID
    
    for (const mockPatient of MOCK_PATIENTS) {
      console.log(`Creating patient: ${mockPatient.firstName} ${mockPatient.lastName}`);
      
      // Insert the patient
      const [newPatient] = await db
        .insert(patient)
        .values({
          providerId,
          firstName: mockPatient.firstName,
          lastName: mockPatient.lastName,
          dob: mockPatient.dob, // Keep as string in YYYY-MM-DD format which is expected by date field
          gender: mockPatient.gender,
          diagnoses: mockPatient.diagnoses,
          profile: mockPatient.profile,
          createdAt: new Date(),
        })
        .returning();
      
      // Generate and insert mock progress notes
      const mockNotes = generateMockNotes(newPatient.id, providerId);
      for (const note of mockNotes) {
        await db
          .insert(progressNote)
          .values({
            patientId: note.patientId,
            authorId: note.authorId,
            content: note.content,
            draft: note.draft,
            createdAt: note.createdAt,
          });
      }
      
      console.log(`  ✅ Created ${mockNotes.length} progress notes`);
    }
    
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.end();
  }
}

main();
