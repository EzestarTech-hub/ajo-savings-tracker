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

        totalGroups.textContent =
            data.totalGroups;

        totalMembers.textContent =
            data.totalMembers;

        totalContributions.textContent =
            formatMoney(
                data.totalContributions
            );

        totalPayouts.textContent =
            formatMoney(
                data.totalPayouts
            );

        availableBalance.textContent =
            formatMoney(
                data.availableBalance
            );

        pendingPayouts.textContent =
            formatMoney(
                data.pendingPayouts
            );


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

        healthStatus.textContent =
            data.status;

        healthMessage.textContent =
            data.message;


        // ===============================
        // UPDATE HEALTH CLASS
        // ===============================

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


    } catch (error) {

        console.error(
            "Dashboard health error:",
            error
        );

        healthStatus.textContent =
            "Unable to load";

        healthMessage.textContent =
            "Could not load Ajo health information.";

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

        pendingCount.textContent =
            `${payouts.length} pending`;


        // ===============================
        // NO PAYOUTS
        // ===============================

        if (
            payouts.length === 0
        ) {

            upcomingPayouts.innerHTML = `
                <p>
                    No upcoming payouts.
                </p>
            `;

            return;

        }


        // ===============================
        // DISPLAY PAYOUTS
        // ===============================

        upcomingPayouts.innerHTML =
            "";


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


                upcomingPayouts.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Upcoming payouts error:",
            error
        );

        upcomingPayouts.innerHTML = `
            <p>
                Unable to load payout schedule.
            </p>
        `;

        pendingCount.textContent =
            "0 pending";

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