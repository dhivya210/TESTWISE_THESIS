#!/usr/bin/env python3
"""
Simple script to clear all data from SQLite database
Uses Python's built-in sqlite3 module (no external dependencies)
"""
import sqlite3
import os
import sys

# Get database path
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'data', 'testwise.db')

if not os.path.exists(db_path):
    print(f"[ERROR] Database not found at: {db_path}")
    sys.exit(1)

print("\nClearing all data from database...")
print(f"   Database: {db_path}\n")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Clear all user data tables
    tables_to_clear = [
        'evaluations',
        'user_answers', 
        'user_results',
        'users'
    ]
    
    for table in tables_to_clear:
        try:
            cursor.execute(f'DELETE FROM {table}')
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name = '{table}'")
            count = cursor.rowcount
            print(f"[OK] Cleared {table} table ({count} rows)")
        except sqlite3.OperationalError as e:
            if 'no such table' in str(e).lower():
                print(f"[WARN] Table {table} does not exist (skipping)")
            else:
                raise
    
    conn.commit()
    
    # Get final counts
    print("\nFinal counts:")
    for table in tables_to_clear:
        try:
            cursor.execute(f'SELECT COUNT(*) FROM {table}')
            count = cursor.fetchone()[0]
            print(f"   {table}: {count}")
        except:
            pass
    
    conn.close()
    
    print("\n[SUCCESS] Database cleared successfully!")
    print("   Note: Questions, Options, and Tool Weights are preserved (reference data)\n")
    
except Exception as e:
    print(f"\n[ERROR] Error clearing database: {e}")
    sys.exit(1)

