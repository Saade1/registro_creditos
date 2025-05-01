document
  .getElementById("credit-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const editingId = event.target.dataset.editingId;

    try {
      const response = await fetch(
        editingId ? `/creditos/${editingId}` : "/creditos",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      alert(result.message);

      loadCredits(); 
      showTotalCreditsGraph();
      showCreditDistributionGraph();
      event.target.reset();
      delete event.target.dataset.editingId; 
      document.getElementById("submitButton").textContent = "Registrar Crédito";
    } catch (error) {
      console.error("Error al registrar/actualizar crédito:", error);
    }
  });

document.addEventListener("DOMContentLoaded", loadCredits);

async function loadCredits() {
  const tbody = document.querySelector("#credit-Table tbody");
  tbody.innerHTML = ""; 

  try {
    // Hacer solicitud a la API Flask
    const response = await fetch("/creditos");
    const credits = await response.json();

    if (credits.length === 0) {
      const emptyRow = `
                <tr>
                    <td colspan="7" style="text-align: center;">No hay registros disponibles</td>
                </tr>`;
      tbody.innerHTML = emptyRow;
    } else {
      // Agregar filas con datos
      credits.forEach((credit) => {
        const row = `
                    <tr>
                        <td>${credit.id}</td>
                        <td>${credit.cliente}</td>
                        <td>${credit.monto}</td>
                        <td>${credit.tasa_Interes}</td>
                        <td>${credit.plazo}</td>
                        <td>${credit.fecha_Otorgamiento}</td>
                        <td>
                            <button onclick="editCredit(${credit.id})">Editar</button>
                            <button class="delete" onclick="deleteCredit(${credit.id})"> Eliminar</button>
                        </td>
                    </tr>`;
        tbody.innerHTML += row;
      });
    }
  } catch (error) {
    console.error("Error al cargar los créditos:", error);
    const errorRow = `
            <tr>
                <td colspan="7" style="text-align: center;">Error al cargar los datos</td>
            </tr>`;
    tbody.innerHTML = errorRow;
  }
}

async function editCredit(id) {
  try {
    const response = await fetch("/creditos");
    const credits = await response.json();
    const credit = credits.find((c) => c.id === id);

    if (credit) {
      document.querySelector("[name='cliente']").value = credit.cliente;
      document.querySelector("[name='monto']").value = credit.monto;
      document.querySelector("[name='tasa_Interes']").value =
        credit.tasa_Interes;
      document.querySelector("[name='plazo']").value = credit.plazo;
      document.querySelector("[name='fecha_Otorgamiento']").value =
        credit.fecha_Otorgamiento;

      document.getElementById("credit-form").dataset.editingId = id;
      document.getElementById("submitButton").textContent =
        "Actualizar Crédito";
    }
  } catch (error) {
    console.error("Error al obtener el crédito para editar:", error);
  }
}

async function deleteCredit(id) {
  if (!confirm("¿Seguro que desea eliminar este crédito?")) {
    return;
  }
  try {
    const response = await fetch(`/creditos/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    alert(result.message);

    loadCredits();
    showTotalCreditsGraph();
    showCreditDistributionGraph();
  } catch (error) {
    console.error("Error al eliminar crédito:", error);
  }
}

const colors = ["#FF6384", "#36A2EB", "#FFCE56"]; 
const borderColors = colors.map((color) => color.replace("0.6", "1")); 

async function showTotalCreditsGraph() {
  const response = await fetch("/creditos");
  const credits = await response.json();

  if (!credits.length) {
    console.warn("No hay datos para mostrar en el gráfico.");
    return;
  }

  // Sumar montos por cliente
  const creditTotals = {};
  credits.forEach((credit) => {
    creditTotals[credit.cliente] =
      (creditTotals[credit.cliente] || 0) + credit.monto;
  });

  const labels = Object.keys(creditTotals);
  const totalAmounts = Object.values(creditTotals);

  // Destruir gráfico previo si existe para evitar superposición
  const existingChart = Chart.getChart("totalCreditsChart");
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById("totalCreditsChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total de Créditos Otorgados",
          data: totalAmounts,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      animation: {
        duration: 1500,
        easing: "easeOutBounce",
      },
      scales: {
        y: {
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14,
              family: "Arial",
              weight: "bold",
            },
            color: "#333",
          },
        },
      },
    },
  });
}

async function showCreditDistributionGraph() {
  const response = await fetch("/creditos");
  const credits = await response.json();

  if (!credits.length) {
    console.warn("No hay datos para mostrar en el gráfico.");
    return;
  }

  // Contar créditos por rango de montos
  const ranges = {
    "Menos de 5,000": credits.filter((credit) => credit.monto < 5000).length,
    "Entre 5,000 y 15,000": credits.filter(
      (credit) => credit.monto >= 5000 && credit.monto <= 15000
    ).length,
    "Más de 15,000": credits.filter((credit) => credit.monto > 15000).length,
  };

  // Destruir gráfico previo si existe
  const existingChart = Chart.getChart("creditDistributionChart");
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document
    .getElementById("creditDistributionChart")
    .getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(ranges),
      datasets: [
        {
          label: "Distribución de Créditos por Rango",
          data: Object.values(ranges),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
        easing: "easeOutBounce",
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 14,
              family: "Arial",
              weight: "bold",
            },
            color: "#333",
          },
        },
      },
    },
  });
}

// Llamar a la función cuando la página cargue
document.addEventListener("DOMContentLoaded", async () => {
  await showTotalCreditsGraph();
  await showCreditDistributionGraph();
});

document.getElementById("toggleCharts").addEventListener("click", function () {
  const chartsContainer = document.getElementById("charts-container");

  if (
    chartsContainer.style.display === "none" ||
    chartsContainer.style.display === ""
  ) {
    chartsContainer.style.display = "flex";
    showTotalCreditsGraph(); 
    showCreditDistributionGraph();
    this.textContent = "Ocultar Gráficas";
  } else {
    chartsContainer.style.display = "none";
    this.textContent = "Mostrar Gráficas";
  }
});
