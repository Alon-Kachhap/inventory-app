// schema for Inveventory
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("InventoryItem", inventorySchema);