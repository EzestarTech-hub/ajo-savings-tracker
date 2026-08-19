const express = require("express");

const router = express.Router();

const db = require("../db");

// ======================================================
// GET ALL MEMBERS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            members.id,
            members.name,
            members.group_id,
            groups.name AS group_name
        FROM members
        INNER JOIN groups
            ON groups.id = members.group_id
        ORDER BY members.id DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            return res.status(500).json({
                error: err.message
            });

        }

        res.json(rows);

    });

});

// ======================================================
// GET MEMBER FINANCIAL SUMMARY
// ======================================================

router.get("/summary", (req, res) => {

    const sql = `
        SELECT

            members.id,
            members.name,
            members.group_id,

            groups.name AS group_name,

            COALESCE(
                (
                    SELECT SUM(amount)
                    FROM contributions
                    WHERE contributions.member_id = members.id
                ),
                0
            ) AS totalContributions,

            COALESCE(
                (
                    SELECT SUM(amount)
                    FROM payouts
                    WHERE payouts.member_id = members.id
                ),
                0
            ) AS totalPayouts,

            COALESCE(
                (
                    SELECT SUM(principal_amount)
                    FROM loans
                    WHERE loans.member_id = members.id
                ),
                0
            ) AS totalLoans,

            COALESCE(
                (
                    SELECT SUM(outstanding_balance)
                    FROM loans
                    WHERE loans.member_id = members.id
                ),
                0
            ) AS outstandingLoans

        FROM members

        INNER JOIN groups
            ON groups.id = members.group_id

        ORDER BY members.id DESC
    `;


    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Member financial summary error:",
                err
            );

            return res.status(500).json({
                error: err.message
            });

        }


        const result = rows.map(member => {

            const totalContributions =
                Number(
                    member.totalContributions || 0
                );

            const totalPayouts =
                Number(
                    member.totalPayouts || 0
                );

            const totalLoans =
                Number(
                    member.totalLoans || 0
                );

            const outstandingLoans =
                Number(
                    member.outstandingLoans || 0
                );


            return {

                id:
                    member.id,

                name:
                    member.name,

                group_id:
                    member.group_id,

                group_name:
                    member.group_name,

                totalContributions,

                totalPayouts,

                balance:
                    totalContributions -
                    totalPayouts,

                totalLoans,

                outstandingLoans

            };

        });


        res.json(result);

    });

});

// POST - Add a member
router.post("/:id/members", (req, res) => {

  console.log("POST /:id/members route reached");

  const groupId = req.params.id;
  const { name } = req.body;

  const sql = `
    INSERT INTO members (group_id, name)
    VALUES (?, ?)
  `;

  db.run(sql, [groupId, name], function (err) {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.status(201).json({
      message: "Member added successfully!",
      memberId: this.lastID
    });

  });

});

// GET - Read all members in a group
router.get("/:id/members", (req, res) => {

  const groupId = req.params.id;

  const sql = `
    SELECT * FROM members
    WHERE group_id = ?
  `;

  db.all(sql, [groupId], (err, rows) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    res.json(rows);

  });

});

console.log("Members routes loaded");

module.exports = router;