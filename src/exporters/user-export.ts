import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function exportUserData(userId: string) {
  const query = `
    SELECT u.*, t.*, p.*
    FROM users u
    LEFT JOIN transactions t ON t.user_id = u.id
    LEFT JOIN payment_methods p ON p.user_id = u.id
    WHERE u.id = '${userId}'
  `;
  const result = await pool.query(query);
  console.log('Exported', result.rows.length, 'records for user', userId);
  return result.rows;
}
