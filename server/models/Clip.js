const db = require('./db');

const Clip = {
  findAllByUser(userId, date) {
    if (date) {
      return db
        .prepare("SELECT * FROM clips WHERE user_id = ? AND date(clipped_at) = ? ORDER BY clipped_at DESC")
        .all(userId, date);
    }
    return db
      .prepare('SELECT * FROM clips WHERE user_id = ? ORDER BY clipped_at DESC')
      .all(userId);
  },

  findById(id) {
    return db.prepare('SELECT * FROM clips WHERE id = ?').get(id);
  },

  create({ userId, url, title, summary, thumbnail, source }) {
    const stmt = db.prepare(`
      INSERT INTO clips (user_id, url, title, summary, thumbnail, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, url, title || null, summary || null, thumbnail || null, source || null);
    return db.prepare('SELECT * FROM clips WHERE id = ?').get(result.lastInsertRowid);
  },

  updateMemo(id, memo) {
    db.prepare('UPDATE clips SET memo = ? WHERE id = ?').run(memo || null, id);
    return db.prepare('SELECT * FROM clips WHERE id = ?').get(id);
  },

  delete(id) {
    return db.prepare('DELETE FROM clips WHERE id = ?').run(id);
  },
};

module.exports = Clip;
