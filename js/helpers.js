import { APP, ROUTES, buildApiUrl } from "./config.js";

const FALLBACK_IMAGE = "./img/product-placeholder.svg";

export function normalizeProducto(raw = {}) {
  return {
    id: raw.id ?? raw._id ?? raw.producto_id ?? raw.codigo ?? "",
    nombre: raw.nombre ?? raw.name ?? raw.titulo ?? "Producto sin nombre",
    descripcion: raw.descripcion ?? raw.description ?? "Sin descripción disponible.",
    precio: parseFloat(raw.precio ?? raw.price ?? 0),
    categoria: raw.categoria ?? raw.category ?? (raw.categoria_id ? `Categoria #${raw.categoria_id}` : "General"),
    categoria_id: raw.categoria_id === null ? null : parseInt(raw.categoria_id ?? 0, 10),
    imagen: raw.imagen ?? raw.image ?? raw.image_url ?? raw.imagen_url ?? FALLBACK_IMAGE,
    stock: parseInt(raw.stock ?? raw.inventory ?? raw.existencias ?? 0, 10),
    sku: raw.sku ?? raw.SKU ?? raw.codigo ?? "",
    activo: raw.activo ?? true
  };
}

export function formatCurrency(value = 0) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(value) || 0);
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`.trim();

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.className = "toast";
  }, 3200);
}

export function setLoadingBlock(container, message = "Cargando...") {
  container.innerHTML = `
    <article class="loading-state">
      <div>
        <h3>${message}</h3>
      </div>
    </article>
  `;
}

export function setEmptyBlock(container, title, message) {
  container.innerHTML = `
    <article class="empty-state">
      <div>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    </article>
  `;
}

export function setButtonLoading(button, isLoading, loadingLabel = "Procesando...") {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = loadingLabel;
    return;
  }

  button.disabled = false;
  button.textContent = button.dataset.originalLabel || button.textContent;
}

export function formDataToProductPayload(form) {
  const formData = new FormData(form);
  const categoriaId = formData.get("categoria_id");
  return {
    nombre: String(formData.get("nombre") || "").trim(),
    descripcion: String(formData.get("descripcion") || "").trim(),
    precio: Number(formData.get("precio") || 0),
    categoria_id: categoriaId === "" ? null : Number(categoriaId),
    imagen_url: String(formData.get("imagen_url") || "").trim() || null,
    stock: Number(formData.get("stock") || 0)
  };
}

export async function requestJson(url, options = {}) {
  console.log("URL de la solicitud:", url);
  console.log("Opciones de la solicitud:", options);
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string"
      ? payload
      : payload.message || payload.mensaje || payload.error || `Error ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function extractCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.datos)) return payload.datos;
  if (Array.isArray(payload?.productos)) return payload.productos;
  return [];
}

export function extractItem(payload) {
  if (!payload) return null;
  return payload.data || payload.datos || payload.producto || payload;
}

export async function fetchProductos() {
  const payload = await requestJson(buildApiUrl(APP.productsResource));
  console.log("Respuesta de la API:", payload);
  return extractCollection(payload).map(normalizeProducto);
}

export async function fetchProductoById(id) {
  const payload = await requestJson(buildApiUrl(`${APP.productsResource}/${id}`));
  const item = extractItem(payload);
  if (!item) {
    throw new Error("No se encontró el producto solicitado.");
  }
  return normalizeProducto(item);
}

export async function createProducto(data) {
  const payload = await requestJson(buildApiUrl(APP.productsResource), {
    method: "POST",
    body: JSON.stringify(data)
  });

  return normalizeProducto(extractItem(payload) || data);
}

export async function updateProducto(id, data) {
  const payload = await requestJson(buildApiUrl(`${APP.productsResource}/${id}`), {
    method: "PUT",
    body: JSON.stringify(data)
  });

  return normalizeProducto(extractItem(payload) || { id, ...data });
}

export async function deleteProducto(id) {
  return requestJson(buildApiUrl(`${APP.productsResource}/${id}`), {
    method: "DELETE"
  });
}

export function renderProductCard(producto, options = {}) {
  const { showDelete = true } = options;
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <div class="product-media">
      <img src="${producto.imagen || FALLBACK_IMAGE}" alt="${producto.nombre}">
    </div>
    <div class="product-body">
      <span class="product-badge">${producto.categoria || "General"}</span>
      <h3 class="product-title">${producto.nombre}</h3>
      <p class="product-description">${producto.descripcion}</p>
      <div class="price-row">
        <span class="label-muted">Precio</span>
        <strong>${formatCurrency(producto.precio)}</strong>
      </div>
      <div class="stock-row">
        <span class="label-muted">Stock: ${producto.stock}</span>
        <span class="label-muted">ID: ${producto.id || "N/D"}</span>
      </div>
      <div class="card-actions">
        <a class="icon-btn" href="${ROUTES.detalle(producto.id)}">Ver detalle</a>
        <a class="icon-btn" href="${ROUTES.editar(producto.id)}">Editar</a>
        ${showDelete ? `<button class="icon-btn btn-danger" type="button" data-action="delete" data-id="${producto.id}">Eliminar</button>` : ""}
      </div>
    </div>
  `;

  const image = article.querySelector("img");
  image.addEventListener("error", () => {
    image.src = FALLBACK_IMAGE;
  }, { once: true });

  return article;
}

export function renderDetail(producto) {
  return `
    <div class="detail-visual">
      <div class="detail-image">
        <img src="${producto.imagen || FALLBACK_IMAGE}" alt="${producto.nombre}" id="detail-image">
      </div>
      <div class="meta-grid">
        <article class="meta-item">
          <span class="label-muted">ID del producto</span>
          <strong>${producto.id || "N/D"}</strong>
        </article>
        <article class="meta-item">
          <span class="label-muted">Stock</span>
          <strong>${producto.stock} unidades</strong>
        </article>
      </div>
    </div>

    <div class="detail-panel">
      <span class="product-badge">${producto.categoria}</span>
      <h2 class="detail-title">${producto.nombre}</h2>
      <strong class="detail-price">${formatCurrency(producto.precio)}</strong>
      <p class="detail-description">${producto.descripcion}</p>
      <div class="meta-grid">
        <article class="meta-item">
          <span class="label-muted">Endpoint base</span>
          <strong>${buildApiUrl(APP.productsResource)}</strong>
        </article>
        <article class="meta-item">
          <span class="label-muted">Vista activa</span>
          <strong>${APP.name}</strong>
        </article>
      </div>
      <div class="detail-actions">
        <a class="btn btn-primary" href="${ROUTES.editar(producto.id)}">Editar producto</a>
        <a class="btn btn-secondary" href="${ROUTES.productos}">Ver listado</a>
        <button class="btn btn-danger" type="button" id="delete-product-button">Eliminar</button>
      </div>
    </div>
  `;
}

export function applyImagePreview(input, previewImage) {
  const update = () => {
    const value = input.value.trim();
    previewImage.src = value || FALLBACK_IMAGE;
  };

  input.addEventListener("input", update);
  previewImage.addEventListener("error", () => {
    previewImage.src = FALLBACK_IMAGE;
  });
  update();
}
