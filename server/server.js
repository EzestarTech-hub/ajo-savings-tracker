const express = require("express");
const path = require("path");

const db = require("./db");
const groupsRouter = require("./routes/groups");
const dashboardRouter = require("./routes/dashboard");
const membersRouter = require("./routes/members");
const contributionsRouter = require("./routes/contributions");
const reportsRouter = require("./routes/reports");
const app = express();

const PORT = process.env.PORT || 3000;
const payoutsRouter = require("./routes/payouts");
const scheduleRouter = require("./routes/schedule");
const loansRouter = require("./routes/loans");


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/groups", groupsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/groups", membersRouter);
app.use("/api/members", membersRouter);
app.use("/api/members", contributionsRouter);
app.use("/api/members", payoutsRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/loans", loansRouter);
app.use("/api/reports", reportsRouter);

// Home route
app.get("/", (req, res) => {
  res.send("Ajo Savings Tracker API is running!");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});