const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape/shopee', async (req, res) => {
  const query = req.query.q || 'sunscreen spf50';
  let browser;
  
  try {
    console.log('🚀 Starting browser for:', query);
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const page = await browser.newPage();
    
    // Stealth mode
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    const url = `https://shopee.co.th/search?keyword=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    await page.waitForSelector('[data-sqe="item"]', { timeout: 10000 });
    
    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-sqe="item"]');
      return Array.from(items).slice(0, 20).map(item => {
        const name = item.querySelector('[data-sqe="name"]')?.textContent || '';
        const price = item.querySelector('[class*="price"]')?.textContent || '';
        const link = item.querySelector('a')?.href || '';
        const image = item.querySelector('img')?.src || '';
        
        return { name, price, link, image };
      }).filter(p => p.name);
    });
    
    await browser.close();
    
    console.log('✅ Scraped', products.length, 'products');
    
    return res.json({
      ok: true,
      query,
      total: products.length,
      products
    });
    
  } catch (error) {
    if (browser) await browser.close();
    console.error('❌ Error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Shopee Puppeteer Scraper' });
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper on port ${PORT}`);
});