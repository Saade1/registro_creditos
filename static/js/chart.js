new Chart(ctx, {
  type: "bar",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Total de Créditos Otorgados",
        data: totalAmounts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2, 
  },
});
