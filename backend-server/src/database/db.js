import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDatabaseSchema } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/testwise.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;
let dbRaw = null; // Keep reference to raw sql.js database
let SQL = null;
let saveInterval = null;

// Helper to create a better-sqlite3-like API wrapper
function createStatementWrapper(dbRaw, sql) {
  return {
    run(...params) {
      const stmt = dbRaw.prepare(sql);
      if (params.length > 0) {
        stmt.bind(params);
      }
      stmt.step();
      const changes = stmt.getRowsModified() || 0;
      
      // Get last insert rowid
      const rowidResult = dbRaw.exec('SELECT last_insert_rowid() as id');
      const lastInsertRowid = rowidResult.length > 0 && rowidResult[0].values.length > 0 
        ? rowidResult[0].values[0][0] 
        : 0;
      
      stmt.free();
      return {
        lastInsertRowid,
        changes
      };
    },
    get(...params) {
      const stmt = dbRaw.prepare(sql);
      if (params.length > 0) {
        stmt.bind(params);
      }
      const hasRow = stmt.step();
      let result = null;
      if (hasRow) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    },
    all(...params) {
      const stmt = dbRaw.prepare(sql);
      if (params.length > 0) {
        stmt.bind(params);
      }
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
  };
}

// Wrapper to make db.prepare work like better-sqlite3
function wrapDatabase(dbRaw) {
  return {
    prepare(sql) {
      return createStatementWrapper(dbRaw, sql);
    },
    exec(sql) {
      return dbRaw.exec(sql);
    },
    export() {
      return dbRaw.export();
    },
    close() {
      dbRaw.close();
    }
  };
}

export async function getDatabase() {
  if (!db) {
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file) => {
          // sql.js needs the wasm file, try to find it in node_modules
          const wasmPath = path.join(__dirname, '../../../node_modules/sql.js/dist/sql-wasm.wasm');
          if (fs.existsSync(wasmPath)) {
            return wasmPath;
          }
          // Fallback: let sql.js handle it
          return `https://sql.js.org/dist/${file}`;
        }
      });
    }
    
    // Load existing database or create new one
    let buffer;
    if (fs.existsSync(dbPath)) {
      try {
        buffer = fs.readFileSync(dbPath);
        dbRaw = new SQL.Database(buffer);
      } catch (error) {
        console.warn('⚠️  Could not load existing database, creating new one:', error.message);
        dbRaw = new SQL.Database();
      }
    } else {
      dbRaw = new SQL.Database();
    }
    
    dbRaw.run('PRAGMA journal_mode = WAL;');
    
    // Wrap database to provide better-sqlite3-like API
    db = wrapDatabase(dbRaw);
    
    // Initialize schema
    initDatabaseSchema(db);
    
    // Auto-save database every 5 seconds
    if (saveInterval) {
      clearInterval(saveInterval);
    }
    saveInterval = setInterval(() => {
      try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
      } catch (error) {
        console.error('Error saving database:', error);
      }
    }, 5000);
  }
  return db;
}

export async function initDatabase() {
  const database = await getDatabase();
  console.log('✅ Database initialized');
  return database;
}

export function closeDatabase() {
  if (db && dbRaw) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (error) {
      console.error('Error saving database on close:', error);
    }
    if (saveInterval) {
      clearInterval(saveInterval);
      saveInterval = null;
    }
    db.close();
    db = null;
    dbRaw = null;
  }
}
