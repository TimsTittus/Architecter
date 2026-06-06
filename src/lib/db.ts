import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

let dbPath = 'sqlite.db';

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  const tmpPath = '/tmp/sqlite.db';

  if (!fs.existsSync(tmpPath)) {
    try {
      const rootDbPath = path.join(process.cwd(), 'sqlite.db');
      if (fs.existsSync(rootDbPath)) {
        fs.copyFileSync(rootDbPath, tmpPath);
      }
    } catch (error) {
      console.error('Failed to copy sqlite.db to /tmp:', error);
    }
  }
  dbPath = tmpPath;
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
