const express = require("express");
const router = express.Router();

const db = require("../db");

console.log("Dashboard routes loaded");

// ======================================================
// GET DASHBOARD SUMMARY
// ======================================================

router.get("/summary", (req, res) => {

    const sql = `

        SELECT

            /* TOTAL GROUPS */
            (
                SELECT COUNT(*)
                FROM groups
            ) AS totalGroups,

            /* TOTAL MEMBERS */
            (
                SELECT COUNT(*)
                FROM members
            ) AS totalMembers,

            /* TOTAL CONTRIBUTIONS */
            (
                SELECT COALESCE(SUM(amount), 0)
                FROM contributions
            ) AS totalContributions,

            /* TOTAL PAYOUTS */
            (
                SELECT COALESCE(SUM(amount), 0)
                FROM payouts
            ) AS totalPayouts,

            /* PENDING PAYOUT SCHEDULE AMOUNT */
            (
                SELECT COALESCE(SUM(amount), 0)
                FROM payout_schedule
                WHERE status = 'Pending'
            ) AS pendingPayouts,

            /* NUMBER OF PENDING SCHEDULES */
            (
                SELECT COUNT(*)
                FROM payout_schedule
                WHERE status = 'Pending'
            ) AS pendingScheduleCount,

            /* NUMBER OF PAID SCHEDULES */
            (
                SELECT COUNT(*)
                FROM payout_schedule
                WHERE status = 'Paid'
            ) AS paidScheduleCount

    `;

    db.get(sql, [], (err, row) => {

        if (err) {

            console.error(
                "Dashboard summary error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });

        }

        // ==================================================
        // FINANCIAL CALCULATIONS
        // ==================================================

        const totalContributions =
            Number(
                row.totalContributions || 0
            );

        const totalPayouts =
            Number(
                row.totalPayouts || 0
            );

        const pendingPayouts =
            Number(
                row.pendingPayouts || 0
            );

        // Money currently available after
        // payouts that have already been made.
        const availableBalance =
            totalContributions -
            totalPayouts;

        // Money that would remain after
        // all pending payouts are paid.
        const remainingBalance =
            availableBalance -
            pendingPayouts;


        // ==================================================
        // SEND DASHBOARD SUMMARY
        // ==================================================

        res.json({

            totalGroups:
                Number(
                    row.totalGroups || 0
                ),

            totalMembers:
                Number(
                    row.totalMembers || 0
                ),

            totalContributions,

            totalPayouts,

            availableBalance,

            pendingPayouts,

            remainingBalance,

            pendingScheduleCount:
                Number(
                    row.pendingScheduleCount || 0
                ),

            paidScheduleCount:
                Number(
                    row.paidScheduleCount || 0
                )

        });

    });

});


// ======================================================
// GET UPCOMING PAYOUTS
// ======================================================

router.get(
    "/upcoming-payouts",
    (req, res) => {

        const sql = `

            SELECT

                payout_schedule.id,

                payout_schedule.amount,

                payout_schedule.payout_date,

                payout_schedule.status,

                members.name AS member_name,

                groups.name AS group_name

            FROM payout_schedule

            INNER JOIN members
                ON payout_schedule.member_id =
                   members.id

            INNER JOIN groups
                ON payout_schedule.group_id =
                   groups.id

            WHERE payout_schedule.status =
                'Pending'

            ORDER BY
                payout_schedule.payout_date ASC,
                payout_schedule.id ASC

            LIMIT 10

        `;

        db.all(
            sql,
            [],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Upcoming payout error:",
                        err
                    );

                    return res.status(500).json({
                        error: err.message
                    });

                }

                // ==========================================
                // TODAY
                // ==========================================

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                // ==========================================
                // ADD PAYOUT TIMING INFORMATION
                // ==========================================

                const result =
                    rows.map(
                        payout => {

                            const payoutDate =
                                new Date(
                                    payout.payout_date +
                                    "T00:00:00"
                                );


                            const difference =
                                payoutDate.getTime() -
                                today.getTime();


                            const daysRemaining =
                                Math.ceil(
                                    difference /
                                    (
                                        1000 *
                                        60 *
                                        60 *
                                        24
                                    )
                                );


                            let timing =
                                "Upcoming";


                            if (
                                daysRemaining < 0
                            ) {

                                timing =
                                    "Overdue";

                            }

                            else if (
                                daysRemaining === 0
                            ) {

                                timing =
                                    "Due Today";

                            }

                            else if (
                                daysRemaining === 1
                            ) {

                                timing =
                                    "Due Tomorrow";

                            }


                            return {

                                id:
                                    payout.id,

                                member_name:
                                    payout.member_name,

                                group_name:
                                    payout.group_name,

                                amount:
                                    Number(
                                        payout.amount
                                    ),

                                payout_date:
                                    payout.payout_date,

                                status:
                                    payout.status,

                                daysRemaining,

                                timing

                            };

                        }
                    );


                res.json(result);

            }
        );

    }
);


// ======================================================
// GET AJO HEALTH
// ======================================================

router.get(
    "/health",
    (req, res) => {

        const sql = `

            SELECT

                /* TOTAL CONTRIBUTIONS */
                (
                    SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        )

                    FROM contributions

                ) AS contributions,


                /* TOTAL PAID OUT */
                (
                    SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        )

                    FROM payouts

                ) AS payouts,


                /* TOTAL PENDING PAYOUTS */
                (
                    SELECT
                        COALESCE(
                            SUM(amount),
                            0
                        )

                    FROM payout_schedule

                    WHERE status = 'Pending'

                ) AS scheduled

        `;


        db.get(
            sql,
            [],
            (err, row) => {

                if (err) {

                    console.error(
                        "Ajo health error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            err.message
                    });

                }


                const contributions =
                    Number(
                        row.contributions || 0
                    );


                const payouts =
                    Number(
                        row.payouts || 0
                    );


                const scheduled =
                    Number(
                        row.scheduled || 0
                    );


                // ==========================================
                // AVAILABLE BALANCE
                // ==========================================

                const availableBalance =
                    contributions -
                    payouts;


                // ==========================================
                // BALANCE AFTER PENDING PAYOUTS
                // ==========================================

                const remainingBalance =
                    availableBalance -
                    scheduled;


                let status;

                let message;


                // ==========================================
                // HEALTH LOGIC
                // ==========================================

                if (
                    scheduled >
                    availableBalance
                ) {

                    status =
                        "At Risk";

                    message =
                        "Upcoming payouts are higher than the currently available balance.";

                }

                else if (
                    scheduled === 0
                ) {

                    status =
                        "Healthy";

                    message =
                        "There are currently no pending payouts.";

                }

                else if (
                    remainingBalance <= 0
                ) {

                    status =
                        "At Risk";

                    message =
                        "Pending payouts will use all available funds.";

                }

                else if (
                    remainingBalance <
                    contributions * 0.20
                ) {

                    status =
                        "Attention Needed";

                    message =
                        "Upcoming payouts will use a large part of the available funds.";

                }

                else {

                    status =
                        "Healthy";

                    message =
                        "The Ajo cycle currently has enough funds for its scheduled payouts.";

                }


                // ==========================================
                // SEND RESPONSE
                // ==========================================

                res.json({

                    status,

                    message,

                    contributions,

                    payouts,

                    scheduled,

                    availableBalance,

                    remainingBalance

                });

            }
        );

    }
);


// ======================================================
// GET LOAN DASHBOARD SUMMARY
// ======================================================

router.get("/loans", (req, res) => {

    const sql = `
        SELECT

            /* TOTAL NUMBER OF LOANS */
            (
                SELECT COUNT(*)
                FROM loans
            ) AS totalLoans,

            /* ACTIVE LOANS */
            (
                SELECT COUNT(*)
                FROM loans
                WHERE status = 'Active'
            ) AS activeLoans,

            /* TOTAL PRINCIPAL LOANED */
            (
                SELECT COALESCE(
                    SUM(principal_amount),
                    0
                )
                FROM loans
            ) AS totalLoaned,

            /* CURRENT OUTSTANDING BALANCE */
            (
                SELECT COALESCE(
                    SUM(outstanding_balance),
                    0
                )
                FROM loans
                WHERE status = 'Active'
            ) AS outstandingLoans,

            /* TOTAL REPAYMENTS RECEIVED */
            (
                SELECT COALESCE(
                    SUM(amount),
                    0
                )
                FROM loan_repayments
            ) AS totalLoanRepayments,

            /* TOTAL INTEREST */
            (
                SELECT COALESCE(
                    SUM(interest_amount),
                    0
                )
                FROM loans
            ) AS totalInterest

    `;

    db.get(sql, [], (err, row) => {

        if (err) {

            console.error(
                "Dashboard loan summary error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });

        }

        return res.json({

            totalLoans:
                Number(row.totalLoans || 0),

            activeLoans:
                Number(row.activeLoans || 0),

            totalLoaned:
                Number(row.totalLoaned || 0),

            outstandingLoans:
                Number(row.outstandingLoans || 0),

            totalLoanRepayments:
                Number(row.totalLoanRepayments || 0),

            totalInterest:
                Number(row.totalInterest || 0)

        });

    });

});

// ======================================================
// GET LOAN DASHBOARD ACTIVITY
// ======================================================

router.get("/loan-activity", (req, res) => {

    const sql = `
        SELECT
            loans.id,
            loans.principal_amount,
            loans.interest_rate,
            loans.interest_amount,
            loans.total_amount,
            loans.total_repayment,
            loans.amount_repaid,
            loans.outstanding_balance,
            loans.status,
            loans.loan_date,

            COALESCE(
                loans.due_date,
                (
                    SELECT MAX(due_date)
                    FROM loan_repayment_schedule
                    WHERE loan_id = loans.id
                )
            ) AS due_date,

            members.name AS member_name,
            groups.name AS group_name

        FROM loans

        INNER JOIN members
            ON members.id = loans.member_id

        INNER JOIN groups
            ON groups.id = loans.group_id

        ORDER BY loans.id DESC

        LIMIT 20
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Dashboard loan activity error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });

        }

        const result = rows.map(loan => {

            const totalRepayment =
                Number(
                    loan.total_repayment || 0
                );

            const amountRepaid =
                Number(
                    loan.amount_repaid || 0
                );

            let repaymentProgress = 0;

            if (totalRepayment > 0) {

                repaymentProgress =
                    (
                        amountRepaid /
                        totalRepayment
                    ) * 100;

            }

            repaymentProgress =
                Math.min(
                    100,
                    Math.max(
                        0,
                        repaymentProgress
                    )
                );

            return {

                id:
                    loan.id,

                memberName:
                    loan.member_name,

                groupName:
                    loan.group_name,

                principalAmount:
                    Number(
                        loan.principal_amount || 0
                    ),

                interestRate:
                    Number(
                        loan.interest_rate || 0
                    ),

                interestAmount:
                    Number(
                        loan.interest_amount || 0
                    ),

                totalAmount:
                    Number(
                        loan.total_amount || 0
                    ),

                totalRepayment,

                amountRepaid,

                outstandingBalance:
                    Number(
                        loan.outstanding_balance || 0
                    ),

                repaymentProgress:
                    Number(
                        repaymentProgress.toFixed(2)
                    ),

                status:
                    loan.status,

                loanDate:
                    loan.loan_date,

                dueDate:
                    loan.due_date

            };

        });

        return res.json(result);

    });

});


module.exports = router;