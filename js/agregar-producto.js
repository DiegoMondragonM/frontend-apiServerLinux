import { ROUTES } from "./config.js";
import {
  applyImagePreview,
  buildProductFormData,
  createProducto,
  fillCategorySelect,
  getProductFormValues,
  setButtonLoading,
  showToast
} from "./helpers.js";

const form = document.getElementById("producto-form");
const submitButton = document.getElementById("submit-button");
const imageInput = document.getElementById("imagen-input");
const previewImage = document.getElementById("preview-image");
const categorySelect = document.getElementById("categoria-select");

applyImagePreview(imageInput, previewImage);

async function cargarCategorias() {
  try {
    await fillCategorySelect(categorySelect);
  } catch (error) {
    categorySelect.innerHTML = '<option value="">Error de conexion</option>';
    showToast("No se pudieron cargar las categorias.", "error");
  }
}

cargarCategorias();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const values = getProductFormValues(form);
  const payload = buildProductFormData(form);

  if (!values.nombre || values.precio <= 0) {
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
