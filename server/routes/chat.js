const express = require('express');
const Product = require('../models/Product');
const PriceLog = require('../models/PriceLog');
const router = express.Router();

// Very small rule-based bot: supports "best price for [name]" and "history for [name]" "track [name]"
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'message required' });
  const text = message.toLowerCase();

  // attempt to extract product name
  const forMatch = text.match(/(?:best price for|best for|cheapest for|best price of|price for|track|history for|history of|show history of|show history for)\s+(.+)/);
  let productName = null;
  if (forMatch) productName = forMatch[1].trim();
  // fallback: take quoted phrase
  if (!productName) {
    const q = text.match(/"([^"]+)"/);
    if (q) productName = q[1];
  }
  // fallback: last word(s)
  if (!productName) {
    // try last 3 words
    productName = text.split(' ').slice(-3).join(' ');
  }

  // simple search
  const products = await Product.find({ name: new RegExp(productName, 'i') }).limit(5);
  if (!products || products.length === 0) {
    return res.json({ reply: `I couldn't find products matching "${productName}". Try a shorter or different name.` });
  }

  const p = products[0];

  if (text.includes('history') || text.includes('price history') || text.includes('show history')) {
    const logs = await PriceLog.find({ product: p._id }).sort({ scrapedAt: 1 }).limit(100);
    if (!logs || logs.length === 0) return res.json({ reply: `No price history found for "${p.name}" yet.` });
    const sample = logs.slice(-10).map(l => `${new Date(l.scrapedAt).toLocaleString()}: ${l.currency}${l.price}`).join('\n');
    return res.json({ reply: `Price history (last ${Math.min(10, logs.length)} entries) for "${p.name}":\n${sample}` });
  }

  // default: best price
  const best = await PriceLog.find({ product: p._id }).sort({ price: 1 }).limit(1);
  if (!best || best.length === 0) return res.json({ reply: `No price logs available yet for "${p.name}".` });
  const b = best[0];
  return res.json({ reply: `Best deal for "${p.name}": ${b.currency}${b.price} — ${b.siteName || b.url}` });
});

module.exports = router;
