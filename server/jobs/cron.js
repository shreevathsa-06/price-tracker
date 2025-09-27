const cron = require('node-cron');
const Product = require('../models/Product');
const PriceLog = require('../models/PriceLog');
const { scrapePrice } = require('../scraper/scrapeHelper');

const intervalMinutes = parseInt(process.env.SCRAPE_INTERVAL_MINUTES || '60', 10);

function startCron() {
  // run immediately then schedule
  runScrapeAll().catch(err => console.error('initial scrape error', err));

  // Cron expression: run every SCRAPE_INTERVAL_MINUTES
  const cronExpr = `*/${Math.max(1, intervalMinutes)} * * * *`;
  console.log('Starting cron with', cronExpr);
  cron.schedule(cronExpr, async () => {
    console.log('Running scheduled scrape at', new Date());
    await runScrapeAll();
  });
}

async function runScrapeAll() {
  const products = await Product.find();
  for (const p of products) {
    for (const u of p.urls) {
      try {
        const r = await scrapePrice(u.url);
        if (r && typeof r.price === 'number') {
  // Save price log
  const log = new PriceLog({
    product: p._id,
    siteName: u.siteName || r.siteName || '',
    url: u.url,
    price: r.price,
    currency: r.currency || ''
  });
  await log.save();
  console.log('Saved price for', p.name, u.url, r.price);

  // Update product with latest price
  const product = await Product.findById(p._id);
  product.price = r.price;
  product.site = u.siteName || r.siteName || '';
  if (!product.priceHistory) product.priceHistory = [];
  product.priceHistory.push({ price: r.price, site: product.site });
  await product.save();
}


         else {
          console.log('No price found for', u.url);
        }
      } catch (err) {
        console.warn('Scrape error for', u.url, err.message);
      }
    }
  }
}


module.exports = startCron;
