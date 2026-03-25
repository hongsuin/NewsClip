const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeUrl(url) {
  const response = await axios.get(url, {
    timeout: 8000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
    },
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data);

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text().trim() ||
    null;

  const thumbnail =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    null;

  const summary =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    null;

  let source = null;
  try {
    source = new URL(url).hostname.replace(/^www\./, '');
  } catch (_) {}

  return {
    title: title ? title.trim() : null,
    thumbnail,
    summary: summary ? summary.trim() : null,
    source,
  };
}

module.exports = { scrapeUrl };
