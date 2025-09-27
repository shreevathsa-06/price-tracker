const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// -----------------------------
// Helper: Parse price from text
// -----------------------------
function parsePriceFromText(text) {
  if (!text) return null;

  const regex = /([₹$€£])\s?([0-9\.,]+)/g;
  let m;
  const prices = [];
  while ((m = regex.exec(text)) !== null) {
    prices.push({ currency: m[1], amount: m[2] });
  }

  if (prices.length > 0) {
    const pick = prices[0];
    const num = parseFloat(pick.amount.replace(/,/g, ''));
    return { currency: pick.currency, price: num };
  }

  // fallback: find numbers and assume currencyless
  const numMatch = text.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{1,2})?)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1].replace(/,/g, ''));
    return { price: num, currency: '' };
  }

  return null;
}

// -----------------------------
// Scrape price from URL
// -----------------------------
async function scrapePrice(url) {
  try {
    // Try axios + cheerio first
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' },
      timeout: 15000
    });

    const $ = cheerio.load(res.data);

    // Check common selectors
    const selectors = [
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.price',
      '.a-price .a-offscreen',
      '.priceblock',
      '.pdp-price',
      'span.a-size-medium.a-color-price',
      '.product-price'
    ];

    for (const sel of selectors) {
      const node = $(sel).first();
      if (node && node.text()) {
        const parsed = parsePriceFromText(node.text());
        if (parsed) return { price: parsed.price, currency: parsed.currency, siteName: (new URL(url)).hostname };
      }
    }

    // Try meta tags
    let metaPrice = $('meta[property="og:price:amount"]').attr('content')
      || $('meta[itemprop="price"]').attr('content')
      || $('meta[name="price"]').attr('content');
    if (metaPrice) {
      const amount = parseFloat(metaPrice.toString().replace(/,/g, ''));
      return { price: amount, currency: '', siteName: (new URL(url)).hostname };
    }

    // Fallback: Puppeteer for JS-rendered pages (Amazon/Flipkart)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // wait 2s for dynamic content

    const bodyText = await page.$eval('body', el => el.innerText);
    await browser.close();

    const parsed = parsePriceFromText(bodyText);
    if (parsed) return { price: parsed.price, currency: parsed.currency, siteName: (new URL(url)).hostname };

    return null;

  } catch (err) {
    console.warn('Scrape failed for', url, err.message);
    return null;
  }
}

module.exports = { scrapePrice };
