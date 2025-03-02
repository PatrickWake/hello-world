import { D1Database } from '@cloudflare/workers-types';

// Get the database from environment or create a mock for development
const getDatabase = (): D1Database => {
  // In a real environment, this would come from Cloudflare Workers bindings
  // For local development, we'll create a mock or use a local instance
  if (process.env.NODE_ENV === 'development') {
    // Return a mock D1Database for development
    return {
      prepare: () => ({
        bind: () => ({
          all: async () => [],
          first: async () => null,
          run: async () => ({ success: true }),
        }),
      }),
      exec: async () => ({ results: [] }),
      batch: async () => [{ results: [] }],
      dump: async () => new Uint8Array(),
    } as unknown as D1Database;
  }
  
  // In production, this would be provided by Cloudflare
  // This is a placeholder that should be replaced with actual implementation
  return (global as any).DB as D1Database;
};

export class SessionStore {
  private db: D1Database;

  constructor(db?: D1Database) {
    this.db = db || getDatabase();
  }

  async createSession(userId: string, token: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours from now

    await this.db
      .prepare(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
      )
      .bind(sessionId, userId, token, expiresAt.toISOString())
      .run();

    return sessionId;
  }

  async getSession(sessionId: string) {
    const session = await this.db
      .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime()')
      .bind(sessionId)
      .first();

    return session;
  }

  async deleteSession(sessionId: string) {
    await this.db
      .prepare('DELETE FROM sessions WHERE id = ?')
      .bind(sessionId)
      .run();
  }

  async deleteUserSessions(userId: string) {
    await this.db
      .prepare('DELETE FROM sessions WHERE user_id = ?')
      .bind(userId)
      .run();
  }

  async cleanExpiredSessions() {
    await this.db
      .prepare('DELETE FROM sessions WHERE expires_at <= datetime()')
      .run();
  }
}

// Create a singleton instance with a lazy-loaded database
export const sessionStore = new SessionStore(); 