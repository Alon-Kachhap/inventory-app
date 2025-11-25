require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const itemsRouter = require("./routes/items");

const app = express();
const PORT = process.env.PORT || 4000;

// allowing requests from frontend dev server (Next.js)
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use(itemsRouter);

// start server after DB connect
connectDB(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Backend listening at http://localhost:${PORT}`);
    });
});