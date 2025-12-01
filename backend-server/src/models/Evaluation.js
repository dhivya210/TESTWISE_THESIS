import { getDatabase } from '../database/db.js';

export class Evaluation {
  static async create(data) {
    const db = await getDatabase();
    const {
      userId,
      projectName,
      recommendedTool,
      scores,
      answers
    } = data;

    // Check for duplicate evaluation within the last 5 seconds (same user, tool, and scores)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const duplicate = db.prepare(`
      SELECT id FROM evaluations 
      WHERE userId = ? 
        AND recommendedTool = ?
        AND seleniumScore = ?
        AND playwrightScore = ?
        AND testimScore = ?
        AND mablScore = ?
        AND createdAt > ?
      LIMIT 1
    `).get(
      userId,
      recommendedTool,
      scores.selenium || 0,
      scores.playwright || 0,
      scores.testim || 0,
      scores.mabl || 0,
      fiveSecondsAgo
    );

    if (duplicate) {
      console.log('⚠️ Duplicate evaluation detected, returning existing one');
      return await this.findById(duplicate.id);
    }

    const result = db.prepare(`
      INSERT INTO evaluations (
        userId, projectName, recommendedTool,
        seleniumScore, playwrightScore, testimScore, mablScore,
        answers
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      projectName || null,
      recommendedTool,
      scores.selenium || 0,
      scores.playwright || 0,
      scores.testim || 0,
      scores.mabl || 0,
      JSON.stringify(answers)
    );

    return await this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    const db = await getDatabase();
    const evaluation = db.prepare('SELECT * FROM evaluations WHERE id = ?').get(id);
    if (!evaluation) return null;

    return {
      ...evaluation,
      answers: JSON.parse(evaluation.answers),
      scores: {
        selenium: evaluation.seleniumScore,
        playwright: evaluation.playwrightScore,
        testim: evaluation.testimScore,
        mabl: evaluation.mablScore,
      },
    };
  }

  static async findByUserId(userId, limit = 50) {
    const db = await getDatabase();
    const evaluations = db.prepare(`
      SELECT * FROM evaluations 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ?
    `).all(userId, limit);

    return evaluations.map(evaluation => ({
      ...evaluation,
      answers: JSON.parse(evaluation.answers),
      scores: {
        selenium: evaluation.seleniumScore,
        playwright: evaluation.playwrightScore,
        testim: evaluation.testimScore,
        mabl: evaluation.mablScore,
      },
    }));
  }

  static async countByUserId(userId) {
    const db = await getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM evaluations WHERE userId = ?').get(userId);
    return result.count;
  }

  static async delete(id, userId) {
    const db = await getDatabase();
    const result = db.prepare('DELETE FROM evaluations WHERE id = ? AND userId = ?').run(id, userId);
    return result.changes > 0;
  }
}

