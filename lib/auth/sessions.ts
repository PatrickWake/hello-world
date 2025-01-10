interface Session {
  id: string;
  userId: string;
  token: string;
  created_at: Date;
  expires_at: Date;
  last_active: Date;
}

export class SessionStore {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async createSession(userId: string, token: string): Promise<Session> {
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.db
      .prepare(`
        INSERT INTO sessions (id, user_id, token, expires_at)
        VALUES (?, ?, ?, ?)
      `)
      .bind(id, userId, token, expiresAt.toISOString())
      .run();

    const session = await this.getSession(id);
    if (!session) throw new Error('Failed to create session');
    
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const result = await this.db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .bind(sessionId)
      .first();

    if (!result) return null;

    const session = this.mapSession(result);
    if (!this.isSessionValid(session)) {
      await this.invalidateSession(sessionId);
      return null;
    }

    await this.updateLastActive(sessionId);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const result = await this.db
      .prepare('SELECT * FROM sessions WHERE token = ?')
      .bind(token)
      .first();

    if (!result) return null;

    const session = this.mapSession(result);
    if (!this.isSessionValid(session)) {
      await this.invalidateSession(session.id);
      return null;
    }

    await this.updateLastActive(session.id);
    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run();
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.db
      .prepare('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP')
      .run();
  }

  private async updateLastActive(sessionId: string): Promise<void> {
    await this.db
      .prepare(`
        UPDATE sessions 
        SET last_active = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(sessionId)
      .run();
  }

  private isSessionValid(session: Session): boolean {
    return new Date() < session.expires_at;
  }

  private mapSession(row: any): Session {
    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      created_at: new Date(row.created_at),
      expires_at: new Date(row.expires_at),
      last_active: new Date(row.last_active)
    };
  }
}

export const sessionStore = new SessionStore(DB); 