CREATE TABLE IF NOT EXISTS "Patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"providerId" uuid,
	"firstName" varchar(64) NOT NULL,
	"lastName" varchar(64) NOT NULL,
	"dob" date NOT NULL,
	"gender" varchar(16),
	"diagnoses" varchar[],
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProgressNote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patientId" uuid,
	"authorId" uuid,
	"content" text NOT NULL,
	"draft" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Patient" ADD CONSTRAINT "Patient_providerId_User_id_fk" FOREIGN KEY ("providerId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProgressNote" ADD CONSTRAINT "ProgressNote_patientId_Patient_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."Patient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProgressNote" ADD CONSTRAINT "ProgressNote_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
