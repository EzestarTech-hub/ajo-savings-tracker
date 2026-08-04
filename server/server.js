const express = require("express");
const path = require("path");

const db = require("./db");
const groupsRouter = require("./routes/groups");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/groups", groupsRouter);

// Home route
app.get("/", (req, res) => {
  res.send("Ajo Savings Tracker API is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});