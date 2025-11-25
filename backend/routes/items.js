const express = require("express");
const router = express.Router();
const InventoryItem = require("../models/InventoryItem");

// GET /items - list all
router.get("/items", async (req, res) => {
    try {
        const items = await InventoryItem.find().sort({ createdAt: -1 });
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /item - create
router.post("/items", async (req, res) => {
    try {
        const { name, qty, price } = req.body;
        const item = await InventoryItem.create({ name, qty, price });
        res.status(201).json({ success: true, item });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message })
    }
});

// PUT /items/:id - update
router.put("/item/:id", async (req, res) => {
    try {
        const { name, qty, price } = req.body;
        const item = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            { name, qty, price },
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ success: false, error: "Not found" });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /items/:id
router.delete("/items/:id", async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, error: "Not found" });
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;