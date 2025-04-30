ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "patientId" uuid REFERENCES "Patient"("id");
