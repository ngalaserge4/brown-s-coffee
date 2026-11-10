document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => {
      item.classList.remove("active");
    });

    filter.classList.add("active");

    document.querySelectorAll(".menu-card").forEach((card) => {
      card.hidden =
        filter.dataset.filter !== "all" &&
        card.dataset.category !== filter.dataset.filter;
    });
  });
});
