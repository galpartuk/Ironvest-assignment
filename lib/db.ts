import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export interface DbUser {
  id: string;
  created_at: string;
}

export interface DbAuditLog {
  id: number;
  user_id: string;
  action: string;
  created_at: string;
  verified_action: number;
  iv_score: number | null;
  indicators: string | null;
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

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        created_at TEXT NOT NULL,
        verified_action INTEGER NOT NULL,
        iv_score INTEGER NULL,
        indicators TEXT NULL
      );
    `);
  }

  return db;
}

export async function findUserById(id: string): Promise<DbUser | undefined> {
  const database = getDatabase();
  const row = database
    .prepare('SELECT id, created_at FROM users WHERE id = ?')
    .get(id) as DbUser | undefined;
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

export async function insertAuditLog(params: {
  userId: string;
  action: string;
  verifiedAction: boolean;
  ivScore?: number;
  indicators?: unknown;
}): Promise<void> {
  const database = getDatabase();
  const createdAt = new Date().toISOString();
  database
    .prepare(
      'INSERT INTO audit_logs (user_id, action, created_at, verified_action, iv_score, indicators) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      params.userId,
      params.action,
      createdAt,
      params.verifiedAction ? 1 : 0,
      typeof params.ivScore === 'number' ? params.ivScore : null,
      params.indicators ? JSON.stringify(params.indicators) : null
    );
}

export interface UserAuditEntry {
  id: number;
  createdAt: string;
  action: string;
  verifiedAction: boolean;
  ivScore: number | null;
  indicators: Record<string, boolean>;
}

export async function getRecentAuditLogsForUser(userId: string, limit = 20): Promise<UserAuditEntry[]> {
  const database = getDatabase();
  const rows = database
    .prepare(
      'SELECT id, user_id, action, created_at, verified_action, iv_score, indicators FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    )
    .all(userId, limit) as DbAuditLog[];

  return rows.map((row) => {
    let indicators: Record<string, boolean> = {};
    if (row.indicators) {
      try {
        const parsed = JSON.parse(row.indicators) as Record<string, unknown>;
        indicators = Object.fromEntries(
          Object.entries(parsed)
            .filter(([, value]) => typeof value === 'boolean')
            .map(([key, value]) => [key, value as boolean])
        );
      } catch {
        indicators = {};
      }
    }

    return {
      id: row.id,
      createdAt: row.created_at,
      action: row.action,
      verifiedAction: !!row.verified_action,
      ivScore: row.iv_score,
      indicators,
    };
  });
}


