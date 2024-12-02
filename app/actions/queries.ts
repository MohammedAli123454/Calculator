import { sql } from "drizzle-orm";
import { db } from "../configs/db"; // Adjust the path as needed
import { salesData } from "../configs/schema"; // Adjust the path as needed

// Fetch and group sales data by month and category from the database
export async function fetchGroupedSalesData() {
  try {
    const result = await db.execute(sql`
      SELECT
        TO_CHAR(date, 'Mon') AS month,
        category,
        SUM(sales) AS total_sales
      FROM ${salesData}
      GROUP BY month, category
      ORDER BY month, category
    `);

    return (result.rows as { month: string; category: string; total_sales: number }[]).map(
      (row) => ({
        month: row.month,
        category: row.category,
        total_sales: Number(row.total_sales),
      })
    );
  } catch (error) {
    console.error("Error fetching grouped sales data:", error);
    return [];
  }
}

// Fetch and group sales data by category from the database
export async function fetchCategoryChartData() {
  try {
    const result = await db.execute(sql`
      SELECT
        category,
        SUM(sales) AS total_sales
      FROM ${salesData}
      GROUP BY category
      ORDER BY category
    `);

    return (result.rows as { category: string; total_sales: number }[]).map(
      (row) => ({
        category: row.category,
        total_sales: Number(row.total_sales),
      })
    );
  } catch (error) {
    console.error("Error fetching category chart data:", error);
    return [];
  }
}

// Fetch unique months from the database
export async function fetchUniqueMonths() {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT   TO_CHAR(date, 'Mon') AS month
      FROM ${salesData}
      ORDER BY month
    `);

    return (result.rows as { month: string }[]).map((row) => row.month);
  } catch (error) {
    console.error("Error fetching unique months:", error);
    return [];
  }
}

// Fetch unique categories from the database
export async function fetchUniqueCategories() {
  try {
    const result = await db.execute(sql`
      SELECT DISTINCT category
      FROM ${salesData}
      ORDER BY category
    `);

    return (result.rows as { category: string }[]).map((row) => row.category);
  } catch (error) {
    console.error("Error fetching unique categories:", error);
    return [];
  }
}