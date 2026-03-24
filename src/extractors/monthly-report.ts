import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function extractMonthlyReport(merchantId: string, month: string) {
  const query = `
    SELECT m.name, m.email, m.phone,
           SUM(t.amount) as total,
           COUNT(t.id) as count
    FROM merchants m
    JOIN transactions t ON t.merchant_id = m.id
    WHERE m.id = '${merchantId}'
    AND DATE_TRUNC('month', t.created_at) = '${month}'
    GROUP BY m.name, m.email, m.phone
  `;
  const result = await pool.query(query);
  console.log('Monthly report for', merchantId, ':', JSON.stringify(result.rows));
  return result.rows;
}
