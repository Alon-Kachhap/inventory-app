"use client";

import { use, useEffect, useState } from "react";
import { fetchJSON } from "../lib/api"

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await fetchJSON("/items");
      setItems(data.items);
    } catch (err) {
      alert("Load error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      const data = await fetchJSON("/items", {
        method: "POST",
        body: JSON.stringify({ name, qty: Number(qty), price: Number(price) })
      });
      setItems(prev => [data.item, ...prev]);
      setName(""); setQty(0); setPrice(0);
    } catch (err) {
      alert("Alert error: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete item?")) return;
    try {
      await fetchJSON(`/items/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-black">Inventory Dashboard</h1>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input required value={name} onChange={e => setName(e.target.value)}
            className="p-2 border rounded text-gray-400" placeholder="Item name" />
          <input required type="number" value={qty} onChange={e => setQty(e.target.value)}
            className="p-2 border rounded text-gray-400" placeholder="Quantity" />
          <input required type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="p-2 border rounded text-gray-400" placeholder="Price" />
          <button className="bg-blue-600 text-white rounded px-4" type="submit">Add</button>
        </form>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4 text-gray-500">Items {loading && "(loading...)"}</h2>
          <div className="divide-y">
            {items.length === 0 && <p className="text-gray-900">No items yet.</p>}
            {items.map(item => (
              <div key={item._id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-500">{item.name}</div>
                  <div className="text-sm text-gray-900">Qty: {item.qty} • Price: ₹{item.price}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleDelete(item._id)}
                    className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}