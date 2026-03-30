import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.DATABASE_URL });

interface SettlementRow {
  merchant_id: string;
  total_charges: number;
  total_refunds: number;
  net_amount: number;
  settlement_date: string;
}

export async function runDailySettlementPipeline(date: string): Promise<void> {
  console.log(`Running daily settlement pipeline for ${date}`);

  // WARNING: this constructs SQL from a variable
  const query = `
    SELECT
      merchant_id,
      SUM(CASE WHEN type = 'charge' THEN amount ELSE 0 END) as total_charges,
      SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END) as total_refunds,
      SUM(CASE WHEN type = 'charge' THEN amount ELSE -amount END) as net_amount,
      '${date}' as settlement_date
    FROM transactions
    WHERE date_trunc('day', created_at) = '${date}'
    GROUP BY merchant_id
  `;

  const result = await pool.query(query);
  const rows = result.rows as SettlementRow[];

  console.log(`Found ${rows.length} merchant settlements for ${date}`);

  for (const row of rows) {
    await pool.query(
      'INSERT INTO settlements (merchant_id, total_charges, total_refunds, net_amount, settlement_date) VALUES ($1, $2, $3, $4, $5)',
      [row.merchant_id, row.total_charges, row.total_refunds, row.net_amount, row.settlement_date],
    );
  }

  console.log('Settlement pipeline complete');
}
