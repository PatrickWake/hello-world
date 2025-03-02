import type { D1Database } from '@cloudflare/workers-types';

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export class SessionStore {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async createSession(userId: string, token: string): Promise<Session> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    await this.db.prepare(
      `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, userId, token, expiresAt.toISOString(), now.toISOString())
    .run();

    return {
      id,
      userId,
      token,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString()
    };
  }

  async getSession(id: string): Promise<Session | null> {
    const result = await this.db.prepare(
      `SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`
    )
    .bind(id)
    .first<Session>();

    return result || null;
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.prepare(
      `DELETE FROM sessions WHERE id = ?`
    )
    .bind(id)
    .run();
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.db.prepare(
      `DELETE FROM sessions WHERE expires_at <= datetime('now')`
    )
    .run();
  }

  async updateSessionToken(id: string, newToken: string): Promise<void> {
    await this.db.prepare(
      `UPDATE sessions 
       SET token = ?, 
           expires_at = datetime('now', '+24 hours')
       WHERE id = ?`
    )
    .bind(newToken, id)
    .run();
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const results = await this.db.prepare(
      `SELECT * FROM sessions 
       WHERE user_id = ? 
       AND expires_at > datetime('now')
       ORDER BY created_at DESC`
    )
    .bind(userId)
    .all<Session>();

    return results.results || [];
  }
}

export const sessionStore = new SessionStore(DB); 