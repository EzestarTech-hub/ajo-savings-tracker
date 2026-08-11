const express = require("express");
const path = require("path");

const db = require("./db");
const groupsRouter = require("./routes/groups");
const dashboardRouter = require("./routes/dashboard");
const membersRouter = require("./routes/members");
const contributionsRouter = require("./routes/contributions");
const app = express();

const PORT = 3000;
const payoutsRouter = require("./routes/payouts");
const scheduleRouter = require("./routes/schedule");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/groups", groupsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/groups", membersRouter);
app.use("/api/members", contributionsRouter);
app.use("/api/members", payoutsRouter);
app.use("/api/schedule", scheduleRouter);

// Home route
app.get("/", (req, res) => {
  res.send("Ajo Savings Tracker API is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});