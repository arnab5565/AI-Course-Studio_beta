const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

dotenv.config();

console.log("Starting server init...");
console.log("Port:", process.env.PORT);
console.log("Connecting to DB...");

connectDB();

const app = express();
console.log("Express app created...");

app.use(cors());
app.use(express.json());

// Log incoming requests to console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth",authRoutes);
app.use("/api/gemini", geminiRoutes);
app.listen(process.env.PORT,()=>{
  console.log("Server running");
});
