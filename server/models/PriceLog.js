const mongoose = require('mongoose');

const PriceLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  siteName: { type: String },
  url: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: '' },
  scrapedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PriceLog', PriceLogSchema);
