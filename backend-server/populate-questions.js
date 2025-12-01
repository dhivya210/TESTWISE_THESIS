/**
 * Script to populate Questions, Options, and ToolWeights from frontend data
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'testwise.db');

// Import questions data (we'll need to read it as JSON)
const questionsData = [
  {
    id: 1,
    category: 'Budget',
    text: 'What is your budget allocation for test automation tools?',
    options: [
      { text: 'Free or open-source solutions preferred', value: 1, toolWeights: { selenium: 10, playwright: 10, testim: 5, mabl: 3 } },
      { text: 'Limited budget; prefer established free tools', value: 2, toolWeights: { selenium: 8, playwright: 10, testim: 5, mabl: 4 } },
      { text: 'Moderate budget; willing to invest for productivity gains', value: 3, toolWeights: { selenium: 5, playwright: 7, testim: 10, mabl: 8 } },
      { text: 'Enterprise budget; require premium features and dedicated support', value: 4, toolWeights: { selenium: 3, playwright: 5, testim: 7, mabl: 10 } },
    ],
  },
  {
    id: 2,
    category: 'Execution',
    text: 'How frequently do you plan to execute your test suites?',
    options: [
      { text: 'On demand or manual execution', value: 1, toolWeights: { selenium: 5, playwright: 5, testim: 10, mabl: 7 } },
      { text: 'Weekly test runs', value: 2, toolWeights: { selenium: 8, playwright: 7, testim: 7, mabl: 7 } },
      { text: 'Daily automated test execution', value: 3, toolWeights: { selenium: 7, playwright: 10, testim: 8, mabl: 10 } },
      { text: 'Continuous integration and continuous deployment (CI/CD)', value: 4, toolWeights: { selenium: 7, playwright: 10, testim: 10, mabl: 10 } },
    ],
  },
  {
    id: 3,
    category: 'Team',
    text: 'How many team members will be responsible for test maintenance?',
    options: [
      { text: '1 to 2 team members (small team)', value: 1, toolWeights: { selenium: 5, playwright: 7, testim: 10, mabl: 8 } },
      { text: '3 to 5 team members (medium team)', value: 2, toolWeights: { selenium: 7, playwright: 7, testim: 8, mabl: 10 } },
      { text: '6 to 10 team members (large team)', value: 3, toolWeights: { selenium: 8, playwright: 10, testim: 7, mabl: 8 } },
      { text: 'More than 10 team members (enterprise team)', value: 4, toolWeights: { selenium: 10, playwright: 8, testim: 5, mabl: 7 } },
    ],
  },
  // Add more questions as needed - this is a sample
];

console.log('\n📝 Populating Questions, Options, and ToolWeights...\n');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found. Please run migration first.');
  process.exit(1);
}

try {
  const db = new Database(dbPath);
  
  // Clear existing data (optional - comment out if you want to keep existing)
  console.log('Clearing existing questions data...');
  db.exec('DELETE FROM tool_weights');
  db.exec('DELETE FROM user_answers');
  db.exec('DELETE FROM options');
  db.exec('DELETE FROM questions');
  
  // Insert questions and options
  for (const question of questionsData) {
    // Insert question
    const questionResult = db.prepare(`
      INSERT INTO questions (id, category, text)
      VALUES (?, ?, ?)
    `).run(question.id, question.category, question.text);
    
    console.log(`✅ Inserted question ${question.id}: ${question.category}`);
    
    // Insert options for this question
    for (const option of question.options) {
      const optionResult = db.prepare(`
        INSERT INTO options (question_id, text, value)
        VALUES (?, ?, ?)
      `).run(question.id, option.text, option.value);
      
      const optionId = optionResult.lastInsertRowid;
      
      // Insert tool weights for this option
      const tools = ['selenium', 'playwright', 'testim', 'mabl'];
      for (const tool of tools) {
        const weight = option.toolWeights[tool];
        if (weight !== undefined) {
          db.prepare(`
            INSERT INTO tool_weights (option_id, tool_name, weight)
            VALUES (?, ?, ?)
          `).run(optionId, tool, weight);
        }
      }
    }
    
    console.log(`   ✅ Inserted ${question.options.length} options with tool weights`);
  }
  
  db.close();
  
  console.log('\n✅ Questions, Options, and ToolWeights populated successfully!\n');
  console.log(`   Total questions: ${questionsData.length}`);
  console.log(`   Total options: ${questionsData.reduce((sum, q) => sum + q.options.length, 0)}`);
  
} catch (error) {
  console.error('\n❌ Error populating data:', error.message);
  console.error(error);
  process.exit(1);
}



