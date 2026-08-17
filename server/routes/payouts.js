const express = require("express");

const router = express.Router();

const db = require("../db");

console.log("Payouts routes loaded");

// ======================================================
// RECORD PAYOUT
// ======================================================

router.post("/:id/payouts", (req, res) => {

    console.log(
        "PAYOUT POST REQUEST:",
        req.params,
        req.body
    );

    const memberId = req.params.id;

    const {
        amount,
        payout_date
    } = req.body;


    // ==================================================
    // VALIDATE INPUT
    // ==================================================

    if (
        !amount ||
        Number(amount) <= 0 ||
        !payout_date
    ) {

        return res.status(400).json({

            error:
                "Enter a valid payout amount and payout date."

        });

    }


    // ==================================================
    // CHECK MEMBER BALANCE
    // ==================================================

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
            memberId,
            memberId
        ],
        (err, row) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            const totalContributions =
                Number(
                    row.totalContributions || 0
                );


            const totalPayouts =
                Number(
                    row.totalPayouts || 0
                );


            const balance =
                totalContributions -
                totalPayouts;


            const payoutAmount =
                Number(amount);


            console.log(
                "PAYOUT BALANCE:",
                {
                    memberId,
                    totalContributions,
                    totalPayouts,
                    balance,
                    payoutAmount
                }
            );


            // ==================================================
            // PREVENT INVALID PAYOUT
            // ==================================================

            if (
                balance <= 0 ||
                payoutAmount > balance
            ) {

                return res.status(400).json({

                    error:
                        `Insufficient balance. Available balance: ₦${balance.toLocaleString()}`

                });

            }


            // ==================================================
            // SAVE PAYOUT
            // ==================================================

            const sql = `
                INSERT INTO payouts
                (
                    member_id,
                    amount,
                    payout_date
                )
                VALUES (?, ?, ?)
            `;


            db.run(
                sql,
                [
                    memberId,
                    payoutAmount,
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
                            "Payout recorded successfully!",

                        payoutId:
                            this.lastID

                    });

                }
            );

        }
    );

});


// ======================================================
// GET MEMBER PAYOUTS
// ======================================================

router.get("/:id/payouts", (req, res) => {

    const memberId =
        req.params.id;


    const sql = `
        SELECT *
        FROM payouts
        WHERE member_id = ?
        ORDER BY payout_date DESC, id DESC
    `;


    db.all(
        sql,
        [memberId],
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
// UPDATE PAYOUT
// ======================================================

router.put("/payouts/:id", (req, res) => {

    const payoutId =
        req.params.id;


    const {
        amount,
        payout_date
    } = req.body;


    // ==================================================
    // VALIDATE INPUT
    // ==================================================

    if (
        !amount ||
        Number(amount) <= 0 ||
        !payout_date
    ) {

        return res.status(400).json({

            error:
                "Enter a valid payout amount and payout date."

        });

    }


    const newAmount =
        Number(amount);


    // ==================================================
    // FIND EXISTING PAYOUT
    // ==================================================

    const findSql = `
        SELECT
            id,
            member_id,
            amount
        FROM payouts
        WHERE id = ?
    `;


    db.get(
        findSql,
        [payoutId],
        (err, payout) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            if (!payout) {

                return res.status(404).json({

                    error:
                        "Payout not found."

                });

            }


            // ==================================================
            // CALCULATE CURRENT MEMBER BALANCE
            // ==================================================

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
                    payout.member_id,
                    payout.member_id
                ],
                (err, row) => {

                    if (err) {

                        return res.status(500).json({
                            error: err.message
                        });

                    }


                    const totalContributions =
                        Number(
                            row.totalContributions || 0
                        );


                    const totalPayouts =
                        Number(
                            row.totalPayouts || 0
                        );


                    const oldAmount =
                        Number(
                            payout.amount || 0
                        );


                    // ==================================================
                    // RESTORE OLD PAYOUT
                    // ==================================================

                    const balanceAvailableForEdit =
                        totalContributions -
                        (
                            totalPayouts -
                            oldAmount
                        );


                    console.log(
                        "PAYOUT EDIT BALANCE:",
                        {
                            payoutId,
                            oldAmount,
                            newAmount,
                            totalContributions,
                            totalPayouts,
                            balanceAvailableForEdit
                        }
                    );


                    // ==================================================
                    // PREVENT INVALID UPDATE
                    // ==================================================

                    if (
                        newAmount >
                        balanceAvailableForEdit
                    ) {

                        return res.status(400).json({

                            error:
                                `Insufficient balance. Available balance for this edit: ₦${balanceAvailableForEdit.toLocaleString()}`

                        });

                    }


                    // ==================================================
                    // UPDATE PAYOUT
                    // ==================================================

                    const updateSql = `
                        UPDATE payouts
                        SET
                            amount = ?,
                            payout_date = ?
                        WHERE id = ?
                    `;


                    db.run(
                        updateSql,
                        [
                            newAmount,
                            payout_date,
                            payoutId
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
                                        "Payout not found."

                                });

                            }


                            res.json({

                                message:
                                    "Payout updated successfully!"

                            });

                        }
                    );

                }
            );

        }
    );

});


// ======================================================
// DELETE PAYOUT
// ======================================================

router.delete("/payouts/:id", (req, res) => {

    const payoutId =
        req.params.id;


    const sql = `
        DELETE FROM payouts
        WHERE id = ?
    `;


    db.run(
        sql,
        [payoutId],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({

                    error:
                        "Payout not found."

                });

            }


            res.json({

                message:
                    "Payout deleted successfully!"

            });

        }
    );

});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;