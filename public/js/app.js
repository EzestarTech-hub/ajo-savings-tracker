const groupList =
    document.getElementById("groupList");

const form =
    document.getElementById("groupForm");

const message =
    document.getElementById("message");

const groupType =
    document.getElementById("groupType");

const loanSettings =
    document.getElementById("loanSettings");

const coordinatorFee =
    document.getElementById("coordinatorFee");

const loanInterestRate =
    document.getElementById("loanInterestRate");

const loanRepaymentMonths =
    document.getElementById("loanRepaymentMonths");


// ======================================================
// SHOW / HIDE COOPERATIVE LOAN SETTINGS
// ======================================================

groupType.addEventListener(
    "change",
    () => {

        if (
            groupType.value === "cooperative"
        ) {

            loanSettings.style.display =
                "block";

        }

        else {

            loanSettings.style.display =
                "none";

            // Reset cooperative-only fields
            loanInterestRate.value = "0";

            loanRepaymentMonths.value = "0";

        }

    }
);


// ======================================================
// CREATE GROUP
// ======================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ==================================================
        // BASIC INFORMATION
        // ==================================================

        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const type =
            groupType.value;

        const contributionAmount =
            Number(
                document
                    .getElementById("amount")
                    .value
            );

        const frequency =
            document
                .getElementById("frequency")
                .value;

        const startDate =
            document
                .getElementById("startDate")
                .value;


        // ==================================================
        // COORDINATOR FEE
        // ==================================================

        const coordinatorFeeValue =
            Number(
                coordinatorFee.value
            ) || 0;


        // ==================================================
        // LOAN SETTINGS
        // ==================================================

        let interestRate = 0;

        let repaymentMonths = 0;


        if (
            type === "cooperative"
        ) {

            interestRate =
                Number(
                    loanInterestRate.value
                ) || 0;

            repaymentMonths =
                Number(
                    loanRepaymentMonths.value
                ) || 0;


            // ==============================================
            // VALIDATE LOAN INTEREST
            // ==============================================

            if (
                interestRate < 0
            ) {

                message.textContent =
                    "Loan interest rate cannot be negative.";

                return;

            }


            // ==============================================
            // VALIDATE REPAYMENT PERIOD
            // ==============================================

            if (
                repaymentMonths <= 0
            ) {

                message.textContent =
                    "Loan repayment period must be at least 1 month.";

                return;

            }

        }


        // ==================================================
        // CREATE GROUP OBJECT
        // ==================================================

        const group = {

            name:
                name,

            group_type:
                type,

            contribution_amount:
                contributionAmount,

            frequency:
                frequency,

            start_date:
                startDate,

            coordinator_fee:
                coordinatorFeeValue,

            loan_interest_rate:
                interestRate,

            loan_repayment_months:
                repaymentMonths

        };


        // ==================================================
        // DEBUG
        // ==================================================

        console.log(
            "GROUP DATA BEING SENT:",
            group
        );


        try {

            // ==================================================
            // SEND TO SERVER
            // ==================================================

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
                            JSON.stringify(
                                group
                            )

                    }
                );


            // ==================================================
            // READ SERVER RESPONSE
            // ==================================================

            const data =
                await response.json();


            console.log(
                "GROUP RESPONSE:",
                data
            );


            // ==================================================
            // SUCCESS
            // ==================================================

            if (
                response.ok
            ) {

                message.textContent =
                    data.message;


                form.reset();


                // Hide cooperative settings
                loanSettings.style.display =
                    "none";


                // Reset loan fields
                loanInterestRate.value =
                    "0";

                loanRepaymentMonths.value =
                    "0";


                // Reload groups
                await loadGroups();

            }


            // ==================================================
            // SERVER ERROR
            // ==================================================

            else {

                message.textContent =
                    data.error ||
                    "Unable to create group.";

            }


        } catch (error) {

            console.error(
                "Create group error:",
                error
            );


            message.textContent =
                "Something went wrong while creating the group.";

        }

    }
);


// ======================================================
// LOAD ALL GROUPS
// ======================================================

async function loadGroups() {

    try {

        const response =
            await fetch(
                "/api/groups"
            );


        const groups =
            await response.json();


        groupList.innerHTML =
            "";


        groups.forEach(
            group => {

                const li =
                    document.createElement(
                        "li"
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    `group-details.html?id=${group.id}`;


                link.textContent =
                    `${group.name} - ₦${Number(
                        group.contribution_amount
                    ).toLocaleString()} (${group.frequency})`;


                li.appendChild(
                    link
                );


                groupList.appendChild(
                    li
                );

            }
        );


    } catch (error) {

        console.error(
            "Load groups error:",
            error
        );

    }

}


// ======================================================
// LOAD GROUPS WHEN PAGE OPENS
// ======================================================

loadGroups();
