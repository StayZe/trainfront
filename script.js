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
                <td>${train.id}</td>
                <td>${train.name}</td>
                <td>
                    ${
                      train.repairs.length
                        ? `<ul>${train.repairs
                            .map(
                              (rep) => `
                            <li>
                                ${rep.type} (${rep.date}) 
                                <button class="delete-btn" onclick="deleteRepair(${rep.id})">❌</button>
                            </li>
                        `
                            )
                            .join("")}</ul>`
                        : "<em>Aucune réparation</em>"
                    }
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteTrain(${
                      train.id
                    })">Supprimer</button>
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

// Charger les trains au démarrage
fetchTrains();

async function deleteRepair(repairId) {
  if (!confirm("Voulez-vous vraiment supprimer cette réparation ?")) return;

  try {
    const response = await fetch(`${apiBaseUrl}/repairs/${repairId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }

    alert("Réparation supprimée !");
    fetchTrains(); // Mettre à jour la liste
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    alert("Erreur lors de la suppression de la réparation.");
  }
}
