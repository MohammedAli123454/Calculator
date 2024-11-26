CREATE TABLE IF NOT EXISTS "sales_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"category" varchar NOT NULL,
	"sales" integer NOT NULL
);
