const express = require("express");

const router = express.Router();

const db = require("../db");

// ======================================================
// CREATE GROUP
// ======================================================

router.post("/", (req, res) => {

    const {
        name,
        contribution_amount,
        frequency,
        start_date
    } = req.body;

    if (
        !name ||
        !contribution_amount ||
        Number(contribution_amount) <= 0 ||
        !frequency ||
        !start_date
    ) {

        return res.status(400).json({
            error:
                "Group name, contribution amount, frequency and start date are required."
        });

    }

    const sql = `
        INSERT INTO groups
        (
            name,
            contribution_amount,
            frequency,
            start_date
        )
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            name.trim(),
            Number(contribution_amount),
            frequency,
            start_date
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.status(201).json({

                message:
                    "Group created successfully!",

                groupId:
                    this.lastID

            });

        }
    );

});


// ======================================================
// GET ALL GROUPS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM groups
        ORDER BY id DESC
    `;

    db.all(
        sql,
        [],
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
// GET GROUP SUMMARY
// ======================================================

router.get("/:id/summary", (req, res) => {

    const groupId =
        req.params.id;

    const sql = `

        SELECT

            groups.name,

            COUNT(
                DISTINCT members.id
            ) AS numberOfMembers,

            COALESCE(
                SUM(contributions.amount),
                0
            ) AS totalContribution

        FROM groups

        LEFT JOIN members
            ON groups.id = members.group_id

        LEFT JOIN contributions
            ON members.id = contributions.member_id

        WHERE groups.id = ?

        GROUP BY groups.id

    `;

    db.get(
        sql,
        [groupId],
        (err, row) => {

            if (err) {

                console.error(
                    "Group summary error:",
                    err
                );

                return res.status(500).json({
                    error: err.message
                });

            }

            if (!row) {

                return res.status(404).json({
                    error:
                        "Group not found."
                });

            }

            res.json({

                groupName:
                    row.name,

                numberOfMembers:
                    Number(
                        row.numberOfMembers || 0
                    ),

                totalContribution:
                    Number(
                        row.totalContribution || 0
                    )

            });

        }
    );

});


// ======================================================
// AJO CYCLE / CONTRIBUTION OVERVIEW
// ======================================================

router.get("/:id/cycle-overview", (req, res) => {

    const groupId =
        req.params.id;


    // ==================================================
    // GET GROUP INFORMATION
    // ==================================================

    const groupSql = `

        SELECT
            id,
            name,
            contribution_amount,
            frequency,
            start_date

        FROM groups

        WHERE id = ?

    `;

    db.get(
        groupSql,
        [groupId],
        (err, group) => {

            if (err) {

                console.error(
                    "Get group information error:",
                    err
                );

                return res.status(500).json({
                    error: err.message
                });

            }

            if (!group) {

                return res.status(404).json({
                    error:
                        "Group not found."
                });

            }


            // ==================================================
            // GET MEMBERS AND THEIR CONTRIBUTIONS
            // ==================================================

            const membersSql = `

                SELECT

                    members.id AS member_id,

                    members.name AS member_name,

                    COALESCE(
                        SUM(contributions.amount),
                        0
                    ) AS actual_contribution

                FROM members

                LEFT JOIN contributions
                    ON members.id =
                       contributions.member_id

                WHERE members.group_id = ?

                GROUP BY members.id

                ORDER BY members.id ASC

            `;

            db.all(
                membersSql,
                [groupId],
                (memberErr, members) => {

                    if (memberErr) {

                        console.error(
                            "Cycle members error:",
                            memberErr
                        );

                        return res.status(500).json({
                            error:
                                memberErr.message
                        });

                    }


                    // ==================================================
                    // CALCULATE ELAPSED CYCLES
                    // ==================================================

                    const startDate =
                        new Date(
                            group.start_date +
                            "T00:00:00"
                        );

                    const today =
                        new Date();

                    let elapsedCycles =
                        1;


                    if (
                        !isNaN(
                            startDate.getTime()
                        )
                    ) {

                        const difference =
                            today.getTime() -
                            startDate.getTime();

                        const daysElapsed =
                            Math.max(
                                0,
                                Math.floor(
                                    difference /
                                    (
                                        1000 *
                                        60 *
                                        60 *
                                        24
                                    )
                                )
                            );

                        const frequency =
                            String(
                                group.frequency
                            ).toLowerCase();


                        if (
                            frequency ===
                            "daily"
                        ) {

                            elapsedCycles =
                                daysElapsed + 1;

                        }

                        else if (
                            frequency ===
                            "weekly"
                        ) {

                            elapsedCycles =
                                Math.floor(
                                    daysElapsed / 7
                                ) + 1;

                        }

                        else if (
                            frequency ===
                            "monthly"
                        ) {

                            elapsedCycles =
                                (
                                    (
                                        today.getFullYear() -
                                        startDate.getFullYear()
                                    ) * 12
                                )
                                +
                                (
                                    today.getMonth() -
                                    startDate.getMonth()
                                )
                                + 1;

                        }

                        else {

                            elapsedCycles =
                                1;

                        }

                    }


                    // ==================================================
                    // CONTRIBUTION AMOUNTS
                    // ==================================================

                    const contributionAmount =
                        Number(
                            group.contribution_amount
                        );

                    const memberCount =
                        members.length;


                    // ==================================================
                    // EXPECTED CONTRIBUTION
                    // ==================================================

                    const expectedPerMember =
                        contributionAmount *
                        elapsedCycles;

                    const totalExpected =
                        expectedPerMember *
                        memberCount;


                    // ==================================================
                    // MEMBER CONTRIBUTION STATUS
                    // ==================================================

                    const memberOverview =
                        members.map(
                            member => {

                                const actual =
                                    Number(
                                        member.actual_contribution ||
                                        0
                                    );

                                const expected =
                                    expectedPerMember;


                                const outstanding =
                                    Math.max(
                                        0,
                                        expected -
                                        actual
                                    );


                                const difference =
                                    actual -
                                    expected;


                                let status;


                                if (
                                    actual >=
                                    expected
                                ) {

                                    status =
                                        "Paid";

                                }

                                else if (
                                    actual > 0
                                ) {

                                    status =
                                        "Partially Paid";

                                }

                                else {

                                    status =
                                        "Not Paid";

                                }


                                return {

                                    member_id:
                                        member.member_id,

                                    member_name:
                                        member.member_name,

                                    expected:
                                        expected,

                                    actual:
                                        actual,

                                    difference:
                                        difference,

                                    outstanding:
                                        outstanding,

                                    status:
                                        status

                                };

                            }
                        );


                    // ==================================================
                    // HISTORICAL TOTAL CONTRIBUTION
                    // ==================================================

                    const totalContributionToDate =
                        memberOverview.reduce(
                            (
                                total,
                                member
                            ) => {

                                return (
                                    total +
                                    member.actual
                                );

                            },
                            0
                        );


                    // ==================================================
                    // CURRENT CYCLE CONTRIBUTION
                    // ==================================================

                    const currentCycleActual =
                        memberOverview.reduce(
                            (
                                total,
                                member
                            ) => {

                                return (
                                    total +
                                    Math.min(
                                        member.actual,
                                        member.expected
                                    )
                                );

                            },
                            0
                        );


                    // ==================================================
                    // TOTAL OUTSTANDING
                    // ==================================================

                    const outstanding =
                        memberOverview.reduce(
                            (
                                total,
                                member
                            ) => {

                                return (
                                    total +
                                    member.outstanding
                                );

                            },
                            0
                        );


                    // ==================================================
                    // MEMBER PAYMENT PROGRESS
                    // ==================================================

                    const paidMembers =
                        memberOverview.filter(
                            member =>
                                member.actual >=
                                member.expected
                        ).length;


                    // ==================================================
                    // CURRENT CYCLE PROGRESS
                    // ==================================================

                    let progress =
                        0;


                    if (
                        totalExpected > 0
                    ) {

                        progress =
                            (
                                currentCycleActual /
                                totalExpected
                            ) * 100;

                    }


                    progress =
                        Math.min(
                            100,
                            Math.max(
                                0,
                                progress
                            )
                        );


                    // ==================================================
                    // OVERALL CYCLE STATUS
                    // ==================================================

                    let cycleStatus;


                    if (
                        memberCount === 0
                    ) {

                        cycleStatus =
                            "No Members";

                    }

                    else if (
                        paidMembers ===
                        memberCount
                    ) {

                        cycleStatus =
                            "On Track";

                    }

                    else if (
                        paidMembers > 0
                    ) {

                        cycleStatus =
                            "Needs Attention";

                    }

                    else {

                        cycleStatus =
                            "No Contributions";

                    }


                    // ==================================================
                    // RESPONSE
                    // ==================================================

                    res.json({

                        group: {

                            id:
                                group.id,

                            name:
                                group.name,

                            contributionAmount:
                                contributionAmount,

                            frequency:
                                group.frequency,

                            startDate:
                                group.start_date,

                            memberCount:
                                memberCount

                        },


                        cycle: {

                            elapsedCycles:
                                elapsedCycles,

                            expectedPerMember:
                                expectedPerMember,

                            totalExpected:
                                totalExpected,

                            totalActual:
                                currentCycleActual,

                            totalContributionToDate:
                                totalContributionToDate,

                            outstanding:
                                outstanding,

                            paidMembers:
                                paidMembers,

                            unpaidMembers:
                                memberCount -
                                paidMembers,

                            progress:
                                Number(
                                    progress.toFixed(2)
                                ),

                            status:
                                cycleStatus

                        },


                        members:
                            memberOverview

                    });

                }
            );

        }
    );

});


// ======================================================
// ADD MEMBER
// ======================================================

router.post("/:id/members", (req, res) => {

    console.log(
        "POST /:id/members route reached"
    );

    const groupId =
        req.params.id;

    const { name } =
        req.body;


    if (
        !name ||
        !name.trim()
    ) {

        return res.status(400).json({
            error:
                "Member name is required."
        });

    }


    const sql = `

        INSERT INTO members
        (
            group_id,
            name
        )
        VALUES (?, ?)

    `;


    db.run(
        sql,
        [
            groupId,
            name.trim()
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }


            res.status(201).json({

                message:
                    "Member added successfully!",

                memberId:
                    this.lastID

            });

        }
    );

});


// ======================================================
// GET ALL MEMBERS IN A GROUP
// ======================================================

router.get("/:id/members", (req, res) => {

    const groupId =
        req.params.id;


    const sql = `

        SELECT *

        FROM members

        WHERE group_id = ?

        ORDER BY id ASC

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
// DELETE EMPTY GROUP
// ======================================================

router.delete("/:id", (req, res) => {

    const groupId =
        req.params.id;


    // ==================================================
    // CHECK WHETHER GROUP EXISTS
    // ==================================================

    const checkGroupSql = `

        SELECT
            id,
            name

        FROM groups

        WHERE id = ?

    `;


    db.get(
        checkGroupSql,
        [groupId],
        (err, group) => {

            if (err) {

                return res.status(500).json({
                    error:
                        err.message
                });

            }


            if (!group) {

                return res.status(404).json({
                    error:
                        "Group not found."
                });

            }


            // ==================================================
            // CHECK MEMBERS
            // ==================================================

            const checkMembersSql = `

                SELECT
                    COUNT(*) AS memberCount

                FROM members

                WHERE group_id = ?

            `;


            db.get(
                checkMembersSql,
                [groupId],
                (err, result) => {

                    if (err) {

                        return res.status(500).json({
                            error:
                                err.message
                        });

                    }


                    // ==================================================
                    // DO NOT DELETE GROUP WITH MEMBERS
                    // ==================================================

                    if (
                        result.memberCount > 0
                    ) {

                        return res.status(400).json({

                            error:
                                "This group cannot be deleted because it has members."

                        });

                    }


                    // ==================================================
                    // DELETE EMPTY GROUP
                    // ==================================================

                    const deleteSql = `

                        DELETE FROM groups

                        WHERE id = ?

                    `;


                    db.run(
                        deleteSql,
                        [groupId],
                        function (err) {

                            if (err) {

                                return res.status(500).json({
                                    error:
                                        err.message
                                });

                            }


                            res.json({

                                message:
                                    `Group "${group.name}" deleted successfully.`

                            });

                        }
                    );

                }
            );

        }
    );

});


// ======================================================
// ROUTE LOADED
// ======================================================

console.log(
    "Groups routes loaded"
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;