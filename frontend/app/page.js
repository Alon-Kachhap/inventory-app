"use client";

import { useEffect, useState } from "react";
import { fetchJSON } from "../lib/api";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // create form state
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editError, setEditError] = useState("");

  // derived total inventory value
  const grandTotal = items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  // stock search Filter
  const visibleItems = items.filter(item => {
    // 1) matches search
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());

    // 2) match low stock
    const matchesLowStock =
      !lowStockOnly || item.qty < 5; // low stock => qty < 5

    return matchesSearch && matchesLowStock;
  });

  // ---- helpers ----
  function validateItemFields(name, qty, price) {
    if (!name.trim()) return "Name is required";
    if (isNaN(qty) || qty < 0) return "Quantity must be 0 or more";
    if (isNaN(price) || price < 0) return "Price must be 0 or more";
    return "";
  }

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
    setFormError("");

    const numQty = Number(qty);
    const numPrice = Number(price);

    const errMsg = validateItemFields(name, numQty, numPrice);
    if (errMsg) {
      setFormError(errMsg);
      return;
    }

    setSubmitting(true);
    try {
      const data = await fetchJSON("/items", {
        method: "POST",
        body: JSON.stringify({ name, qty: numQty, price: numPrice })
      });
      setItems(prev => [data.item, ...prev]);
      setName("");
      setQty(0);
      setPrice(0);
    } catch (err) {
      setFormError("Add error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setEditName(item.name);
    setEditQty(item.qty);
    setEditPrice(item.price);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setEditError("");

    const numQty = Number(editQty);
    const numPrice = Number(editPrice);

    const errMsg = validateItemFields(editName, numQty, numPrice);
    if (errMsg) {
      setEditError(errMsg);
      return;
    }

    try {
      const data = await fetchJSON(`/items/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          qty: numQty,
          price: numPrice
        })
      });

      setItems(prev =>
        prev.map(i => (i._id === editingId ? data.item : i))
      );

      setEditingId(null);
    } catch (err) {
      setEditError("Update error: " + err.message);
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

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-black">Inventory Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Total inventory value:{" "}
          <span className="font-mono font-semibold">
            ₹{grandTotal.toFixed(2)}
          </span>
        </p>

        {/* Add item form */}
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2"
        >
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="p-2 border rounded text-gray-900"
            placeholder="Item name"
          />
          <input
            required
            type="number"
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="p-2 border rounded text-gray-900"
            placeholder="Quantity"
            min="0"
          />
          <input
            required
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="p-2 border rounded text-gray-900"
            placeholder="Price"
            min="0"
          />
          <button
            className="bg-blue-600 text-white rounded px-4 disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>

        {formError && (
          <p className="mb-4 text-sm text-red-600">{formError}</p>
        )}

        {/* Items list */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            Items {loading && <span className="text-sm text-gray-500">(loading...)</span>}
          </h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <input
              className="p-2 border rounded w-full md:w-1/2"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <label className="flex items-center gap-2 text-sm text-gray-900">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={lowStockOnly}
                onChange={e => setLowStockOnly(e.target.checked)}
              />
              <span>Low stock only (qty &lt; 5)</span>
            </label>
          </div>

          {visibleItems.length === 0 && (
            <p className="text-gray-500">No items yet.</p>
          )}

          {visibleItems.map(item => (
            <div key={item._id} className="py-3 border-b last:border-b-0">
              {editingId === item._id ? (
                // ---------- EDIT MODE ----------
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <input
                      className="w-full p-1 border rounded"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-1/2 p-1 border rounded"
                        value={editQty}
                        onChange={e => setEditQty(e.target.value)}
                        min="0"
                      />
                      <input
                        type="number"
                        className="w-1/2 p-1 border rounded"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        min="0"
                      />
                    </div>
                    {editError && (
                      <p className="text-xs text-red-600 mt-1">{editError}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-1 border text-sm rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // ---------- VIEW MODE ----------
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-800">
                      Qty: {item.qty} • Price: ₹{item.price} • Value:{" "}
                      <span className="font-mono">
                        ₹{(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-sm text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}