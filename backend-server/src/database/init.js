/**
 * Database schema initialization
 */
export function initDatabaseSchema(db) {
  console.log('\n📊 Initializing database schema...\n');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT,
      organizationName TEXT,
      themePreference TEXT DEFAULT 'light',
      createdAt DATETIME DEFAULT (datetime('now')),
      updatedAt DATETIME DEFAULT (datetime('now'))
    )
  `);
  console.log('✅ Users table ready');

  // Evaluations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      projectName TEXT,
      recommendedTool TEXT NOT NULL,
      seleniumScore INTEGER DEFAULT 0,
      playwrightScore INTEGER DEFAULT 0,
      testimScore INTEGER DEFAULT 0,
      mablScore INTEGER DEFAULT 0,
      answers TEXT NOT NULL,
      createdAt DATETIME DEFAULT (datetime('now')),
      updatedAt DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Evaluations table ready');

  // Create indexes
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(userId)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(createdAt)');
    console.log('✅ Indexes created');
  } catch (error) {
    console.warn('⚠️  Some indexes could not be created:', error.message);
  }

  console.log('\n✅ Database schema initialized successfully!\n');
}

