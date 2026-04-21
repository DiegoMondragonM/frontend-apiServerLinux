import { ROUTES } from "./config.js";
import {
  applyImagePreview,
  fetchProductoById,
  formDataToProductPayload,
  getQueryParam,
  setButtonLoading,
  showToast,
  updateProducto
} from "./helpers.js";

const form = document.getElementById("producto-form");
const submitButton = document.getElementById("submit-button");
const imageInput = document.getElementById("imagen-input");
const previewImage = document.getElementById("preview-image");
const productId = getQueryParam("id");

applyImagePreview(imageInput, previewImage);

function fillForm(producto) {
  form.elements.nombre.value = producto.nombre;
  form.elements.precio.value = producto.precio;
  form.elements.categoria_id.value = producto.categoria_id || "";
  form.elements.stock.value = producto.stock;
  form.elements.imagen_url.value = producto.imagen && !producto.imagen.endsWith("product-placeholder.svg") ? producto.imagen : "";
  form.elements.descripcion.value = producto.descripcion;
  previewImage.src = producto.imagen;
}

async function loadProducto() {
  if (!productId) {
    showToast("Abre esta página con un parámetro ?id=123.", "error");
    submitButton.disabled = true;
    return;
  }

  let loaded = false;

  try {
    setButtonLoading(submitButton, true, "Cargando...");
    const producto = await fetchProductoById(productId);
    fillForm(producto);
    loaded = true;
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(submitButton, false);
    if (!loaded) {
      submitButton.disabled = true;
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = formDataToProductPayload(form);

  if (!payload.nombre || payload.precio <= 0) {
    showToast("Ingresa un nombre y un precio mayor a cero.", "error");
    return;
  }

  try {
    setButtonLoading(submitButton, true, "Actualizando...");
    const updatedProduct = await updateProducto(productId, payload);
    showToast("Producto actualizado correctamente.", "success");

    window.setTimeout(() => {
      const target = updatedProduct.id ? ROUTES.detalle(updatedProduct.id) : ROUTES.productos;
      window.location.href = target;
    }, 800);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(submitButton, false);
  }
});

loadProducto();
