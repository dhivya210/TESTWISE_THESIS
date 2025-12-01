/**
 * Script to clear all data from database tables
 * Preserves the schema but removes all user and evaluation data
 */
import { getDatabase } from './src/database/db.js';

console.log('\n🗑️  Clearing all data from database...\n');

try {
  const db = getDatabase();
  
  // Clear all tables
  console.log('Clearing evaluations table...');
  db.prepare('DELETE FROM evaluations').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "evaluations"').run();
  
  console.log('Clearing user_answers table...');
  db.prepare('DELETE FROM user_answers').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "user_answers"').run();
  
  console.log('Clearing user_results table...');
  db.prepare('DELETE FROM user_results').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "user_results"').run();
  
  console.log('Clearing users table...');
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "users"').run();
  
  // Note: We keep questions, options, and tool_weights as they are reference data
  // If you want to clear those too, uncomment the following:
  /*
  console.log('Clearing tool_weights table...');
  db.prepare('DELETE FROM tool_weights').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "tool_weights"').run();
  
  console.log('Clearing options table...');
  db.prepare('DELETE FROM options').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "options"').run();
  
  console.log('Clearing questions table...');
  db.prepare('DELETE FROM questions').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name = "questions"').run();
  */
  
  // Get counts to verify
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const evalCount = db.prepare('SELECT COUNT(*) as count FROM evaluations').get().count;
  const answerCount = db.prepare('SELECT COUNT(*) as count FROM user_answers').get().count;
  const resultCount = db.prepare('SELECT COUNT(*) as count FROM user_results').get().count;
  
  console.log('\n✅ Database cleared successfully!');
  console.log(`   Users: ${userCount}`);
  console.log(`   Evaluations: ${evalCount}`);
  console.log(`   User Answers: ${answerCount}`);
  console.log(`   User Results: ${resultCount}`);
  console.log('\n📝 Note: Questions, Options, and Tool Weights are preserved (reference data)\n');
  
} catch (error) {
  console.error('\n❌ Error clearing database:', error.message);
  console.error(error);
  process.exit(1);
}



