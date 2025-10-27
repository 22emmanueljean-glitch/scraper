const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape/shopee', async (req, res) => {
  const query = req.query.q || 'sunscreen spf50';
  
  try {
    console.log('🚀 Fetching Shopee for:', query);
    
    const shopeeUrl = `https://shopee.co.th/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(query)}&limit=20&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
    
    const response = await fetch(shopeeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://shopee.co.th/',
        'Accept': 'application/json',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return res.json({
        ok: false,
        error: 'No results found',
        query,
        debug: data
      });
    }
    
    const products = data.items.map(item => {
      const p = item.item_basic;
      return {
        name: p.name,
        price: p.price / 100000,
        currency: p.currency,
        rating: p.item_rating?.rating_star || 0,
        sold: p.historical_sold || 0,
        url: `https://shopee.co.th/product/${p.shopid}/${p.itemid}`,
        image: p.image ? `https://cf.shopee.co.th/file/${p.image}` : null
      };
    });
    
    console.log('✅ Scraped', products.length, 'products');
    
    return res.json({
      ok: true,
      query,
      total: products.length,
      products
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Shopee API Scraper Running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper running on port ${PORT}`);
});