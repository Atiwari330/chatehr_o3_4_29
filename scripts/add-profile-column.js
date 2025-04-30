// Simple script to directly add profile column to the Patient table
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function addProfileColumn() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not defined in environment');
    process.exit(1);
  }

  console.log('⏳ Connecting to database...');
  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    console.log('⏳ Adding profile column to Patient table...');
    
    // Get current column info
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Patient'
    `;
    
    console.log('Current columns in Patient table:', columns.map(c => c.column_name));
    
    // Add the column if it doesn't exist
    await sql`ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "profile" jsonb`;
    
    console.log('✅ Profile column added successfully');
    
    // Verify the column was added
    const updatedColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Patient'
    `;
    
    console.log('Updated columns in Patient table:', updatedColumns.map(c => c.column_name));
    
  } catch (error) {
    console.error('❌ Error adding profile column:', error);
  } finally {
    await sql.end();
    console.log('Database connection closed');
  }
}

addProfileColumn();
