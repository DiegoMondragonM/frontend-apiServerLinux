import {
  deleteProducto,
  fetchProductos,
  formatCurrency,
  renderProductCard,
  setEmptyBlock,
  setLoadingBlock,
  showToast
} from "./helpers.js";

const grid = document.getElementById("productos-grid");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const totalProductos = document.getElementById("total-productos");
const totalStock = document.getElementById("total-stock");
const precioPromedio = document.getElementById("precio-promedio");

let productos = [];

function sortProductos(items, criteria) {
  const sorted = [...items];

  sorted.sort((a, b) => {
    switch (criteria) {
      case "nombre-desc":
        return b.nombre.localeCompare(a.nombre, "es");
      case "precio-asc":
        return a.precio - b.precio;
      case "precio-desc":
        return b.precio - a.precio;
      case "stock-desc":
        return b.stock - a.stock;
      case "nombre-asc":
      default:
        return a.nombre.localeCompare(b.nombre, "es");
    }
  });

  return sorted;
}

function getFilteredProductos() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = productos.filter((producto) => {
    const haystack = [producto.nombre, producto.categoria, producto.id]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  return sortProductos(filtered, sortSelect.value);
}

function updateStats(items) {
  const stock = items.reduce((acc, producto) => acc + (Number(producto.stock) || 0), 0);
  const average = items.length
    ? items.reduce((acc, producto) => acc + (Number(producto.precio) || 0), 0) / items.length
    : 0;

  totalProductos.textContent = items.length;
  totalStock.textContent = stock;
  precioPromedio.textContent = formatCurrency(average);
}

function renderProductos(items) {
  if (!items.length) {
    setEmptyBlock(grid, "No hay coincidencias", "Prueba con otro término o agrega un nuevo producto.");
    return;
  }

  grid.innerHTML = "";
  items.forEach((producto) => {
    grid.appendChild(renderProductCard(producto));
  });
}

function refreshView() {
  const visibleItems = getFilteredProductos();
  updateStats(visibleItems);
  renderProductos(visibleItems);
}

async function handleDelete(productId) {
  const confirmed = window.confirm("¿Quieres eliminar este producto? Esta acción no se puede deshacer.");
  if (!confirmed) return;

  try {
    await deleteProducto(productId);
    productos = productos.filter((producto) => String(producto.id) !== String(productId));
    refreshView();
    showToast("Producto eliminado correctamente.", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadProductos() {
  setLoadingBlock(grid, "Cargando catálogo...");

  try {
    productos = await fetchProductos();
    refreshView();
  } catch (error) {
    setEmptyBlock(grid, "No fue posible cargar productos", error.message);
    updateStats([]);
    showToast(error.message, "error");
  }
}

searchInput.addEventListener("input", refreshView);
sortSelect.addEventListener("change", refreshView);
grid.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  handleDelete(button.dataset.id);
});

loadProductos();
