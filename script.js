const apiBaseUrl = "http://localhost"; // URL du backend

// Fonction pour récupérer et afficher les trains
async function fetchTrains() {
  try {
    const response = await fetch(`${apiBaseUrl}/trains`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
    }

    const trains = await response.json();
    console.log("Trains récupérés :", trains);

    const tableBody = document.getElementById("train-table-body");
    const trainSelect = document.getElementById("train_id");

    tableBody.innerHTML = "";
    trainSelect.innerHTML = "";

    trains.forEach((train) => {
      // Ajouter à la table
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${train.id}</td>
                <td>${train.name}</td>
                <td>
                    ${
                      train.repairs.length
                        ? `<ul>${train.repairs
                            .map((rep) => `<li>${rep.type} (${rep.date})</li>`)
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

      // Ajouter à la liste déroulante pour les réparations
      const option = document.createElement("option");
      option.value = train.id;
      option.textContent = train.name;
      trainSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des trains :", error);
  }
}

// Charger les trains au démarrage
fetchTrains();

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
