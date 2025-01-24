const apiBaseUrl = "http://localhost"; // URL du backend

// Fonction pour récupérer et afficher les trains avec leurs réparations
async function fetchTrains() {
  try {
    const response = await fetch(`${apiBaseUrl}/trains`);
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    const trains = await response.json();
    const tableBody = document.getElementById("train-table-body");
    const trainSelect = document.getElementById("train_id");

    tableBody.innerHTML = "";
    trainSelect.innerHTML = "";

    trains.forEach((train) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border p-3">${train.id}</td>
        <td class="border p-3 font-semibold">${train.name}</td>
        <td class="border p-3">
          ${
            train.repairs.length
              ? `<ul class="flex flex-col gap-2">${train.repairs
                  .map(
                    (rep) => `
                <li class="flex justify-between items-center p-2 bg-gray-200 rounded-md mb-1 gap-4">
                  <span class="text-sm font-medium">${rep.type} (${rep.date})</span>
                  <button class="bg-red-500 text-white px-2 py-1 text-xs rounded-md hover:bg-red-700 transition"
                    onclick="deleteRepair(${rep.id})">x</button>
                </li>
              `
                  )
                  .join("")}</ul>`
              : "<em class='text-gray-500'>Aucune réparation</em>"
          }
        </td>
        <td class="border p-3 text-center">
          <button class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-800 transition"
            onclick="deleteTrain(${train.id})">Supprimer</button>
        </td>
      `;
      tableBody.appendChild(row);

      const option = document.createElement("option");
      option.value = train.id;
      option.textContent = train.name;
      trainSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des trains :", error);
  }
}

// Fonction pour ajouter un train
document
  .getElementById("add-train-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const trainName = document.getElementById("train_name").value;

    await fetch(`${apiBaseUrl}/trains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trainName }),
    });

    document.getElementById("train_name").value = "";
    fetchTrains();
  });

// Fonction pour ajouter une réparation
document
  .getElementById("add-repair-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const trainId = document.getElementById("train_id").value;
    const repairType = document.getElementById("repair_type").value;

    await fetch(`${apiBaseUrl}/repairs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ train_id: trainId, type: repairType }),
    });

    document.getElementById("repair_type").value = "";
    fetchTrains();
  });

// Fonction pour supprimer un train
async function deleteTrain(trainId) {
  if (confirm("Voulez-vous vraiment supprimer ce train ?")) {
    await fetch(`${apiBaseUrl}/trains/${trainId}`, { method: "DELETE" });
    fetchTrains();
  }
}

// Fonction pour supprimer une réparation
async function deleteRepair(repairId) {
  if (confirm("Voulez-vous vraiment supprimer cette réparation ?")) {
    await fetch(`${apiBaseUrl}/repairs/${repairId}`, { method: "DELETE" });
    fetchTrains();
  }
}

// Charger les trains au démarrage
fetchTrains();
