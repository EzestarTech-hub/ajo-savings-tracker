// ======================================================
// AJO SAVINGS TRACKER - LOANS
// ======================================================

// ======================================================
// GET HTML ELEMENTS
// ======================================================

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

const refreshLoans =
    document.getElementById("refreshLoans");


// ======================================================
// FORMAT MONEY
// ======================================================

function formatMoney(amount) {

    return `₦${Number(
        amount || 0
    ).toLocaleString()}`;

}


// ======================================================
// LOAD LOAN SUMMARY
// ======================================================

async function loadLoanSummary() {

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
                "Failed to load loan summary."
            );

        }

        const data =
            await response.json();


        if (totalLoans) {

            totalLoans.textContent =
                data.totalLoans || 0;

        }


        if (activeLoans) {

            activeLoans.textContent =
                data.activeLoans || 0;

        }


        if (totalLoaned) {

            totalLoaned.textContent =
                formatMoney(
                    data.totalLoaned
                );

        }


        if (outstandingLoans) {

            outstandingLoans.textContent =
                formatMoney(
                    data.outstandingLoans
                );

        }


        if (totalLoanRepayments) {

            totalLoanRepayments.textContent =
                formatMoney(
                    data.totalLoanRepayments
                );

        }


        if (totalInterest) {

            totalInterest.textContent =
                formatMoney(
                    data.totalInterest
                );

        }

    } catch (error) {

        console.error(
            "Loan summary error:",
            error
        );

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


        console.log(
            "Loan activity response:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load loan activity: ${response.status}`
            );

        }


        const loans =
            await response.json();


        console.log(
            "Loan activity data:",
            loans
        );


        if (
            !Array.isArray(loans) ||
            loans.length === 0
        ) {

            loanActivity.innerHTML = `
                <p>
                    No loan activity found.
                </p>
            `;

            return;

        }


        loanActivity.innerHTML = "";


        // ==================================================
        // DISPLAY LOANS
        // ==================================================

        loans.forEach(
            loan => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "loan-activity-item";


                // ==========================================
                // REPAYMENT PROGRESS
                // ==========================================

                const progress =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Number(
                                loan.repaymentProgress || 0
                            )
                        )
                    );


                // ==========================================
                // STATUS CLASS
                // ==========================================

                let statusClass =
                    "status-pending";


                if (
                    loan.status === "Paid"
                ) {

                    statusClass =
                        "status-paid";

                } else if (
                    loan.status === "Active"
                ) {

                    statusClass =
                        "status-active";

                }


                // ==========================================
                // DUE DATE
                // ==========================================

                const dueDate =
                    loan.dueDate ||
                    "Not set";


                // ==========================================
                // CREATE LOAN CARD
                // ==========================================

                item.innerHTML = `

                    <div class="loan-activity-header">

                        <div>

                            <strong>
                                ${loan.memberName}
                            </strong>

                            <p>
                                ${loan.groupName}
                            </p>

                        </div>


                        <span
                            class="status-badge ${statusClass}"
                        >
                            ${loan.status}
                        </span>

                    </div>


                    <div class="loan-activity-details">

                        <div>

                            <strong>
                                ${formatMoney(
                                    loan.principalAmount
                                )}
                            </strong>

                            <span>
                                Principal
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${formatMoney(
                                    loan.interestAmount
                                )}
                            </strong>

                            <span>
                                Interest
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${formatMoney(
                                    loan.totalRepayment
                                )}
                            </strong>

                            <span>
                                Total Repayment
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${formatMoney(
                                    loan.amountRepaid
                                )}
                            </strong>

                            <span>
                                Repaid
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${formatMoney(
                                    loan.outstandingBalance
                                )}
                            </strong>

                            <span>
                                Outstanding
                            </span>

                        </div>

                    </div>


                    <div class="loan-progress-container">

                        <div class="loan-progress-label">

                            <span>
                                Repayment Progress
                            </span>

                            <strong>
                                ${progress}%
                            </strong>

                        </div>


                        <div class="loan-progress-bar">

                            <div
                                class="loan-progress-fill"
                                style="width: ${progress}%"
                            ></div>

                        </div>

                    </div>


                    <div class="loan-activity-footer">

                        <span>
                            Loan Date:
                            ${loan.loanDate || "Not set"}
                        </span>


                        <span>
                            Due:
                            ${dueDate}
                        </span>

                    </div>


                    <!-- =====================================
                         LOAN ACTIONS
                    ====================================== -->

                    <div class="loan-actions">

                        <button
                            type="button"
                            class="view-loan-details-button"
                            data-loan-id="${loan.id}"
                        >
                            View Loan Details
                        </button>


                        ${
                            loan.status === "Active"
                                ? `
                                    <button
                                        type="button"
                                        class="repay-loan-button"
                                        data-loan-id="${loan.id}"
                                    >
                                        Make Repayment
                                    </button>
                                  `
                                : ""
                        }

                    </div>

                `;


                loanActivity.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Loan activity error:",
            error
        );


        loanActivity.innerHTML = `
            <p>
                Unable to load loan activity.
            </p>
        `;

    }

}


// ======================================================
// LOAD EVERYTHING
// ======================================================

async function loadLoans() {

    await Promise.all([

        loadLoanSummary(),

        loadLoanActivity(),

        loadLoanGroups()

    ]);

}


// ======================================================
// REFRESH BUTTON
// ======================================================

if (refreshLoans) {

    refreshLoans.addEventListener(
        "click",
        loadLoans
    );

}


// ======================================================
// CREATE LOAN FORM
// ======================================================

const loanForm =
    document.getElementById("loanForm");

const loanGroup =
    document.getElementById("loanGroup");

const loanMember =
    document.getElementById("loanMember");

const loanAmount =
    document.getElementById("loanAmount");

const loanDate =
    document.getElementById("loanDate");

const previewInterestRate =
    document.getElementById(
        "previewInterestRate"
    );

const previewInterestAmount =
    document.getElementById(
        "previewInterestAmount"
    );

const previewTotalRepayment =
    document.getElementById(
        "previewTotalRepayment"
    );

const previewRepaymentMonths =
    document.getElementById(
        "previewRepaymentMonths"
    );

const cancelLoan =
    document.getElementById("cancelLoan");


// ======================================================
// STORE SELECTED GROUP
// ======================================================

let selectedLoanGroup = null;


// ======================================================
// LOAD GROUPS
// ======================================================

async function loadLoanGroups() {

    if (!loanGroup) {
        return;
    }


    try {

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


        loanGroup.innerHTML = `
            <option value="">
                Select group
            </option>
        `;


        groups.forEach(
            group => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    group.id;


                option.textContent =
                    group.name;


                loanGroup.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Load loan groups error:",
            error
        );

    }

}


// ======================================================
// LOAD MEMBERS FOR SELECTED GROUP
// ======================================================

async function loadLoanMembers(
    groupId
) {

    if (!loanMember) {
        return;
    }


    loanMember.innerHTML = `
        <option value="">
            Loading members...
        </option>
    `;


    loanMember.disabled =
        true;


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


        loanMember.innerHTML = `
            <option value="">
                Select member
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


                loanMember.appendChild(
                    option
                );

            }
        );


        loanMember.disabled =
            members.length === 0;


    } catch (error) {

        console.error(
            "Load loan members error:",
            error
        );


        loanMember.innerHTML = `
            <option value="">
                Unable to load members
            </option>
        `;

    }

}


// ======================================================
// UPDATE LOAN CALCULATION PREVIEW
// ======================================================

function updateLoanPreview() {

    if (!selectedLoanGroup) {
        return;
    }


    const amount =
        Number(
            loanAmount?.value || 0
        );


    const interestRate =
        Number(
            selectedLoanGroup.loan_interest_rate || 0
        );


    const repaymentMonths =
        Number(
            selectedLoanGroup.loan_repayment_months || 0
        );


    const interestAmount =
        amount *
        interestRate /
        100;


    const totalRepayment =
        amount +
        interestAmount;


    if (previewInterestRate) {

        previewInterestRate.textContent =
            `${interestRate}%`;

    }


    if (previewInterestAmount) {

        previewInterestAmount.textContent =
            formatMoney(
                interestAmount
            );

    }


    if (previewTotalRepayment) {

        previewTotalRepayment.textContent =
            formatMoney(
                totalRepayment
            );

    }


    if (previewRepaymentMonths) {

        previewRepaymentMonths.textContent =
            `${repaymentMonths} months`;

    }

}


// ======================================================
// GROUP CHANGED
// ======================================================

if (loanGroup) {

    loanGroup.addEventListener(
        "change",
        async () => {

            const groupId =
                loanGroup.value;


            selectedLoanGroup =
                null;


            if (!groupId) {

                loanMember.innerHTML = `
                    <option value="">
                        Select member
                    </option>
                `;


                loanMember.disabled =
                    true;


                updateLoanPreview();

                return;

            }


            try {

                const response =
                    await fetch(
                        "/api/groups",
                        {
                            cache: "no-store"
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to reload group information."
                    );

                }


                const groups =
                    await response.json();


                selectedLoanGroup =
                    groups.find(
                        group =>
                            Number(group.id) ===
                            Number(groupId)
                    );


                if (!selectedLoanGroup) {

                    throw new Error(
                        "Selected group was not found."
                    );

                }


                await loadLoanMembers(
                    groupId
                );


                updateLoanPreview();


            } catch (error) {

                console.error(
                    "Group selection error:",
                    error
                );

            }

        }
    );

}


// ======================================================
// LOAN AMOUNT CHANGED
// ======================================================

if (loanAmount) {

    loanAmount.addEventListener(
        "input",
        updateLoanPreview
    );

}


// ======================================================
// LOAN DATE
// ======================================================

if (loanDate) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    loanDate.value =
        today;


    loanDate.min =
        today;

}


// ======================================================
// CANCEL LOAN
// ======================================================

if (cancelLoan) {

    cancelLoan.addEventListener(
        "click",
        () => {

            if (loanForm) {
                loanForm.reset();
            }


            if (loanMember) {

                loanMember.innerHTML = `
                    <option value="">
                        Select member
                    </option>
                `;


                loanMember.disabled =
                    true;

            }


            selectedLoanGroup =
                null;


            updateLoanPreview();

        }
    );

}


// ======================================================
// VIEW LOAN DETAILS
// ======================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".view-loan-details-button"
            );


        if (!button) {
            return;
        }


        const loanId =
            button.dataset.loanId;


        if (!loanId) {

            alert(
                "Loan ID was not found."
            );

            return;

        }


        const loanCard =
            button.closest(
                ".loan-activity-item"
            );


        if (!loanCard) {
            return;
        }


        // ==============================================
        // PREVENT DUPLICATE DETAILS
        // ==============================================

        const existingDetails =
            loanCard.querySelector(
                ".loan-details-panel"
            );


        if (existingDetails) {

            existingDetails.remove();

            button.textContent =
                "View Loan Details";

            return;

        }


        try {

            button.disabled =
                true;


            button.textContent =
                "Loading...";


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

                throw new Error(
                    data.error ||
                    "Unable to load loan details."
                );

            }


            const loan =
                data.loan;


            const schedule =
                Array.isArray(
                    data.schedule
                )
                    ? data.schedule
                    : [];


            const repayments =
                Array.isArray(
                    data.repayments
                )
                    ? data.repayments
                    : [];


            // ==========================================
            // BUILD SCHEDULE HTML
            // ==========================================

            let scheduleHtml =
                "";


            if (
                schedule.length === 0
            ) {

                scheduleHtml = `
                    <p>
                        No repayment schedule found.
                    </p>
                `;

            } else {

                scheduleHtml = schedule
                    .map(
                        cycle => {

                            const expected =
                                Number(
                                    cycle.expected_amount || 0
                                );


                            const paid =
                                Number(
                                    cycle.paid_amount || 0
                                );


                            const remaining =
                                Math.max(
                                    0,
                                    expected - paid
                                );


                            return `

                                <div class="loan-detail-schedule-item">

                                    <strong>
                                        Cycle
                                        ${cycle.cycle_number}
                                    </strong>


                                    <span>
                                        Due:
                                        ${cycle.due_date}
                                    </span>


                                    <span>
                                        Expected:
                                        ${formatMoney(
                                            expected
                                        )}
                                    </span>


                                    <span>
                                        Paid:
                                        ${formatMoney(
                                            paid
                                        )}
                                    </span>


                                    <span>
                                        Remaining:
                                        ${formatMoney(
                                            remaining
                                        )}
                                    </span>


                                    <span>
                                        Status:
                                        ${cycle.status}
                                    </span>

                                </div>

                            `;

                        }
                    )
                    .join("");

            }


            // ==========================================
            // BUILD REPAYMENT HISTORY
            // ==========================================

            let repaymentHtml =
                "";


            if (
                repayments.length === 0
            ) {

                repaymentHtml = `
                    <p>
                        No repayments recorded yet.
                    </p>
                `;

            } else {

                repaymentHtml = repayments
                    .map(
                        repayment => {

                            return `

                                <div class="loan-detail-repayment-item">

                                    <strong>
                                        Amount:
                                        ${formatMoney(
                                            repayment.amount
                                        )}
                                    </strong>


                                    <span>
                                        Date:
                                        ${
                                            repayment.payment_date ||
                                            repayment.repayment_date ||
                                            "-"
                                        }
                                    </span>


                                    ${
                                        repayment.cycle_number !== null &&
                                        repayment.cycle_number !== undefined
                                            ? `
                                                <span>
                                                    Cycle:
                                                    ${repayment.cycle_number}
                                                </span>
                                              `
                                            : ""
                                    }

                                </div>

                            `;

                        }
                    )
                    .join("");

            }


            // ==========================================
            // CREATE DETAILS PANEL
            // ==========================================

            const details =
                document.createElement(
                    "div"
                );


            details.className =
                "loan-details-panel";


            details.innerHTML = `

                <div class="loan-details-content">

                    <h3>
                        Loan Details
                    </h3>


                    <p>
                        <strong>
                            Loan ID:
                        </strong>
                        ${loan.id}
                    </p>


                    <p>
                        <strong>
                            Member:
                        </strong>
                        ${loan.member_name}
                    </p>


                    <p>
                        <strong>
                            Group:
                        </strong>
                        ${loan.group_name}
                    </p>


                    <p>
                        <strong>
                            Principal:
                        </strong>
                        ${formatMoney(
                            loan.principal_amount
                        )}
                    </p>


                    <p>
                        <strong>
                            Interest Rate:
                        </strong>
                        ${Number(
                            loan.interest_rate || 0
                        )}%
                    </p>


                    <p>
                        <strong>
                            Interest Amount:
                        </strong>
                        ${formatMoney(
                            loan.interest_amount
                        )}
                    </p>


                    <p>
                        <strong>
                            Total Repayment:
                        </strong>
                        ${formatMoney(
                            loan.total_repayment
                        )}
                    </p>


                    <p>
                        <strong>
                            Amount Repaid:
                        </strong>
                        ${formatMoney(
                            loan.amount_repaid
                        )}
                    </p>


                    <p>
                        <strong>
                            Outstanding:
                        </strong>
                        ${formatMoney(
                            loan.outstanding_balance
                        )}
                    </p>


                    <p>
                        <strong>
                            Status:
                        </strong>
                        ${loan.status}
                    </p>


                    <hr>


                    <h4>
                        Repayment Schedule
                    </h4>


                    <div class="loan-detail-schedule">

                        ${scheduleHtml}

                    </div>


                    <hr>


                    <h4>
                        Repayment History
                    </h4>


                    <div class="loan-detail-repayments">

                        ${repaymentHtml}

                    </div>


                    <button
                        type="button"
                        class="close-loan-details-button"
                    >
                        Close Details
                    </button>

                </div>

            `;


            loanCard.appendChild(
                details
            );


            button.disabled =
                false;


            button.textContent =
                "Hide Loan Details";


            details.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });


        } catch (error) {

            console.error(
                "Loan details error:",
                error
            );


            alert(
                `Unable to load loan details: ${error.message}`
            );


            button.disabled =
                false;


            button.textContent =
                "View Loan Details";

        }

    }
);


// ======================================================
// CLOSE LOAN DETAILS
// ======================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".close-loan-details-button"
            );


        if (!button) {
            return;
        }


        const details =
            button.closest(
                ".loan-details-panel"
            );


        if (details) {

            const loanCard =
                details.closest(
                    ".loan-activity-item"
                );


            details.remove();


            if (loanCard) {

                const viewButton =
                    loanCard.querySelector(
                        ".view-loan-details-button"
                    );


                if (viewButton) {

                    viewButton.textContent =
                        "View Loan Details";

                }

            }

        }

    }
);


// ======================================================
// REPAYMENT BUTTON
// ======================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".repay-loan-button"
            );


        if (!button) {
            return;
        }


        const loanId =
            button.dataset.loanId;


        console.log(
            "Repayment button clicked. Loan ID:",
            loanId
        );


        // ==============================================
        // FIND LOAN CARD
        // ==============================================

        const loanCard =
            button.closest(
                ".loan-activity-item"
            );


        if (!loanCard) {
            return;
        }


        // ==============================================
        // PREVENT DUPLICATE FORM
        // ==============================================

        const existingForm =
            loanCard.querySelector(
                ".repayment-form"
            );


        if (existingForm) {
            return;
        }


        // ==============================================
        // CREATE REPAYMENT FORM
        // ==============================================

        const repaymentForm =
            document.createElement(
                "div"
            );


        repaymentForm.className =
            "repayment-form";


        repaymentForm.innerHTML = `

            <div class="repayment-form-content">

                <h4>
                    Make Loan Repayment
                </h4>


                <label>
                    Repayment Amount
                </label>


                <input
                    type="number"
                    class="repayment-amount"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                />


                <label>
                    Repayment Date
                </label>


                <input
                    type="date"
                    class="repayment-date"
                    value="${
                        new Date()
                            .toISOString()
                            .split("T")[0]
                    }"
                />


                <div class="repayment-form-actions">

                    <button
                        type="button"
                        class="submit-repayment-button"
                        data-loan-id="${loanId}"
                    >
                        Submit Repayment
                    </button>


                    <button
                        type="button"
                        class="cancel-repayment-button"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        `;


        loanCard.appendChild(
            repaymentForm
        );

    }
);


// ======================================================
// CANCEL REPAYMENT
// ======================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".cancel-repayment-button"
            );


        if (!button) {
            return;
        }


        const repaymentForm =
            button.closest(
                ".repayment-form"
            );


        if (repaymentForm) {

            repaymentForm.remove();

        }

    }
);


// ======================================================
// SUBMIT REPAYMENT
// ======================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".submit-repayment-button"
            );


        if (!button) {
            return;
        }


        const loanId =
            button.dataset.loanId;


        const repaymentForm =
            button.closest(
                ".repayment-form"
            );


        if (!repaymentForm) {
            return;
        }


        const amountInput =
            repaymentForm.querySelector(
                ".repayment-amount"
            );


        const dateInput =
            repaymentForm.querySelector(
                ".repayment-date"
            );


        const amount =
            Number(
                amountInput.value
            );


        const repaymentDate =
            dateInput.value;


        // ==============================================
        // VALIDATE AMOUNT
        // ==============================================

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Please enter a valid repayment amount."
            );

            return;

        }


        // ==============================================
        // VALIDATE DATE
        // ==============================================

        if (!repaymentDate) {

            alert(
                "Please select a repayment date."
            );

            return;

        }


        console.log(
            "Submitting repayment:",
            {
                loanId,
                amount,
                repaymentDate
            }
        );


        try {

            button.disabled =
                true;


            button.textContent =
                "Processing...";


            // ==========================================
            // SEND REPAYMENT TO BACKEND
            // ==========================================

            const response =
                await fetch(
                    `/api/loans/${loanId}/repay`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            amount:
                                amount,

                            repayment_date:
                                repaymentDate

                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "Repayment response:",
                data
            );


            // ==========================================
            // HANDLE ERROR
            // ==========================================

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to record repayment."
                );

            }


            // ==========================================
            // SUCCESS
            // ==========================================

            alert(
                data.message ||
                "Repayment recorded successfully!"
            );


            // ==========================================
            // RELOAD LOAN INFORMATION
            // ==========================================

            await loadLoans();


        } catch (error) {

            console.error(
                "Repayment error:",
                error
            );


            alert(
                `Unable to record repayment: ${error.message}`
            );


            button.disabled =
                false;


            button.textContent =
                "Submit Repayment";

        }

    }
);


// ======================================================
// INITIAL LOAD
// ======================================================

loadLoans();