document.querySelectorAll(".admin-table tbody tr").forEach((row) => {
  row.addEventListener("click", () => {
    row.style.background = "rgba(49,90,114,.08)";
  });
});
