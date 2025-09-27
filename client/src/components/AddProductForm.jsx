import React, { useState } from 'react';
import { api } from '../api';

export default function AddProductForm({ onAdded }) {
  const [name, setName] = useState('');
  const [urls, setUrls] = useState([{ siteName: '', url: '' }]);
  const [loading, setLoading] = useState(false);

  function updateUrl(index, field, value) {
    const copy = [...urls];
    copy[index][field] = value;
    setUrls(copy);
  }

  function addUrl() {
    setUrls(prev => [...prev, { siteName: '', url: '' }]);
  }

  async function submit(e) {
    e.preventDefault();
    if (!name) return alert('Enter product name');
    setLoading(true);
    try {
      const body = { name, urls: urls.filter(u => u.url) };
      await api.post('/products', body);
      setName('');
      setUrls([{ siteName: '', url: '' }]);
      onAdded?.();
      alert('Product added.');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h3>Add Product</h3>
      <div style={{ marginBottom: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Product name (e.g. iPhone 14)" style={{ width: '100%' }} />
      </div>

      {urls.map((u, i) => (
        <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
          <input placeholder="Site name (optional)" value={u.siteName} onChange={e => updateUrl(i, 'siteName', e.target.value)} style={{ flex:1 }} />
          <input placeholder="Product URL" value={u.url} onChange={e => updateUrl(i, 'url', e.target.value)} style={{ flex:3 }} />
        </div>
      ))}

      <div style={{ display:'flex', gap:8 }}>
        <button type="button" onClick={addUrl}>Add another URL</button>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
      </div>
    </form>
  );
}
