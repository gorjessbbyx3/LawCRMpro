import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const migrationsDir = join(__dirname, 'migrations');
  const migrationFiles = [
    '001_calendar_event_indexes.sql'
  ];

  console.log('Running database migrations...');

  for (const file of migrationFiles) {
    const migrationPath = join(migrationsDir, file);
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log(`Running migration: ${file}`);
    await db.execute(sql.raw(migrationSQL));
    console.log(`✓ ${file} completed`);
  }

  console.log('All migrations completed successfully');
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
