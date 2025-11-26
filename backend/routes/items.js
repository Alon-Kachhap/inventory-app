// backend/routes/items.js
const express = require("express");
const router = express.Router();
const InventoryItem = require("../models/InventoryItem");

// GET /items - list all items
router.get("/items", async (req, res) => {
    try {
        const items = await InventoryItem.find().sort({ createdAt: -1 });
        res.json({ success: true, items });
    } catch (err) {
        console.error("Error in GET /items:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /items - create new item
router.post("/items", async (req, res) => {
    try {
        const { name, qty, price } = req.body;
        const item = await InventoryItem.create({ name, qty, price });
        res.status(201).json({ success: true, item });
    } catch (err) {
        console.error("Error in POST /items:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT /items/:id - update item
router.put("/items/:id", async (req, res) => {
    try {
        const { name, qty, price } = req.body;
        const item = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            { name, qty, price },
            { new: true, runValidators: true }
        );
        if (!item) {
            return res.status(404).json({ success: false, error: "Not found" });
        }
        res.json({ success: true, item });
    } catch (err) {
        console.error("Error in PUT /items/:id:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /items/:id - delete item
router.delete("/items/:id", async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: "Not found" });
        }
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        console.error("Error in DELETE /items/:id:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;