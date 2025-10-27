const express = require('express');
const { chromium } = require('playwright-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape/shopee', async (req, res) => {
  const query = req.query.q || 'sunscreen spf50';
  
  try {
    console.log('🚀 Scraping:', query);
    
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(`https://shopee.co.th/search?keyword=${encodeURIComponent(query)}`);
    await page.waitForTimeout(3000);
    
    const products = await page.$$eval('[data-sqe="item"]', items => 
      items.slice(0, 20).map(item => ({
        name: item.querySelector('[data-sqe="name"]')?.textContent || '',
        price: item.querySelector('[class*="price"]')?.textContent || '',
        link: item.querySelector('a')?.href || '',
        image: item.querySelector('img')?.src || ''
      })).filter(p => p.name)
    );
    
    await browser.close();
    
    res.json({ ok: true, query, total: products.length, products });
    
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));