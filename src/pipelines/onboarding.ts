import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.DATABASE_URL });

export async function runMerchantOnboardingETL(): Promise<void> {
  console.log('Running merchant onboarding ETL');

  const result = await pool.query(`
    SELECT
      m.id as merchant_id,
      m.name,
      m.email,
      m.phone,
      m.address,
      m.tax_id,
      m.created_at,
      COUNT(t.id) as transaction_count,
      SUM(t.amount) as total_volume
    FROM merchants m
    LEFT JOIN transactions t ON t.merchant_id = m.id
    WHERE m.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY m.id, m.name, m.email, m.phone, m.address, m.tax_id, m.created_at
  `);

  console.log(`Processing ${result.rows.length} newly onboarded merchants`);

  for (const row of result.rows) {
    console.log(`Merchant ${row.name} (email: ${row.email}): ${row.transaction_count} transactions, volume: ${row.total_volume}`);

    await pool.query(
      'INSERT INTO analytics.merchant_onboarding (merchant_id, name, email, transaction_count, total_volume, onboarded_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (merchant_id) DO UPDATE SET transaction_count = $4, total_volume = $5',
      [row.merchant_id, row.name, row.email, row.transaction_count, row.total_volume, row.created_at],
    );
  }

  console.log('Onboarding ETL complete');
}
