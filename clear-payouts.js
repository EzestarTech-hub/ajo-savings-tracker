const db = require("./server/db");

db.run("DELETE FROM payouts", function (err) {
    if (err) {
        console.error("Error deleting payouts:", err.message);
    } else {
        console.log(`Deleted ${this.changes} payout records.`);
    }

    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database closed.");
        }
    });
});