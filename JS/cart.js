const cart = JSON.parse(localStorage.getItem("brownsCart") || "[]");
const countEls = document.querySelectorAll(".cart-count");
const drawer = document.querySelector(".cart-drawer");
const toast = document.querySelector(".toast");

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  countEls.forEach((element) => {
    element.textContent = count;
  });

  const clearButton = document.querySelector("[data-cart-clear]");
  if (clearButton) {
    clearButton.disabled = cart.length === 0;
  }

  const items = document.querySelector(".cart-items");

  if (!items) {
    return;
  }

  items.innerHTML = cart.length
    ? cart
        .map(
          (item) => `
			<div class="cart-item">
				<span>
					${item.name}
					<small>Qty ${item.qty}</small>
				</span>
				<strong>$${(item.price * item.qty).toFixed(2)}</strong>
			</div>
		`,
        )
        .join("")
    : '<p style="color:var(--muted);font-size:.85rem">Your bag is waiting for something good.</p>';

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalElement = document.querySelector(".cart-total span:last-child");

  if (totalElement) {
    totalElement.textContent = `$${total.toFixed(2)}`;
  }

  localStorage.setItem("brownsCart", JSON.stringify(cart));
}

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-btn");

  if (addButton) {
    const existingItem = cart.find(
      (item) => item.name === addButton.dataset.item,
    );

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({
        name: addButton.dataset.item,
        price: Number(addButton.dataset.price),
        qty: 1,
      });
    }

    renderCart();
    showToast(`${addButton.dataset.item} added to your bag`);
  }

  if (event.target.closest("[data-cart-open]")) {
    event.preventDefault();
    drawer?.classList.add("open");
  }

  if (event.target.closest("[data-cart-close]")) {
    drawer?.classList.remove("open");
  }

  if (event.target.closest("[data-cart-clear]")) {
    if (!cart.length) {
      return;
    }

    cart.splice(0, cart.length);
    renderCart();
    showToast("Your bag has been cleared");
  }

  if (event.target.closest("[data-checkout]")) {
    showToast(
      cart.length
        ? "Checkout is ready for the next step"
        : "Add something delicious first",
    );
  }
});

renderCart();
