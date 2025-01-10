import { UserRole } from '../auth/roles';
import { hashPassword } from '../auth/utils';

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export class UserDB {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();
    
    return result ? this.mapUser(result) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first();
    
    return result ? this.mapUser(result) : null;
  }

  async createUser(email: string, password: string, name?: string): Promise<Omit<User, 'password'>> {
    const id = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    await this.db
      .prepare(`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(id, email, hashedPassword, name || null, UserRole.USER)
      .run();

    const user = await this.findUserById(id);
    if (!user) throw new Error('Failed to create user');
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<Omit<User, 'password'> | null> {
    await this.db
      .prepare(`
        UPDATE users 
        SET role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(role, userId)
      .run();

    const user = await this.findUserById(userId);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    const hashedPassword = await hashPassword(password);
    return hashedPassword === user.password;
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      role: row.role as UserRole,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }
}

export const db = new UserDB(DB); 