const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './dailyclip.db';
const db = new Database(path.resolve(dbPath));

// WAL 모드: 읽기/쓰기 동시성 향상
db.pragma('journal_mode = WAL');

// 테이블 초기화
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS clips (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    url        TEXT NOT NULL,
    title      TEXT,
    summary    TEXT,
    thumbnail  TEXT,
    source     TEXT,
    memo       TEXT,
    clipped_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// 기존 DB 마이그레이션: memo 컬럼이 없으면 추가
const columns = db.pragma('table_info(clips)').map((c) => c.name);
if (!columns.includes('memo')) {
  db.exec('ALTER TABLE clips ADD COLUMN memo TEXT;');
}

module.exports = db;
