// VIOLATION: PII in analytics SQL (selecting email, phone, SSN)
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function extractAnalyticsData() {
  const query = `
    SELECT
      u.id,
      u.email,
      u.phone,
      u.ssn,
      u.date_of_birth,
      COUNT(t.id) as transaction_count,
      SUM(t.amount) as total_volume
    FROM users u
    LEFT JOIN transactions t ON t.user_id = u.id
    GROUP BY u.id, u.email, u.phone, u.ssn, u.date_of_birth
    ORDER BY total_volume DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}
