import { ROUTES } from "./config.js";
import {
  deleteProducto,
  fetchProductoById,
  getQueryParam,
  renderDetail,
  setEmptyBlock,
  setLoadingBlock,
  showToast
} from "./helpers.js";

const container = document.getElementById("detalle-container");
const productId = getQueryParam("id");

async function handleDelete() {
  const confirmed = window.confirm("¿Quieres eliminar este producto?");
  if (!confirmed) return;

  try {
    await deleteProducto(productId);
    showToast("Producto eliminado correctamente.", "success");
    window.setTimeout(() => {
      window.location.href = ROUTES.productos;
    }, 900);
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadDetalle() {
  if (!productId) {
    setEmptyBlock(container, "Falta el identificador", "Abre esta página con un parámetro como ?id=1.");
    return;
  }

  setLoadingBlock(container, "Cargando detalle...");

  try {
    const producto = await fetchProductoById(productId);
    container.innerHTML = renderDetail(producto);

    const image = document.getElementById("detail-image");
    image?.addEventListener("error", () => {
      image.src = "./img/product-placeholder.svg";
    }, { once: true });

    document
      .getElementById("delete-product-button")
      ?.addEventListener("click", handleDelete);
  } catch (error) {
    setEmptyBlock(container, "No se pudo cargar el producto", error.message);
    showToast(error.message, "error");
  }
}

loadDetalle();
