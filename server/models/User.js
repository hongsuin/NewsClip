const db = require('./db');

const User = {
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    return db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(id);
  },

  create(email, hashedPassword) {
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    const result = stmt.run(email, hashedPassword);
    return { id: result.lastInsertRowid, email };
  },
};

module.exports = User;
