// VIOLATION: String-concatenated SQL (SQL injection risk)
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function extractMerchantData(merchantId: string, startDate: string, endDate: string) {
  // WARNING: SQL injection vulnerability
  const query = `
    SELECT m.id, m.name, m.email, m.phone, m.tax_id,
           t.amount, t.status, t.created_at
    FROM merchants m
    JOIN transactions t ON t.merchant_id = m.id
    WHERE m.id = '${merchantId}'
    AND t.created_at BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY t.created_at DESC
  `;

  const result = await pool.query(query);
  console.log(`Extracted ${result.rows.length} records for merchant ${merchantId}`);
  return result.rows;
}
