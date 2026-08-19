const express = require("express");

const router = express.Router();

const db = require("../db");

router.post("/:id/contributions", (req, res) => {

    const memberId =
        Number(req.params.id);

    const {
        amount,
        payment_date
    } = req.body;


    // ==================================================
    // VALIDATE MEMBER ID
    // ==================================================

    if (
        !Number.isInteger(memberId) ||
        memberId <= 0
    ) {

        return res.status(400).json({
            error:
                "Invalid member ID."
        });

    }


    // ==================================================
    // VALIDATE CONTRIBUTION AMOUNT
    // ==================================================

    const contributionAmount =
        Number(amount);

    if (
        !Number.isFinite(contributionAmount) ||
        contributionAmount <= 0
    ) {

        return res.status(400).json({
            error:
                "Contribution amount must be greater than zero."
        });

    }


    // ==================================================
    // VALIDATE PAYMENT DATE
    // ==================================================

    if (
        !payment_date ||
        typeof payment_date !== "string"
    ) {

        return res.status(400).json({
            error:
                "Payment date is required."
        });

    }


    // ==================================================
    // CHECK MEMBER EXISTS
    // ==================================================

    const memberSql = `
        SELECT id
        FROM members
        WHERE id = ?
    `;

    db.get(
        memberSql,
        [memberId],
        (memberErr, member) => {

            if (memberErr) {

                return res.status(500).json({
                    error:
                        memberErr.message
                });

            }


            if (!member) {

                return res.status(404).json({
                    error:
                        "Member not found."
                });

            }


            // ==================================================
            // INSERT CONTRIBUTION
            // ==================================================

            const sql = `
                INSERT INTO contributions (
                    member_id,
                    amount,
                    payment_date
                )
                VALUES (?, ?, ?)
            `;

            db.run(
                sql,
                [
                    memberId,
                    contributionAmount,
                    payment_date
                ],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            error:
                                err.message
                        });

                    }

                    return res.status(201).json({

                        message:
                            "Contribution recorded successfully!",

                        contributionId:
                            this.lastID

                    });

                }
            );

        }
    );

});

router.get("/:id/contributions", (req, res) => {

  const memberId = req.params.id;

  const sql = `
    SELECT * FROM contributions
    WHERE member_id = ?
  `;

  db.all(sql, [memberId], (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

});

router.get("/:id/total", (req, res) => {

  const memberId = req.params.id;

  const sql = `
    SELECT SUM(amount) AS total
    FROM contributions
    WHERE member_id = ?
  `;

  db.get(sql, [memberId], (err, row) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json({
      memberId: memberId,
      totalContribution: row.total || 0
    });

  });

});

router.put("/:id", (req, res) => {

    const contributionId = req.params.id;

    const { amount, payment_date } = req.body;

    const sql = `
        UPDATE contributions
        SET amount = ?, payment_date = ?
        WHERE id = ?
    `;

    db.run(sql, [amount, payment_date, contributionId], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: "Contribution not found."
            });
        }

        res.json({
            message: "Contribution updated successfully!"
        });

    });

});


// ======================================================
// UPDATE CONTRIBUTION
// ======================================================

router.put("/contributions/:id", (req, res) => {

    const contributionId = req.params.id;

    const {
        amount,
        payment_date
    } = req.body;

    // Validate input
    if (
        !amount ||
        Number(amount) <= 0 ||
        !payment_date
    ) {

        return res.status(400).json({
            error:
                "Enter a valid contribution amount and payment date."
        });

    }

    const sql = `
        UPDATE contributions
        SET
            amount = ?,
            payment_date = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            Number(amount),
            payment_date,
            contributionId
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error:
                        "Contribution not found."
                });

            }

            res.json({

                message:
                    "Contribution updated successfully!"

            });

        }
    );

});

// ======================================================
// DELETE CONTRIBUTION
// ======================================================

router.delete("/contributions/:id", (req, res) => {

    const contributionId = req.params.id;

    const sql = `
        DELETE FROM contributions
        WHERE id = ?
    `;

    db.run(
        sql,
        [contributionId],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error:
                        "Contribution not found."
                });

            }

            res.json({

                message:
                    "Contribution deleted successfully!"

            });

        }
    );

});

router.delete("/:id", (req, res) => {

    const contributionId = req.params.id;

    const sql = `
        DELETE FROM contributions
        WHERE id = ?
    `;

    db.run(sql, [contributionId], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: "Contribution not found."
            });
        }

        res.json({
            message: "Contribution deleted successfully!"
        });

    });

});

// ======================================================
// GET MEMBER BALANCE
// ======================================================

router.get("/:id/balance", (req, res) => {

    const memberId = req.params.id;

    const sql = `
        SELECT
            COALESCE(
                (
                    SELECT SUM(amount)
                    FROM contributions
                    WHERE member_id = ?
                ),
                0
            ) AS totalContributions,

            COALESCE(
                (
                    SELECT SUM(amount)
                    FROM payouts
                    WHERE member_id = ?
                ),
                0
            ) AS totalPayouts
    `;

    db.get(
        sql,
        [memberId, memberId],
        (err, row) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            const balance =
                row.totalContributions -
                row.totalPayouts;

            res.json({

                memberId: memberId,

                totalContributions:
                    row.totalContributions,

                totalPayouts:
                    row.totalPayouts,

                balance: balance

            });

        }
    );

});

module.exports = router;