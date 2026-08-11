const groupList = document.getElementById("groupList");
const form = document.getElementById("groupForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const group = {
    name: document.getElementById("name").value,
    contribution_amount: Number(document.getElementById("amount").value),
    frequency: document.getElementById("frequency").value,
    start_date: document.getElementById("startDate").value
  };

  try {
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(group)
    });

    const data = await response.json();

    if (response.ok) {
      message.textContent = data.message;
      form.reset();

      loadGroups();
    } else {
      message.textContent = data.error;
    }

  } catch (error) {
    message.textContent = "Something went wrong.";
    console.error(error);
  }
});

async function loadGroups() {

  try {

    const response = await fetch("/api/groups");

    const groups = await response.json();

    groupList.innerHTML = "";

    groups.forEach(group => {

      const li = document.createElement("li");

const link = document.createElement("a");

link.href = `group.html?id=${group.id}`;

link.textContent =
  `${group.name} - ₦${group.contribution_amount} (${group.frequency})`;

li.appendChild(link);

groupList.appendChild(li);

    });

  } catch (error) {

    console.error(error);

  }

}


loadGroups();