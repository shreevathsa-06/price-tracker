import { useState, useEffect } from 'react';
import { getProducts, addProduct, getBestDeal } from './api';
import ProductDetail from './components/ProductDetail';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [search, setSearch] = useState('');
  const [bestDeal, setBestDeal] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleAddProduct = async () => {
    if (!name || !url || !siteName) return alert('Fill all fields');
    await addProduct({ name, urls: [{ url, siteName }] });
    setName(''); setUrl(''); setSiteName('');
    fetchProducts();
  };

  const handleSearchDeal = async () => {
    if (!search) return;
    const deal = await getBestDeal(search);
    setBestDeal(deal);
  };

  return (
    <div className="container">
      <h1>Price Tracker</h1>

      {/* Add Product */}
      <div className="card">
        <h2>Add Product</h2>
        <input placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Site Name" value={siteName} onChange={e => setSiteName(e.target.value)} />
        <input placeholder="Product URL" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>

      {/* Product List */}
      <div className="card">
        <h2>All Products</h2>
        {products.length === 0 && <p>No products yet</p>}
        {products.map(p => (
          <div 
            key={p._id} 
            className="product"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedProductId(p._id)} // <-- step 3 here
          >
            <strong>{p.name}</strong> - {p.price ? `${p.currency || '₹'}${p.price}` : 'N/A'} ({p.site})
          </div>
        ))}
        {selectedProductId && (
          <div style={{ marginTop: 20 }}>
            <h3>Product Detail</h3>
            <ProductDetail productId={selectedProductId} />
         </div>
        )}
      </div>

      {/* Deal Bot */}
      <div className="card">
        <h2>Deal Bot</h2>
        <input placeholder="Search Product" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={handleSearchDeal}>Find Best Deal</button>
        {bestDeal && bestDeal.price && (
          <div className="deal">
            Best Deal: {bestDeal.name} - {bestDeal.currency || '₹'}{bestDeal.price} ({bestDeal.site})
          </div>
        )}
        {bestDeal && !bestDeal.price && <div>{bestDeal.message || 'Price not available'}</div>}
      </div>
    </div>
  );
}

export default App;
