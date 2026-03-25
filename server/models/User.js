const { getDb } = require('./db');

const User = {
  findByEmail(email) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(id);
  },

  create(email, hashedPassword) {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const result = stmt.run(email, hashedPassword);
    return { id: result.lastInsertRowid, email };
  },
};

module.exports = User;
