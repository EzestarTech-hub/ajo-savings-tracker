// ======================================================
// AJO SAVINGS TRACKER - REPORTS
// ======================================================

// ======================================================
// GET HTML ELEMENTS
// ======================================================

const contributionCount =
    document.getElementById("contributionCount");

const totalContributions =
    document.getElementById("totalContributions");

// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(amount) {

    return `₦${Number(
        amount || 0
    ).toLocaleString()}`;

}

// ======================================================
// LOAD CONTRIBUTION REPORT
// ======================================================

async function loadContributionReport() {

    try {

        const response =
            await fetch(
                "/api/reports/contributions",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load contribution report."
            );

        }

        const data =
            await response.json();

        // ===============================
        // CONTRIBUTION COUNT
        // ===============================

        if (contributionCount) {

            contributionCount.textContent =
                data.contributionCount;

        }

        // ===============================
        // TOTAL CONTRIBUTIONS
        // ===============================

        if (totalContributions) {

            totalContributions.textContent =
                formatMoney(
                    data.totalContributions
                );

        }

    } catch (error) {

        console.error(
            "Contribution report error:",
            error
        );

    }

}

// ======================================================
// INITIAL LOAD
// ======================================================

loadContributionReport();
loadLoanReport();
loadPayoutSummary();
loadPayoutsByGroup();
loadPayoutsByMember();
loadContributionsByGroup();
loadContributionsByMember();
loadLoansByGroup();
loadLoansByMember();

// ======================================================
// LOAD PAYOUTS BY MEMBER
// ======================================================

async function loadPayoutsByMember() {

    const container =
        document.getElementById("payoutsByMember");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/payouts/by-member",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load payouts by member."
            );

        }

        const members =
            await response.json();

        if (
            !Array.isArray(members) ||
            members.length === 0
        ) {

            container.innerHTML =
                "<p>No payout data found.</p>";

            return;
        }

        container.innerHTML = "";
        container.className = "report-list";

        members.forEach(member => {

            const item =
                document.createElement("div");

            item.className = "report-card";

            item.innerHTML = `
                <h3>
                    ${member.member_name}
                </h3>

                <p>
                    Group:
                    <strong>
                        ${member.group_name}
                    </strong>
                </p>

                <p>
                    Payout Records:
                    <strong>
                        ${member.payout_count}
                    </strong>
                </p>

                <p>
                    Total Payouts:
                    <strong>
                        ${formatMoney(
                            member.total_payouts
                        )}
                    </strong>
                </p>
            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Payouts by member error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load member payout report.</p>";

    }

}

// ======================================================
// LOAD PAYOUTS BY GROUP
// ======================================================

async function loadPayoutsByGroup() {

    const container =
        document.getElementById("payoutsByGroup");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/payouts/by-group",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load payouts by group."
            );

        }

        const groups =
            await response.json();

        if (
            !Array.isArray(groups) ||
            groups.length === 0
        ) {

            container.innerHTML =
                "<p>No payout data found.</p>";

            return;
        }

        container.innerHTML = "";
        container.className = "report-list";

        groups.forEach(group => {

            const item =
                document.createElement("div");

            item.className = "report-card";

            item.innerHTML = `
                <h3>
                    ${group.group_name}
                </h3>

                <p>
                    Payout Records:
                    <strong>
                        ${group.payout_count}
                    </strong>
                </p>

                <p>
                    Total Payouts:
                    <strong>
                        ${formatMoney(
                            group.total_payouts
                        )}
                    </strong>
                </p>
            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Payouts by group error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load payout group report.</p>";

    }

}

// ======================================================
// LOAD CONTRIBUTIONS BY MEMBER
// ======================================================

async function loadContributionsByMember() {

    const container =
        document.getElementById(
            "contributionsByMember"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/contributions/by-member",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load contributions by member."
            );

        }

        const members =
            await response.json();

        if (
            !Array.isArray(members) ||
            members.length === 0
        ) {

            container.innerHTML =
                "<p>No member contribution data found.</p>";

            return;
        }

        container.innerHTML = "";
        container.className = "report-list";

        members.forEach(member => {

            const item =
                document.createElement("div");

            item.className = "report-card";

            item.innerHTML = `
                <h3>
                    ${member.member_name}
                </h3>

                <p>
                    Group:
                    <strong>
                        ${member.group_name}
                    </strong>
                </p>

                <p>
                    Contribution Records:
                    <strong>
                        ${member.contribution_count}
                    </strong>
                </p>

                <p>
                    Total Contributions:
                    <strong>
                        ${formatMoney(
                            member.total_contributions
                        )}
                    </strong>
                </p>
            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Contributions by member error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load member contribution report.</p>";

    }

}


// ======================================================
// LOAD LOANS BY MEMBER
// ======================================================

async function loadLoansByMember() {

    const container =
        document.getElementById("loansByMember");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/loans/by-member",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load loans by member."
            );

        }

        const members =
            await response.json();

        if (
            !Array.isArray(members) ||
            members.length === 0
        ) {

            container.innerHTML =
                "<p>No member loan data found.</p>";

            return;
        }

        container.innerHTML = "";
        container.className = "report-list";

        members.forEach(member => {

            const item =
                document.createElement("div");

            item.className = "report-card";

            item.innerHTML = `
                <h3>
                    ${member.member_name}
                </h3>

                <p>
                    Group:
                    <strong>
                        ${member.group_name}
                    </strong>
                </p>

                <p>
                    Loan Records:
                    <strong>
                        ${member.loan_count}
                    </strong>
                </p>

                <p>
                    Total Loaned:
                    <strong>
                        ${formatMoney(
                            member.total_loaned
                        )}
                    </strong>
                </p>

                <p>
                    Total Interest:
                    <strong>
                        ${formatMoney(
                            member.total_interest
                        )}
                    </strong>
                </p>

                <p>
                    Total Repaid:
                    <strong>
                        ${formatMoney(
                            member.total_repaid
                        )}
                    </strong>
                </p>

                <p>
                    Total Outstanding:
                    <strong>
                        ${formatMoney(
                            member.total_outstanding
                        )}
                    </strong>
                </p>
            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Loans by member error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load member loan report.</p>";

    }

}

// ======================================================
// LOAD LOANS BY GROUP
// ======================================================

async function loadLoansByGroup() {

    const container =
        document.getElementById("loansByGroup");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/loans/by-group",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load loans by group."
            );

        }

        const groups =
            await response.json();

        if (
            !Array.isArray(groups) ||
            groups.length === 0
        ) {

            container.innerHTML =
                "<p>No loan data found.</p>";

            return;
        }

        container.innerHTML = "";
        container.className = "report-list";

        groups.forEach(group => {

            const item =
                document.createElement("div");

            item.className = "report-card";

            item.innerHTML = `
                <h3>
                    ${group.group_name}
                </h3>

                <p>
                    Loan Records:
                    <strong>
                        ${group.loan_count}
                    </strong>
                </p>

                <p>
                    Total Loaned:
                    <strong>
                        ${formatMoney(
                            group.total_loaned
                        )}
                    </strong>
                </p>

                <p>
                    Total Interest:
                    <strong>
                        ${formatMoney(
                            group.total_interest
                        )}
                    </strong>
                </p>

                <p>
                    Total Repaid:
                    <strong>
                        ${formatMoney(
                            group.total_repaid
                        )}
                    </strong>
                </p>

                <p>
                    Total Outstanding:
                    <strong>
                        ${formatMoney(
                            group.total_outstanding
                        )}
                    </strong>
                </p>
            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Loans by group error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load loan group report.</p>";

    }

}

// ======================================================
// LOAD CONTRIBUTIONS BY GROUP
// ======================================================

async function loadContributionsByGroup() {

    const container =
        document.getElementById(
            "contributionsByGroup"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/contributions/by-group",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load contributions by group."
            );

        }

        const groups =
            await response.json();

        if (
            !Array.isArray(groups) ||
            groups.length === 0
        ) {

            container.innerHTML =
                "<p>No contribution data found.</p>";

            return;
        }

        container.innerHTML = "";
        container.className = "report-list";

        groups.forEach(group => {

            const item =
                document.createElement("div");

            item.className = "report-card";

            item.innerHTML = `
                <h3>
                    ${group.group_name}
                </h3>

                <p>
                    Contribution Records:
                    <strong>
                        ${group.contribution_count}
                    </strong>
                </p>

                <p>
                    Total Contributions:
                    <strong>
                        ${formatMoney(
                            group.total_contributions
                        )}
                    </strong>
                </p>
            `;

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Contributions by group error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load group contribution report.</p>";

    }

}

// ======================================================
// LOAD LOAN REPORT
// ======================================================

async function loadLoanReport() {

    try {

        const response =
            await fetch(
                "/api/reports/loans",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load loan report."
            );

        }

        const data =
            await response.json();

        // ===============================
        // TOTAL LOANS
        // ===============================

        const totalLoans =
            document.getElementById("totalLoans");

        if (totalLoans) {

            totalLoans.textContent =
                data.totalLoans;

        }

        // ===============================
        // ACTIVE LOANS
        // ===============================

        const activeLoans =
            document.getElementById("activeLoans");

        if (activeLoans) {

            activeLoans.textContent =
                data.activeLoans;

        }

        // ===============================
        // PAID LOANS
        // ===============================

        const paidLoans =
            document.getElementById("paidLoans");

        if (paidLoans) {

            paidLoans.textContent =
                data.paidLoans;

        }

        // ===============================
        // TOTAL LOANED
        // ===============================

        const totalLoaned =
            document.getElementById("totalLoaned");

        if (totalLoaned) {

            totalLoaned.textContent =
                formatMoney(
                    data.totalLoaned
                );

        }

        // ===============================
        // TOTAL INTEREST
        // ===============================

        const totalInterest =
            document.getElementById("totalInterest");

        if (totalInterest) {

            totalInterest.textContent =
                formatMoney(
                    data.totalInterest
                );

        }

        // ===============================
        // TOTAL REPAID
        // ===============================

        const totalRepaid =
            document.getElementById("totalRepaid");

        if (totalRepaid) {

            totalRepaid.textContent =
                formatMoney(
                    data.totalRepaid
                );

        }

        // ===============================
        // TOTAL OUTSTANDING
        // ===============================

        const totalOutstanding =
            document.getElementById(
                "totalOutstanding"
            );

        if (totalOutstanding) {

            totalOutstanding.textContent =
                formatMoney(
                    data.totalOutstanding
                );

        }

    } catch (error) {

        console.error(
            "Loan report error:",
            error
        );

    }

}


// ======================================================
// LOAD PAYOUT SUMMARY
// ======================================================

async function loadPayoutSummary() {

    const container =
        document.getElementById("payoutSummary");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/reports/payouts",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load payout summary."
            );

        }

        const data =
            await response.json();

        container.innerHTML = `
            <p>
                Payout Records:
                <strong>
                    ${data.payoutCount}
                </strong>
            </p>

            <p>
                Total Payouts:
                <strong>
                    ${formatMoney(
                        data.totalPayouts
                    )}
                </strong>
            </p>
        `;

    } catch (error) {

        console.error(
            "Payout summary error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load payout summary.</p>";

    }

}