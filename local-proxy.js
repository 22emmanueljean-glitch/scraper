const express = require('express');
const app = express();

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://shopee.co.th/',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-api-source': 'pc',
      'x-requested-with': 'XMLHttpRequest'
    }
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(4000, () => console.log('Local proxy running on 4000'));