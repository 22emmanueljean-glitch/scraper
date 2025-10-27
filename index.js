const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.get('/scrape/shopee', async (req, res) => {
  const query = req.query.q || 'sunscreen spf50';
  
  try {
    console.log('🚀 Fetching Shopee for:', query);
    
    // Try multiple times with different approaches
    const shopeeUrl = `https://shopee.co.th/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(query)}&limit=20&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2`;
    
    let attempts = 0;
    let data = null;
    
    while (attempts < 3 && !data?.items) {
      attempts++;
      console.log(`Attempt ${attempts}...`);
      
      const response = await fetch(shopeeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          'Referer': 'https://shopee.co.th/',
          'Accept': 'application/json',
          'Accept-Language': 'th-TH,th;q=0.9',
          'X-Requested-With': 'XMLHttpRequest',
          'sec-ch-ua': '"Chromium";v="119", "Not?A_Brand";v="24"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"iOS"'
        }
      });
      
      data = await response.json();
      
      if (!data.items && attempts < 3) {
        await sleep(2000 * attempts); // Wait longer each attempt
      }
    }
    
    if (!data.items || data.items.length === 0) {
      return res.json({
        ok: false,
        error: 'Shopee blocked request - use mock data for now',
        query,
        mock: true,
        products: [
          {
            name: "Mock Sunscreen SPF50",
            price: 299,
            currency: "THB",
            rating: 4.5,
            sold: 1000,
            url: "https://shopee.co.th/",
            image: "https://via.placeholder.com/200"
          }
        ]
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