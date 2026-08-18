const express = require("express");
const router = express.Router();
const db = require("../db");

console.log("Loans routes loaded");

// ======================================================
// CREATE LOAN
// ======================================================

router.post("/", (req, res) => {
    const {
        group_id,
        member_id,
        principal_amount,
        start_date
    } = req.body;

    const groupId = Number(group_id);
    const memberId = Number(member_id);
    const principalAmount = Number(principal_amount);

    // ==================================================
    // BASIC VALIDATION
    // ==================================================

    if (!Number.isInteger(groupId) || groupId <= 0) {
        return res.status(400).json({
            error: "Valid group ID is required."
        });
    }

    if (!Number.isInteger(memberId) || memberId <= 0) {
        return res.status(400).json({
            error: "Valid member ID is required."
        });
    }

    if (
        !Number.isFinite(principalAmount) ||
        principalAmount <= 0
    ) {
        return res.status(400).json({
            error: "Loan amount must be greater than zero."
        });
    }

    if (!start_date) {
        return res.status(400).json({
            error: "Loan start date is required."
        });
    }

    // ==================================================
    // GET GROUP
    // ==================================================

    const groupSql = `
        SELECT
            id,
            name,
            group_type,
            loan_interest_rate,
            loan_repayment_months
        FROM groups
        WHERE id = ?
    `;

    db.get(
        groupSql,
        [groupId],
        (groupErr, group) => {
            if (groupErr) {
                console.error(
                    "Get group for loan error:",
                    groupErr
                );

                return res.status(500).json({
                    error: groupErr.message
                });
            }

            if (!group) {
                return res.status(404).json({
                    error: "Group not found."
                });
            }

            // ==================================================
            // ONLY COOPERATIVE GROUPS CAN USE LOANS
            // ==================================================

            if (
                String(group.group_type).toLowerCase() !==
                "cooperative"
            ) {
                return res.status(400).json({
                    error:
                        "Loans are only available for Cooperative Ajo groups."
                });
            }

            // ==================================================
            // GET MEMBER
            // ==================================================

            const memberSql = `
                SELECT
                    id,
                    name,
                    group_id
                FROM members
                WHERE id = ?
            `;

            db.get(
                memberSql,
                [memberId],
                (memberErr, member) => {
                    if (memberErr) {
                        console.error(
                            "Get member for loan error:",
                            memberErr
                        );

                        return res.status(500).json({
                            error: memberErr.message
                        });
                    }

                    if (!member) {
                        return res.status(404).json({
                            error: "Member not found."
                        });
                    }

                    // ==================================================
                    // MEMBER MUST BELONG TO GROUP
                    // ==================================================

                    if (
                        Number(member.group_id) !==
                        groupId
                    ) {
                        return res.status(400).json({
                            error:
                                "This member does not belong to this group."
                        });
                    }

                    // ==================================================
                    // GET MEMBER CONTRIBUTIONS
                    // ==================================================

                    const contributionSql = `
                        SELECT
                            COALESCE(SUM(amount), 0)
                            AS total_contributions
                        FROM contributions
                        WHERE member_id = ?
                    `;

                    db.get(
                        contributionSql,
                        [memberId],
                        (
                            contributionErr,
                            contributionData
                        ) => {
                            if (contributionErr) {
                                console.error(
                                    "Get member contribution error:",
                                    contributionErr
                                );

                                return res.status(500).json({
                                    error:
                                        contributionErr.message
                                });
                            }

                            const totalContributions =
                                Number(
                                    contributionData.total_contributions ||
                                    0
                                );

                            // ==================================================
                            // MEMBER MUST HAVE CONTRIBUTED
                            // ==================================================

                            if (
                                totalContributions <=
                                0
                            ) {
                                return res.status(400).json({
                                    error:
                                        "This member is not eligible for a loan because no contribution has been recorded.",
                                    totalContributions: 0,
                                    maximumLoan: 0
                                });
                            }

                            // ==================================================
                            // MAXIMUM LOAN = 3 × CONTRIBUTIONS
                            // ==================================================

                            const maximumLoan =
                                totalContributions * 3;

                            // ==================================================
                            // CHECK LOAN LIMIT
                            // ==================================================

                            if (
                                principalAmount >
                                maximumLoan
                            ) {
                                return res.status(400).json({
                                    error:
                                        `Loan amount exceeds the member's maximum loan limit of ₦${maximumLoan.toLocaleString()} (3× total contribution).`,
                                    totalContributions:
                                        totalContributions,
                                    maximumLoan:
                                        maximumLoan,
                                    requestedLoan:
                                        principalAmount
                                });
                            }

                            // ==================================================
                            // CHECK EXISTING ACTIVE LOAN
                            // ==================================================

                            const existingLoanSql = `
                                SELECT
                                    id,
                                    outstanding_balance,
                                    status
                                FROM loans
                                WHERE member_id = ?
                                AND group_id = ?
                                AND status = 'Active'
                                AND outstanding_balance > 0
                                LIMIT 1
                            `;

                            db.get(
                                existingLoanSql,
                                [
                                    memberId,
                                    groupId
                                ],
                                (
                                    existingLoanErr,
                                    existingLoan
                                ) => {
                                    if (
                                        existingLoanErr
                                    ) {
                                        console.error(
                                            "Check existing loan error:",
                                            existingLoanErr
                                        );

                                        return res.status(500).json({
                                            error:
                                                existingLoanErr.message
                                        });
                                    }

                                    // ==================================================
                                    // PREVENT MULTIPLE ACTIVE LOANS
                                    // ==================================================

                                    if (existingLoan) {
                                        return res.status(400).json({
                                            error:
                                                `This member already has an active loan with an outstanding balance of ₦${Number(
                                                    existingLoan.outstanding_balance
                                                ).toLocaleString()}.`
                                        });
                                    }

                                    // ==================================================
                                    // GET LOAN SETTINGS
                                    // ==================================================

                                    const interestRate =
                                        Number(
                                            group.loan_interest_rate ||
                                            0
                                        );

                                    const repaymentMonths =
                                        Number(
                                            group.loan_repayment_months ||
                                            0
                                        );

                                    // ==================================================
                                    // VALIDATE INTEREST RATE
                                    // ==================================================

                                    if (
                                        interestRate <=
                                        0
                                    ) {
                                        return res.status(400).json({
                                            error:
                                                "This cooperative has not configured a valid loan interest rate."
                                        });
                                    }

                                    // ==================================================
                                    // VALIDATE REPAYMENT PERIOD
                                    // ==================================================

                                    if (
                                        !Number.isInteger(
                                            repaymentMonths
                                        ) ||
                                        repaymentMonths <=
                                        0
                                    ) {
                                        return res.status(400).json({
                                            error:
                                                "This cooperative has not configured a valid loan repayment period."
                                        });
                                    }

                                    // ==================================================
                                    // CALCULATE INTEREST
                                    // ==================================================

                                    const interestAmount =
                                        principalAmount *
                                        (interestRate / 100);

                                    // ==================================================
                                    // TOTAL REPAYMENT
                                    // ==================================================

                                    const totalRepayment =
                                        principalAmount +
                                        interestAmount;

                                    // ==================================================
                                    // MONTHLY REPAYMENT
                                    // ==================================================

                                    const monthlyRepayment =
                                        totalRepayment /
                                        repaymentMonths;

                                    // ==================================================
                                    // FINAL DUE DATE
                                    // ==================================================

                                    const finalDueDate =
                                        calculateFinalDueDate(
                                            start_date,
                                            repaymentMonths
                                        );

                                    // ==================================================
                                    // INSERT LOAN
                                    // ==================================================

                                    const insertLoanSql = `
                                        INSERT INTO loans (
                                            group_id,
                                            member_id,
                                            principal_amount,
                                            interest_rate,
                                            interest_amount,
                                            total_amount,
                                            loan_date,
                                            due_date,
                                            status,
                                            total_repayment,
                                            repayment_months,
                                            amount_repaid,
                                            outstanding_balance,
                                            start_date
                                        )
                                        VALUES (
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?,
                                            ?
                                        )
                                    `;

                                    db.run(
                                        insertLoanSql,
                                        [
                                            groupId,
                                            memberId,
                                            principalAmount,
                                            interestRate,
                                            interestAmount,
                                            totalRepayment,
                                            start_date,
                                            finalDueDate,
                                            "Active",
                                            totalRepayment,
                                            repaymentMonths,
                                            0,
                                            totalRepayment,
                                            start_date
                                        ],
                                        function (loanErr) {
                                            if (loanErr) {
                                                console.error(
                                                    "Create loan error:",
                                                    loanErr
                                                );

                                                return res.status(500).json({
                                                    error:
                                                        loanErr.message
                                                });
                                            }

                                            const loanId =
                                                this.lastID;

                                            // ==================================================
                                            // CREATE REPAYMENT SCHEDULE
                                            // ==================================================

                                            createRepaymentSchedule(
                                                loanId,
                                                memberId,
                                                totalRepayment,
                                                repaymentMonths,
                                                start_date,
                                                (scheduleErr) => {
                                                    if (
                                                        scheduleErr
                                                    ) {
                                                        console.error(
                                                            "Create loan schedule error:",
                                                            scheduleErr
                                                        );

                                                        return res.status(500).json({
                                                            error:
                                                                scheduleErr.message
                                                        });
                                                    }

                                                    // ==================================================
                                                    // SUCCESS
                                                    // ==================================================

                                                    console.log(
                                                        "LOAN CREATED:",
                                                        {
                                                            loanId,
                                                            groupId,
                                                            memberId,
                                                            member:
                                                                member.name,
                                                            totalContributions,
                                                            maximumLoan,
                                                            principalAmount,
                                                            interestRate,
                                                            interestAmount,
                                                            totalRepayment,
                                                            repaymentMonths
                                                        }
                                                    );

                                                    return res.status(201).json({
                                                        message:
                                                            "Loan created successfully!",

                                                        loanId,

                                                        member:
                                                            member.name,

                                                        totalContributions,

                                                        maximumLoan,

                                                        principalAmount,

                                                        interestRate,

                                                        interestAmount,

                                                        totalRepayment,

                                                        repaymentMonths,

                                                        monthlyRepayment:
                                                            Number(
                                                                monthlyRepayment.toFixed(
                                                                    2
                                                                )
                                                            ),

                                                        outstandingBalance:
                                                            totalRepayment,

                                                        dueDate:
                                                            finalDueDate,

                                                        status:
                                                            "Active"
                                                    });
                                                }
                                            );
                                        }
                                    );
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
// CALCULATE FINAL DUE DATE
// ======================================================

function calculateFinalDueDate(
    startDate,
    repaymentMonths
) {
    const date = new Date(
        `${startDate}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    date.setMonth(
        date.getMonth() +
        repaymentMonths
    );

    return date
        .toISOString()
        .split("T")[0];
}

// ======================================================
// CREATE REPAYMENT SCHEDULE
// ======================================================

function createRepaymentSchedule(
    loanId,
    memberId,
    totalRepayment,
    repaymentMonths,
    startDate,
    callback
) {
    const monthlyAmount =
        totalRepayment /
        repaymentMonths;

    const start = new Date(
        `${startDate}T00:00:00`
    );

    if (Number.isNaN(start.getTime())) {
        callback(
            new Error(
                "Invalid loan start date."
            )
        );

        return;
    }

    let completed = 0;

    function addNextCycle() {
        if (
            completed >=
            repaymentMonths
        ) {
            callback(null);
            return;
        }

        const cycleNumber =
            completed + 1;

        const dueDate =
            new Date(start);

        dueDate.setMonth(
            dueDate.getMonth() +
            cycleNumber
        );

        const dueDateString =
            dueDate
                .toISOString()
                .split("T")[0];

        let expectedAmount =
            monthlyAmount;

        // ==================================================
        // FINAL PAYMENT ROUNDING
        // ==================================================

        if (
            cycleNumber ===
            repaymentMonths
        ) {
            expectedAmount =
                totalRepayment -
                (
                    monthlyAmount *
                    (repaymentMonths - 1)
                );
        }

        const scheduleSql = `
            INSERT INTO loan_repayment_schedule (
                loan_id,
                member_id,
                cycle_number,
                due_date,
                expected_amount,
                paid_amount,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
            scheduleSql,
            [
                loanId,
                memberId,
                cycleNumber,
                dueDateString,
                Number(
                    expectedAmount.toFixed(2)
                ),
                0,
                "Pending"
            ],
            (err) => {
                if (err) {
                    callback(err);
                    return;
                }

                completed++;

                addNextCycle();
            }
        );
    }

    addNextCycle();
}

// ======================================================
// GET MEMBER LOANS
// ======================================================

router.get(
    "/member/:memberId",
    (req, res) => {
        const memberId =
            Number(
                req.params.memberId
            );

        if (
            !Number.isInteger(memberId) ||
            memberId <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid member ID."
            });
        }

        const sql = `
            SELECT
                loans.*,
                groups.name AS group_name,
                members.name AS member_name
            FROM loans
            INNER JOIN groups
                ON groups.id =
                   loans.group_id
            INNER JOIN members
                ON members.id =
                   loans.member_id
            WHERE loans.member_id = ?
            ORDER BY loans.id DESC
        `;

        db.all(
            sql,
            [memberId],
            (err, rows) => {
                if (err) {
                    console.error(
                        "Get member loans error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            err.message
                    });
                }

                return res.json(rows);
            }
        );
    }
);

// ======================================================
// GET SINGLE LOAN
// ======================================================

router.get(
    "/:id",
    (req, res) => {
        const loanId =
            Number(
                req.params.id
            );

        if (
            !Number.isInteger(loanId) ||
            loanId <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid loan ID."
            });
        }

        const loanSql = `
            SELECT
                loans.*,
                groups.name AS group_name,
                members.name AS member_name
            FROM loans
            INNER JOIN groups
                ON groups.id =
                   loans.group_id
            INNER JOIN members
                ON members.id =
                   loans.member_id
            WHERE loans.id = ?
        `;

        db.get(
            loanSql,
            [loanId],
            (err, loan) => {
                if (err) {
                    console.error(
                        "Get loan error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            err.message
                    });
                }

                if (!loan) {
                    return res.status(404).json({
                        error:
                            "Loan not found."
                    });
                }

                // ==================================================
                // GET REPAYMENT SCHEDULE
                // ==================================================

                const scheduleSql = `
                    SELECT *
                    FROM loan_repayment_schedule
                    WHERE loan_id = ?
                    ORDER BY cycle_number ASC
                `;

                db.all(
                    scheduleSql,
                    [loanId],
                    (
                        scheduleErr,
                        schedule
                    ) => {
                        if (scheduleErr) {
                            console.error(
                                "Get loan schedule error:",
                                scheduleErr
                            );

                            return res.status(500).json({
                                error:
                                    scheduleErr.message
                            });
                        }

                        // ==================================================
                        // GET REPAYMENT HISTORY
                        // ==================================================

                        const repaymentSql = `
                            SELECT *
                            FROM loan_repayments
                            WHERE loan_id = ?
                            ORDER BY id DESC
                        `;

                        db.all(
                            repaymentSql,
                            [loanId],
                            (
                                repaymentErr,
                                repayments
                            ) => {
                                if (
                                    repaymentErr
                                ) {
                                    console.error(
                                        "Get loan repayments error:",
                                        repaymentErr
                                    );

                                    return res.status(500).json({
                                        error:
                                            repaymentErr.message
                                    });
                                }

                                return res.json({
                                    loan,
                                    schedule,
                                    repayments
                                });
                            }
                        );
                    }
                );
            }
        );
    }
);
// ======================================================
// RECORD LOAN REPAYMENT
// ======================================================

router.post(
    "/:id/repay",
    (req, res) => {

        const loanId =
            Number(req.params.id);

        const amount =
            Number(req.body.amount);

        const repaymentDate =
            req.body.repayment_date ||
            new Date()
                .toISOString()
                .split("T")[0];

        const requestedCycle =
            Number(req.body.cycle_number);

        // ==================================================
        // VALIDATE LOAN ID
        // ==================================================

        if (
            !Number.isInteger(loanId) ||
            loanId <= 0
        ) {
            return res.status(400).json({
                error:
                    "Invalid loan ID."
            });
        }

        // ==================================================
        // VALIDATE REPAYMENT AMOUNT
        // ==================================================

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                error:
                    "Repayment amount must be greater than zero."
            });
        }

        // ==================================================
        // GET LOAN
        // ==================================================

        const loanSql = `
            SELECT *
            FROM loans
            WHERE id = ?
        `;

        db.get(
            loanSql,
            [loanId],
            (loanErr, loan) => {

                if (loanErr) {

                    console.error(
                        "Get loan for repayment error:",
                        loanErr
                    );

                    return res.status(500).json({
                        error:
                            loanErr.message
                    });
                }

                if (!loan) {

                    return res.status(404).json({
                        error:
                            "Loan not found."
                    });
                }

                // ==================================================
                // LOAN MUST BE ACTIVE
                // ==================================================

                if (
                    loan.status !==
                    "Active"
                ) {

                    return res.status(400).json({
                        error:
                            "This loan is already fully repaid."
                    });
                }

                const outstanding =
                    Number(
                        loan.outstanding_balance ||
                        0
                    );

                // ==================================================
                // REPAYMENT CANNOT EXCEED BALANCE
                // ==================================================

                if (
                    amount >
                    outstanding
                ) {

                    return res.status(400).json({
                        error:
                            `Repayment exceeds outstanding balance of ₦${outstanding.toLocaleString()}.`
                    });
                }

                // ==================================================
                // GET NEXT UNPAID CYCLE
                // ==================================================

                const cycleSql = `
                    SELECT *
                    FROM loan_repayment_schedule
                    WHERE loan_id = ?
                    AND status != 'Paid'
                    ORDER BY cycle_number ASC
                    LIMIT 1
                `;

                db.get(
                    cycleSql,
                    [loanId],
                    (
                        cycleErr,
                        cycle
                    ) => {

                        if (cycleErr) {

                            console.error(
                                "Get repayment cycle error:",
                                cycleErr
                            );

                            return res.status(500).json({
                                error:
                                    cycleErr.message
                            });
                        }

                        // ==================================================
                        // DETERMINE CYCLE NUMBER
                        // ==================================================

                        const cycleNumber =
                            Number.isInteger(
                                requestedCycle
                            ) &&
                            requestedCycle > 0
                                ? requestedCycle
                                : cycle
                                    ? cycle.cycle_number
                                    : 1;

                        // ==================================================
                        // CALCULATE NEW BALANCES
                        // ==================================================

                        const newAmountRepaid =
                            Number(
                                loan.amount_repaid ||
                                0
                            ) + amount;

                        const newOutstanding =
                            Math.max(
                                0,
                                outstanding - amount
                            );

                        const newStatus =
                            newOutstanding <= 0
                                ? "Paid"
                                : "Active";

                        // ==================================================
                        // UPDATE LOAN
                        // ==================================================

                        const updateLoanSql = `
                            UPDATE loans
                            SET
                                amount_repaid = ?,
                                outstanding_balance = ?,
                                status = ?
                            WHERE id = ?
                        `;

                        db.run(
                            updateLoanSql,
                            [
                                newAmountRepaid,
                                newOutstanding,
                                newStatus,
                                loanId
                            ],
                            (updateErr) => {

                                if (updateErr) {

                                    console.error(
                                        "Update loan repayment error:",
                                        updateErr
                                    );

                                    return res.status(500).json({
                                        error:
                                            updateErr.message
                                    });
                                }

                                // ==================================================
                                // RECORD REPAYMENT
                                // ==================================================

                                const repaymentSql = `
                                    INSERT INTO loan_repayments (
                                        loan_id,
                                        member_id,
                                        amount,
                                        payment_date,
                                        cycle_number
                                    )
                                    VALUES (?, ?, ?, ?, ?)
                                `;

                                db.run(
                                    repaymentSql,
                                    [
                                        loanId,
                                        loan.member_id,
                                        amount,
                                        repaymentDate,
                                        cycleNumber
                                    ],
                                    function (
                                        repaymentErr
                                    ) {

                                        if (repaymentErr) {

                                            console.error(
                                                "Record repayment error:",
                                                repaymentErr
                                            );

                                            return res.status(500).json({
                                                error:
                                                    repaymentErr.message
                                            });
                                        }

                                        const repaymentId =
                                            this.lastID;

                                        // ==================================================
// UPDATE REPAYMENT SCHEDULE
// ==================================================

const scheduleSql = `
    SELECT *
    FROM loan_repayment_schedule
    WHERE loan_id = ?
    AND status != 'Paid'
    ORDER BY cycle_number ASC
`;

db.all(
    scheduleSql,
    [loanId],
    (scheduleErr, schedules) => {

        if (scheduleErr) {

            console.error(
                "Get repayment schedules error:",
                scheduleErr
            );

            return sendRepaymentResponse();

        }

        let remainingAmount =
            amount;

        let completed =
            0;

        function updateNextSchedule() {

            if (
                remainingAmount <= 0 ||
                completed >= schedules.length
            ) {

                return sendRepaymentResponse();

            }

            const currentSchedule =
                schedules[completed];

            const expectedAmount =
                Number(
                    currentSchedule.expected_amount ||
                    0
                );

            const alreadyPaid =
                Number(
                    currentSchedule.paid_amount ||
                    0
                );

            const remainingForCycle =
                Math.max(
                    0,
                    expectedAmount -
                    alreadyPaid
                );

            const amountForCycle =
                Math.min(
                    remainingAmount,
                    remainingForCycle
                );

            const newPaidAmount =
                alreadyPaid +
                amountForCycle;

            const newStatus =
                newPaidAmount >=
                expectedAmount
                    ? "Paid"
                    : "Partially Paid";

            const updateScheduleSql = `
                UPDATE loan_repayment_schedule
                SET
                    paid_amount = ?,
                    status = ?
                WHERE id = ?
            `;

            db.run(
    updateScheduleSql,
    [
        newPaidAmount,
        newStatus,
        currentSchedule.id
    ],
    (scheduleUpdateErr) => {

        if (scheduleUpdateErr) {

            console.error(
                "Schedule update error:",
                scheduleUpdateErr
            );

            return sendRepaymentResponse();

        }

        // ==================================================
        // RECORD REPAYMENT ALLOCATION
        // ==================================================

        const allocationSql = `
            INSERT INTO loan_repayment_allocations (
                repayment_id,
                loan_id,
                cycle_number,
                allocated_amount
            )
            VALUES (?, ?, ?, ?)
        `;

        db.run(
            allocationSql,
            [
                repaymentId,
                loanId,
                currentSchedule.cycle_number,
                amountForCycle
            ],
            (allocationErr) => {

                if (allocationErr) {

                    console.error(
                        "Repayment allocation error:",
                        allocationErr
                    );

                    return sendRepaymentResponse();

                }

                remainingAmount -=
                    amountForCycle;

                completed++;

                updateNextSchedule();

            }
        );

    }
);

        }

        updateNextSchedule();

    }
);

                                        // ==================================================
                                        // SEND RESPONSE
                                        // ==================================================

                                        function sendRepaymentResponse() {

                                            return res.json({

                                                message:
                                                    newStatus ===
                                                    "Paid"
                                                        ? "Loan fully repaid!"
                                                        : "Loan repayment recorded successfully!",

                                                repaymentId,

                                                loanId,

                                                amountPaid:
                                                    amount,

                                                amountRepaid:
                                                    newAmountRepaid,

                                                outstandingBalance:
                                                    newOutstanding,

                                                status:
                                                    newStatus

                                            });

                                        }

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;