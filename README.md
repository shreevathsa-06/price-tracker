# price-tracker
A MERN stack application that tracks product prices and notifies users about price drops.

## 🚀 Features
- Add products to track
- Scrape prices from websites
- View price history with charts
- Real-time notifications (via bot/chat)
## 📂 Project Structure
price-tracker/
  server/
    package.json
    .env.example
    server.js
    models/
      Product.js
      PriceLog.js
    routes/
      products.js
      scrape.js
      chat.js
    scraper/
      scrapeHelper.js
    jobs/
      cron.js
  client/
    package.json
    package-lock.json
    index.html
    vite.config.js
    src/
      main.jsx
      App.jsx
      api.js
      index.css
      components/
        AddProductForm.jsx
        ProductList.jsx
        ProductDetail.jsx
        DealBot.jsx
        PriceChart.jsx
