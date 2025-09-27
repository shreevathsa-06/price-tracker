import axios from 'axios';

// Create an axios instance for easier usage
export const api = axios.create({
  baseURL: 'http://localhost:5000/api', // backend URL
});

// ------------------------
// Get all products
// ------------------------
export const getProducts = async () => {
  try {
    const res = await api.get('/products');
    return res.data;
  } catch (err) {
    console.error('getProducts error:', err);
    return [];
  }
};

// ------------------------
// Add a new product
// ------------------------
export const addProduct = async (product) => {
  try {
    const res = await api.post('/products', product);
    return res.data;
  } catch (err) {
    console.error('addProduct error:', err);
    return null;
  }
};

// ------------------------
// Get best deal for a product by name
// ------------------------
export const getBestDeal = async (name) => {
  try {
    const res = await api.get(`/products/best-deal/${encodeURIComponent(name)}`);
    return res.data;
  } catch (err) {
    console.error('getBestDeal error:', err);
    return null;
  }
};

// ------------------------
// Scrape a product manually
// ------------------------
export const scrapeProduct = async (id) => {
  try {
    const res = await api.post(`/scrape/product/${id}`);
    return res.data;
  } catch (err) {
    console.error('scrapeProduct error:', err);
    return null;
  }
};
// Scrape a product manually by its ID
export const manualScrapeProduct = async (productId) => {
  try {
    const res = await axios.post(`${API_URL}/scrape/product/${productId}`);
    return res.data;
  } catch (err) {
    console.error('scrapeProduct error:', err);
    return null;
  }
};




