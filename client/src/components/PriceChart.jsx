import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PriceChart({ logs }) {
  if (!logs || logs.length === 0) return <p>No price history yet</p>;

  const data = {
    labels: logs.map((log) =>
      new Date(log.scrapedAt).toLocaleDateString("en-IN")
    ),
    datasets: [
      {
        label: "Price (₹)",
        data: logs.map((log) => log.price),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return <Line data={data} />;
}
