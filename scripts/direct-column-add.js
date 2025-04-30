// Simple script to directly add patientId column to the Chat table
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function addPatientIdColumn() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined in environment');
    process.exit(1);
  }

  console.log('⏳ Connecting to database...');
  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    console.log('⏳ Adding patientId column to Chat table...');
    
    // Get current column info
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Chat'
    `;
    
    console.log('Current columns in Chat table:', columns.map(c => c.column_name));
    
    // Add the column if it doesn't exist
    await sql`ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "patientId" uuid`;
    
    console.log('✅ PatientId column added successfully');
    
    // Verify the column was added
    const updatedColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Chat'
    `;
    
    console.log('Updated columns in Chat table:', updatedColumns.map(c => c.column_name));
    
  } catch (error) {
    console.error('❌ Error adding patientId column:', error);
  } finally {
    await sql.end();
    console.log('Database connection closed');
  }
}

addPatientIdColumn();
