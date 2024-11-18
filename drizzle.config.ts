import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: "./app/configs/schema.ts",
  out: "./drizzle",

  dbCredentials: {
    url: "postgresql://azcsmohdali1:f1NauxJ0RikY@ep-morning-snowflake-15132543-pooler.ap-southeast-1.aws.neon.tech/rnd?sslmode=require"
  },

});


