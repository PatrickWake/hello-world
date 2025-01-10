import crypto from 'crypto';
import { ActivityType, ActivityLog } from './types';

class ActivityLogger {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async log(
    type: ActivityType,
    userId: string,
    req: {
      ip: string;
      headers: { [key: string]: string | undefined };
    },
    details: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<ActivityLog> {
    const id = crypto.randomUUID();
    
    await this.db.prepare(`
      INSERT INTO activity_logs (
        id, type, user_id, ip_address, user_agent, details, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      type,
      userId,
      req.ip,
      req.headers['user-agent'] || 'unknown',
      JSON.stringify(details),
      JSON.stringify({
        ...metadata,
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION
      })
    ).run();

    return this.getLogById(id);
  }

  async getLogById(id: string): Promise<ActivityLog | null> {
    const result = await this.db.prepare(`
      SELECT * FROM activity_logs WHERE id = ?
    `).bind(id).first();
    
    return result ? this.mapActivityLog(result) : null;
  }

  async getLogs(filters: {
    userId?: string;
    type?: ActivityType;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<ActivityLog[]> {
    let query = `SELECT * FROM activity_logs WHERE 1=1`;
    const bindings: any[] = [];

    if (filters.userId) {
      query += ` AND user_id = ?`;
      bindings.push(filters.userId);
    }

    if (filters.type) {
      query += ` AND type = ?`;
      bindings.push(filters.type);
    }

    if (filters.startDate) {
      query += ` AND timestamp >= ?`;
      bindings.push(filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query += ` AND timestamp <= ?`;
      bindings.push(filters.endDate.toISOString());
    }

    query += ` ORDER BY timestamp DESC`;

    const results = await this.db.prepare(query).bind(...bindings).all();
    return results.results.map(this.mapActivityLog);
  }

  private mapActivityLog(row: any): ActivityLog {
    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      type: row.type as ActivityType,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      details: JSON.parse(row.details),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    };
  }
}

// Initialize with your D1 database
declare global {
  const DB: D1Database;
}

export const activityLogger = new ActivityLogger(DB); 