// ======================================================
// AJO SAVINGS TRACKER - DASHBOARD
// ======================================================

// ======================================================
// GET HTML ELEMENTS
// ======================================================

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
        // UPDATE SUMMARY CARDS
        // ===============================

        if (totalGroups) {

            totalGroups.textContent =
                data.totalGroups;

        }


        if (totalMembers) {

            totalMembers.textContent =
                data.totalMembers;

        }


        if (totalContributions) {

            totalContributions.textContent =
                formatMoney(
                    data.totalContributions
                );

        }


        if (totalPayouts) {

            totalPayouts.textContent =
                formatMoney(
                    data.totalPayouts
                );

        }


        if (availableBalance) {

            availableBalance.textContent =
                formatMoney(
                    data.availableBalance
                );

        }


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
        // DISPLAY PAYOUTS
        // ===============================

        if (upcomingPayouts) {

            upcomingPayouts.innerHTML =
                "";

        }


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
// LOAD EVERYTHING
// ======================================================

async function loadDashboard() {

    await Promise.all([

        loadDashboardSummary(),

        loadDashboardHealth(),

        loadUpcomingPayouts()

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