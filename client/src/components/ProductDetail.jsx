import React, { useEffect, useState } from 'react';
import { manualScrapeProduct } from '../api'; // only import the function you want
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns'; // for time scale

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, TimeScale, Title, Tooltip, Legend);

export default function ProductDetail({ productId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!productId) { setData(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [productId]);

  async function manualScrape() {
    try {
      await manualScrapeProduct(productId); // use the correct function
      await load(); // reload product data including new logs
      alert('Scrape finished (logs may take a moment to appear).');
    } catch (err) {
      alert('Scrape error: ' + (err.response?.data?.message || err.message));
    }
  }

  if (!productId) return <div className="small">Select a product to see details.</div>;
  if (loading || !data) return <div>Loading product...</div>;

  const logs = data.logs || [];
  const points = logs.map(l => ({ x: new Date(l.scrapedAt), y: l.price }));

  const chartData = {
    datasets: [
      {
        label: `${data.product.name} price`,
        data: points,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: {
      x: { type: 'time', title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Price (₹)' } }
    }
  };

  return (
    <div>
      <h3>{data.product.name}</h3>
      <div className="small">URLs tracked: {data.product.urls?.length || 0}</div>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <button onClick={manualScrape}>Scrape Now</button>
      </div>

      <div>
        Current Price: {logs.length > 0 ? `${logs[logs.length - 1].currency}${logs[logs.length - 1].price}` : 'N/A'}
      </div>

      <div style={{ height: 260 }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h4 style={{ marginTop: 12 }}>Recent logs</h4>
      <div>
        {logs.slice().reverse().map(l => (
          <div key={l._id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div><strong>{l.currency}{l.price}</strong> — <span className="small">{l.siteName || l.url}</span></div>
            <div className="small">{new Date(l.scrapedAt).toLocaleString()}</div>
          </div>
        ))}
        {logs.length === 0 && <div className="small">No price logs yet</div>}
      </div>
    </div>
  );
}
