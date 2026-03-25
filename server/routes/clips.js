const express = require('express');
const Clip = require('../models/Clip');
const { scrapeUrl } = require('../utils/scraper');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/clips?date=YYYY-MM-DD
router.get('/', auth, (req, res) => {
  const { date } = req.query;
  const clips = Clip.findAllByUser(req.user.userId, date || null);
  return res.json(clips);
});

// GET /api/clips/:id
router.get('/:id', auth, (req, res) => {
  const clip = Clip.findById(Number(req.params.id));
  if (!clip) return res.status(404).json({ error: '클립을 찾을 수 없습니다.' });
  if (clip.user_id !== req.user.userId) return res.status(403).json({ error: '접근 권한이 없습니다.' });
  return res.json(clip);
});

// POST /api/clips  — URL 스크래핑 후 저장
router.post('/', auth, async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ error: 'URL을 입력해 주세요.' });
  }
  if (url.length > 2000) {
    return res.status(400).json({ error: 'URL이 너무 깁니다.' });
  }
  try {
    new URL(url);
  } catch (_) {
    return res.status(400).json({ error: '올바른 URL 형식이 아닙니다.' });
  }

  try {
    const meta = await scrapeUrl(url.trim());
    const clip = Clip.create({
      userId: req.user.userId,
      url: url.trim(),
      ...meta,
    });
    return res.status(201).json(clip);
  } catch (err) {
    if (err.response) {
      return res.status(422).json({ error: `해당 페이지에 접근할 수 없습니다. (HTTP ${err.response.status})` });
    }
    console.error(err);
    return res.status(500).json({ error: '클립 저장 중 오류가 발생했습니다.' });
  }
});

// PATCH /api/clips/:id/memo
router.patch('/:id/memo', auth, (req, res) => {
  const clip = Clip.findById(Number(req.params.id));
  if (!clip) return res.status(404).json({ error: '클립을 찾을 수 없습니다.' });
  if (clip.user_id !== req.user.userId) return res.status(403).json({ error: '접근 권한이 없습니다.' });

  const memo = req.body.memo !== undefined ? req.body.memo : null;
  if (memo !== null && typeof memo !== 'string') {
    return res.status(400).json({ error: '메모는 문자열이어야 합니다.' });
  }
  if (memo && memo.length > 2000) {
    return res.status(400).json({ error: '메모는 2000자 이하로 입력해 주세요.' });
  }

  const updated = Clip.updateMemo(clip.id, memo);
  return res.json(updated);
});

// DELETE /api/clips/:id
router.delete('/:id', auth, (req, res) => {
  const clip = Clip.findById(Number(req.params.id));
  if (!clip) return res.status(404).json({ error: '클립을 찾을 수 없습니다.' });
  if (clip.user_id !== req.user.userId) return res.status(403).json({ error: '접근 권한이 없습니다.' });

  Clip.delete(clip.id);
  return res.json({ message: '클립이 삭제되었습니다.' });
});

module.exports = router;
