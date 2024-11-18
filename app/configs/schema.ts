import { sql } from 'drizzle-orm';
import { pgTable, serial, varchar, primaryKey, integer, json,timestamp} from "drizzle-orm/pg-core";
import { date } from 'drizzle-orm/pg-core'; // Ensure this import is included

export const employee = pgTable("employee", {
    id: serial("id").primaryKey(),
    empNo: varchar("emp_no").notNull(),
    empName: varchar("emp_name").notNull(),
    siteDesignation: varchar("site_designation").notNull(),
    designation: varchar("designation").notNull(),
    head: varchar("head").notNull(),
    department: varchar("department").notNull(),
    hod: varchar("hod").notNull(),
    doj: date("doj").notNull(),
    visa: varchar("visa").notNull(),
    iqamaNo: varchar("iqama_no").notNull(),
    status: varchar("status").notNull(),
    category: varchar("category").notNull(),
    payrole: varchar("payrole").notNull(),
    sponser: varchar("sponser").notNull(),
    project: varchar("project").notNull(),
    accommodationStatus: varchar("accommodation_status").notNull(),
  });