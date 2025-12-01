/**
 * Migration script to add extended schema tables
 * This adds Questions, Options, UserAnswer, UserResult, and ToolWeights tables
 * while preserving existing users and evaluations tables
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initExtendedSchema } from './src/database/init-extended.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'testwise.db');

console.log('\n🔄 Migrating Database to Extended Schema\n');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found. Creating new database...');
  initExtendedSchema();
  process.exit(0);
}

try {
  const db = new Database(dbPath);
  
  // Initialize extended schema (will only create tables that don't exist)
  initExtendedSchema();
  
  console.log('\n✅ Migration completed successfully!');
  console.log('   New tables added: questions, options, user_answers, user_results, tool_weights\n');
  
} catch (error) {
  console.error('\n❌ Migration error:', error.message);
  console.error(error);
  process.exit(1);
}



