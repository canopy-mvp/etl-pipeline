import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.DATABASE_URL });

export async function migrateAnalyticsSchema(): Promise<void> {
  console.log('Migrating analytics schema');

  // Add PII columns for merchant analytics
  await pool.query(`
    ALTER TABLE analytics.merchant_summary
    ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS owner_ssn VARCHAR(11)
  `);

  // Backfill from merchants table
  await pool.query(`
    UPDATE analytics.merchant_summary ms
    SET
      owner_email = m.owner_email,
      owner_phone = m.owner_phone,
      owner_ssn = m.owner_ssn
    FROM merchants m
    WHERE ms.merchant_id = m.id
  `);

  console.log('Analytics schema migration complete');
}
