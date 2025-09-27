require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const productsRouter = require('./routes/products');
const scrapeRouter = require('./routes/scrape');
const chatRouter = require('./routes/chat');
const startCron = require('./jobs/cron');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/products', productsRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/chat', chatRouter);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/price-tracker';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startCron(); // start scheduled scraping job
    });
  })
  .catch(err => {
    console.error('Mongo connection error', err);
  });
