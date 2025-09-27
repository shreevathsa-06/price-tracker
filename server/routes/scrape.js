const express = require('express');
const Product = require('../models/Product');
const PriceLog = require('../models/PriceLog');
const { scrapePrice } = require('../scraper/scrapeHelper');
const router = express.Router();

// Scrape a single url payload: { url, productId, siteName? }
// or scrape all urls for a product: POST /api/scrape/product/:id
router.post('/one', async (req, res) => {
  try {
    const { url, productId, siteName } = req.body;
    if (!url || !productId) return res.status(400).json({ message: 'url and productId required' });
    const result = await scrapePrice(url);
    if (!result || typeof result.price !== 'number') return res.status(500).json({ message: 'price not found' });
    const log = new PriceLog({
      product: productId,
      siteName: siteName || result.siteName || '',
      url,
      price: result.price,
      currency: result.currency || ''
    });
    await log.save();
    res.json({ ok: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scrape all URLs for a product
router.post('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const results = [];
    for (const u of product.urls) {
      try {
        const r = await scrapePrice(u.url);
        if (r && typeof r.price === 'number') {
          const log = new PriceLog({
            product: product._id,
            siteName: u.siteName || r.siteName || '',
            url: u.url,
            price: r.price,
            currency: r.currency || ''
          });
          await log.save();
          results.push({ url: u.url, log });
        }
      } catch (errInner) {
        console.warn('scrape error for', u.url, errInner.message);
      }
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compare and get best (lowest) price for a product
router.get('/compare/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const logs = await PriceLog.find({ product: productId }).sort({ price: 1 }).limit(1);
    if (!logs || logs.length === 0) return res.json({ message: 'No price logs yet' });
    res.json({ best: logs[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
