const title = document.getElementById("titulo");

const searchInput = document.getElementById("searchInput");

const cardsContainer = document.getElementById("productos");
const carrito = document.getElementById("listaCarrito");
const modalDetail = document.getElementById("modal-detail");
const deleteButton = document.getElementById("delete-button");

let webColor = "#c6c7ff";

let products = [];

const getProducts = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");
    if (response.ok) {
      let productsJson = await response.json();
      products = productsJson;
      renderProducts(productsJson);
    }
  } catch (error) {
    console.log(error);
  }
};

const createTask = async (task) => {
  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const taskJson = await response.json();
      products.push(taskJson);
      renderProducts(products);
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteTask = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      products = products.filter((product) => product.id !== id);
      renderProducts(products);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateTask = async (id, task) => {
  console.log(id, task);
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const taskJson = await response.json();
      products = products.map((product) =>
        product.id === id ? taskJson : product
      );
      renderProducts(products);
    }
  } catch (error) {
    console.log(error);
  }
};

deleteButton.addEventListener("click", (e) => {
  e.preventDefault();

  const id = modalDetail["data-product-id"];
  console.log(id);
  deleteTask(id);
  modalDetail.classList.remove("is-active");
});

window.onload = () => {
  getProducts();
};

document.getElementById("searchButton").addEventListener("click", () => {
  const text = searchInput.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(text)
  );
  renderProducts(filteredProducts);
});

searchInput.addEventListener("input", (event) => {
  const text = searchInput.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(text)
  );
  renderProducts(filteredProducts);
});

document.querySelectorAll(".dropdown-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const sortType = item.getAttribute("data-sort");
    let sortedProducts = [...products];
    if (sortType === "price-asc")
      sortedProducts.sort((a, b) => a.price - b.price);
    else if (sortType === "price-desc")
      sortedProducts.sort((a, b) => b.price - a.price);
    renderProducts(sortedProducts);
  });
});

document.querySelectorAll(".item-categoria").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const category = item.getAttribute("data-sort");
    const filteredProducts =
      category === "Todas"
        ? products
        : products.filter((product) => product.category === category);
    renderProducts(filteredProducts);
  });
});

function openDetailModal(product) {
  product.stopPropagation();

  const productDetail = products.find((p) => p.name == product.target.id);

  modalDetail.querySelector(".modal-card-title").textContent =
    productDetail.name;
  document.getElementById("modal-image").src = productDetail.image;
  document.getElementById("modal-description").textContent =
    productDetail.description;
  document.getElementById(
    "modal-price"
  ).textContent = `${productDetail.price} USD`;
  document.getElementById("modal-detail")["data-product-id"] = productDetail.id;

  modalDetail.classList.add("is-active");
}

function renderProducts(products) {
  cardsContainer.innerHTML =
    products.length === 0
      ? `<div class="notification has-text-centered"><p class="title is-4">No se encontraron productos</p></div>`
      : products.map((product) => renderCard(product)).join("");
  attachDragEvents();

  document.querySelectorAll(".product").forEach(($product) => {
    $product.addEventListener("click", openDetailModal);
  });
}

function attachDragEvents() {
  document.querySelectorAll(".product").forEach((product) => {
    product.addEventListener("dragstart", drag);
  });
}

function allowDrop(event) {
  event.preventDefault();
}

document.getElementById("carrito").addEventListener("dragover", allowDrop);
document.getElementById("carrito").addEventListener("drop", drop);

const categorias = [
  "Accesorios",
  "Periféricos",
  "Audio",
  "Pantallas",
  "Almacenamiento",
  "Wearables",
];

const productCategorySelect = document.getElementById("productCategory");
const editProductCategorySelect = document.getElementById(
  "editProductCategory"
);

categorias.forEach((categoria) => {
  const option = document.createElement("option");
  option.value = categoria;
  option.textContent = categoria;
  productCategorySelect.appendChild(option);
});

categorias.forEach((categoria) => {
  const option = document.createElement("option");
  option.value = categoria;
  option.textContent = categoria;
  editProductCategorySelect.appendChild(option);
});

document.addEventListener("DOMContentLoaded", () => {
  function openModal($el) {
    $el.classList.add("is-active");
  }

  function closeModal($el) {
    $el.classList.remove("is-active");
  }

  function closeAllModals() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  document.querySelectorAll(".js-modal-trigger").forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      openModal($target);
    });
  });

  document
    .querySelectorAll(".modal-background, .delete, .modal-card-foot .button")
    .forEach(($close) => {
      const $target = $close.closest(".modal");

      $close.addEventListener("click", () => {
        closeModal($target);
      });
    });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });

  const saveProductButton = document.getElementById("saveProductButton");
  const productForm = document.getElementById("productForm");

  saveProductButton.addEventListener("click", async () => {
    if (productForm.checkValidity()) {
      const name = document.getElementById("productName").value;
      const description = document.getElementById("productDescription").value;
      const image = document.getElementById("productImage").value;
      const price = parseFloat(document.getElementById("productPrice").value);

      const newProduct = {
        name,
        description,
        image,
        price,
        category: "Accessories",
      };

      await createTask(newProduct);
      closeAllModals();
      productForm.reset();
    } else {
      alert("Por favor, completa todos los campos.");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
  attachEventListeners();
});

function attachEventListeners() {
  document
    .getElementById("searchButton")
    .addEventListener("click", filterAndRenderProducts);
  searchInput.addEventListener("input", filterAndRenderProducts);
  document.getElementById("dropdown").addEventListener("click", toggleDropdown);
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", sortProducts);
  });
  document
    .getElementById("dropdown-categoria")
    .addEventListener("click", toggleDropdown);
  document.querySelectorAll(".item-categoria").forEach((item) => {
    item.addEventListener("click", filterByCategory);
  });
  document.getElementById("carrito").addEventListener("dragover", allowDrop);
  document.getElementById("carrito").addEventListener("drop", drop);
  title.addEventListener("click", toggleConfetti);
}

function toggleDropdown() {
  this.classList.toggle("is-active");
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.dataset.productId);
}

function drop(event) {
  event.preventDefault();
  const productId = event.dataTransfer.getData("text");
  const product = products.find((p) => p.name === productId);

  if (product) {
    const existingItem = carrito.querySelector(
      `div[data-product-id="${productId}"]`
    );
    if (existingItem) {
      const quantityElement = existingItem.querySelector(".quantity");
      let quantity = parseInt(quantityElement.textContent);
      quantityElement.textContent = quantity + 1;
    } else {
      addItemToCart(product);
    }
  }
}

function addItemToCart(product) {
  const item = document.createElement("div");
  item.setAttribute("data-product-id", product.name);
  item.className = "box my-3 accent-color";
  item.innerHTML = `
    <div class="is-flex is-justify-content-space-between">
      <div>
        <b>${product.name}</b> - $${product.price}
        <span class="quantity">0</span> unidad(es)
      </div>
      <div>
        <button onclick="increaseQuantity('${product.name}', 1)">+</button>
        <button onclick="increaseQuantity('${product.name}', -1)">-</button>
      </div>
    </div>
  `;
  carrito.appendChild(item);
}

function increaseQuantity(productId, change) {
  const productElement = carrito.querySelector(
    `div[data-product-id="${productId}"]`
  );
  const quantityElement = productElement.querySelector(".quantity");
  let quantity = parseInt(quantityElement.textContent);
  quantity = Math.max(1, quantity + change); // Asegura que la cantidad no sea menor que 1
  quantityElement.textContent = quantity;
}

function sortProducts(event) {
  event.preventDefault();
  const sortType = this.getAttribute("data-sort");
  let sortedProducts = [...products];
  if (sortType === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }
  renderProducts(sortedProducts);
}

function filterByCategory(event) {
  event.preventDefault();
  const category = this.getAttribute("data-sort");
  const filteredProducts =
    category === "Todas"
      ? products
      : products.filter((product) => product.category === category);
  renderProducts(filteredProducts);
}

function filterAndRenderProducts() {
  const text = searchInput.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(text)
  );
  renderProducts(filteredProducts);
}

function toggleConfetti(e) {
  e.preventDefault();
  const rect = title.getBoundingClientRect();
  const x = (rect.left + rect.right) / 2 / window.innerWidth;
  const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
  confetti({
    particleCount: 20,
    spread: 200,
    origin: { x: x, y: y },
  });
  toggleAccentColor();
}

title.addEventListener("click", function () {
  webColor = `hsl(${Math.random() * 360}, 100%, 80%)`;
  setAccentColors(webColor);

  const emojis = ["🚀", "🌈", "🦄", "🌟", "🎉", "🎈", "🎊", "🔥", "💥", "🌲"];

  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  this.textContent = "Humildify " + randomEmoji;
});

function setAccentColors(color) {
  const elementsColor = Array.from(
    document.getElementsByClassName("accent-color")
  );
  const elementsBackground = Array.from(
    document.getElementsByClassName("accent-background")
  );
  const elementsShadow = Array.from(
    document.getElementsByClassName("accent-shadow")
  );

  elementsColor.forEach((element) => {
    element.style.color = color;
  });

  elementsBackground.forEach((element) => {
    element.style.backgroundColor = color;
  });

  elementsShadow.forEach((element) => {
    element.style.boxShadow = `0px 0px 20px -8px ${color}`;
  });

  elementsShadow.forEach((element) => {
    element.addEventListener("focus", () => {
      element.style.borderColor = color;
    });

    element.addEventListener("blur", () => {
      element.style.borderColor = "";
    });
  });
}

function renderCard(product) {
  return `
    <div class="cell product" draggable="true" id="${product.name}" data-product-id="${product.name}">
      <div class="card accent-shadow">
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="${product.image}" class=""full-width alt="${product.name}" />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${product.name}</p>
              <p class="subtitle is-4">${product.price}</p>
            </div>
          </div>
          <div class="content">${product.description}</div>
        </div>
      </div>
    </div>`;
}

function toggleAccentColor() {
  webColor = `hsl(${Math.random() * 360}, 100%, 80%)`;
  setAccentColors(webColor);
  title.textContent = "Humildify " + getEmoji();
}

function getEmoji() {
  const emojis = ["🚀", "🌈", "🦄", "🌟", "🎉", "🎈", "🎊", "🔥", "💥", "🌲"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function openEditModal(id) {
  const productData = products.find((product) => product.id === id);
  document.getElementById("editProductName").value = productData.name;
  document.getElementById("editProductDescription").value =
    productData.description;
  document.getElementById("editProductImage").value = productData.imageUrl;
  document.getElementById("editProductPrice").value = productData.price;

  const categorySelect = document.getElementById("editProductCategory");
  categorySelect.value = productData.category;

  const editModal = document.getElementById("editProductModal");
  editModal.classList.add("is-active");
  editModal["data-product-id"] = id;
}

document.getElementById("add-button").addEventListener("click", function () {
  openEditModal(document.getElementById("modal-detail")["data-product-id"]);
});

document
  .querySelector("#editProductModal .delete")
  .addEventListener("click", function () {
    document.getElementById("editProductModal").classList.remove("is-active");
  });

document
  .getElementById("updateProductButton")
  .addEventListener("click", async () => {
    const id = document.getElementById("editProductModal")["data-product-id"];
    const name = document.getElementById("editProductName").value;
    const description = document.getElementById("editProductDescription").value;
    const image = document.getElementById("editProductImage").value;
    const price = parseFloat(document.getElementById("editProductPrice").value);
    const category = document.getElementById("editProductCategory").value;

    const updatedProduct = {
      name,
      description,
      image,
      price,
      category,
    };

    console.log(updatedProduct);

    await updateTask(id, updatedProduct);
    document.getElementById("editProductModal").classList.remove("is-active");
  });
