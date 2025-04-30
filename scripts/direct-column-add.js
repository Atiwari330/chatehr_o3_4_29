// Simplified script to add the profile column to the database
// This script uses the existing database setup from the project

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function addProfileColumn() {
  try {
    // Read the database URL from .env.local file
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const postgresUrlMatch = envContent.match(/POSTGRES_URL=(.+)/);
    
    if (!postgresUrlMatch) {
      console.error('❌ Could not find POSTGRES_URL in .env.local file');
      process.exit(1);
    }
    
    const postgresUrl = postgresUrlMatch[1].trim();
    console.log('⏳ Connecting to database...');
    
    // Create a new database connection
    const client = postgres(postgresUrl, { max: 1 });
    
    try {
      console.log('⏳ Executing SQL to add profile column...');
      
      // Execute the SQL directly
      await client`ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "profile" jsonb`;
      
      console.log('✅ Profile column added successfully');
      
      // Verify the column was added
      const result = await client`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Patient' AND column_name = 'profile'
      `;
      
      if (result.length > 0) {
        console.log('✅ Verified profile column exists');
      } else {
        console.error('❗ Could not verify profile column was added');
      }
      
    } finally {
      // Close the database connection
      await client.end();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error adding profile column:', error);
  }
}

addProfileColumn();
