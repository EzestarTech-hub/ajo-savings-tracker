// ======================================================
// AJO SAVINGS TRACKER - GROUPS PAGE
// ======================================================


// ======================================================
// GET HTML ELEMENTS
// ======================================================

const groupsList =
    document.getElementById(
        "groupsList"
    );

const refreshGroups =
    document.getElementById(
        "refreshGroups"
    );

const showCreateGroup =
    document.getElementById(
        "showCreateGroup"
    );

const createGroupForm =
    document.getElementById(
        "createGroupForm"
    );

const cancelCreateGroup =
    document.getElementById(
        "cancelCreateGroup"
    );

const saveGroup =
    document.getElementById(
        "saveGroup"
    );

const groupName =
    document.getElementById(
        "groupName"
    );

const groupType =
    document.getElementById(
        "groupType"
    );

const contributionAmount =
    document.getElementById(
        "contributionAmount"
    );

const frequency =
    document.getElementById(
        "frequency"
    );

const startDate =
    document.getElementById(
        "startDate"
    );


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(amount) {

    return `₦${Number(
        amount || 0
    ).toLocaleString()}`;

}


// ======================================================
// LOAD GROUPS
// ======================================================

async function loadGroups() {

    try {

        groupsList.innerHTML = `
            <p>
                Loading groups...
            </p>
        `;


        const response =
            await fetch(
                "/api/groups",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load groups."
            );

        }


        const groups =
            await response.json();


        if (
            !Array.isArray(groups) ||
            groups.length === 0
        ) {

            groupsList.innerHTML = `
                <p>
                    No savings groups found.
                </p>
            `;

            return;

        }


        groupsList.innerHTML = "";


        groups.forEach(
            group => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "group-card";


                const groupTypeText =
                    group.group_type ===
                    "cooperative"
                        ? "Cooperative Ajo"
                        : "Individual Ajo";


                item.innerHTML = `

                    <span class="group-type">
                        ${groupTypeText}
                    </span>

                    <h3>
                        ${group.name}
                    </h3>

                    <p>
                        Contribution:
                        <strong>
                            ${formatMoney(
                                group.contribution_amount
                            )}
                        </strong>
                    </p>

                    <p>
                        Frequency:
                        <strong>
                            ${group.frequency}
                        </strong>
                    </p>

                    <p>
                        Start Date:
                        <strong>
                            ${group.start_date}
                        </strong>
                    </p>

                    <p>
                        Group ID:
                        <strong>
                            ${group.id}
                        </strong>
                    </p>

                    <div class="group-actions">

                        <button
                            type="button"
                            class="view-group-button"
                        >
                            View Group
                        </button>

                    </div>

                `;


                const viewButton =
                    item.querySelector(
                        ".view-group-button"
                    );


                viewButton.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            `group-details.html?id=${group.id}`;

                    }
                );


                groupsList.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Groups page error:",
            error
        );


        groupsList.innerHTML = `
            <p>
                Unable to load groups.
            </p>
        `;

    }

}


// ======================================================
// SHOW CREATE GROUP FORM
// ======================================================

showCreateGroup.addEventListener(
    "click",
    () => {

        createGroupForm.style.display =
            createGroupForm.style.display ===
            "none"
                ? "block"
                : "none";

    }
);


// ======================================================
// CANCEL CREATE GROUP
// ======================================================

cancelCreateGroup.addEventListener(
    "click",
    () => {

        createGroupForm.style.display =
            "none";

    }
);


// ======================================================
// SAVE GROUP
// ======================================================

saveGroup.addEventListener(
    "click",
    async () => {

        const name =
            groupName.value.trim();

        const type =
            groupType.value;

        const amount =
            Number(
                contributionAmount.value
            );

        const selectedFrequency =
            frequency.value;

        const date =
            startDate.value;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!name) {

            alert(
                "Please enter a group name."
            );

            return;

        }


        if (!type) {

            alert(
                "Please select a group type."
            );

            return;

        }


        if (
            !amount ||
            amount <= 0
        ) {

            alert(
                "Please enter a valid contribution amount."
            );

            return;

        }


        if (!selectedFrequency) {

            alert(
                "Please select a contribution frequency."
            );

            return;

        }


        if (!date) {

            alert(
                "Please select a start date."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    "/api/groups",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                group_type:
                                    type,

                                contribution_amount:
                                    amount,

                                frequency:
                                    selectedFrequency,

                                start_date:
                                    date

                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.error ||
                    "Unable to create group."
                );

                return;

            }


            alert(
                data.message ||
                "Group created successfully!"
            );


            // ==================================================
            // CLEAR FORM
            // ==================================================

            groupName.value =
                "";

            groupType.value =
                "";

            contributionAmount.value =
                "";

            frequency.value =
                "";

            startDate.value =
                "";


            createGroupForm.style.display =
                "none";


            // ==================================================
            // RELOAD GROUPS
            // ==================================================

            await loadGroups();


        } catch (error) {

            console.error(
                "Create group error:",
                error
            );


            alert(
                "Unable to create group."
            );

        }

    }
);


// ======================================================
// REFRESH BUTTON
// ======================================================

refreshGroups.addEventListener(
    "click",
    () => {

        loadGroups();

    }
);


// ======================================================
// INITIAL LOAD
// ======================================================

loadGroups();