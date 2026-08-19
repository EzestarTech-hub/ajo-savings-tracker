// ======================================================
// AJO SAVINGS TRACKER - DASHBOARD
// ======================================================


// ======================================================
// GET HTML ELEMENTS
// ======================================================

// ===============================
// MAIN DASHBOARD ELEMENTS
// ===============================

const totalGroups =
    document.getElementById("totalGroups");

const totalMembers =
    document.getElementById("totalMembers");

const totalContributions =
    document.getElementById("totalContributions");

const totalPayouts =
    document.getElementById("totalPayouts");

const availableBalance =
    document.getElementById("availableBalance");

    const remainingBalance =
    document.getElementById(
        "remainingBalance"
    );

const pendingPayouts =
    document.getElementById("pendingPayouts");

const healthStatus =
    document.getElementById("healthStatus");

const healthMessage =
    document.getElementById("healthMessage");

const healthCard =
    document.getElementById("healthCard");

const upcomingPayouts =
    document.getElementById("upcomingPayouts");

const pendingCount =
    document.getElementById("pendingCount");

const refreshDashboard =
    document.getElementById("refreshDashboard");


// ===============================
// LOAN DASHBOARD ELEMENTS
// ===============================

const totalLoans =
    document.getElementById("totalLoans");

const activeLoans =
    document.getElementById("activeLoans");

const totalLoaned =
    document.getElementById("totalLoaned");

const outstandingLoans =
    document.getElementById("outstandingLoans");

const totalLoanRepayments =
    document.getElementById("totalLoanRepayments");

const totalInterest =
    document.getElementById("totalInterest");

const loanActivity =
    document.getElementById("loanActivity");


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(amount) {

    return `₦${Number(
        amount || 0
    ).toLocaleString()}`;

}


// ======================================================
// LOAD DASHBOARD SUMMARY
// ======================================================

async function loadDashboardSummary() {

    try {

        const response =
            await fetch(
                "/api/dashboard/summary",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load dashboard summary."
            );

        }


        const data =
            await response.json();


        // ===============================
        // TOTAL GROUPS
        // ===============================

        if (totalGroups) {

            totalGroups.textContent =
                data.totalGroups;

        }


        // ===============================
        // TOTAL MEMBERS
        // ===============================

        if (totalMembers) {

            totalMembers.textContent =
                data.totalMembers;

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


        // ===============================
        // TOTAL PAYOUTS
        // ===============================

        if (totalPayouts) {

            totalPayouts.textContent =
                formatMoney(
                    data.totalPayouts
                );

        }


        // ===============================
        // AVAILABLE BALANCE
        // ===============================

        if (availableBalance) {

            availableBalance.textContent =
                formatMoney(
                    data.availableBalance
                );

        }


        // ===============================
        // REMAINING BALANCE
        // ===============================

            if (remainingBalance) {

                remainingBalance.textContent =
                formatMoney(
                data.remainingBalance
            );

        }


        // ===============================
        // PENDING PAYOUTS
        // ===============================

        if (pendingPayouts) {

            pendingPayouts.textContent =
                formatMoney(
                    data.pendingPayouts
                );

        }


    } catch (error) {

        console.error(
            "Dashboard summary error:",
            error
        );

    }

}


// ======================================================
// LOAD AJO HEALTH
// ======================================================

async function loadDashboardHealth() {

    try {

        const response =
            await fetch(
                "/api/dashboard/health",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load Ajo health."
            );

        }


        const data =
            await response.json();


        // ===============================
        // UPDATE HEALTH STATUS
        // ===============================

        if (healthStatus) {

            healthStatus.textContent =
                data.status;

        }


        if (healthMessage) {

            healthMessage.textContent =
                data.message;

        }


        // ===============================
        // UPDATE HEALTH CLASS
        // ===============================

        if (healthCard) {

            healthCard.className =
                "health-card";


            if (
                data.status ===
                "Healthy"
            ) {

                healthCard.classList.add(
                    "healthy"
                );

            }

            else if (
                data.status ===
                "Attention Needed"
            ) {

                healthCard.classList.add(
                    "attention"
                );

            }

            else if (
                data.status ===
                "At Risk"
            ) {

                healthCard.classList.add(
                    "at-risk"
                );

            }

        }


    } catch (error) {

        console.error(
            "Dashboard health error:",
            error
        );


        if (healthStatus) {

            healthStatus.textContent =
                "Unable to load";

        }


        if (healthMessage) {

            healthMessage.textContent =
                "Could not load Ajo health information.";

        }

    }

}


// ======================================================
// LOAD UPCOMING PAYOUTS
// ======================================================

async function loadUpcomingPayouts() {

    try {

        const response =
            await fetch(
                "/api/dashboard/upcoming-payouts",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load upcoming payouts."
            );

        }


        const payouts =
            await response.json();


        // ===============================
        // UPDATE PENDING COUNT
        // ===============================

        if (pendingCount) {

            pendingCount.textContent =
                `${payouts.length} pending`;

        }


        // ===============================
        // NO PAYOUTS
        // ===============================

        if (
            payouts.length === 0
        ) {

            if (upcomingPayouts) {

                upcomingPayouts.innerHTML = `
                    <p>
                        No upcoming payouts.
                    </p>
                `;

            }

            return;

        }


        // ===============================
        // CLEAR OLD PAYOUTS
        // ===============================

        if (upcomingPayouts) {

            upcomingPayouts.innerHTML =
                "";

        }


        // ===============================
        // DISPLAY PAYOUTS
        // ===============================

        payouts.forEach(
            payout => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "payout-item";


                item.innerHTML = `

                    <div>

                        <strong>
                            ${payout.member_name}
                        </strong>

                        <p>
                            ${payout.group_name}
                        </p>

                    </div>


                    <div>

                        <strong>
                            ${formatMoney(
                                payout.amount
                            )}
                        </strong>

                        <p>
                            ${payout.payout_date}
                        </p>

                        <span>
                            ${payout.timing}
                        </span>

                    </div>

                `;


                if (upcomingPayouts) {

                    upcomingPayouts.appendChild(
                        item
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "Upcoming payouts error:",
            error
        );


        if (upcomingPayouts) {

            upcomingPayouts.innerHTML = `
                <p>
                    Unable to load payout schedule.
                </p>
            `;

        }


        if (pendingCount) {

            pendingCount.textContent =
                "0 pending";

        }

    }

}


// ======================================================
// LOAD LOAN DASHBOARD SUMMARY
// ======================================================

async function loadLoanDashboard() {

    try {

        const response =
            await fetch(
                "/api/dashboard/loans",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load loan dashboard."
            );

        }


        const data =
            await response.json();


        // ===============================
        // TOTAL LOANS
        // ===============================

        if (totalLoans) {

            totalLoans.textContent =
                data.totalLoans || 0;

        }


        // ===============================
        // ACTIVE LOANS
        // ===============================

        if (activeLoans) {

            activeLoans.textContent =
                data.activeLoans || 0;

        }


        // ===============================
        // TOTAL LOANED
        // ===============================

        if (totalLoaned) {

            totalLoaned.textContent =
                formatMoney(
                    data.totalLoaned
                );

        }


        // ===============================
        // OUTSTANDING LOANS
        // ===============================

        if (outstandingLoans) {

            outstandingLoans.textContent =
                formatMoney(
                    data.outstandingLoans
                );

        }


        // ===============================
        // TOTAL LOAN REPAYMENTS
        // ===============================

        if (totalLoanRepayments) {

            totalLoanRepayments.textContent =
                formatMoney(
                    data.totalLoanRepayments
                );

        }


        // ===============================
        // TOTAL INTEREST
        // ===============================

        if (totalInterest) {

            totalInterest.textContent =
                formatMoney(
                    data.totalInterest
                );

        }


    } catch (error) {

        console.error(
            "Loan dashboard error:",
            error
        );


        if (totalLoans) {

            totalLoans.textContent =
                "0";

        }

        if (activeLoans) {

            activeLoans.textContent =
                "0";

        }

        if (totalLoaned) {

            totalLoaned.textContent =
                "₦0";

        }

        if (outstandingLoans) {

            outstandingLoans.textContent =
                "₦0";

        }

        if (totalLoanRepayments) {

            totalLoanRepayments.textContent =
                "₦0";

        }

        if (totalInterest) {

            totalInterest.textContent =
                "₦0";

        }

    }

}


// ======================================================
// LOAD LOAN ACTIVITY
// ======================================================

async function loadLoanActivity() {

    try {

        const response =
            await fetch(
                "/api/dashboard/loan-activity",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load loan activity."
            );

        }


        const loans =
            await response.json();


        // ===============================
        // NO LOANS
        // ===============================

        if (
            !loans ||
            loans.length === 0
        ) {

            if (loanActivity) {

                loanActivity.innerHTML = `
                    <p>
                        No loan activity yet.
                    </p>
                `;

            }

            return;

        }


        // ===============================
        // CLEAR OLD ACTIVITY
        // ===============================

        if (loanActivity) {

            loanActivity.innerHTML =
                "";

        }


        // ===============================
        // DISPLAY LOANS
        // ===============================

        loans.forEach(
            loan => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "loan-activity-item";


                const progress =
                    Number(
                        loan.repaymentProgress || 0
                    );


                item.innerHTML = `

                    <div class="loan-activity-main">

                        <div>

                            <strong>
                                ${loan.memberName}
                            </strong>

                            <p>
                                ${loan.groupName}
                            </p>

                        </div>


                        <div>

                            <strong>
                                ${formatMoney(
                                    loan.principalAmount
                                )}
                            </strong>

                            <p>
                                Principal
                            </p>

                        </div>

                    </div>


                    <div class="loan-activity-details">

                        <span>
                            Interest:
                            ${formatMoney(
                                loan.interestAmount
                            )}
                        </span>


                        <span>
                            Total:
                            ${formatMoney(
                                loan.totalRepayment
                            )}
                        </span>


                        <span>
                            Repaid:
                            ${formatMoney(
                                loan.amountRepaid
                            )}
                        </span>


                        <span>
                            Outstanding:
                            ${formatMoney(
                                loan.outstandingBalance
                            )}
                        </span>

                    </div>


                    <div class="loan-progress">

                        <div class="loan-progress-bar">

                            <div
                                class="loan-progress-fill"
                                style="width: ${Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        progress
                                    )
                                )}%"
                            ></div>

                        </div>


                        <div class="loan-progress-info">

                            <span>
                                Repayment Progress
                            </span>

                            <strong>
                                ${progress}%
                            </strong>

                        </div>

                    </div>

                    <button
                        type="button"
                        class="view-loan-details-button"
                        data-loan-id="${loan.id}"
                        data-group-id="${loan.groupId}"
                    >
                        View Loan Details
                    </button>


                    <div class="loan-activity-footer">

                        <span>
                            Status:
                            ${loan.status}
                        </span>


                        <span>
                            Loan Date:
                            ${loan.loanDate || "-"}
                        </span>


                        <span>
                            Due:
                            ${loan.dueDate || "Not set"}
                        </span>

                    </div>

                `;


                loanActivity.appendChild(
                    item
                );

                const viewLoanDetailsButton =
    item.querySelector(
        ".view-loan-details-button"
    );

if (viewLoanDetailsButton) {

    viewLoanDetailsButton.addEventListener(
        "click",
        () => {

            const loanId =
                viewLoanDetailsButton.dataset.loanId;

            const groupId =
                viewLoanDetailsButton.dataset.groupId;

            window.location.href =
                `group-details.html?id=${groupId}&loanId=${loanId}`;

        }
    );

}

            }
        );

    } catch (error) {

        console.error(
            "Loan activity error:",
            error
        );


        if (loanActivity) {

            loanActivity.innerHTML = `
                <p>
                    Unable to load loan activity.
                </p>
            `;

        }

    }

}


// ======================================================
// LOAD EVERYTHING
// ======================================================

async function loadDashboard() {

    await Promise.all([

        // Main dashboard
        loadDashboardSummary(),

        // Ajo health
        loadDashboardHealth(),

        // Payouts
        loadUpcomingPayouts(),

        // Loan summary
        loadLoanDashboard(),

        // Loan activity
        loadLoanActivity()

    ]);

}


// ======================================================
// REFRESH BUTTON
// ======================================================

if (refreshDashboard) {

    refreshDashboard.addEventListener(
        "click",
        loadDashboard
    );

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadDashboard();