# Ajo Savings Tracker

Ajo Savings Tracker is a full-stack web application designed to help individuals and cooperative savings groups manage members, contributions, payouts, loans, loan repayments, and financial records in one place.

The project was developed as a capstone project to demonstrate practical full-stack web development using JavaScript, Node.js, Express, and SQLite.

---

## Project Background

Managing traditional Ajo and cooperative savings activities can involve keeping records of members, contributions, payouts, loans, and repayments manually. This can make it difficult to maintain accurate financial records and track individual member balances.

Ajo Savings Tracker was developed to provide a simple digital system for organizing these activities and improving the accuracy and accessibility of savings records.

---

## Project Objectives

The main objectives of the project are to:

- Digitize savings group record keeping.
- Manage savings groups and their members.
- Record and track member contributions.
- Record and track member payouts.
- Calculate member savings balances.
- Manage member loans.
- Calculate loan interest and repayment amounts.
- Track loan repayments and outstanding balances.
- Manage loan repayment schedules.
- Provide financial summaries through a dashboard and reports.

---

## Features

### Dashboard

The dashboard provides an overview of the savings system, including:

- Total groups
- Total members
- Total contributions
- Total payouts
- Available balance
- Pending payouts
- Loan information
- Overall financial status

### Group Management

Users can create and manage savings groups.

Group information includes:

- Group name
- Contribution amount
- Contribution frequency
- Start date
- Group type
- Coordinator fee
- Loan interest rate
- Loan repayment period

### Member Management

The application allows users to:

- Add members to groups.
- View all members.
- View member financial summaries.
- View contribution history.
- View payout history.
- View savings balance.

Each member's financial summary includes:

- Total contributions
- Total payouts
- Savings balance
- Total loans
- Outstanding loans

### Contributions

The contribution system allows users to:

- Record member contributions.
- Enter contribution amounts.
- Enter payment dates.
- View contribution records.
- View contributions by member.

A member's savings balance is automatically updated when a contribution is recorded.

### Payouts

The payout system allows users to:

- Record member payouts.
- Enter payout amounts.
- Enter payout dates.
- View payout records.

The backend checks the member's available savings balance before recording a payout.

This prevents a member from receiving a payout greater than the amount available in their savings balance.

### Loan Management

The application supports:

- Creating loans.
- Calculating loan interest.
- Calculating total repayment.
- Tracking amount repaid.
- Tracking outstanding loan balance.
- Tracking loan status.

### Loan Repayments

The application supports recording loan repayments and updating the corresponding loan balance.

When a loan is fully repaid:

- The outstanding balance becomes ₦0.
- The loan status becomes `Paid`.
- The repayment schedule is updated.

### Repayment Schedule

The system supports repayment schedules based on the configured repayment period.

The schedule tracks:

- Cycle number
- Due date
- Expected amount
- Paid amount
- Status

### Reports

The application includes a reports section for viewing financial information from the savings system.

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

No frontend framework is currently used.

### Backend

- Node.js
- Express.js

### Database

- SQLite
- sqlite3

### Development Tools

- Git
- GitHub
- Visual Studio Code
- Git Bash
- Nodemon

---

## Project Structure

```text
ajo-savings-tracker/
│
├── public/
│   ├── assets/
│   │
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   │
│   ├── js/
│   │   ├── dashboard.js
│   │   ├── loans.js
│   │   └── ...
│   │
│   ├── dashboard.html
│   ├── groups.html
│   ├── members.html
│   ├── loans.html
│   ├── contributions.html
│   ├── payouts.html
│   └── reports.html
│
├── server/
│   ├── routes/
│   │   ├── groups.js
│   │   ├── members.js
│   │   ├── contributions.js
│   │   ├── payouts.js
│   │   ├── loans.js
│   │   └── dashboard.js
│   │
│   ├── db.js
│   ├── server.js
│   └── database.sqlite
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md