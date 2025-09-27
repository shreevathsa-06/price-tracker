const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  siteName: { type: String, default: '' },
  url: { type: String, required: true }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  urls: { type: [UrlSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
