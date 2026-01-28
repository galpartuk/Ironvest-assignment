import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export interface DbUser {
  id: string;
  created_at: string;
}

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), '.data', 'app.db');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL
      );
    `);
  }

  return db;
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const database = getDatabase();
  const row = database
    .prepare<DbUser['id'], DbUser>('SELECT id, created_at FROM users WHERE id = ?')
    .get(id);
  return row ?? undefined;
}

export async function createUserRecord(id: string): Promise<DbUser> {
  const database = getDatabase();
  const createdAt = new Date().toISOString();
  database
    .prepare('INSERT INTO users (id, created_at) VALUES (?, ?)')
    .run(id, createdAt);

  return { id, created_at: createdAt };
}

