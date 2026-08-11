const express = require("express");

const router = express.Router();

const db = require("../db");

console.log("Schedule routes loaded");

// ======================================================
// CREATE PAYOUT SCHEDULE
// ======================================================

router.post("/", (req, res) => {

    const {
        group_id,
        member_id,
        amount,
        payout_date
    } = req.body;

    // ===============================
    // VALIDATE INPUT
    // ===============================

    if (
        !group_id ||
        !member_id ||
        !amount ||
        Number(amount) <= 0 ||
        !payout_date
    ) {

        return res.status(400).json({
            error:
                "Group, member, amount and payout date are required."
        });

    }

    // ===============================
    // PREVENT PAST DATE
    // ===============================

    const today =
        new Date().toISOString().split("T")[0];

    if (payout_date < today) {

        return res.status(400).json({
            error:
                "Payout date cannot be in the past."
        });

    }

    // ===============================
    // SAVE SCHEDULE
    // ===============================

    const sql = `
        INSERT INTO payout_schedule
        (
            group_id,
            member_id,
            amount,
            payout_date,
            status
        )
        VALUES (?, ?, ?, ?, 'Pending')
    `;

    db.run(
        sql,
        [
            Number(group_id),
            Number(member_id),
            Number(amount),
            payout_date
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.status(201).json({

                message:
                    "Payout schedule created successfully!",

                scheduleId:
                    this.lastID

            });

        }
    );

});

// ======================================================
// GET GROUP PAYOUT SCHEDULE
// ======================================================

router.get("/group/:groupId", (req, res) => {

    const groupId =
        req.params.groupId;

    const sql = `
        SELECT
            payout_schedule.id,
            payout_schedule.group_id,
            payout_schedule.member_id,
            members.name AS member_name,
            payout_schedule.amount,
            payout_schedule.payout_date,
            payout_schedule.status

        FROM payout_schedule

        INNER JOIN members
            ON payout_schedule.member_id = members.id

        WHERE payout_schedule.group_id = ?

        ORDER BY
            payout_schedule.payout_date ASC,
            payout_schedule.id ASC
    `;

    db.all(
        sql,
        [groupId],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }
    );

});

// ======================================================
// UPDATE PAYOUT SCHEDULE
// ======================================================

router.put("/:id", (req, res) => {

    const scheduleId =
        req.params.id;

    const {
        member_id,
        amount,
        payout_date,
        status
    } = req.body;

    // Validate required fields

    if (
        !member_id ||
        !amount ||
        Number(amount) <= 0 ||
        !payout_date ||
        !status
    ) {

        return res.status(400).json({
            error:
                "Member, amount, payout date and status are required."
        });

    }

    // ==================================================
    // PREVENT PAST PAYOUT DATE ON UPDATE
    // ==================================================

    const today =
        new Date().toISOString().split("T")[0];

    if (payout_date < today) {

        return res.status(400).json({
            error:
                "Payout date cannot be in the past."
        });

    }

    // ==================================================
    // UPDATE SCHEDULE
    // ==================================================

    const sql = `
        UPDATE payout_schedule

        SET
            member_id = ?,
            amount = ?,
            payout_date = ?,
            status = ?

        WHERE id = ?
    `;

    db.run(
        sql,
        [
            member_id,
            Number(amount),
            payout_date,
            status,
            scheduleId
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
                        "Payout schedule not found."
                });

            }

            res.json({

                message:
                    "Payout schedule updated successfully!"

            });

        }
    );

});

// ======================================================
// UPDATE PAYOUT SCHEDULE STATUS
// ======================================================

router.patch("/:id/status", (req, res) => {

    const scheduleId =
        req.params.id;

    const {
        status
    } = req.body;

    const allowedStatuses = [
        "Pending",
        "Paid"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({

            error:
                "Status must be Pending or Paid."

        });

    }

    // ==================================================
    // GET THE SCHEDULE FIRST
    // ==================================================

    const findSql = `
        SELECT
            id,
            member_id,
            amount,
            payout_date,
            status
        FROM payout_schedule
        WHERE id = ?
    `;

    db.get(
        findSql,
        [scheduleId],
        (err, schedule) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            if (!schedule) {

                return res.status(404).json({

                    error:
                        "Payout schedule not found."

                });

            }

            // ==========================================
            // MARK AS PENDING
            // ==========================================

            if (status === "Pending") {

                const sql = `
                    UPDATE payout_schedule
                    SET status = ?
                    WHERE id = ?
                `;

                db.run(
                    sql,
                    [
                        status,
                        scheduleId
                    ],
                    function (err) {

                        if (err) {

                            return res.status(500).json({
                                error: err.message
                            });

                        }

                        res.json({

                            message:
                                "Payout schedule marked as Pending."

                        });

                    }
                );

                return;
            }

            // ==========================================
            // MARK AS PAID
            // ==========================================

            // Prevent duplicate payout

            if (schedule.status === "Paid") {

                return res.status(400).json({

                    error:
                        "This payout schedule has already been marked as Paid."

                });

            }

            // ==========================================
            // CHECK MEMBER AVAILABLE BALANCE
            // ==========================================

            const balanceSql = `

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
                balanceSql,
                [
                    schedule.member_id,
                    schedule.member_id
                ],
                (balanceErr, balance) => {

                    if (balanceErr) {

                        return res.status(500).json({

                            error:
                                balanceErr.message

                        });

                    }

                    // ==========================================
                    // CALCULATE AVAILABLE BALANCE
                    // ==========================================

                    const totalContributions =
                        Number(
                            balance.totalContributions || 0
                        );

                    const totalPayouts =
                        Number(
                            balance.totalPayouts || 0
                        );

                    const availableBalance =
                        totalContributions -
                        totalPayouts;

                    const payoutAmount =
                        Number(
                            schedule.amount
                        );

                    // ==========================================
                    // PREVENT INSUFFICIENT BALANCE
                    // ==========================================

                    if (
                        payoutAmount >
                        availableBalance
                    ) {

                        return res.status(400).json({

                            error:
                                "Insufficient member balance.",

                            availableBalance:
                                availableBalance,

                            requestedAmount:
                                payoutAmount

                        });

                    }

                    // ==========================================
                    // RECORD PAYOUT
                    // ==========================================

                    const payoutSql = `

                        INSERT INTO payouts
                        (
                            member_id,
                            amount,
                            payout_date
                        )
                        VALUES (?, ?, ?)

                    `;

                    db.run(
                        payoutSql,
                        [
                            schedule.member_id,
                            payoutAmount,
                            schedule.payout_date
                        ],
                        function (err) {

                            if (err) {

                                return res.status(500).json({

                                    error:
                                        err.message

                                });

                            }

                            const payoutId =
                                this.lastID;

                            // ==================================
                            // UPDATE SCHEDULE STATUS
                            // ==================================

                            const updateSql = `

                                UPDATE payout_schedule

                                SET status = ?

                                WHERE id = ?

                            `;

                            db.run(
                                updateSql,
                                [
                                    "Paid",
                                    scheduleId
                                ],
                                function (err) {

                                    if (err) {

                                        return res.status(500).json({

                                            error:
                                                err.message

                                        });

                                    }

                                    res.json({

                                        message:
                                            "Payout schedule marked as Paid and payout recorded successfully!",

                                        payoutId:
                                            payoutId,

                                        availableBalanceBefore:
                                            availableBalance,

                                        payoutAmount:
                                            payoutAmount,

                                        availableBalanceAfter:
                                            availableBalance -
                                            payoutAmount

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

// ======================================================
// DELETE PAYOUT SCHEDULE
// ======================================================

router.delete("/:id", (req, res) => {

    const scheduleId =
        req.params.id;

    const sql = `
        DELETE FROM payout_schedule
        WHERE id = ?
    `;

    db.run(
        sql,
        [scheduleId],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            if (this.changes === 0) {

                return res.status(404).json({
                    error:
                        "Payout schedule not found."
                });

            }

            res.json({

                message:
                    "Payout schedule deleted successfully!"

            });

        }
    );

});

module.exports = router;