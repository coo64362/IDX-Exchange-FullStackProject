const express = require("express");
const cors = require("cors");
require("dotenv").config();
const propertyRoutes = require("./routes/propertyRoutes");
// import propertyRoutes from "./routes/propertyRoutes.js"; can i use this instead?

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/properties', propertyRoutes);

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS db_status");

    res.status(200).json({
      status: "ok",
      //message: "Database connection is healthy",
      database: "connected",
      //result: rows[0],
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      database: "disconnected",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});