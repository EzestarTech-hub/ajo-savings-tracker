const express = require("express");

const router = express.Router();

const db = require("../db");

router.post("/", (req, res) => {
    const {
        name,
        contribution_amount,
        frequency,
        start_date
    } = req.body;

    const sql = `
        INSERT INTO groups
        (name, contribution_amount, frequency, start_date)
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [name, contribution_amount, frequency, start_date],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Group created successfully!",
                groupId: this.lastID
            });
        }
    );
});

router.get("/", (req, res) => {

    const sql = "SELECT * FROM groups";

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});

module.exports = router;