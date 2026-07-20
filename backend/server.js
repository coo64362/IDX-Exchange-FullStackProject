const express = require("express");
const cors = require("cors");
require("dotenv").config();
const propertyRoutes = require("./routes/propertyRoutes");

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

//Request Logging Middleware
app.use((req, res, next) => {
  const requestStart = performance.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const requestEnd = performance.now();

    console.log(`${req.method}, ${req.originalUrl}, ${timestamp}, ${res.statusCode}, ${(requestEnd - requestStart).toFixed(2)} ms`);
  });

  //Continue to the next middleware/route
  next();
});

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