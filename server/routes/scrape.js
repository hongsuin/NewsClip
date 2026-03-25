const express = require('express');
const { scrapeUrl } = require('../utils/scraper');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/scrape  (JWT 인증 필요)
router.post('/', authMiddleware, async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return res.status(400).json({ error: 'URL을 입력해 주세요.' });
  }
  if (url.length > 2000) {
    return res.status(400).json({ error: 'URL이 너무 깁니다.' });
  }

  try {
    new URL(url); // 유효한 URL 형식인지 검사
  } catch (_) {
    return res.status(400).json({ error: '올바른 URL 형식이 아닙니다.' });
  }

  try {
    const data = await scrapeUrl(url.trim());
    return res.json(data);
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return res.status(408).json({ error: '요청 시간이 초과되었습니다. URL을 확인해 주세요.' });
    }
    if (err.response) {
      return res.status(422).json({ error: `해당 페이지에 접근할 수 없습니다. (HTTP ${err.response.status})` });
    }
    console.error(err);
    return res.status(500).json({ error: '스크래핑 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
