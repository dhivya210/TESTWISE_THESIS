import { getDatabase } from '../database/db.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create(email, password, username, organizationName) {
    const db = await getDatabase();
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
      const result = db.prepare(`
        INSERT INTO users (email, password, username, organizationName)
        VALUES (?, ?, ?, ?)
      `).run(email, hashedPassword, username || null, organizationName || null);
      
      return await this.findById(result.lastInsertRowid);
    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findById(id) {
    const db = await getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return null;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async findByEmail(email) {
    const db = await getDatabase();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static async updateTheme(userId, themePreference) {
    const db = await getDatabase();
    db.prepare(`
      UPDATE users 
      SET themePreference = ?, updatedAt = datetime('now')
      WHERE id = ?
    `).run(themePreference, userId);
    
    return await this.findById(userId);
  }

  static async updatePassword(email, newPassword) {
    const db = await getDatabase();
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare(`
      UPDATE users 
      SET password = ?, updatedAt = datetime('now')
      WHERE email = ?
    `).run(hashedPassword, email);
    
    return await this.findByEmail(email);
  }

  static verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }
}

