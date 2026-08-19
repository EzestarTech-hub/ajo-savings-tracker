// ======================================================
// AJO SAVINGS TRACKER - GROUP DETAILS
// ======================================================


// ======================================================
// GET GROUP ID FROM URL
// ======================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const groupId =
    urlParams.get("id");


// ======================================================
// GET HTML ELEMENTS
// ======================================================

const groupName =
    document.getElementById("groupName");

const memberCount =
    document.getElementById("memberCount");

const totalContribution =
    document.getElementById("totalContribution");

const cycleOverview =
    document.getElementById("cycleOverview");

const memberList =
    document.getElementById("memberList");

const addMember =
    document.getElementById("addMember");

const memberForm =
    document.getElementById("memberForm");

const memberName =
    document.getElementById("memberName");

const saveMember =
    document.getElementById("saveMember");

const contributionForm =
    document.getElementById("contributionForm");

const selectedMember =
    document.getElementById("selectedMember");

const contributionAmount =
    document.getElementById("contributionAmount");

const paymentDate =
    document.getElementById("paymentDate");

const saveContribution =
    document.getElementById("saveContribution");

const payoutForm =
    document.getElementById("payoutForm");

const selectedPayoutMember =
    document.getElementById("selectedPayoutMember");

const payoutAmount =
    document.getElementById("payoutAmount");

const payoutDate =
    document.getElementById("payoutDate");

const savePayout =
    document.getElementById("savePayout");

const addScheduleButton =
    document.getElementById("addScheduleButton");

const scheduleForm =
    document.getElementById("scheduleForm");

const scheduleMember =
    document.getElementById("scheduleMember");

const scheduleAmount =
    document.getElementById("scheduleAmount");

const scheduleDate =
    document.getElementById("scheduleDate");

const saveSchedule =
    document.getElementById("saveSchedule");

const payoutScheduleList =
    document.getElementById("payoutScheduleList");


// ======================================================
// MEMBER SELECTION
// ======================================================

let selectedContributionMemberId = null;

let selectedPayoutMemberId = null;


// ======================================================
// GROUP SETTINGS
// ======================================================

let currentGroupType = "individual";

let currentLoanInterestRate = 0;

let currentLoanRepaymentMonths = 0;


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(amount) {

    return `₦${Number(
        amount || 0
    ).toLocaleString()}`;

}


// ======================================================
// CHECK GROUP ID
// ======================================================

if (!groupId) {

    alert(
        "No group ID was provided."
    );

}


// ======================================================
// LOAD GROUP SUMMARY
// ======================================================

async function loadGroupSummary() {

    try {

        const response =
            await fetch(
                `/api/groups/${groupId}/summary`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load group summary."
            );

        }

        const data =
            await response.json();

        groupName.textContent =
            data.groupName;

        memberCount.textContent =
            data.numberOfMembers;

        totalContribution.textContent =
            formatMoney(
                data.totalContribution
            );

            const cooperativeSettingsDisplay =
    document.getElementById(
        "cooperativeSettingsDisplay"
    );

const groupCoordinatorFee =
    document.getElementById(
        "groupCoordinatorFee"
    );

const groupLoanInterestRate =
    document.getElementById(
        "groupLoanInterestRate"
    );

const groupLoanRepaymentMonths =
    document.getElementById(
        "groupLoanRepaymentMonths"
    );


if (
    data.groupType ===
    "cooperative"
) {

    cooperativeSettingsDisplay.style.display =
        "grid";

    groupCoordinatorFee.textContent =
        formatMoney(
            data.coordinatorFee
        );

    groupLoanInterestRate.textContent =
        `${data.loanInterestRate}%`;

    groupLoanRepaymentMonths.textContent =
        `${data.loanRepaymentMonths} months`;

    } else {

    cooperativeSettingsDisplay.style.display =
        "none";

}

    } catch (error) {

        console.error(
            "Group summary error:",
            error
        );

        groupName.textContent =
            "Unable to load group";

    }

}


// ======================================================
// LOAD CYCLE OVERVIEW
// ======================================================

async function loadCycleOverview() {

    try {

        const response =
            await fetch(
                `/api/groups/${groupId}/cycle-overview`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load cycle overview."
            );

        }

        const data =
            await response.json();

        const group =
            data.group;

        const cycle =
            data.cycle;

        groupName.textContent =
            group.name;

        currentGroupType =
            group.groupType ||
            "individual";

        currentLoanInterestRate =
            Number(
                group.loanInterestRate || 0
            );

        currentLoanRepaymentMonths =
            Number(
                group.loanRepaymentMonths || 0
            );

        cycleOverview.innerHTML = `

            <div class="card">

                <h3>
                    Contribution
                </h3>

                <p>
                    ${formatMoney(
                        group.contributionAmount
                    )}
                    /
                    ${group.frequency}
                </p>

            </div>

            <div class="card">

                <h3>
                    Current Cycle
                </h3>

                <p>
                    ${cycle.elapsedCycles}
                </p>

            </div>

            <div class="card">

                <h3>
                    Expected
                </h3>

                <p>
                    ${formatMoney(
                        cycle.totalExpected || 0
                    )}
                </p>

            </div>

            <div class="card">

                <h3>
                    Current Contribution
                </h3>

                <p>
                    ${formatMoney(
                        cycle.totalActual
                    )}
                </p>

            </div>

            <div class="card">

                <h3>
                    Total Contribution To Date
                </h3>

                <p>
                    ${formatMoney(
                        cycle.totalContributionToDate
                    )}
                </p>

            </div>

            <div class="card">

                <h3>
                    Outstanding
                </h3>

                <p>
                    ${formatMoney(
                        cycle.outstanding
                    )}
                </p>

            </div>

            <div class="card">

                <h3>
                    Progress
                </h3>

                <p>
                    ${cycle.progress}%
                </p>

            </div>

            <div class="card">

                <h3>
                    Status
                </h3>

                <p>
                    ${cycle.status}
                </p>

            </div>

        `;

    } catch (error) {

        console.error(
            "Cycle overview error:",
            error
        );

        cycleOverview.innerHTML = `
            <p>
                Unable to load cycle overview.
            </p>
        `;

    }

}

// ======================================================
// LOAD MEMBERS
// ======================================================

async function loadMembers() {

    try {

        const response =
            await fetch(
                `/api/groups/${groupId}/members`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load members."
            );

        }

        const members =
            await response.json();

        memberList.innerHTML = "";

        if (members.length === 0) {

            memberList.innerHTML = `
                <p>
                    No members yet.
                </p>
            `;

            updateScheduleMembers(
                members
            );

            return;

        }


        // ==================================================
        // LOAD EACH MEMBER
        // ==================================================

        for (const member of members) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "card";


            // ==================================================
            // LOAD MEMBER BALANCE
            // ==================================================

            let memberBalance = 0;

            try {

                const balanceResponse =
                    await fetch(
                        `/api/members/${member.id}/balance`,
                        {
                            cache: "no-store"
                        }
                    );

                if (balanceResponse.ok) {

                    const balanceData =
                        await balanceResponse.json();

                    memberBalance =
                        Number(
                            balanceData.balance || 0
                        );

                }

            } catch (balanceError) {

                console.error(
                    `Unable to load balance for member ${member.id}:`,
                    balanceError
                );

            }


            // ==================================================
            // LOAN BUTTONS
            // ==================================================

            let loanButtonHTML = "";

            console.log(
                "CURRENT GROUP TYPE:",
                currentGroupType
            );

            if (
                currentGroupType ===
                "cooperative"
            ) {

                loanButtonHTML = `

                    <button
                        type="button"
                        class="create-loan-button"
                    >
                        Create Loan
                    </button>

                    <button
                        type="button"
                        class="view-loans-button"
                    >
                        View Loans
                    </button>

                `;

            }


            // ==================================================
            // MEMBER CARD
            // ==================================================

            item.innerHTML = `

                <h3>
                    ${member.name}
                </h3>

                <p>
                    <strong>
                        Savings Balance:
                    </strong>

                    ${formatMoney(
                        memberBalance
                    )}
                </p>

                <button
                    type="button"
                    class="contribution-button"
                >
                    Record Contribution
                </button>

                <button
                    type="button"
                    class="view-contributions-button"
                >
                    View Contributions
                </button>

                <button
                    type="button"
                    class="payout-button"
                >
                    Record Payout
                </button>

                <button
                    type="button"
                    class="view-payouts-button"
                >
                    View Payouts
                </button>

                ${loanButtonHTML}

            `;


            // ==================================================
            // RECORD CONTRIBUTION
            // ==================================================

            const contributionButton =
                item.querySelector(
                    ".contribution-button"
                );

            contributionButton.addEventListener(
                "click",
                () => {

                    selectedContributionMemberId =
                        member.id;

                    selectedMember.textContent =
                        `Member: ${member.name}`;

                    contributionForm.style.display =
                        "block";

                    contributionForm.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );


            // ==================================================
            // VIEW CONTRIBUTIONS
            // ==================================================

            const viewContributionsButton =
                item.querySelector(
                    ".view-contributions-button"
                );

            viewContributionsButton.addEventListener(
                "click",
                () => {

                    loadMemberContributions(
                        member.id
                    );

                }
            );


            // ==================================================
            // RECORD PAYOUT
            // ==================================================

            const payoutButton =
                item.querySelector(
                    ".payout-button"
                );

            payoutButton.addEventListener(
                "click",
                () => {

                    selectedPayoutMemberId =
                        member.id;

                    selectedPayoutMember.textContent =
                        `Member: ${member.name}`;

                    payoutForm.style.display =
                        "block";

                    payoutForm.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );


            // ==================================================
            // VIEW PAYOUTS
            // ==================================================

            const viewPayoutsButton =
                item.querySelector(
                    ".view-payouts-button"
                );

            viewPayoutsButton.addEventListener(
                "click",
                () => {

                    loadMemberPayouts(
                        member.id
                    );

                }
            );


            // ==================================================
            // CREATE LOAN
            // ==================================================

            const createLoanButton =
                item.querySelector(
                    ".create-loan-button"
                );

            if (createLoanButton) {

                createLoanButton.addEventListener(
                    "click",
                    () => {

                        showLoanForm(
                            member.id,
                            member.name
                        );

                    }
                );

            }


            // ==================================================
            // VIEW LOANS
            // ==================================================

            const viewLoansButton =
                item.querySelector(
                    ".view-loans-button"
                );

            if (viewLoansButton) {

                viewLoansButton.addEventListener(
                    "click",
                    () => {

                        loadMemberLoans(
                            member.id,
                            member.name
                        );

                    }
                );

            }


            // ==================================================
            // ADD MEMBER CARD TO PAGE
            // ==================================================

            memberList.appendChild(
                item
            );

        }


        // ==================================================
        // UPDATE SCHEDULE MEMBERS
        // ==================================================

        updateScheduleMembers(
            members
        );


    } catch (error) {

        console.error(
            "Members error:",
            error
        );

        memberList.innerHTML = `
            <p>
                Unable to load members.
            </p>
        `;

    }

}



// ======================================================
// LOAD MEMBER CONTRIBUTIONS
// ======================================================

async function loadMemberContributions(
    memberId
) {

    try {

        const response =
            await fetch(
                `/api/members/${memberId}/contributions`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load contributions."
            );

        }

        const contributions =
            await response.json();

        const contributionHistory =
            document.getElementById(
                "contributionHistory"
            );

        const contributionHistoryList =
            document.getElementById(
                "contributionHistoryList"
            );

        if (
            !contributionHistory ||
            !contributionHistoryList
        ) {

            return;

        }

        contributionHistory.style.display =
            "block";

        contributionHistoryList.innerHTML =
            "";

        if (contributions.length === 0) {

            contributionHistoryList.innerHTML = `
                <p>
                    This member has no contributions yet.
                </p>
            `;

            return;

        }

        contributions.forEach(
            contribution => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "card";

                item.innerHTML = `

                    <p>
                        <strong>
                            Amount:
                        </strong>

                        ${formatMoney(
                            contribution.amount
                        )}
                    </p>

                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${contribution.payment_date}
                    </p>

                    <p>
                        <strong>
                            Contribution ID:
                        </strong>

                        ${contribution.id}
                    </p>

                    <button
                        type="button"
                        class="edit-contribution-button"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-contribution-button"
                    >
                        Delete
                    </button>

                `;


                // EDIT CONTRIBUTION

                const editButton =
                    item.querySelector(
                        ".edit-contribution-button"
                    );

                editButton.addEventListener(
                    "click",
                    async () => {

                        const newAmount =
                            prompt(
                                "Enter new contribution amount:",
                                contribution.amount
                            );

                        if (
                            newAmount === null
                        ) {

                            return;

                        }

                        if (
                            Number(newAmount) <= 0
                        ) {

                            alert(
                                "Enter a valid amount."
                            );

                            return;

                        }

                        const newDate =
                            prompt(
                                "Enter new payment date:",
                                contribution.payment_date
                            );

                        if (!newDate) {

                            return;

                        }

                        try {

                            const updateResponse =
                                await fetch(
                                    `/api/members/contributions/${contribution.id}`,
                                    {
                                        method: "PUT",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify({
                                                amount:
                                                    Number(
                                                        newAmount
                                                    ),

                                                payment_date:
                                                    newDate
                                            })
                                    }
                                );

                            const updateData =
                                await updateResponse.json();

                            if (
                                !updateResponse.ok
                            ) {

                                alert(
                                    updateData.error ||
                                    "Unable to update contribution."
                                );

                                return;

                            }

                            alert(
                                updateData.message
                            );

                            await loadGroupSummary();

                            await loadCycleOverview();

                            await loadMembers();

                            await loadMemberContributions(
                                memberId
                            );

                        } catch (error) {

                            console.error(
                                "Update contribution error:",
                                error
                            );

                            alert(
                                "Unable to update contribution."
                            );

                        }

                    }
                );


                // DELETE CONTRIBUTION

                const deleteButton =
                    item.querySelector(
                        ".delete-contribution-button"
                    );

                deleteButton.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                `Delete contribution of ${formatMoney(
                                    contribution.amount
                                )} dated ${contribution.payment_date}?`
                            );

                        if (!confirmed) {

                            return;

                        }

                        try {

                            const deleteResponse =
                                await fetch(
                                    `/api/members/contributions/${contribution.id}`,
                                    {
                                        method: "DELETE"
                                    }
                                );

                            const deleteData =
                                await deleteResponse.json();

                            if (
                                !deleteResponse.ok
                            ) {

                                alert(
                                    deleteData.error ||
                                    "Unable to delete contribution."
                                );

                                return;

                            }

                            alert(
                                deleteData.message
                            );

                            await loadGroupSummary();

                            await loadCycleOverview();

                            await loadMembers();

                            await loadMemberContributions(
                                memberId
                            );

                        } catch (error) {

                            console.error(
                                "Delete contribution error:",
                                error
                            );

                            alert(
                                "Unable to delete contribution."
                            );

                        }

                    }
                );

                contributionHistoryList.appendChild(
                    item
                );

            }
        );

        contributionHistory.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Member contributions error:",
            error
        );

        alert(
            "Unable to load contribution history."
        );

    }

}


// ======================================================
// LOAD MEMBER PAYOUTS
// ======================================================

async function loadMemberPayouts(
    memberId
) {

    try {

        const response =
            await fetch(
                `/api/members/${memberId}/payouts`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load payouts."
            );

        }

        const payouts =
            await response.json();

        const payoutHistory =
            document.getElementById(
                "payoutHistory"
            );

        const payoutHistoryList =
            document.getElementById(
                "payoutHistoryList"
            );

        if (
            !payoutHistory ||
            !payoutHistoryList
        ) {

            return;

        }

        payoutHistory.style.display =
            "block";

        payoutHistoryList.innerHTML =
            "";

        if (payouts.length === 0) {

            payoutHistoryList.innerHTML = `
                <p>
                    This member has no payouts yet.
                </p>
            `;

            payoutHistory.scrollIntoView({
                behavior: "smooth"
            });

            return;

        }

        payouts.forEach(
            payout => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "card";

                item.innerHTML = `

                    <p>
                        <strong>
                            Amount:
                        </strong>

                        ${formatMoney(
                            payout.amount
                        )}
                    </p>

                    <p>
                        <strong>
                            Date:
                        </strong>

                        ${payout.payout_date}
                    </p>

                    <p>
                        <strong>
                            Payout ID:
                        </strong>

                        ${payout.id}
                    </p>

                    <button
                        type="button"
                        class="edit-payout-button"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-payout-button"
                    >
                        Delete
                    </button>

                `;


                // EDIT PAYOUT

                const editPayoutButton =
                    item.querySelector(
                        ".edit-payout-button"
                    );

                editPayoutButton.addEventListener(
                    "click",
                    async () => {

                        const newAmount =
                            prompt(
                                "Enter new payout amount:",
                                payout.amount
                            );

                        if (
                            newAmount === null ||
                            Number(newAmount) <= 0
                        ) {

                            alert(
                                "Invalid amount."
                            );

                            return;

                        }

                        const newDate =
                            prompt(
                                "Enter new payout date:",
                                payout.payout_date
                            );

                        if (!newDate) {

                            alert(
                                "Invalid payout date."
                            );

                            return;

                        }

                        try {

                            const updateResponse =
                                await fetch(
                                    `/api/members/payouts/${payout.id}`,
                                    {
                                        method: "PUT",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify({
                                                amount:
                                                    Number(
                                                        newAmount
                                                    ),

                                                payout_date:
                                                    newDate
                                            })
                                    }
                                );

                            const updateData =
                                await updateResponse.json();

                            if (!updateResponse.ok) {

                                alert(
                                    updateData.error ||
                                    "Unable to update payout."
                                );

                                return;

                            }

                            alert(
                                updateData.message
                            );

                            await loadGroupSummary();

                            await loadCycleOverview();

                            await loadMembers();

                            await loadMemberPayouts(
                                memberId
                            );

                        } catch (error) {

                            console.error(
                                "Update payout error:",
                                error
                            );

                            alert(
                                "Unable to update payout."
                            );

                        }

                    }
                );


                // DELETE PAYOUT

                const deletePayoutButton =
                    item.querySelector(
                        ".delete-payout-button"
                    );

                deletePayoutButton.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                `Are you sure you want to delete this payout of ${formatMoney(
                                    payout.amount
                                )}?`
                            );

                        if (!confirmed) {

                            return;

                        }

                        try {

                            const deleteResponse =
                                await fetch(
                                    `/api/members/payouts/${payout.id}`,
                                    {
                                        method: "DELETE"
                                    }
                                );

                            const deleteData =
                                await deleteResponse.json();

                            if (!deleteResponse.ok) {

                                alert(
                                    deleteData.error ||
                                    "Unable to delete payout."
                                );

                                return;

                            }

                            alert(
                                deleteData.message
                            );

                            await loadGroupSummary();

                            await loadCycleOverview();

                            await loadMembers();

                            await loadMemberPayouts(
                                memberId
                            );

                        } catch (error) {

                            console.error(
                                "Delete payout error:",
                                error
                            );

                            alert(
                                "Unable to delete payout."
                            );

                        }

                    }
                );

                payoutHistoryList.appendChild(
                    item
                );

            }
        );

        payoutHistory.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Member payouts error:",
            error
        );

        alert(
            "Unable to load payout history."
        );

    }

}


// ======================================================
// ADD MEMBER
// ======================================================

if (addMember) {

    addMember.addEventListener(
        "click",
        () => {

            memberForm.style.display =
                memberForm.style.display === "none"
                    ? "block"
                    : "none";

        }
    );

}


// ======================================================
// SAVE MEMBER
// ======================================================

if (saveMember) {

    saveMember.addEventListener(
        "click",
        async () => {

            const name =
                memberName.value.trim();

            if (!name) {

                alert(
                    "Please enter a member name."
                );

                return;

            }

            try {

                const response =
                    await fetch(
                        `/api/groups/${groupId}/members`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name: name
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to add member."
                    );

                    return;

                }

                alert(
                    data.message
                );

                memberName.value =
                    "";

                memberForm.style.display =
                    "none";

                await loadGroupSummary();

                await loadCycleOverview();

                await loadMembers();

            } catch (error) {

                console.error(
                    "Add member error:",
                    error
                );

                alert(
                    "Something went wrong."
                );

            }

        }
    );

}


// ======================================================
// SAVE CONTRIBUTION
// ======================================================

if (saveContribution) {

    saveContribution.addEventListener(
        "click",
        async () => {

            if (!selectedContributionMemberId) {

                alert(
                    "Please select a member."
                );

                return;

            }

            const amount =
                Number(
                    contributionAmount.value
                );

            const date =
                paymentDate.value;

            if (
                !amount ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Enter a valid contribution amount and date."
                );

                return;

            }

            try {

                const response =
                    await fetch(
                        `/api/members/${selectedContributionMemberId}/contributions`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    amount: amount,
                                    payment_date: date
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to record contribution."
                    );

                    return;

                }

                alert(
                    data.message
                );

                contributionAmount.value =
                    "";

                paymentDate.value =
                    "";

                contributionForm.style.display =
                    "none";

                await loadGroupSummary();

                await loadCycleOverview();

                await loadMembers();

            } catch (error) {

                console.error(
                    "Contribution error:",
                    error
                );

                alert(
                    "Something went wrong."
                );

            }

        }
    );

}


// ======================================================
// SAVE PAYOUT
// ======================================================

if (savePayout) {

    savePayout.addEventListener(
        "click",
        async () => {

            if (!selectedPayoutMemberId) {

                alert(
                    "Please select a member."
                );

                return;

            }

            const amount =
                Number(
                    payoutAmount.value
                );

            const date =
                payoutDate.value;

            if (
                !amount ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Enter a valid payout amount and date."
                );

                return;

            }

            try {

                const response =
                    await fetch(
                        `/api/members/${selectedPayoutMemberId}/payouts`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    amount: amount,
                                    payout_date: date
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to record payout."
                    );

                    return;

                }

                alert(
                    data.message
                );

                payoutAmount.value =
                    "";

                payoutDate.value =
                    "";

                payoutForm.style.display =
                    "none";

                await loadGroupSummary();

                await loadCycleOverview();

                await loadMembers();

                await loadPayoutSchedule();

            } catch (error) {

                console.error(
                    "Payout error:",
                    error
                );

                alert(
                    "Something went wrong."
                );

            }

        }
    );

}


// ======================================================
// PAYOUT SCHEDULE
// ======================================================

if (addScheduleButton) {

    addScheduleButton.addEventListener(
        "click",
        () => {

            scheduleForm.style.display =
                scheduleForm.style.display === "none"
                    ? "block"
                    : "none";

        }
    );

}


function updateScheduleMembers(
    members
) {

    if (!scheduleMember) {

        return;

    }

    scheduleMember.innerHTML = `
        <option value="">
            Select Member
        </option>
    `;

            members.forEach(
            async member => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                member.id;

            option.textContent =
                member.name;

            scheduleMember.appendChild(
                option
            );

        }
    );

}


if (saveSchedule) {

    saveSchedule.addEventListener(
        "click",
        async () => {

            const memberId =
                scheduleMember.value;

            const amount =
                Number(
                    scheduleAmount.value
                );

            const date =
                scheduleDate.value;

            if (
                !memberId ||
                !amount ||
                amount <= 0 ||
                !date
            ) {

                alert(
                    "Select a member and enter a valid amount and date."
                );

                return;

            }

            try {

                const response =
                    await fetch(
                        "/api/schedule",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    group_id:
                                        Number(groupId),

                                    member_id:
                                        Number(memberId),

                                    amount:
                                        amount,

                                    payout_date:
                                        date
                                })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to create payout schedule."
                    );

                    return;

                }

                alert(
                    data.message
                );

                scheduleMember.value =
                    "";

                scheduleAmount.value =
                    "";

                scheduleDate.value =
                    "";

                scheduleForm.style.display =
                    "none";

                await loadPayoutSchedule();

            } catch (error) {

                console.error(
                    "Schedule error:",
                    error
                );

                alert(
                    "Something went wrong."
                );

            }

        }
    );

}


async function markScheduleAsPaid(
    scheduleId
) {

    try {

        const response =
            await fetch(
                `/api/schedule/${scheduleId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status: "Paid"
                        })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Unable to mark payout as Paid."
            );

            return;

        }

        alert(
            data.message
        );

        await loadPayoutSchedule();

    } catch (error) {

        console.error(
            "Mark schedule paid error:",
            error
        );

        alert(
            "Something went wrong."
        );

    }

}


async function loadPayoutSchedule() {

    if (!payoutScheduleList) {

        return;

    }

    try {

        const response =
            await fetch(
                `/api/schedule/group/${groupId}`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load payout schedule."
            );

        }

        const schedules =
            await response.json();

        payoutScheduleList.innerHTML =
            "";

        if (schedules.length === 0) {

            payoutScheduleList.innerHTML = `
                <p>
                    No payout schedules.
                </p>
            `;

            return;

        }

        schedules.forEach(
            schedule => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "card";

                item.innerHTML = `

                    <h3>
                        ${schedule.member_name}
                    </h3>

                    <p>
                        Amount:
                        ${formatMoney(
                            schedule.amount
                        )}
                    </p>

                    <p>
                        Date:
                        ${schedule.payout_date}
                    </p>

                    <p>
                        Status:
                        ${schedule.status}
                    </p>

                    <div class="schedule-action">

                        ${
                            schedule.status === "Pending"
                                ? `
                                    <button
                                        type="button"
                                        class="mark-paid-button"
                                    >
                                        Mark as Paid
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        disabled
                                    >
                                        Paid
                                    </button>
                                `
                        }

                    </div>

                `;

                const markPaidButton =
                    item.querySelector(
                        ".mark-paid-button"
                    );

                if (markPaidButton) {

                    markPaidButton.addEventListener(
                        "click",
                        () => {

                            markScheduleAsPaid(
                                schedule.id
                            );

                        }
                    );

                }

                payoutScheduleList.appendChild(
                    item
                );

            }
        );

    } catch (error) {

        console.error(
            "Payout schedule error:",
            error
        );

        payoutScheduleList.innerHTML = `
            <p>
                Unable to load payout schedule.
            </p>
        `;

    }

}


// ======================================================
// LOAN SECTION
// ======================================================

let loanSection =
    document.getElementById(
        "loanSection"
    );

if (!loanSection) {

    loanSection =
        document.createElement(
            "section"
        );

    loanSection.id =
        "loanSection";

    loanSection.style.display =
        "none";

    loanSection.style.marginTop =
        "20px";

    document.body.appendChild(
        loanSection
    );

}


// ======================================================
// SHOW LOAN FORM
// ======================================================

function showLoanForm(
    memberId,
    memberName
) {

    if (
        currentGroupType !==
        "cooperative"
    ) {

        alert(
            "Loans are only available for Cooperative Ajo groups."
        );

        return;

    }

    loanSection.style.display =
        "block";

    loanSection.innerHTML = `

        <div class="card">

            <h2>
                Create Loan
            </h2>

            <p>
                <strong>
                    Member:
                </strong>

                ${memberName}
            </p>

            <p>
                <strong>
                    Interest Rate:
                </strong>

                ${currentLoanInterestRate}%
            </p>

            <p>
                <strong>
                    Repayment Period:
                </strong>

                ${currentLoanRepaymentMonths}
                month(s)
            </p>

            <label>
                Loan Amount
            </label>

            <input
                type="number"
                id="loanPrincipalAmount"
                min="1"
                step="0.01"
                placeholder="Enter loan amount"
            >

            <br><br>

            <label>
                Start Date
            </label>

            <input
                type="date"
                id="loanStartDate"
            >

            <br><br>

            <button
                type="button"
                id="saveLoanButton"
            >
                Create Loan
            </button>

            <button
                type="button"
                id="cancelLoanButton"
            >
                Cancel
            </button>

        </div>

    `;

    const loanStartDate =
        document.getElementById(
            "loanStartDate"
        );

    loanStartDate.value =
        new Date()
            .toISOString()
            .split("T")[0];

    const saveLoanButton =
        document.getElementById(
            "saveLoanButton"
        );

    const cancelLoanButton =
        document.getElementById(
            "cancelLoanButton"
        );

    saveLoanButton.addEventListener(
        "click",
        () => {

            createLoan(
                memberId,
                memberName
            );

        }
    );

    cancelLoanButton.addEventListener(
        "click",
        () => {

            loanSection.style.display =
                "none";

            loanSection.innerHTML =
                "";

        }
    );

    loanSection.scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================================
// CREATE LOAN
// ======================================================

async function createLoan(
    memberId,
    memberName
) {

    const amountInput =
        document.getElementById(
            "loanPrincipalAmount"
        );

    const startDateInput =
        document.getElementById(
            "loanStartDate"
        );

    const principalAmount =
        Number(
            amountInput.value
        );

    const startDate =
        startDateInput.value;

    if (
        !Number.isFinite(
            principalAmount
        ) ||
        principalAmount <= 0
    ) {

        alert(
            "Enter a valid loan amount."
        );

        return;

    }

    if (!startDate) {

        alert(
            "Select the loan start date."
        );

        return;

    }

    if (
        currentLoanInterestRate <= 0
    ) {

        alert(
            "This cooperative has not configured a valid loan interest rate."
        );

        return;

    }

    if (
        currentLoanRepaymentMonths <= 0
    ) {

        alert(
            "This cooperative has not configured a valid loan repayment period."
        );

        return;

    }

    const interestAmount =
        principalAmount *
        (
            currentLoanInterestRate /
            100
        );

    const totalRepayment =
        principalAmount +
        interestAmount;

    const confirmed =
        confirm(
            `Create loan for ${memberName}?\n\n` +
            `Principal: ${formatMoney(principalAmount)}\n` +
            `Interest: ${formatMoney(interestAmount)}\n` +
            `Total repayment: ${formatMoney(totalRepayment)}\n` +
            `Repayment period: ${currentLoanRepaymentMonths} month(s)`
        );

    if (!confirmed) {

        return;

    }

    try {

        const response =
            await fetch(
                "/api/loans",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            group_id:
                                Number(groupId),

                            member_id:
                                Number(memberId),

                            principal_amount:
                                principalAmount,

                            start_date:
                                startDate

                        })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Unable to create loan."
            );

            return;

        }

        alert(
            data.message ||
            "Loan created successfully!"
        );

        loanSection.style.display =
            "none";

        loanSection.innerHTML =
            "";

        await loadMembers();

        await loadMemberLoans(
            memberId,
            memberName
        );

    } catch (error) {

        console.error(
            "Create loan error:",
            error
        );

        alert(
            "Unable to create loan."
        );

    }

}


// ======================================================
// LOAD MEMBER LOANS
// ======================================================

async function loadMemberLoans(
    memberId,
    memberName
) {

    try {

        const response =
            await fetch(
                `/api/loans/member/${memberId}`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load member loans."
            );

        }

        const loans =
            await response.json();

        loanSection.style.display =
            "block";

        loanSection.innerHTML = `

            <div class="card">

                <h2>
                    Loan History
                </h2>

                <h3>
                    ${memberName}
                </h3>

                <div id="memberLoanList">
                </div>

            </div>

        `;

        loanSection.style.display = "block";

        const memberLoanList =
            document.getElementById(
                "memberLoanList"
            );

        if (loans.length === 0) {

            memberLoanList.innerHTML = `
                <p>
                    This member has no loans.
                </p>
            `;

            loanSection.scrollIntoView({
                behavior: "smooth"
            });

            return;

        }

        loans.forEach(
            loan => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "card";

                item.innerHTML = `

                    <h3>
                        Loan #${loan.id}
                    </h3>

                    <p>
                        Principal:
                        ${formatMoney(
                            loan.principal_amount
                        )}
                    </p>

                    <p>
                        Interest Rate:
                        ${Number(
                            loan.interest_rate || 0
                        )}%
                    </p>

                    <p>
                        Interest:
                        ${formatMoney(
                            loan.interest_amount
                        )}
                    </p>

                    <p>
                        Total Repayment:
                        ${formatMoney(
                            loan.total_repayment
                        )}
                    </p>

                    <p>
                        Amount Repaid:
                        ${formatMoney(
                            loan.amount_repaid
                        )}
                    </p>

                    <p>
                        Outstanding:
                        ${formatMoney(
                            loan.outstanding_balance
                        )}
                    </p>

                    <p>
                        Repayment Months:
                        ${loan.repayment_months}
                    </p>

                    <p>
                        Start Date:
                        ${loan.start_date}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${loan.status}
                        </strong>
                    </p>

                    <button
                        type="button"
                        class="view-loan-details-button"
                    >
                        View Loan Details
                    </button>

                    ${
                        loan.status === "Active"
                            ? `
                                <button
                                    type="button"
                                    class="repay-loan-button"
                                >
                                    Record Repayment
                                </button>
                              `
                            : ""
                    }

                `;

                const viewDetailsButton =
                    item.querySelector(
                        ".view-loan-details-button"
                    );

                viewDetailsButton.addEventListener(
                    "click",
                    () => {

                        loadSingleLoan(
                            loan.id
                        );

                    }
                );

                const repayButton =
                    item.querySelector(
                        ".repay-loan-button"
                    );

                if (repayButton) {

                    repayButton.addEventListener(
                        "click",
                        () => {

                            showRepaymentForm(
                                loan,
                                memberId,
                                memberName
                            );

                        }
                    );

                }

                memberLoanList.appendChild(
                    item
                );

            }
        );

        loanSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Member loans error:",
            error
        );

        alert(
            "Unable to load member loans."
        );

    }

}


// ======================================================
// LOAD SINGLE LOAN
// ======================================================

async function loadSingleLoan(
    loanId
) {

    try {

        const response =
            await fetch(
                `/api/loans/${loanId}`,
                {
                    cache: "no-store"
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Unable to load loan."
            );

            return;

        }

        loanSection.style.display =
            "block";

        loanSection.innerHTML = `

            <div class="card">

                <h2>
                    Loan Details
                </h2>

                <p>
                    <strong>
                        Loan ID:
                    </strong>
                    ${data.loan.id}
                </p>

                <p>
                    <strong>
                        Member:
                    </strong>
                    ${data.loan.member_name}
                </p>

                <p>
                    <strong>
                        Group:
                    </strong>
                    ${data.loan.group_name}
                </p>

                <p>
                    <strong>
                        Principal:
                    </strong>
                    ${formatMoney(
                        data.loan.principal_amount
                    )}
                </p>

                <p>
                    <strong>
                        Interest Rate:
                    </strong>
                    ${data.loan.interest_rate}%
                </p>

                <p>
                    <strong>
                        Interest Amount:
                    </strong>
                    ${formatMoney(
                        data.loan.interest_amount
                    )}
                </p>

                <p>
                    <strong>
                        Total Repayment:
                    </strong>
                    ${formatMoney(
                        data.loan.total_repayment
                    )}
                </p>

                <p>
                    <strong>
                        Amount Repaid:
                    </strong>
                    ${formatMoney(
                        data.loan.amount_repaid
                    )}
                </p>

                <p>
                    <strong>
                        Outstanding:
                    </strong>
                    ${formatMoney(
                        data.loan.outstanding_balance
                    )}
                </p>

                <p>
                    <strong>
                        Status:
                    </strong>
                    ${data.loan.status}
                </p>

                <h3>
                    Repayment Schedule
                </h3>

                <div id="loanScheduleList">
                </div>

                <h3>
                    Repayment History
                </h3>

                <div id="loanRepaymentHistory">
                </div>

                <button
                    type="button"
                    id="closeLoanDetailsButton"
                >
                    Close
                </button>

            </div>

        `;

        const scheduleList =
            document.getElementById(
                "loanScheduleList"
            );

        const repaymentHistory =
            document.getElementById(
                "loanRepaymentHistory"
            );

        if (
            !data.schedule ||
            data.schedule.length === 0
        ) {

            scheduleList.innerHTML = `
                <p>
                    No repayment schedule found.
                </p>
            `;

        } else {

            data.schedule.forEach(
    schedule => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "card";

        item.innerHTML = `

            <p>
                <strong>
                    Cycle:
                </strong>

                ${schedule.cycle_number}
            </p>

            <p>
                <strong>
                    Date:
                </strong>

                ${schedule.due_date}
            </p>

            <p>
                <strong>
                    Expected:
                </strong>

                ${formatMoney(
                    schedule.expected_amount
                )}
            </p>

            <p>
    <strong>
        Paid:
    </strong>

    ${formatMoney(
        schedule.paid_amount
    )}
</p>

<p>
    <strong>
        Remaining:
    </strong>

    ${formatMoney(
        Math.max(
            0,
            Number(
                schedule.expected_amount || 0
            ) -
            Number(
                schedule.paid_amount || 0
            )
        )
    )}
</p>

<p>
    <strong>
        Status:
    </strong>

    ${schedule.status}
</p>
        `;

        scheduleList.appendChild(
            item
        );

    }
);

        }

        if (
    !data.repayments ||
    data.repayments.length === 0
) {

    repaymentHistory.innerHTML = `
        <p>
            No repayments recorded yet.
        </p>
    `;

} else {

    // Group repayment records by repayment ID
    const repaymentGroups = {};

    data.repayments.forEach(
        repayment => {

            if (
                !repaymentGroups[
                    repayment.id
                ]
            ) {

                repaymentGroups[
                    repayment.id
                ] = {
                    amount:
                        Number(
                            repayment.amount || 0
                        ),

                    payment_date:
                        repayment.payment_date,

                    allocations: []
                };

            }

            if (
                repayment.cycle_number !== null &&
                repayment.cycle_number !== undefined
            ) {

                repaymentGroups[
                    repayment.id
                ].allocations.push({
                    cycle_number:
                        repayment.cycle_number,

                    allocated_amount:
                        Number(
                            repayment.allocated_amount || 0
                        )
                });

            }

        }
    );

    Object.values(
        repaymentGroups
    ).forEach(
        repayment => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "card";

            let allocationHtml = "";

            if (
                repayment.allocations.length >
                0
            ) {

                allocationHtml = `
                    <div>
                        <strong>
                            Allocation:
                        </strong>

                        ${repayment.allocations
                            .map(
                                allocation => `
                                    <p>
                                        Cycle
                                        ${allocation.cycle_number}:
                                        ${formatMoney(
                                            allocation.allocated_amount
                                        )}
                                    </p>
                                `
                            )
                            .join("")}
                    </div>
                `;

            } else {

                allocationHtml = `
                    <p>
                        <strong>
                            Cycle:
                        </strong>

                        Not recorded
                    </p>
                `;

            }

            item.innerHTML = `

                <p>
                    <strong>
                        Amount:
                    </strong>

                    ${formatMoney(
                        repayment.amount
                    )}
                </p>

                <p>
                    <strong>
                        Date:
                    </strong>

                    ${repayment.payment_date}
                </p>

                ${allocationHtml}

            `;

            repaymentHistory.appendChild(
                item
            );

        }
    );

}

        const closeButton =
            document.getElementById(
                "closeLoanDetailsButton"
            );

        closeButton.addEventListener(
            "click",
            () => {

                loanSection.style.display =
                    "none";

                loanSection.innerHTML =
                    "";

            }
        );

        loanSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Single loan error:",
            error
        );

        alert(
            "Unable to load loan details."
        );

    }

}


// ======================================================
// SHOW REPAYMENT FORM
// ======================================================

function showRepaymentForm(
    loan,
    memberId,
    memberName
) {

    loanSection.style.display =
        "block";

    loanSection.innerHTML = `

        <div class="card">

            <h2>
                Record Loan Repayment
            </h2>

            <p>
                <strong>
                    Member:
                </strong>
                ${memberName}
            </p>

            <p>
                <strong>
                    Loan ID:
                </strong>
                ${loan.id}
            </p>

            <p>
                <strong>
                    Outstanding:
                </strong>
                ${formatMoney(
                    loan.outstanding_balance
                )}
            </p>

            <label>
                Repayment Amount
            </label>

            <input
                type="number"
                id="loanRepaymentAmount"
                min="1"
                step="0.01"
                max="${Number(
                    loan.outstanding_balance
                )}"
                placeholder="Enter repayment amount"
            >

            <br><br>

            <label>
                Repayment Date
            </label>

            <input
                type="date"
                id="loanRepaymentDate"
            >

            <br><br>

            <button
                type="button"
                id="saveLoanRepaymentButton"
            >
                Save Repayment
            </button>

            <button
                type="button"
                id="cancelLoanRepaymentButton"
            >
                Cancel
            </button>

        </div>

    `;

    const repaymentDate =
        document.getElementById(
            "loanRepaymentDate"
        );

    repaymentDate.value =
        new Date()
            .toISOString()
            .split("T")[0];

    const saveButton =
        document.getElementById(
            "saveLoanRepaymentButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelLoanRepaymentButton"
        );

    saveButton.addEventListener(
        "click",
        () => {

            recordLoanRepayment(
                loan,
                memberId,
                memberName
            );

        }
    );

    cancelButton.addEventListener(
        "click",
        () => {

            loanSection.style.display =
                "none";

            loanSection.innerHTML =
                "";

        }
    );

    loanSection.scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================================
// RECORD LOAN REPAYMENT
// ======================================================

async function recordLoanRepayment(
    loan,
    memberId,
    memberName
) {

    const amountInput =
        document.getElementById(
            "loanRepaymentAmount"
        );

    const dateInput =
        document.getElementById(
            "loanRepaymentDate"
        );

    const amount =
        Number(
            amountInput.value
        );

    const repaymentDate =
        dateInput.value;

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Enter a valid repayment amount."
        );

        return;

    }

    if (
        amount >
        Number(
            loan.outstanding_balance
        )
    ) {

        alert(
            `Repayment cannot exceed the outstanding balance of ${formatMoney(
                loan.outstanding_balance
            )}.`
        );

        return;

    }

    if (!repaymentDate) {

        alert(
            "Select the repayment date."
        );

        return;

    }

    const confirmed =
        confirm(
            `Record repayment of ${formatMoney(
                amount
            )} for ${memberName}?`
        );

    if (!confirmed) {

        return;

    }

    try {

        const response =
            await fetch(
                `/api/loans/${loan.id}/repay`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            amount:
                                amount,

                            repayment_date:
                                repaymentDate

                        })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.error ||
                "Unable to record loan repayment."
            );

            return;

        }

        alert(
            data.message ||
            "Loan repayment recorded successfully!"
        );

        loanSection.style.display =
            "none";

        loanSection.innerHTML =
            "";

        await loadGroupSummary();

        await loadCycleOverview();

        await loadMembers();

        await loadMemberLoans(
            memberId,
            memberName
        );

    } catch (error) {

        console.error(
            "Loan repayment error:",
            error
        );

        alert(
            "Unable to record loan repayment."
        );

    }

}


// ======================================================
// LOAD EVERYTHING
// ======================================================

async function loadGroupPage() {

    await loadGroupSummary();

    await loadCycleOverview();

    await loadMembers();

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadGroupPage();