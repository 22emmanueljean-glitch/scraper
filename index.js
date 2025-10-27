const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape/shopee', async (req, res) => {
  const query = req.query.q || 'sunscreen spf50';
  
  try {
    console.log('🚀 Fetching Shopee via local proxy for:', query);
    
    const shopeeUrl = `https://shopee.co.th/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(query)}&limit=20&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
    
    const proxyUrl = `https://liliana-squshiest-palmately.ngrok-free.dev/proxy?url=${encodeURIComponent(shopeeUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return res.json({
        ok: false,
        error: 'No results found',
        query
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