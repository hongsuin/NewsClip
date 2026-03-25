const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './dailyclip.db');

let db = null;
let SQL = null;

// sql.js를 better-sqlite3 API와 호환되도록 래핑하는 클래스
class DatabaseWrapper {
  constructor(database) {
    this._db = database;
  }

  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        try {
          const stmt = self._db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        } catch (e) {
          console.error('SQL get error:', e.message, sql);
          return undefined;
        }
      },
      all(...params) {
        try {
          const results = [];
          const stmt = self._db.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (e) {
          console.error('SQL all error:', e.message, sql);
          return [];
        }
      },
      run(...params) {
        try {
          self._db.run(sql, params);
          self._save();
          return {
            lastInsertRowid: self._db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0,
            changes: self._db.getRowsModified()
          };
        } catch (e) {
          console.error('SQL run error:', e.message, sql);
          return { lastInsertRowid: 0, changes: 0 };
        }
      }
    };
  }

  exec(sql) {
    try {
      this._db.run(sql);
      this._save();
    } catch (e) {
      console.error('SQL exec error:', e.message);
    }
  }

  pragma(sql) {
    try {
      const result = this._db.exec(`PRAGMA ${sql}`);
      if (result.length > 0) {
        const columns = result[0].columns;
        return result[0].values.map(row => {
          const obj = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
      }
      return [];
    } catch (e) {
      console.error('SQL pragma error:', e.message);
      return [];
    }
  }

  _save() {
    try {
      const data = this._db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (e) {
      console.error('DB save error:', e.message);
    }
  }
}

// 동기적으로 초기화 (better-sqlite3처럼 동작하도록)
function initializeSync() {
  // sql.js 초기화는 비동기이므로, 먼저 프로미스를 생성
  const sqlPromise = initSqlJs();
  
  // Node.js에서는 deasync 없이 동기화가 어려우므로 
  // 프록시 패턴을 사용하여 첫 접근 시 에러 방지
  return new Proxy({}, {
    get(target, prop) {
      if (!db) {
        throw new Error('Database not initialized yet. Please wait for initialization.');
      }
      return db[prop];
    }
  });
}

// 비동기 초기화 함수
async function initDatabase() {
  if (db) return db;
  
  SQL = await initSqlJs();
  
  let database;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    database = new SQL.Database(buffer);
  } else {
    database = new SQL.Database();
  }
  
  db = new DatabaseWrapper(database);
  
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
  
  console.log('Database initialized successfully');
  return db;
}

// 초기화 프로미스
const dbReady = initDatabase();

// 모듈 내보내기 - db 객체에 직접 접근하거나 ready 프로미스 사용
module.exports = {
  get db() {
    return db;
  },
  ready: dbReady,
  getDb: () => db
};
