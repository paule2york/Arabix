const REPO_OWNER = "paule2york";
const REPO_NAME = "Arabix";
const BRANCH = "main";
const TOKEN_KEY = "arabix_cms_token";

const files = {
  portfolio: {
    path: "data/portfolio.json",
    label: "Portfolio",
    itemKey: "projects",
    blankItem: () => ({
      category: "web",
      image: "",
      title: { en: "New project", ar: "" },
      timeframe: { en: "7 days", ar: "" },
      budget: { en: "SAR 1,000", ar: "" }
    })
  },
  shop: {
    path: "data/shop.json",
    label: "Shop",
    itemKey: "products",
    blankItem: () => ({
      category: "business",
      image: "",
      title: { en: "New theme", ar: "" },
      price: { en: "SAR 499", ar: "" },
      timeframe: { en: "Instant delivery", ar: "" },
      description: { en: "", ar: "" },
      slug: "",
      badge: { en: "", ar: "" },
      platform: { en: "HTML / CMS-ready", ar: "" },
      liveDemo: "#",
      license: {
        personal: { en: "Personal license", ar: "", price: 499, oldPrice: 799 },
        commercial: { en: "Commercial license", ar: "", price: 899, oldPrice: 1299 }
      },
      addons: []
    })
  }
};

const state = {
  token: sessionStorage.getItem(TOKEN_KEY) || "",
  activeTab: "portfolio",
  data: {},
  sha: {}
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function apiUrl(path = "") {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${path}`;
}

async function github(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${state.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.message || `GitHub error ${response.status}`);
  }
  return body;
}

function decodeBase64Utf8(value) {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function setStatus(target, message, isError = false) {
  const el = qs(target);
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("is-error", Boolean(isError));
}

function setByPath(object, path, value) {
  const keys = path.split(".");
  let cursor = object;
  keys.slice(0, -1).forEach((key) => {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  });
  cursor[keys.at(-1)] = value;
}

function textField(label, path, value, extra = "") {
  return `
    <label class="${extra}">
      <span>${label}</span>
      <input type="text" value="${escapeAttr(value || "")}" data-field="${path}" />
    </label>
  `;
}

function textArea(label, path, value) {
  return `
    <label class="field-full">
      <span>${label}</span>
      <textarea data-field="${path}">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function numberField(label, path, value) {
  return `
    <label>
      <span>${label}</span>
      <input type="number" value="${Number(value || 0)}" data-field="${path}" />
    </label>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

async function loadFile(key) {
  const file = files[key];
  const body = await github(`/contents/${file.path}?ref=${BRANCH}`);
  state.sha[key] = body.sha;
  state.data[key] = JSON.parse(decodeBase64Utf8(body.content));
}

async function loadAll() {
  setStatus("[data-app-status]", "Loading latest content...");
  await Promise.all(Object.keys(files).map(loadFile));
  renderAll();
  setStatus("[data-app-status]", "Ready.");
}

async function saveFile(key) {
  syncPanel(key);
  const file = files[key];
  setStatus("[data-app-status]", `Saving ${file.label.toLowerCase()}...`);
  const body = await github(`/contents/${file.path}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Update ${file.label.toLowerCase()} content from Arabix CMS`,
      content: encodeBase64Utf8(JSON.stringify(state.data[key], null, 2) + "\n"),
      sha: state.sha[key],
      branch: BRANCH
    })
  });
  state.sha[key] = body.content.sha;
  setStatus("[data-app-status]", `${file.label} saved. Vercel will update automatically.`);
}

async function uploadImage(file, input) {
  if (!file) return;
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const uploadPath = `assets/uploads/${Date.now()}-${safeName}`;
  setStatus("[data-app-status]", "Uploading image...");
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const content = String(dataUrl).split(",")[1];
  await github(`/contents/${uploadPath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Upload ${safeName} from Arabix CMS`,
      content,
      branch: BRANCH
    })
  });
  input.value = `/${uploadPath}`;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  setStatus("[data-app-status]", "Image uploaded.");
}

function renderAll() {
  Object.keys(files).forEach(renderPanel);
  showTab(state.activeTab);
}

function renderPanel(key) {
  renderCategories(key);
  renderItems(key);
}

function renderCategories(key) {
  const wrap = qs(`[data-categories="${key}"]`);
  const categories = state.data[key]?.categories || [];
  wrap.innerHTML = categories
    .map((category, index) => `
      <div class="category-row" data-category-index="${index}">
        ${textField("ID", "id", category.id)}
        ${textField("English", "en", category.en)}
        ${textField("Arabic", "ar", category.ar)}
        <button type="button" class="danger" data-remove-category="${key}:${index}">Remove</button>
      </div>
    `)
    .join("");
}

function renderItems(key) {
  const wrap = qs(`[data-items="${key}"]`);
  const file = files[key];
  const items = state.data[key]?.[file.itemKey] || [];
  wrap.innerHTML = items.map((item, index) => renderItem(key, item, index)).join("");
}

function renderItem(key, item, index) {
  const isShop = key === "shop";
  const image = item.image || "";
  return `
    <article class="item-card" data-item-index="${index}">
      <div class="item-top">
        <div>
          <div class="item-title">${escapeHtml(item.title?.en || item.title || "Untitled")}</div>
          <div class="muted">${escapeHtml(item.category || "No category")}</div>
        </div>
        <div class="row-actions">
          <button type="button" class="ghost" data-duplicate-item="${key}:${index}">Duplicate</button>
          <button type="button" class="danger" data-remove-item="${key}:${index}">Remove</button>
        </div>
      </div>

      <div class="field-grid">
        ${textField("Category ID", "category", item.category)}
        ${textField("Image path", "image", image)}
        <div class="image-field field-full">
          <label>
            <span>Upload image</span>
            <input type="file" accept="image/*" data-upload-image />
          </label>
          <img class="image-preview" src="${escapeAttr(image || "")}" alt="" data-image-preview />
        </div>
        ${textField("Title EN", "title.en", item.title?.en)}
        ${textField("Title AR", "title.ar", item.title?.ar)}
        ${textField(isShop ? "Price EN" : "Timeframe EN", isShop ? "price.en" : "timeframe.en", isShop ? item.price?.en : item.timeframe?.en)}
        ${textField(isShop ? "Price AR" : "Timeframe AR", isShop ? "price.ar" : "timeframe.ar", isShop ? item.price?.ar : item.timeframe?.ar)}
        ${textField(isShop ? "Delivery EN" : "Budget EN", isShop ? "timeframe.en" : "budget.en", isShop ? item.timeframe?.en : item.budget?.en)}
        ${textField(isShop ? "Delivery AR" : "Budget AR", isShop ? "timeframe.ar" : "budget.ar", isShop ? item.timeframe?.ar : item.budget?.ar)}
        ${isShop ? shopExtraFields(item) : ""}
      </div>
    </article>
  `;
}

function shopExtraFields(item) {
  return `
    ${textArea("Description EN", "description.en", item.description?.en)}
    ${textArea("Description AR", "description.ar", item.description?.ar)}
    ${textField("Slug", "slug", item.slug)}
    ${textField("Live demo URL", "liveDemo", item.liveDemo)}
    ${textField("Badge EN", "badge.en", item.badge?.en)}
    ${textField("Badge AR", "badge.ar", item.badge?.ar)}
    ${textField("Platform EN", "platform.en", item.platform?.en)}
    ${textField("Platform AR", "platform.ar", item.platform?.ar)}
    ${textField("Personal license EN", "license.personal.en", item.license?.personal?.en)}
    ${textField("Personal license AR", "license.personal.ar", item.license?.personal?.ar)}
    ${numberField("Personal price", "license.personal.price", item.license?.personal?.price)}
    ${numberField("Personal old price", "license.personal.oldPrice", item.license?.personal?.oldPrice)}
    ${textField("Commercial license EN", "license.commercial.en", item.license?.commercial?.en)}
    ${textField("Commercial license AR", "license.commercial.ar", item.license?.commercial?.ar)}
    ${numberField("Commercial price", "license.commercial.price", item.license?.commercial?.price)}
    ${numberField("Commercial old price", "license.commercial.oldPrice", item.license?.commercial?.oldPrice)}
  `;
}

function syncPanel(key) {
  const panel = qs(`[data-panel="${key}"]`);
  const categories = [];
  qsa("[data-category-index]", panel).forEach((row) => {
    const category = {};
    qsa("[data-field]", row).forEach((input) => {
      category[input.dataset.field] = input.value.trim();
    });
    categories.push(category);
  });

  const itemKey = files[key].itemKey;
  const items = [];
  qsa("[data-item-index]", panel).forEach((card) => {
    const current = structuredClone(state.data[key][itemKey][Number(card.dataset.itemIndex)] || {});
    qsa("[data-field]", card).forEach((input) => {
      const value = input.type === "number" ? Number(input.value || 0) : input.value.trim();
      setByPath(current, input.dataset.field, value);
    });
    items.push(current);
  });

  state.data[key].categories = categories;
  state.data[key][itemKey] = items;
}

function showTab(key) {
  state.activeTab = key;
  qsa("[data-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === key));
  qsa("[data-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.panel !== key));
}

function addCategory(key) {
  syncPanel(key);
  state.data[key].categories.push({ id: "new", en: "New category", ar: "" });
  renderPanel(key);
}

function addItem(key) {
  syncPanel(key);
  const itemKey = files[key].itemKey;
  state.data[key][itemKey].unshift(files[key].blankItem());
  renderPanel(key);
}

function removeCategory(key, index) {
  syncPanel(key);
  state.data[key].categories.splice(index, 1);
  renderPanel(key);
}

function removeItem(key, index) {
  syncPanel(key);
  state.data[key][files[key].itemKey].splice(index, 1);
  renderPanel(key);
}

function duplicateItem(key, index) {
  syncPanel(key);
  const itemKey = files[key].itemKey;
  const copy = structuredClone(state.data[key][itemKey][index]);
  if (copy.title?.en) copy.title.en += " Copy";
  state.data[key][itemKey].splice(index + 1, 0, copy);
  renderPanel(key);
}

async function login(token) {
  state.token = token.trim();
  sessionStorage.setItem(TOKEN_KEY, state.token);
  setStatus("[data-login-status]", "Checking GitHub access...");
  await github("");
  qs("[data-login-view]").classList.add("is-hidden");
  qs("[data-app-view]").classList.remove("is-hidden");
  setStatus("[data-login-status]", "");
  await loadAll();
}

document.addEventListener("submit", async (event) => {
  if (!event.target.matches("[data-login-form]")) return;
  event.preventDefault();
  try {
    await login(new FormData(event.target).get("token"));
  } catch (error) {
    sessionStorage.removeItem(TOKEN_KEY);
    setStatus("[data-login-status]", error.message, true);
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;

  try {
    if (target.matches("[data-tab]")) showTab(target.dataset.tab);
    if (target.matches("[data-refresh]")) await loadAll();
    if (target.matches("[data-logout]")) {
      sessionStorage.removeItem(TOKEN_KEY);
      location.reload();
    }
    if (target.matches("[data-save]")) await saveFile(target.dataset.save);
    if (target.matches("[data-add-category]")) addCategory(target.dataset.addCategory);
    if (target.matches("[data-add-item]")) addItem(target.dataset.addItem);
    if (target.matches("[data-remove-category]")) {
      const [key, index] = target.dataset.removeCategory.split(":");
      removeCategory(key, Number(index));
    }
    if (target.matches("[data-remove-item]")) {
      const [key, index] = target.dataset.removeItem.split(":");
      removeItem(key, Number(index));
    }
    if (target.matches("[data-duplicate-item]")) {
      const [key, index] = target.dataset.duplicateItem.split(":");
      duplicateItem(key, Number(index));
    }
  } catch (error) {
    setStatus("[data-app-status]", error.message, true);
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.matches('[data-field="image"]')) return;
  const card = event.target.closest(".item-card");
  const preview = qs("[data-image-preview]", card);
  if (preview) preview.src = event.target.value;
});

document.addEventListener("change", async (event) => {
  if (!event.target.matches("[data-upload-image]")) return;
  const card = event.target.closest(".item-card");
  const imageInput = qs('[data-field="image"]', card);
  try {
    await uploadImage(event.target.files[0], imageInput);
  } catch (error) {
    setStatus("[data-app-status]", error.message, true);
  } finally {
    event.target.value = "";
  }
});

if (state.token) {
  login(state.token).catch(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    qs("[data-login-view]").classList.remove("is-hidden");
  });
}
