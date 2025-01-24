// Configuration
const API_BASE_URL = "http://localhost";
const NOTIFICATION_DURATION = 3000;

// Utility Functions
const createNotification = (message, type = "info") => {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 
        ${
          type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
        }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("opacity-0", "translate-x-full");
    setTimeout(() => document.body.removeChild(notification), 300);
  }, NOTIFICATION_DURATION);
};

// API Service
class TrainService {
  static async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      createNotification(error.message, "error");
      console.error(error);
      return null;
    }
  }

  static async getTrains() {
    return await this.fetchWithErrorHandling(`${API_BASE_URL}/trains`);
  }

  static async getRepairTypes() {
    return await this.fetchWithErrorHandling(`${API_BASE_URL}/repair-types`);
  }

  static async addTrain(name) {
    return await this.fetchWithErrorHandling(`${API_BASE_URL}/trains`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  }

  static async addRepair(trainId, repairTypeId) {
    return await this.fetchWithErrorHandling(`${API_BASE_URL}/repairs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        train_id: trainId,
        repair_type_id: repairTypeId,
      }),
    });
  }

  static async deleteTrain(trainId) {
    return await this.fetchWithErrorHandling(
      `${API_BASE_URL}/trains/${trainId}`,
      {
        method: "DELETE",
      }
    );
  }

  static async deleteRepair(repairId) {
    return await this.fetchWithErrorHandling(
      `${API_BASE_URL}/repairs/${repairId}`,
      {
        method: "DELETE",
      }
    );
  }
}

// UI Rendering
class TrainUI {
  static renderTrainTable(trains) {
    const tableBody = document.getElementById("train-table-body");
    const trainSelect = document.getElementById("train_id");

    tableBody.innerHTML = "";
    trainSelect.innerHTML = "";

    trains.forEach((train) => {
      const row = document.createElement("tr");
      row.classList.add("hover:bg-gray-100", "transition-colors");
      row.innerHTML = `
                <td class="p-4 text-gray-800">${train.id}</td>
                <td class="p-4 font-semibold text-gray-800">${train.name}</td>
                <td class="p-4">
                    ${this.renderRepairs(train.repairs)}
                </td>
                <td class="p-4">
                    <button class="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition" 
                        onclick="confirmDelete('train', ${
                          train.id
                        })">🗑 Supprimer</button>
                </td>
            `;
      tableBody.appendChild(row);

      const option = document.createElement("option");
      option.value = train.id;
      option.textContent = train.name;
      trainSelect.appendChild(option);
    });
  }

  static renderRepairs(repairs) {
    return repairs.length
      ? `<ul class="space-y-2">${repairs
          .map(
            (rep) => `
                <li class="bg-gray-100 rounded-lg p-2 flex justify-between items-center">
                    <span class="text-sm text-gray-800">${rep.type} (${rep.date})</span>
                    <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition"
                        onclick="confirmDelete('repair', ${rep.id})">❌</button>
                </li>
            `
          )
          .join("")}</ul>`
      : "<em class='text-gray-500'>Aucune réparation</em>";
  }

  static renderRepairTypes(repairTypes) {
    const repairSelect = document.getElementById("repair_type");
    repairSelect.innerHTML = "";
    repairTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.name;
      repairSelect.appendChild(option);
    });
  }
}

// Event Handlers
async function confirmDelete(type, id) {
  const confirmMessage =
    type === "train"
      ? "Voulez-vous vraiment supprimer ce train ?"
      : "Voulez-vous vraiment supprimer cette réparation ?";

  if (!confirm(confirmMessage)) return;

  const result =
    type === "train"
      ? await TrainService.deleteTrain(id)
      : await TrainService.deleteRepair(id);

  if (result) {
    createNotification(
      `${type === "train" ? "Train" : "Réparation"} supprimé avec succès`
    );
    await initializeApp();
  }
}

// Application Initialization
async function initializeApp() {
  const trains = await TrainService.getTrains();
  const repairTypes = await TrainService.getRepairTypes();

  if (trains) TrainUI.renderTrainTable(trains);
  if (repairTypes) TrainUI.renderRepairTypes(repairTypes);
}

// Form Event Listeners
document
  .getElementById("add-train-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const trainName = document.getElementById("train_name").value.trim();

    if (!trainName) {
      createNotification("Le nom du train ne peut pas être vide", "error");
      return;
    }

    const result = await TrainService.addTrain(trainName);
    if (result) {
      createNotification("Train ajouté avec succès");
      document.getElementById("train_name").value = "";
      await initializeApp();
    }
  });

document
  .getElementById("add-repair-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const trainId = document.getElementById("train_id").value;
    const repairTypeId = document.getElementById("repair_type").value;

    if (!trainId || !repairTypeId) {
      createNotification(
        "Veuillez sélectionner un train et un type de réparation",
        "error"
      );
      return;
    }

    const result = await TrainService.addRepair(trainId, repairTypeId);
    if (result) {
      createNotification("Réparation ajoutée avec succès");
      await initializeApp();
    }
  });

// Start the application
document.addEventListener("DOMContentLoaded", initializeApp);
