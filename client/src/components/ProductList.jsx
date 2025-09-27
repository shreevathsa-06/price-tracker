import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function ProductList({ onSelect }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h3>Products</h3>
      {loading ? <div>Loading...</div> :
        <div>
          {products.map(p => (
            <div key={p._id} className="list-item">
              <div>
                <strong>{p.name}</strong>
                <div className="small">{p.urls?.length || 0} URL(s)</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => onSelect(p._id)}>View</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="small">No products yet</div>}
        </div>
      }
    </div>
  );
}
