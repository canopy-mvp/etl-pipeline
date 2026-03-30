import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.DATABASE_URL });

export async function fixSettlementTimezones(date: string): Promise<void> {
  console.log(`Fixing timezone handling for settlements on ${date}`);

  // Convert all timestamps to UTC for consistent settlement windows
  const result = await pool.query(`
    UPDATE settlements
    SET
      settlement_date = (settlement_date AT TIME ZONE 'UTC')::date,
      updated_at = NOW()
    WHERE settlement_date = $1
    AND settlement_date != (settlement_date AT TIME ZONE 'UTC')::date
    RETURNING id, merchant_id
  `, [date]);

  console.log(`Updated ${result.rowCount} settlement records`);

  // Recalculate affected settlements
  for (const row of result.rows) {
    console.log(`Recalculating settlement ${row.id} for merchant ${row.merchant_id}`);
  }
}
