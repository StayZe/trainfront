const API_BASE_URL = "http://localhost:8080";

// API Service
const ApiService = {
  request: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
      });
      return response.ok ? response.json() : null;
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  },
};

// Train Service
const TrainService = {
  getTrains: () => ApiService.request(`${API_BASE_URL}/trains`),
  getRepairTypes: () => ApiService.request(`${API_BASE_URL}/repair-types`),
  addTrain: (name) =>
    ApiService.request(`${API_BASE_URL}/trains`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  addRepair: (trainId, repairTypeId) =>
    ApiService.request(`${API_BASE_URL}/repairs`, {
      method: "POST",
      body: JSON.stringify({ train_id: trainId, repair_type_id: repairTypeId }),
    }),
  deleteTrain: (trainId) =>
    ApiService.request(`${API_BASE_URL}/trains/${trainId}`, {
      method: "DELETE",
    }),
  deleteRepair: (repairId) =>
    ApiService.request(`${API_BASE_URL}/repairs/${repairId}`, {
      method: "DELETE",
    }),
};

// UI Rendering
const TrainUI = {
  renderTrainTable: (trains) => {
    const tableBody = document.getElementById("train-table-body");
    const trainSelect = document.getElementById("train_id");
    tableBody.innerHTML = "";
    trainSelect.innerHTML = "";

    trains.forEach((train) => {
      const hasRepairs = train.repairs.length > 0;
      const row = document.createElement("tr");
      row.className = `transition-colors ${
        hasRepairs ? "bg-white text-black" : "bg-white"
      }`;

      row.innerHTML = `
        <td class="p-4 text-center">${train.id}</td>
        <td class="p-4 text-center font-semibold">${train.name}</td>
        <td class="p-4 text-center">${TrainUI.renderRepairs(train.repairs)}</td>
        <td class="p-4 text-center">
          ${
            hasRepairs
              ? `<span class="text-xs text-black">Réparations en cours</span>`
              : `<button class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  onclick="confirmDelete('train', ${train.id})">Supprimer</button>`
          }
        </td>
      `;
      tableBody.appendChild(row);

      const option = document.createElement("option");
      option.value = train.id;
      option.textContent = train.name;
      trainSelect.appendChild(option);
    });
  },

  renderRepairs: (repairs) =>
    repairs.length
      ? `<ul class="space-y-2">${repairs
          .map(
            (rep) => `
          <li class="bg-gray-100 rounded-lg p-2 flex justify-between items-center">
            <span class="text-black">${rep.type} (${rep.date})</span>
            <button class="text-white px-2 py-1 rounded-md hover:bg-red-600 transition"
                onclick="confirmDelete('repair', ${rep.id})">❌</button>
          </li>`
          )
          .join("")}</ul>`
      : "<p class='text-gray-500 text-left'>Aucune réparation <br> En service 🟢 </p>",

  renderRepairTypes: (repairTypes) => {
    const repairSelect = document.getElementById("repair_type");
    repairSelect.innerHTML =
      '<option value="">Sélectionner un type de réparation</option>';
    repairTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.name;
      repairSelect.appendChild(option);
    });
  },
};

// Event Handlers
const confirmDelete = async (type, id) => {
  if (!confirm(`Voulez-vous vraiment supprimer ce ${type} ?`)) return;

  const deleteMethod =
    type === "train" ? TrainService.deleteTrain : TrainService.deleteRepair;

  if (await deleteMethod(id)) initializeApp();
};

// Application Initialization
const initializeApp = async () => {
  const [trains, repairTypes] = await Promise.all([
    TrainService.getTrains(),
    TrainService.getRepairTypes(),
  ]);

  if (trains) TrainUI.renderTrainTable(trains);
  if (repairTypes) TrainUI.renderRepairTypes(repairTypes);
};

// Event Listener Setup
document
  .getElementById("add-train-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const trainName = document.getElementById("train_name").value.trim();
    if (trainName && (await TrainService.addTrain(trainName))) {
      event.target.reset();
      initializeApp();
    }
  });

document
  .getElementById("add-repair-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const trainId = document.getElementById("train_id").value;
    const repairTypeId = document.getElementById("repair_type").value;
    if (
      trainId &&
      repairTypeId &&
      (await TrainService.addRepair(trainId, repairTypeId))
    ) {
      initializeApp();
    }
  });

// Start the application
document.addEventListener("DOMContentLoaded", initializeApp);
