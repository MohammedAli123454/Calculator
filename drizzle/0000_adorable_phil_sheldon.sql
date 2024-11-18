CREATE TABLE IF NOT EXISTS "employee" (
	"id" serial PRIMARY KEY NOT NULL,
	"emp_no" varchar NOT NULL,
	"emp_name" varchar NOT NULL,
	"site_designation" varchar NOT NULL,
	"designation" varchar NOT NULL,
	"head" varchar NOT NULL,
	"department" varchar NOT NULL,
	"hod" varchar NOT NULL,
	"doj" date NOT NULL,
	"visa" varchar NOT NULL,
	"iqama_no" varchar NOT NULL,
	"status" varchar NOT NULL,
	"category" varchar NOT NULL,
	"payrole" varchar NOT NULL,
	"sponser" varchar NOT NULL,
	"project" varchar NOT NULL,
	"accommodation_status" varchar NOT NULL
);
