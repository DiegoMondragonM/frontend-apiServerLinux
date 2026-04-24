import { ROUTES, getApiBaseUrl } from "./config.js";
import {
  applyImagePreview,
  createProducto,
  formDataToProductPayload,
  setButtonLoading,
  showToast,
  requestJson
} from "./helpers.js";

const form = document.getElementById("producto-form");
const submitButton = document.getElementById("submit-button");
const imageInput = document.getElementById("imagen-input");
const previewImage = document.getElementById("preview-image");

applyImagePreview(imageInput, previewImage);

async function cargarCategorias() {
  const select = document.getElementById("categoria-select");

  try {
    const response = await requestJson("http://192.168.1.65/api/categorias");

    if (response.ok && response.categorias) {
      select.innerHTML = '<option value="">Selecciona una categoría...</option>';

      response.categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.categoria_id;
        option.textContent = cat.nombre;
        select.appendChild(option);
      });

    } else {
      select.innerHTML = '<option value="">Error al cargar categorías</option>';
    }

  } catch (error) {
    console.error("Error al cargar categorías:", error);
    select.innerHTML = '<option value="">Error de conexión</option>';
  }
}

cargarCategorias();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = formDataToProductPayload(form);

  if (!payload.nombre || payload.precio <= 0) {
    showToast("Ingresa un nombre y un precio mayor a cero.", "error");
    return;
  }

  try {
    setButtonLoading(submitButton, true, "Guardando...");
    const createdProduct = await createProducto(payload);
    showToast("Producto guardado correctamente.", "success");

    window.setTimeout(() => {
      const target = createdProduct.id ? ROUTES.detalle(createdProduct.id) : ROUTES.productos;
      window.location.href = target;
    }, 800);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(submitButton, false);
  }
});
