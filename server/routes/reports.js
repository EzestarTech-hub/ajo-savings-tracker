const express = require("express");
const db = require("../db");

const router = express.Router();


router.get("/contributions", (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS contribution_count,
            COALESCE(SUM(amount), 0) AS total_contributions
        FROM contributions
    `;

    db.get(sql, [], (err, row) => {

        if (err) {

            console.error(
                "Contribution report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            contributionCount:
                row.contribution_count,

            totalContributions:
                row.total_contributions
        });

    });

});

router.get("/contributions/by-group", (req, res) => {

    const sql = `
        SELECT
            g.id AS group_id,
            g.name AS group_name,
            COUNT(c.id) AS contribution_count,
            COALESCE(SUM(c.amount), 0) AS total_contributions
        FROM groups g
        LEFT JOIN members m
            ON m.group_id = g.id
        LEFT JOIN contributions c
            ON c.member_id = m.id
        GROUP BY
            g.id,
            g.name
        ORDER BY
            g.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Group contribution report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});

router.get("/contributions/by-member", (req, res) => {

    const sql = `
        SELECT
            m.id AS member_id,
            m.name AS member_name,
            g.name AS group_name,
            COUNT(c.id) AS contribution_count,
            COALESCE(SUM(c.amount), 0) AS total_contributions
        FROM members m
        LEFT JOIN groups g
            ON g.id = m.group_id
        LEFT JOIN contributions c
            ON c.member_id = m.id
        GROUP BY
            m.id,
            m.name,
            g.name
        ORDER BY
            m.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Member contribution report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});

router.get("/loans", (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS total_loans,

            SUM(
                CASE
                    WHEN status = 'Active'
                    THEN 1
                    ELSE 0
                END
            ) AS active_loans,

            SUM(
                CASE
                    WHEN status = 'Paid'
                    THEN 1
                    ELSE 0
                END
            ) AS paid_loans,

            COALESCE(
                SUM(principal_amount),
                0
            ) AS total_loaned,

            COALESCE(
                SUM(interest_amount),
                0
            ) AS total_interest,

            COALESCE(
                SUM(amount_repaid),
                0
            ) AS total_repaid,

            COALESCE(
                SUM(outstanding_balance),
                0
            ) AS total_outstanding

        FROM loans
    `;

    db.get(sql, [], (err, row) => {

        if (err) {

            console.error(
                "Loan report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            totalLoans:
                row.total_loans || 0,

            activeLoans:
                row.active_loans || 0,

            paidLoans:
                row.paid_loans || 0,

            totalLoaned:
                row.total_loaned || 0,

            totalInterest:
                row.total_interest || 0,

            totalRepaid:
                row.total_repaid || 0,

            totalOutstanding:
                row.total_outstanding || 0
        });

    });

});

router.get("/loans/by-group", (req, res) => {

    const sql = `
        SELECT
            g.id AS group_id,
            g.name AS group_name,

            COUNT(l.id) AS loan_count,

            COALESCE(
                SUM(l.principal_amount),
                0
            ) AS total_loaned,

            COALESCE(
                SUM(l.interest_amount),
                0
            ) AS total_interest,

            COALESCE(
                SUM(l.amount_repaid),
                0
            ) AS total_repaid,

            COALESCE(
                SUM(l.outstanding_balance),
                0
            ) AS total_outstanding

        FROM groups g

        LEFT JOIN loans l
            ON l.group_id = g.id

        GROUP BY
            g.id,
            g.name

        ORDER BY
            g.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Group loan report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});

router.get("/loans/by-member", (req, res) => {

    const sql = `
        SELECT
            m.id AS member_id,
            m.name AS member_name,
            g.name AS group_name,

            COUNT(l.id) AS loan_count,

            COALESCE(
                SUM(l.principal_amount),
                0
            ) AS total_loaned,

            COALESCE(
                SUM(l.interest_amount),
                0
            ) AS total_interest,

            COALESCE(
                SUM(l.amount_repaid),
                0
            ) AS total_repaid,

            COALESCE(
                SUM(l.outstanding_balance),
                0
            ) AS total_outstanding

        FROM members m

        INNER JOIN loans l
            ON l.member_id = m.id

        INNER JOIN groups g
            ON g.id = m.group_id

        GROUP BY
            m.id,
            m.name,
            g.name

        ORDER BY
            m.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Member loan report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});


// ======================================================
// PAYOUT SUMMARY
// ======================================================

router.get("/payouts", (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS payout_count,
            COALESCE(SUM(amount), 0) AS total_payouts
        FROM payouts
    `;

    db.get(sql, [], (err, row) => {

        if (err) {

            console.error(
                "Payout report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            payoutCount:
                row.payout_count,

            totalPayouts:
                row.total_payouts
        });

    });

});

// ======================================================
// PAYOUTS BY GROUP
// ======================================================

router.get("/payouts/by-group", (req, res) => {

    const sql = `
        SELECT
            g.id AS group_id,
            g.name AS group_name,
            COUNT(p.id) AS payout_count,
            COALESCE(SUM(p.amount), 0) AS total_payouts

        FROM groups g

        LEFT JOIN members m
            ON m.group_id = g.id

        LEFT JOIN payouts p
            ON p.member_id = m.id

        GROUP BY
            g.id,
            g.name

        ORDER BY
            g.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Group payout report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});


// ======================================================
// PAYOUTS BY MEMBER
// ======================================================

router.get("/payouts/by-member", (req, res) => {

    const sql = `
        SELECT
            m.id AS member_id,
            m.name AS member_name,
            g.name AS group_name,
            COUNT(p.id) AS payout_count,
            COALESCE(SUM(p.amount), 0) AS total_payouts

        FROM members m

        INNER JOIN payouts p
            ON p.member_id = m.id

        INNER JOIN groups g
            ON g.id = m.group_id

        GROUP BY
            m.id,
            m.name,
            g.name

        ORDER BY
            m.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Member payout report error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    });

});

module.exports = router;