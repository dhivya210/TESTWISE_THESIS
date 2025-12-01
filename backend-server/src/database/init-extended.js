/**
 * Extended database schema initialization
 * Adds Questions, Options, UserAnswer, UserResult, and ToolWeights tables
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/testwise.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function tableExists(db, tableName) {
  try {
    const result = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `).get(tableName);
    return !!result;
  } catch {
    return false;
  }
}

export function initExtendedSchema() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  console.log('\n📊 Initializing extended database schema...\n');

  // 1. UserProfile table (enhanced users table)
  if (!tableExists(db, 'user_profiles')) {
    db.exec(`
      CREATE TABLE user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created user_profiles table');
  }

  // 2. Questions table
  if (!tableExists(db, 'questions')) {
    db.exec(`
      CREATE TABLE questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created questions table');
  }

  // 3. Options table
  if (!tableExists(db, 'options')) {
    db.exec(`
      CREATE TABLE options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        value INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created options table');
  }

  // 4. UserAnswer table
  if (!tableExists(db, 'user_answers')) {
    db.exec(`
      CREATE TABLE user_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        option_id INTEGER NOT NULL,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
        UNIQUE(user_id, question_id)
      )
    `);
    console.log('✅ Created user_answers table');
  }

  // 5. UserResult table
  if (!tableExists(db, 'user_results')) {
    db.exec(`
      CREATE TABLE user_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recommended_tool VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created user_results table');
  }

  // 6. ToolWeights table
  if (!tableExists(db, 'tool_weights')) {
    db.exec(`
      CREATE TABLE tool_weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        option_id INTEGER NOT NULL,
        tool_name VARCHAR(50) NOT NULL,
        weight INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
        UNIQUE(option_id, tool_name)
      )
    `);
    console.log('✅ Created tool_weights table');
  }

  // Create indexes
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_results_user_id ON user_results(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_tool_weights_option_id ON tool_weights(option_id)');
    console.log('✅ Created indexes');
  } catch (error) {
    console.warn('⚠️  Some indexes could not be created:', error.message);
  }

  db.close();
  console.log('\n✅ Extended database schema initialized successfully!\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initExtendedSchema();
}



