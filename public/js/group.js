// ======================================================
// AJO SAVINGS TRACKER - GROUP DETAILS
// ======================================================

// ======================================================
// GET GROUP ID FROM URL
// ======================================================

const urlParams = new URLSearchParams(
    window.location.search
);

const groupId = urlParams.get("id");


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
    document.getElementById(
        "selectedPayoutMember"
    );

const payoutAmount =
    document.getElementById("payoutAmount");

const payoutDate =
    document.getElementById("payoutDate");

const savePayout =
    document.getElementById("savePayout");

const addScheduleButton =
    document.getElementById(
        "addScheduleButton"
    );

const scheduleForm =
    document.getElementById("scheduleForm");

const scheduleMember =
    document.getElementById(
        "scheduleMember"
    );

const scheduleAmount =
    document.getElementById(
        "scheduleAmount"
    );

const scheduleDate =
    document.getElementById(
        "scheduleDate"
    );

const saveSchedule =
    document.getElementById(
        "saveSchedule"
    );

const payoutScheduleList =
    document.getElementById(
        "payoutScheduleList"
    );


// ======================================================
// CURRENT MEMBER SELECTION
// ======================================================

let selectedContributionMemberId = null;

let selectedPayoutMemberId = null;


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
                        cycle.totalExpected
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

            return;

        }


        members.forEach(
            member => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "card";


                item.innerHTML = `

                    <h3>
                        ${member.name}
                    </h3>

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
                    `;


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

                const viewContributionsButton =
    item.querySelector(
        ".view-contributions-button"
    );

viewContributionsButton.addEventListener(
    "click",
    () => {
        loadMemberContributions(member.id);
    }
);

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


                memberList.appendChild(
                    item
                );

            }
        );


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

async function loadMemberContributions(memberId) {

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

        if (contributions.length === 0) {

            alert(
                "This member has no contributions yet."
            );

            return;

        }

        let message =
            "Contribution History\n\n";

        contributions.forEach(
            contribution => {

                message +=
                    `ID: ${contribution.id}\n`;

                message +=
                    `Amount: ₦${Number(
                        contribution.amount
                    ).toLocaleString()}\n`;

                message +=
                    `Date: ${contribution.payment_date}\n\n`;

            }
        );

        message +=
            "Click OK to manage a contribution.";

        alert(message);


        // ==========================================
        // SELECT CONTRIBUTION
        // ==========================================

        const contributionId =
            prompt(
                "Enter the Contribution ID you want to manage:"
            );

        if (!contributionId) {

            return;

        }


        const contribution =
            contributions.find(
                item =>
                    String(item.id) ===
                    String(contributionId)
            );


        if (!contribution) {

            alert(
                "Contribution ID not found."
            );

            return;

        }


        const action =
            prompt(
                "Enter E to Edit or D to Delete:"
            );


        if (!action) {

            return;

        }


        // ==========================================
        // EDIT
        // ==========================================

        if (
            action.toUpperCase() ===
            "E"
        ) {

            const newAmount =
                prompt(
                    "Enter new contribution amount:",
                    contribution.amount
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
                    "Enter new payment date:",
                    contribution.payment_date
                );


            if (!newDate) {

                alert(
                    "Invalid payment date."
                );

                return;

            }


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
                                    Number(newAmount),

                                payment_date:
                                    newDate
                            })
                    }
                );


            const updateData =
                await updateResponse.json();


            if (!updateResponse.ok) {

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

        }


        // ==========================================
        // DELETE
        // ==========================================

        else if (
            action.toUpperCase() ===
            "D"
        ) {

            const confirmed =
                confirm(
                    `Delete contribution of ₦${Number(
                        contribution.amount
                    ).toLocaleString()} dated ${contribution.payment_date}?`
                );


            if (!confirmed) {

                return;

            }


            const deleteResponse =
                await fetch(
                    `/api/members/contributions/${contribution.id}`,
                    {
                        method: "DELETE"
                    }
                );


            const deleteData =
                await deleteResponse.json();


            if (!deleteResponse.ok) {

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

        }


        else {

            alert(
                "Invalid option. Enter E for Edit or D for Delete."
            );

        }


    } catch (error) {

        console.error(
            "Member contributions error:",
            error
        );

        alert(
            "Unable to manage contribution."
        );

    }

}


// ======================================================
// ADD MEMBER BUTTON
// ======================================================

addMember.addEventListener(
    "click",
    () => {

        memberForm.style.display =
            memberForm.style.display === "none"
                ? "block"
                : "none";

    }
);


// ======================================================
// SAVE MEMBER
// ======================================================

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


            memberName.value = "";

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


// ======================================================
// SAVE CONTRIBUTION
// ======================================================

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


// ======================================================
// SAVE PAYOUT
// ======================================================

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


// ======================================================
// SHOW SCHEDULE FORM
// ======================================================

addScheduleButton.addEventListener(
    "click",
    () => {

        scheduleForm.style.display =
            scheduleForm.style.display === "none"
                ? "block"
                : "none";

    }
);


// ======================================================
// UPDATE SCHEDULE MEMBER OPTIONS
// ======================================================

function updateScheduleMembers(
    members
) {

    scheduleMember.innerHTML = `
        <option value="">
            Select Member
        </option>
    `;


    members.forEach(
        member => {

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


// ======================================================
// SAVE PAYOUT SCHEDULE
// ======================================================

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


// ======================================================
// LOAD PAYOUT SCHEDULE
// ======================================================

async function markScheduleAsPaid(scheduleId) {

    try {

        const response = await fetch(
            `/api/schedule/${scheduleId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "Paid"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Unable to mark payout as Paid.");
            return;
        }

        alert(data.message);

        await loadPayoutSchedule();

    } catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }
}

async function loadPayoutSchedule() {

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
        Amount: ₦${Number(schedule.amount).toLocaleString()}
    </p>

    <p>
        Date: ${schedule.payout_date}
    </p>

    <p>
        Status: ${schedule.status}
    </p>

    <div class="schedule-action">

        ${
            schedule.status === "Pending"
                ? `
                    <button
                        type="button"
                        class="mark-paid-button"
                        data-id="${schedule.id}"
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
    item.querySelector(".mark-paid-button");

if (markPaidButton) {

    markPaidButton.addEventListener(
        "click",
        () => markScheduleAsPaid(schedule.id)
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
// LOAD EVERYTHING
// ======================================================

async function loadGroupPage() {

    if (!groupId) {
        return;
    }


    await Promise.all([

        loadGroupSummary(),

        loadCycleOverview(),

        loadMembers(),

        

        loadPayoutSchedule()

    ]);

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadGroupPage();