import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface StoredUser {
  id: string; // we use email as id for now
  email: string;
  password?: string;
  isEnrolled: boolean;
}

const DB_PATH = path.join(process.cwd(), '.data', 'users.json');

async function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([]), 'utf8');
  }
}

async function readAll(): Promise<StoredUser[]> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as StoredUser[];
    return [];
  } catch {
    return [];
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await ensureDbFile();
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await readAll();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(params: {
  email: string;
  password?: string;
  isEnrolled?: boolean;
}): Promise<StoredUser> {
  const existing = await findUserByEmail(params.email);
  if (existing) {
    throw new Error('User with this email already exists');
  }
  const users = await readAll();
  const user: StoredUser = {
    id: params.email,
    email: params.email,
    password: params.password,
    isEnrolled: !!params.isEnrolled,
  };
  users.push(user);
  await writeAll(users);
  return user;
}

export async function markUserEnrolled(email: string): Promise<StoredUser | undefined> {
  const users = await readAll();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return undefined;
  users[idx].isEnrolled = true;
  await writeAll(users);
  return users[idx];
}

