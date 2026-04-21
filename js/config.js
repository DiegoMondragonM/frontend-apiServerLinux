export const APP = {
  name: "Catálogo Veloz",
  storageKey: "web-productos:apiBaseUrl",
  defaultApiBaseUrl: "http://192.168.1.65/api/productos",
  productsResource: "/productos"
};

export function getApiBaseUrl() {
  const customBaseUrl = window.localStorage.getItem(APP.storageKey);
  return (customBaseUrl || APP.defaultApiBaseUrl || "").replace(/\/$/, "");
}

export function buildApiUrl(resource = "") {
  const normalizedResource = resource
    ? resource.startsWith("/")
      ? resource.replace(/^\/productos/, "") // Evitar duplicados
      : `/${resource}`
    : "";

  return `${getApiBaseUrl()}${normalizedResource}`;
}

export const ROUTES = {
  home: "./index.html",
  productos: "./productos.html",
  detalle: (id) => `./detalle.html?id=${encodeURIComponent(id)}`,
  agregar: "./agregar-producto.html",
  editar: (id) => `./editar-producto.html?id=${encodeURIComponent(id)}`
};
