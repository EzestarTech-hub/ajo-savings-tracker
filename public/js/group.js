const params = new URLSearchParams(window.location.search);
const groupId = params.get("id");

// ===============================
// GET HTML ELEMENTS
// ===============================

const groupName =
    document.getElementById("groupName");

const memberCount =
    document.getElementById("memberCount");

const totalContribution =
    document.getElementById("totalContribution");

const memberList =
    document.getElementById("memberList");

const addMemberButton =
    document.getElementById("addMember");

const memberForm =
    document.getElementById("memberForm");

const saveMemberButton =
    document.getElementById("saveMember");

const memberNameInput =
    document.getElementById("memberName");

const contributionForm =
    document.getElementById("contributionForm");

const contributionAmount =
    document.getElementById("contributionAmount");

const paymentDate =
    document.getElementById("paymentDate");

const saveContributionButton =
    document.getElementById("saveContribution");

const selectedMemberText =
    document.getElementById("selectedMember");

const payoutForm =
    document.getElementById("payoutForm");

const payoutAmount =
    document.getElementById("payoutAmount");

const payoutDate =
    document.getElementById("payoutDate");

const savePayoutButton =
    document.getElementById("savePayout");

const selectedPayoutMember =
    document.getElementById("selectedPayoutMember");

// ===============================
// PAYOUT SCHEDULE ELEMENTS
// ===============================

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

const saveScheduleButton =
    document.getElementById("saveSchedule");

// ===============================
// VARIABLES
// ===============================

let selectedMemberId = null;
let editingContributionId = null;
let editingPayoutId = null;
let editingScheduleId = null;

// ===============================
// CHECK GROUP ID
// ===============================

if (!groupId) {

    alert(
        "Group ID is missing from the URL."
    );

}

// ===============================
// LOAD GROUP SUMMARY
// ===============================

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

        const group =
            await response.json();

        groupName.textContent =
            group.groupName;

        memberCount.textContent =
            group.numberOfMembers;

        totalContribution.textContent =
            `₦${Number(
                group.totalContribution
            ).toLocaleString()}`;

    } catch (error) {

        console.error(
            "Summary error:",
            error
        );

        groupName.textContent =
            "Unable to load group";

    }

}

// ===============================
// LOAD MEMBERS
// ===============================

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

        // ===============================
        // FILL SCHEDULE MEMBER DROPDOWN
        // ===============================

        if (scheduleMember) {

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

        memberList.innerHTML = "";

        // ===============================
        // LOOP MEMBERS
        // ===============================

        for (const member of members) {

            // ===============================
            // MEMBER CONTAINER
            // ===============================

            const memberContainer =
                document.createElement("div");

            memberContainer.className =
                "member-card";

            // ===============================
            // MEMBER NAME
            // ===============================

            const memberName =
                document.createElement("h3");

            memberName.textContent =
                member.name;

            memberContainer.appendChild(
                memberName
            );

            // ===============================
            // MEMBER BALANCE
            // ===============================

            const balanceContainer =
                document.createElement("div");

            try {

                const balanceResponse =
                    await fetch(
                        `/api/members/${member.id}/balance`,
                        {
                            cache: "no-store"
                        }
                    );

                if (balanceResponse.ok) {

                    const balance =
                        await balanceResponse.json();

                    const contributionTotal =
                        Number(
                            balance.totalContributions || 0
                        );

                    const payoutTotal =
                        Number(
                            balance.totalPayouts || 0
                        );

                    const memberBalance =
                        Number(
                            balance.balance ??
                            (
                                contributionTotal -
                                payoutTotal
                            )
                        );

                    balanceContainer.innerHTML = `
                        <p>
                            <strong>
                                Total Contributions:
                            </strong>
                            ₦${contributionTotal.toLocaleString()}
                        </p>

                        <p>
                            <strong>
                                Total Payouts:
                            </strong>
                            ₦${payoutTotal.toLocaleString()}
                        </p>

                        <p>
                            <strong>
                                Balance:
                            </strong>
                            ₦${memberBalance.toLocaleString()}
                        </p>
                    `;

                }

            } catch (error) {

                console.error(
                    `Balance error for ${member.name}:`,
                    error
                );

            }

            memberContainer.appendChild(
                balanceContainer
            );

            // ===============================
            // BUTTON CONTAINER
            // ===============================

            const buttonContainer =
                document.createElement("div");

            // ===============================
            // RECORD CONTRIBUTION
            // ===============================

            const contributionButton =
                document.createElement("button");

            contributionButton.textContent =
                "Record Contribution";

            contributionButton.addEventListener(
                "click",
                () => {

                    selectedMemberId =
                        member.id;

                    editingContributionId =
                        null;

                    selectedMemberText.textContent =
                        `Recording contribution for: ${member.name}`;

                    contributionAmount.value =
                        "";

                    paymentDate.value =
                        "";

                    saveContributionButton.textContent =
                        "Save Contribution";

                    contributionForm.style.display =
                        "block";

                    contributionAmount.focus();

                }
            );

            buttonContainer.appendChild(
                contributionButton
            );

            // ===============================
            // RECORD PAYOUT
            // ===============================

            const payoutButton =
                document.createElement("button");

            payoutButton.textContent =
                "Record Payout";

            payoutButton.addEventListener(
                "click",
                () => {

                    selectedMemberId =
                        member.id;

                    editingPayoutId =
                        null;

                    selectedPayoutMember.textContent =
                        `Recording payout for: ${member.name}`;

                    payoutAmount.value =
                        "";

                    payoutDate.value =
                        "";

                    savePayoutButton.textContent =
                        "Save Payout";

                    payoutForm.style.display =
                        "block";

                    payoutAmount.focus();

                }
            );

            buttonContainer.appendChild(
                payoutButton
            );

            memberContainer.appendChild(
                buttonContainer
            );

            // ===============================
            // CONTRIBUTIONS TITLE
            // ===============================

            const contributionTitle =
                document.createElement("h4");

            contributionTitle.textContent =
                "Contributions";

            memberContainer.appendChild(
                contributionTitle
            );

            // ===============================
            // CONTRIBUTION LIST
            // ===============================

            const contributionList =
                document.createElement("div");

            try {

                const response =
                    await fetch(
                        `/api/members/${member.id}/contributions`,
                        {
                            cache: "no-store"
                        }
                    );

                if (response.ok) {

                    const contributions =
                        await response.json();

                    contributions.forEach(
                        contribution => {

                            const row =
                                document.createElement("div");

                            row.className =
                                "contribution-row";

                            const info =
                                document.createElement("span");

                            info.textContent =
                                `₦${Number(
                                    contribution.amount
                                ).toLocaleString()} — ${contribution.payment_date}`;

                            row.appendChild(
                                info
                            );

                            // ===============================
                            // EDIT CONTRIBUTION
                            // ===============================

                            const editButton =
                                document.createElement("button");

                            editButton.textContent =
                                "Edit";

                            editButton.addEventListener(
                                "click",
                                () => {

                                    selectedMemberId =
                                        member.id;

                                    editingContributionId =
                                        contribution.id;

                                    selectedMemberText.textContent =
                                        `Editing contribution for: ${member.name}`;

                                    contributionAmount.value =
                                        contribution.amount;

                                    paymentDate.value =
                                        contribution.payment_date;

                                    saveContributionButton.textContent =
                                        "Update Contribution";

                                    contributionForm.style.display =
                                        "block";

                                    contributionAmount.focus();

                                }
                            );

                            row.appendChild(
                                editButton
                            );

                            // ===============================
                            // DELETE CONTRIBUTION
                            // ===============================

                            const deleteButton =
                                document.createElement("button");

                            deleteButton.textContent =
                                "Delete";

                            deleteButton.addEventListener(
                                "click",
                                async () => {

                                    const confirmed =
                                        confirm(
                                            "Are you sure you want to delete this contribution?"
                                        );

                                    if (!confirmed) {
                                        return;
                                    }

                                    try {

                                        const deleteResponse =
                                            await fetch(
                                                `/api/members/${contribution.id}`,
                                                {
                                                    method:
                                                        "DELETE"
                                                }
                                            );

                                        const data =
                                            await deleteResponse.json();

                                        if (
                                            deleteResponse.ok
                                        ) {

                                            alert(
                                                data.message
                                            );

                                            await loadGroupSummary();

                                            await loadMembers();

                                        } else {

                                            alert(
                                                data.error
                                            );

                                        }

                                    } catch (error) {

                                        console.error(
                                            error
                                        );

                                        alert(
                                            "Unable to delete contribution."
                                        );

                                    }

                                }
                            );

                            row.appendChild(
                                deleteButton
                            );

                            contributionList.appendChild(
                                row
                            );

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "Contribution error:",
                    error
                );

            }

            memberContainer.appendChild(
                contributionList
            );

            // ===============================
            // PAYOUTS TITLE
            // ===============================

            const payoutTitle =
                document.createElement("h4");

            payoutTitle.textContent =
                "Payouts";

            memberContainer.appendChild(
                payoutTitle
            );

            // ===============================
            // PAYOUT LIST
            // ===============================

            const payoutList =
                document.createElement("div");

            try {

                const response =
                    await fetch(
                        `/api/members/${member.id}/payouts`,
                        {
                            cache: "no-store"
                        }
                    );

                if (response.ok) {

                    const payouts =
                        await response.json();

                    payouts.forEach(
                        payout => {

                            const row =
                                document.createElement("div");

                            row.className =
                                "payout-row";

                            const info =
                                document.createElement("span");

                            info.textContent =
                                `₦${Number(
                                    payout.amount
                                ).toLocaleString()} — ${payout.payout_date}`;

                            row.appendChild(
                                info
                            );

                            // ===============================
                            // EDIT PAYOUT
                            // ===============================

                            const editButton =
                                document.createElement("button");

                            editButton.textContent =
                                "Edit";

                            editButton.addEventListener(
                                "click",
                                () => {

                                    selectedMemberId =
                                        member.id;

                                    editingPayoutId =
                                        payout.id;

                                    selectedPayoutMember.textContent =
                                        `Editing payout for: ${member.name}`;

                                    payoutAmount.value =
                                        payout.amount;

                                    payoutDate.value =
                                        payout.payout_date;

                                    savePayoutButton.textContent =
                                        "Update Payout";

                                    payoutForm.style.display =
                                        "block";

                                    payoutAmount.focus();

                                }
                            );

                            row.appendChild(
                                editButton
                            );

                            // ===============================
                            // DELETE PAYOUT
                            // ===============================

                            const deleteButton =
                                document.createElement("button");

                            deleteButton.textContent =
                                "Delete";

                            deleteButton.addEventListener(
                                "click",
                                async () => {

                                    const confirmed =
                                        confirm(
                                            "Are you sure you want to delete this payout?"
                                        );

                                    if (!confirmed) {
                                        return;
                                    }

                                    try {

                                        const deleteResponse =
                                            await fetch(
                                                `/api/members/payouts/${payout.id}`,
                                                {
                                                    method:
                                                        "DELETE"
                                                }
                                            );

                                        const data =
                                            await deleteResponse.json();

                                        if (
                                            deleteResponse.ok
                                        ) {

                                            alert(
                                                data.message
                                            );

                                            await loadGroupSummary();

                                            await loadMembers();

                                        } else {

                                            alert(
                                                data.error
                                            );

                                        }

                                    } catch (error) {

                                        console.error(
                                            error
                                        );

                                        alert(
                                            "Unable to delete payout."
                                        );

                                    }

                                }
                            );

                            row.appendChild(
                                deleteButton
                            );

                            payoutList.appendChild(
                                row
                            );

                        }
                    );

                }

            } catch (error) {

                console.error(
                    "Payout error:",
                    error
                );

            }

            memberContainer.appendChild(
                payoutList
            );

            // ===============================
            // ADD MEMBER CARD
            // ===============================

            memberList.appendChild(
                memberContainer
            );

        }

    } catch (error) {

        console.error(
            "Members error:",
            error
        );

    }

}

// ===============================
// ADD MEMBER
// ===============================

addMemberButton.addEventListener(
    "click",
    () => {

        memberForm.style.display =
            "block";

        memberNameInput.focus();

    }
);

// ===============================
// SAVE MEMBER
// ===============================

saveMemberButton.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        const name =
            memberNameInput.value.trim();

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
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                name
                            })
                    }
                );

            const data =
                await response.json();

            if (response.ok) {

    alert(data.message);

    memberNameInput.value = "";

    memberForm.style.display =
        "none";

    await loadGroupSummary();

    await loadMembers();

    // Refresh Ajo Cycle / Contribution Overview
    await loadCycleOverview();

} else {

                alert(
                    data.error
                );

            }

        } catch (error) {

            console.error(
                error
            );

            alert(
                "Unable to save member."
            );

        }

    }
);

// ===============================
// SAVE OR UPDATE CONTRIBUTION
// ===============================

saveContributionButton.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        const amount =
            Number(
                contributionAmount.value
            );

        const payment_date =
            paymentDate.value;

        if (
            !amount ||
            amount <= 0 ||
            !payment_date
        ) {

            alert(
                "Enter a valid contribution amount and payment date."
            );

            return;

        }

        try {

            let response;

            // ===============================
            // UPDATE CONTRIBUTION
            // ===============================

            if (editingContributionId) {

                response =
                    await fetch(
                        `/api/members/${editingContributionId}`,
                        {
                            method:
                                "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    amount,
                                    payment_date
                                })
                        }
                    );

            }

            // ===============================
            // CREATE CONTRIBUTION
            // ===============================

            else {

                response =
                    await fetch(
                        `/api/members/${selectedMemberId}/contributions`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    amount,
                                    payment_date
                                })
                        }
                    );

            }

            const data =
                await response.json();

            if (response.ok) {

                alert(
                    data.message
                );

                contributionAmount.value =
                    "";

                paymentDate.value =
                    "";

                contributionForm.style.display =
                    "none";

                editingContributionId =
                    null;

                saveContributionButton.textContent =
                    "Save Contribution";

                await loadGroupSummary();

                await loadMembers();

            } else {

                alert(
                    data.error
                );

            }

        } catch (error) {

            console.error(
                error
            );

            alert(
                "Unable to save contribution."
            );

        }

    }
);

// ===============================
// SAVE OR UPDATE PAYOUT
// ===============================

savePayoutButton.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        const amount =
            Number(
                payoutAmount.value
            );

        const payout_date =
            payoutDate.value;

        if (
            !amount ||
            amount <= 0 ||
            !payout_date
        ) {

            alert(
                "Enter a valid payout amount and payout date."
            );

            return;

        }

        try {

            let response;

            // ===============================
            // UPDATE PAYOUT
            // ===============================

            if (editingPayoutId) {

                response =
                    await fetch(
                        `/api/members/payouts/${editingPayoutId}`,
                        {
                            method:
                                "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    amount,
                                    payout_date
                                })
                        }
                    );

            }

            // ===============================
            // CREATE PAYOUT
            // ===============================

            else {

                response =
                    await fetch(
                        `/api/members/${selectedMemberId}/payouts`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    amount,
                                    payout_date
                                })
                        }
                    );

            }

            const data =
                await response.json();

            if (response.ok) {

                alert(
                    data.message
                );

                payoutAmount.value =
                    "";

                payoutDate.value =
                    "";

                payoutForm.style.display =
                    "none";

                editingPayoutId =
                    null;

                savePayoutButton.textContent =
                    "Save Payout";

                await loadGroupSummary();

                await loadMembers();

            } else {

                alert(
                    data.error
                );

            }

        } catch (error) {

            console.error(
                "Payout error:",
                error
            );

            alert(
                "Payout error: " +
                error.message
            );

        }

    }
);

// ===============================
// LOAD PAYOUT SCHEDULE
// ===============================

async function loadPayoutSchedule() {

    const payoutScheduleList =
        document.getElementById(
            "payoutScheduleList"
        );

    if (!payoutScheduleList) {

        console.error(
            "Payout schedule section not found."
        );

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

            payoutScheduleList.innerHTML =
                "<p>No payout schedule yet.</p>";

            return;

        }

        schedules.forEach(
            schedule => {

                const row =
                    document.createElement("div");

                row.className =
                    "payout-schedule-row";

                // ===============================
                // SCHEDULE INFORMATION
                // ===============================

                const info =
                    document.createElement("div");

                info.innerHTML = `
                    <p>
                        <strong>
                            Member:
                        </strong>
                        ${schedule.member_name}
                    </p>

                    <p>
                        <strong>
                            Amount:
                        </strong>
                        ₦${Number(
                            schedule.amount
                        ).toLocaleString()}
                    </p>

                    <p>
                        <strong>
                            Date:
                        </strong>
                        ${schedule.payout_date}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>
                        ${schedule.status}
                    </p>
                `;

                row.appendChild(
                    info
                );

                // ===============================
                // BUTTON CONTAINER
                // ===============================

                const buttons =
                    document.createElement("div");

                // ===============================
                // EDIT BUTTON
                // ===============================

                const editButton =
                    document.createElement("button");

                editButton.textContent =
                    "Edit";

                editButton.addEventListener(
                    "click",
                    () => {

                        scheduleForm.style.display =
                            "block";

                        scheduleMember.value =
                            schedule.member_id;

                        scheduleAmount.value =
                            schedule.amount;

                        scheduleDate.value =
                            schedule.payout_date;

                        saveScheduleButton.textContent =
                            "Update Schedule";

                        editingScheduleId =
                            schedule.id;

                        // Prevent past dates
                        const today =
                            new Date()
                                .toISOString()
                                .split("T")[0];

                        scheduleDate.min =
                            today;

                        scheduleMember.focus();

                    }
                );

                buttons.appendChild(
                    editButton
                );

                // ===============================
                // DELETE BUTTON
                // ===============================

                const deleteButton =
                    document.createElement("button");

                deleteButton.textContent =
                    "Delete";

                deleteButton.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                `Delete the payout schedule for ${schedule.member_name}?`
                            );

                        if (!confirmed) {
                            return;
                        }

                        try {

                            const deleteResponse =
                                await fetch(
                                    `/api/schedule/${schedule.id}`,
                                    {
                                        method:
                                            "DELETE"
                                    }
                                );

                            const data =
                                await deleteResponse.json();

                            if (
                                deleteResponse.ok
                            ) {

                                alert(
                                    data.message
                                );

                                await loadPayoutSchedule();

                            } else {

                                alert(
                                    data.error
                                );

                            }

                        } catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                "Unable to delete schedule."
                            );

                        }

                    }
                );

                buttons.appendChild(
                    deleteButton
                );

                // ===============================
                // MARK AS PAID
                // ===============================

                if (
                    schedule.status ===
                    "Pending"
                ) {

                    const paidButton =
                        document.createElement(
                            "button"
                        );

                    paidButton.textContent =
                        "Mark as Paid";

                    paidButton.addEventListener(
                        "click",
                        async () => {

                            try {

                                const paidResponse =
                                    await fetch(
                                        `/api/schedule/${schedule.id}/status`,
                                        {
                                            method:
                                                "PATCH",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify({
                                                    status:
                                                        "Paid"
                                                }),

                                            cache:
                                                "no-store"
                                        }
                                    );

                                const data =
                                    await paidResponse.json();

                                if (
                                    paidResponse.ok
                                ) {

                                    alert(
                                        data.message
                                    );

                                    // =================================
                                    // IMPORTANT:
                                    // Reload everything from database
                                    // =================================

                                    await loadGroupSummary();

                                    await loadMembers();

                                    await loadCycleOverview();

                                    await loadPayoutSchedule();

                                } else {

                                    alert(
                                        data.error ||
                                        "Unable to mark payout as Paid."
                                    );

                                }

                            } catch (error) {

                                console.error(
                                    "Mark as Paid error:",
                                    error
                                );

                                alert(
                                    "Unable to update schedule."
                                );

                            }

                        }
                    );

                    buttons.appendChild(
                        paidButton
                    );

                }

                row.appendChild(
                    buttons
                );

                payoutScheduleList.appendChild(
                    row
                );

            }
        );

    } catch (error) {

        console.error(
            "Payout schedule error:",
            error
        );

        payoutScheduleList.innerHTML =
            "<p>Unable to load payout schedule.</p>";

    }

}

// ===============================
// ADD PAYOUT SCHEDULE
// ===============================

addScheduleButton.addEventListener(
    "click",
    () => {

        editingScheduleId =
            null;

        saveScheduleButton.textContent =
            "Save Schedule";

        // ===============================
        // TODAY'S DATE
        // ===============================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        // ===============================
        // PREVENT PAST DATE
        // ===============================

        scheduleDate.min =
            today;

        // Clear previous values

        scheduleMember.value =
            "";

        scheduleAmount.value =
            "";

        scheduleDate.value =
            "";

        scheduleForm.style.display =
            "block";

        scheduleMember.focus();

    }
);

// ===============================
// SAVE OR UPDATE PAYOUT SCHEDULE
// ===============================

saveScheduleButton.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        const memberId =
            scheduleMember.value;

        const amount =
            Number(
                scheduleAmount.value
            );

        const payoutDate =
            scheduleDate.value;

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        // ===============================
        // VALIDATE INPUT
        // ===============================

        if (
            !memberId ||
            !amount ||
            amount <= 0 ||
            !payoutDate
        ) {

            alert(
                "Please select a member, enter an amount and choose a payout date."
            );

            return;

        }

        // ===============================
        // PREVENT PAST DATE
        // ===============================

        if (
            payoutDate <
            today
        ) {

            alert(
                "Payout date cannot be in the past."
            );

            return;

        }

        try {

            let response;

            // ===============================
            // UPDATE EXISTING SCHEDULE
            // ===============================

            if (
                editingScheduleId
            ) {

                response =
                    await fetch(
                        `/api/schedule/${editingScheduleId}`,
                        {
                            method:
                                "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    member_id:
                                        Number(
                                            memberId
                                        ),

                                    amount,

                                    payout_date:
                                        payoutDate,

                                    status:
                                        "Pending"

                                }),

                            cache:
                                "no-store"
                        }
                    );

            }

            // ===============================
            // CREATE NEW SCHEDULE
            // ===============================

            else {

                response =
                    await fetch(
                        "/api/schedule",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    group_id:
                                        Number(
                                            groupId
                                        ),

                                    member_id:
                                        Number(
                                            memberId
                                        ),

                                    amount,

                                    payout_date:
                                        payoutDate

                                }),

                            cache:
                                "no-store"
                        }
                    );

            }

            // ===============================
            // READ SERVER RESPONSE
            // SAFELY
            // ===============================

            const responseText =
                await response.text();

            let data;

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (parseError) {

                console.error(
                    "Server returned non-JSON:",
                    responseText
                );

                alert(
                    "Server response was not JSON:\n\n" +
                    responseText
                );

                return;

            }

            // ===============================
            // SUCCESS
            // ===============================

            if (
                response.ok
            ) {

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

                saveScheduleButton.textContent =
                    "Save Schedule";

                editingScheduleId =
                    null;

                await loadPayoutSchedule();

            }

            // ===============================
            // SERVER ERROR
            // ===============================

            else {

                alert(
                    data.error ||
                    "Unable to save payout schedule."
                );

            }

        } catch (error) {

            console.error(
                "Schedule error:",
                error
            );

            alert(
                "Schedule error: " +
                error.message
            );

        }

    }
);

// =========================================
// LOAD AJO CYCLE OVERVIEW
// =========================================

async function loadCycleOverview() {

    const cycleOverview =
        document.getElementById(
            "cycleOverview"
        );

    if (!cycleOverview) {

        console.error(
            "Cycle overview section not found."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `/api/groups/${groupId}/cycle-overview`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load cycle overview."
            );

        }

        const data =
            await response.json();


        const cycle =
            data.cycle;

        const group =
            data.group;

        const members =
            data.members;


        // =====================================
        // DETERMINE STATUS CLASS
        // =====================================

        let statusClass =
            "no-contributions";

        if (
            cycle.status === "On Track"
        ) {

            statusClass =
                "on-track";

        } else if (
            cycle.status ===
            "Needs Attention"
        ) {

            statusClass =
                "attention";

        }


        // =====================================
        // BUILD OVERVIEW
        // =====================================

        cycleOverview.innerHTML = `

            <div class="cycle-summary-grid">

                <div class="cycle-summary-card">

                    <h3>
                        Contribution Per Cycle
                    </h3>

                    <p>
                        ₦${Number(
                            group.contributionAmount
                        ).toLocaleString()}
                    </p>

                </div>


                <div class="cycle-summary-card">

                    <h3>
                        Expected Contribution
                    </h3>

                    <p>
                        ₦${Number(
                            cycle.totalExpected
                        ).toLocaleString()}
                    </p>

                </div>


                <div class="cycle-summary-card">

                    <h3>
                        Actual Contribution
                    </h3>

                    <p>
                        ₦${Number(
                            cycle.totalActual
                        ).toLocaleString()}
                    </p>

                </div>


                <div class="cycle-summary-card">

                    <h3>
                        Outstanding
                    </h3>

                    <p>
                        ₦${Number(
                            cycle.outstanding
                        ).toLocaleString()}
                    </p>

                </div>


                <div class="cycle-summary-card">

                    <h3>
                        Frequency
                    </h3>

                    <p>
                        ${group.frequency}
                    </p>

                </div>


                <div class="cycle-summary-card">

                    <h3>
                        Cycle
                    </h3>

                    <p>
                        ${cycle.elapsedCycles}
                    </p>

                </div>

            </div>


            <div class="cycle-progress-container">

                <strong>
                    Contribution Progress:
                    ${cycle.progress}%
                </strong>

                <div class="cycle-progress-bar">

                    <div
                        class="cycle-progress-fill"
                        style="
                            width:
                            ${cycle.progress}%;
                        "
                    ></div>

                </div>


                <span
                    class="
                        cycle-status
                        ${statusClass}
                    "
                >
                    ${cycle.status}
                </span>

            </div>


            <div class="member-contribution-status">

                <h3>
                    Member Contribution Status
                </h3>


                <div
                    class="
                        member-cycle-row
                        member-cycle-header
                    "
                >

                    <div>
                        Member
                    </div>

                    <div>
                        Expected
                    </div>

                    <div>
                        Actual
                    </div>

                    <div>
                        Status
                    </div>

                </div>

                ${members.map(
                    member => {

                        let memberStatusClass =
                            "member-status-not-paid";


                        if (
                            member.status ===
                            "Paid"
                        ) {

                            memberStatusClass =
                                "member-status-paid";

                        } else if (
                            member.status ===
                            "Partially Paid"
                        ) {

                            memberStatusClass =
                                "member-status-partial";

                        }


                        return `

                            <div
                                class="
                                    member-cycle-row
                                "
                            >

                                <div>
                                    ${member.member_name}
                                </div>

                                <div>
                                    ₦${Number(
                                        member.expected
                                    ).toLocaleString()}
                                </div>

                                <div>
                                    ₦${Number(
                                        member.actual
                                    ).toLocaleString()}
                                </div>

                                <div
                                    class="
                                        ${memberStatusClass}
                                    "
                                >
                                    ${member.status}
                                </div>

                            </div>

                        `;

                    }
                ).join("")}

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

// ===============================
// INITIAL LOAD
// ===============================

loadGroupSummary();
loadMembers();
loadPayoutSchedule();
loadCycleOverview();