const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ======================================================
// DATABASE FILE LOCATION
// ======================================================

const dbPath = path.join(
    __dirname,
    "database.sqlite"
);


// ======================================================
// CREATE / CONNECT TO DATABASE
// ======================================================

const db = new sqlite3.Database(
    dbPath,
    (err) => {

        if (err) {

            console.error(
                "Database connection failed:",
                err.message
            );

        } else {

            console.log(
                "Connected to SQLite database."
            );

        }

    }
);


// ======================================================
// ENABLE FOREIGN KEYS
// ======================================================

db.run(
    "PRAGMA foreign_keys = ON"
);


// ======================================================
// CREATE / UPDATE DATABASE STRUCTURE
// ======================================================

db.serialize(() => {


    // ==================================================
    // GROUPS TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS groups (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            contribution_amount REAL NOT NULL,

            frequency TEXT NOT NULL,

            start_date TEXT NOT NULL,

            group_type TEXT NOT NULL
                DEFAULT 'individual',

            coordinator_fee REAL NOT NULL
                DEFAULT 0,

            loan_interest_rate REAL NOT NULL
                DEFAULT 0,

            loan_repayment_months INTEGER NOT NULL
                DEFAULT 0

        )
    `, (err) => {

        if (err) {

            console.error(
                "Groups table error:",
                err.message
            );

        }

    });


    // ==================================================
    // MEMBERS TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS members (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            group_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            FOREIGN KEY (group_id)
                REFERENCES groups(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Members table error:",
                err.message
            );

        }

    });


    // ==================================================
    // CONTRIBUTIONS TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS contributions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            member_id INTEGER NOT NULL,

            amount REAL NOT NULL,

            payment_date TEXT NOT NULL,

            FOREIGN KEY (member_id)
                REFERENCES members(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Contributions table error:",
                err.message
            );

        }

    });


    // ==================================================
    // PAYOUT SCHEDULE TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS payout_schedule (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            group_id INTEGER NOT NULL,

            member_id INTEGER NOT NULL,

            amount REAL NOT NULL,

            payout_date TEXT NOT NULL,

            status TEXT NOT NULL
                DEFAULT 'Pending',

            FOREIGN KEY (group_id)
                REFERENCES groups(id),

            FOREIGN KEY (member_id)
                REFERENCES members(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Payout schedule table error:",
                err.message
            );

        }

    });


    // ==================================================
    // PAYOUTS TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS payouts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            member_id INTEGER NOT NULL,

            amount REAL NOT NULL,

            payout_date TEXT NOT NULL,

            FOREIGN KEY (member_id)
                REFERENCES members(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Payouts table error:",
                err.message
            );

        }

    });


    // ==================================================
    // LOANS TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS loans (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            group_id INTEGER NOT NULL,

            member_id INTEGER NOT NULL,

            principal_amount REAL NOT NULL,

            interest_rate REAL NOT NULL
                DEFAULT 0,

            interest_amount REAL NOT NULL
                DEFAULT 0,

            total_repayment REAL NOT NULL
                DEFAULT 0,

            repayment_months INTEGER NOT NULL
                DEFAULT 1,

            amount_repaid REAL NOT NULL
                DEFAULT 0,

            outstanding_balance REAL NOT NULL
                DEFAULT 0,

            start_date TEXT NOT NULL,

            status TEXT NOT NULL
                DEFAULT 'Active',

            FOREIGN KEY (group_id)
                REFERENCES groups(id),

            FOREIGN KEY (member_id)
                REFERENCES members(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Loans table error:",
                err.message
            );

        } else {

            console.log(
                "Loans table ready."
            );

        }

    });


    // ==================================================
    // LOAN REPAYMENT SCHEDULE TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS loan_repayment_schedule (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            loan_id INTEGER NOT NULL,

            member_id INTEGER NOT NULL,

            cycle_number INTEGER NOT NULL,

            due_date TEXT NOT NULL,

            expected_amount REAL NOT NULL,

            paid_amount REAL NOT NULL
                DEFAULT 0,

            status TEXT NOT NULL
                DEFAULT 'Pending',

            FOREIGN KEY (loan_id)
                REFERENCES loans(id),

            FOREIGN KEY (member_id)
                REFERENCES members(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Loan repayment schedule table error:",
                err.message
            );

        } else {

            console.log(
                "Loan repayment schedule table ready."
            );

        }

    });


    // ==================================================
    // LOAN REPAYMENTS TABLE
    // ==================================================

    db.run(`
        CREATE TABLE IF NOT EXISTS loan_repayments (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            loan_id INTEGER NOT NULL,

            member_id INTEGER NOT NULL,

            amount REAL NOT NULL,

            repayment_date TEXT NOT NULL,

            cycle_number INTEGER NOT NULL,

            FOREIGN KEY (loan_id)
                REFERENCES loans(id),

            FOREIGN KEY (member_id)
                REFERENCES members(id)

        )
    `, (err) => {

        if (err) {

            console.error(
                "Loan repayments table error:",
                err.message
            );

        } else {

            console.log(
                "Loan repayments table ready."
            );

        }

    });


    // ==================================================
    // DATABASE MIGRATIONS
    // ==================================================
    //
    // These migrations are important because your
    // database.sqlite already existed before some of
    // these columns were added.
    //
    // CREATE TABLE IF NOT EXISTS does NOT add missing
    // columns to an existing table.
    //
    // ==================================================


    // ==================================================
    // GROUPS MIGRATIONS
    // ==================================================

    const groupColumns = [

        {
            name: "group_type",
            definition:
                "TEXT NOT NULL DEFAULT 'individual'"
        },

        {
            name: "coordinator_fee",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "loan_interest_rate",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "loan_repayment_months",
            definition:
                "INTEGER NOT NULL DEFAULT 0"
        }

    ];


    groupColumns.forEach(
        column => {

            db.run(
                `
                ALTER TABLE groups
                ADD COLUMN ${column.name}
                ${column.definition}
                `,
                (err) => {

                    if (err) {

                        if (
                            !err.message.includes(
                                "duplicate column name"
                            )
                        ) {

                            console.error(
                                `Unable to add groups.${column.name}:`,
                                err.message
                            );

                        }

                    } else {

                        console.log(
                            `Added groups.${column.name}`
                        );

                    }

                }
            );

        }
    );


    // ==================================================
    // LOANS MIGRATIONS
    // ==================================================

    const loanColumns = [

        {
            name: "principal_amount",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "interest_rate",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "interest_amount",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "total_repayment",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
        name: "total_amount",
        definition:
            "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "repayment_months",
            definition:
                "INTEGER NOT NULL DEFAULT 1"
        },

        {
            name: "amount_repaid",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "outstanding_balance",
            definition:
                "REAL NOT NULL DEFAULT 0"
        },

        {
            name: "start_date",
            definition:
                "TEXT"
        },

        {
            name: "status",
            definition:
                "TEXT NOT NULL DEFAULT 'Active'"
        }

    ];


    loanColumns.forEach(
        column => {

            db.run(
                `
                ALTER TABLE loans
                ADD COLUMN ${column.name}
                ${column.definition}
                `,
                (err) => {

                    if (err) {

                        if (
                            !err.message.includes(
                                "duplicate column name"
                            )
                        ) {

                            console.error(
                                `Unable to add loans.${column.name}:`,
                                err.message
                            );

                        }

                    } else {

                        console.log(
                            `Added loans.${column.name}`
                        );

                    }

                }
            );

        }
    );

});


// ======================================================
// EXPORT DATABASE
// ======================================================

module.exports = db;