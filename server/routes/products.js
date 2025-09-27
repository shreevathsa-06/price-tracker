const express = require('express');
const { scrapePrice } = require('../scraper/scrapeHelper'); // helper function
const Product = require('../models/Product');
const PriceLog = require('../models/PriceLog');
const router = express.Router();


// ========================
// Create a product
// ========================
router.post('/', async (req, res) => {
  try {
    const { name, urls } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });

    const product = new Product({ name, urls });
    await product.save();

    // Scrape each URL immediately after adding
    for (const u of urls) {
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
      }
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ========================
// List products (with latest price)
// ========================
// List products with latest price
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const results = await Promise.all(products.map(async (p) => {
      const latestLog = await PriceLog.findOne({ product: p._id })
        .sort({ scrapedAt: -1 }); // get most recent log

      return {
        _id: p._id,
        name: p.name,
        urls: p.urls,
        price: latestLog ? latestLog.price : null,
        currency: latestLog ? latestLog.currency : '',
        site: latestLog ? latestLog.siteName : ''
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ========================
// Best deal by product name
// ========================
router.get('/best-deal/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const products = await Product.find({ name: new RegExp(name, 'i') });
    if (!products.length) return res.json({ message: 'No product found' });

    // Get latest logs for all products
    const latestLogs = await Promise.all(products.map(p =>
      PriceLog.findOne({ product: p._id }).sort({ scrapedAt: -1 })
    ));

    let best = null;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const log = latestLogs[i];
      if (log) {
        if (!best || log.price < best.price) {
          best = {
            productId: p._id,
            name: p.name,
            url: log.url,
            site: log.siteName,
            price: log.price,
            currency: log.currency
          };
        }
      }
    }

    if (!best) return res.json({ message: 'Price not available yet' });
    res.json(best);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ========================
// Get product with its logs
// ========================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const logs = await PriceLog.find({ product: product._id }).sort({ scrapedAt: 1 });
    res.json({ product, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ========================
// Delete product + logs
// ========================
router.delete('/:id', async (req, res) => {
  try {
    await PriceLog.deleteMany({ product: req.params.id });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// Scrape a single product manually
// ========================
router.post('/scrape/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Scrape each URL
    for (const u of product.urls) {
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
      }
    }

    res.json({ message: 'Scrape completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
