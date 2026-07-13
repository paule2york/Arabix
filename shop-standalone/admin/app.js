const REPO_OWNER = "paule2york";
const REPO_NAME = "Arabix";
const BRANCH = "main";
const DATA_PATH = "shop-standalone/data/products.json";
const TOKEN_KEY = "arabix_shop_cms_token";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const state = { token: sessionStorage.getItem(TOKEN_KEY) || "", data: null, sha: "", tab: "products" };

const apiUrl = (path = "") => `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${path}`;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const escapeAttr = escapeHtml;
const slugify = (value) => String(value || "theme").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "theme";
const decodeBase64Utf8 = (value) => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\n/g, "")), (char) => char.charCodeAt(0)));
const encodeBase64Utf8 = (value) => { const bytes = new TextEncoder().encode(value); let binary = ""; bytes.forEach((byte) => binary += String.fromCharCode(byte)); return btoa(binary); };
const setStatus = (selector, message, error = false) => { const el = qs(selector); if (!el) return; el.textContent = message || ""; el.classList.toggle("is-error", error); };

async function github(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${state.token}`, "X-GitHub-Api-Version": "2022-11-28", ...(options.headers || {}) }
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(body?.message || `GitHub error ${response.status}`);
  return body;
}

function textField(label, name, value = "", extra = "") {
  return `<label class="field ${extra}"><span>${label}</span><input type="text" data-field="${name}" value="${escapeAttr(value)}" /></label>`;
}
function numberField(label, name, value = 0) {
  return `<label class="field"><span>${label}</span><input type="number" data-field="${name}" value="${Number(value || 0)}" /></label>`;
}
function textArea(label, name, value = "", extra = "") {
  return `<label class="field ${extra}"><span>${label}</span><textarea data-field="${name}">${escapeHtml(value)}</textarea></label>`;
}
function selectField(label, name, value = "") {
  const options = (state.data?.categories || []).filter((cat) => cat.id !== "all").map((cat) => `<option value="${escapeAttr(cat.id)}" ${cat.id === value ? "selected" : ""}>${escapeHtml(cat.name || cat.id)}</option>`).join("");
  return `<label class="field"><span>${label}</span><select data-field="${name}">${options}</select></label>`;
}
function listField(label, name, values = []) {
  const rows = (Array.isArray(values) && values.length ? values : [""]).map((value) => `<div class="list-row"><input type="text" data-list-item value="${escapeAttr(value)}" /><button class="danger" type="button" data-remove-list-row>Remove</button></div>`).join("");
  return `<div class="field field-half list-field" data-list-field="${name}"><span>${label}</span><div class="list-box">${rows}</div><button class="ghost" type="button" data-add-list-row>Add line</button></div>`;
}

function autoArabicText(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const replacements = [
    [/website template/gi, "قالب موقع"], [/template/gi, "قالب"], [/ecommerce/gi, "متجر إلكتروني"], [/restaurant/gi, "مطعم"], [/hotel/gi, "فندق"], [/travel/gi, "سفر"], [/clinic/gi, "عيادة"], [/law/gi, "محاماة"], [/business/gi, "أعمال"], [/portfolio/gi, "بورتفوليو"], [/education/gi, "تعليم"], [/premium/gi, "احترافي"], [/ready/gi, "جاهز"], [/new/gi, "جديد"], [/popular/gi, "الأكثر طلباً"], [/best seller/gi, "الأكثر مبيعاً"]
  ];
  let text = raw;
  replacements.forEach(([pattern, replacement]) => text = text.replace(pattern, replacement));
  if (/^[\x00-\x7F\s.,&+-]+$/.test(text)) return `نسخة عربية لـ ${raw}`;
  return text;
}
function autoArabicLong(product) {
  const title = autoArabicText(product.title || "القالب");
  return `قالب جاهز لـ ${title} بتصميم متجاوب وأقسام منظمة يمكن تعديلها بسرعة لتناسب العلامة والمحتوى.`;
}

function blankCategory() {
  return { id: "new-category", name: "New Category", nameAr: "", icon: "grid", color: "#a6ff00", blurb: "Short category description.", blurbAr: "" };
}
function blankProduct() {
  const next = String((state.data.products || []).length + 1).padStart(3, "0");
  return {
    id: next,
    slug: `new-template-${next}`,
    title: "New Website Template",
    titleAr: "",
    category: "business",
    badge: "New",
    badgeAr: "",
    price: 149,
    oldPrice: 249,
    commercialPrice: 1499,
    singleLicensePrice: 149,
    exclusiveBuyoutPrice: 1499,
    summary: "A polished ready-made website template for fast launch.",
    summaryAr: "",
    details: "Built with responsive sections, clean spacing and a structure you can adapt for your brand.",
    detailsAr: "",
    features: ["Responsive sections", "Clean layout", "Fast launch"],
    featuresAr: [],
    includes: ["Editable sections", "Launch notes"],
    includesAr: [],
    compatible: ["HTML/CSS", "Static hosting", "CMS adaptation ready"],
    compatibleAr: [],
    updated: "July 2026",
    currency: "SAR"
  };
}

async function loadData() {
  setStatus("[data-app-status]", "Loading shop data...");
  const body = await github(`/contents/${DATA_PATH}?ref=${BRANCH}`);
  state.sha = body.sha;
  state.data = JSON.parse(decodeBase64Utf8(body.content));
  renderAll();
  setStatus("[data-app-status]", "Ready.");
}
async function saveData() {
  syncAll();
  setStatus("[data-app-status]", "Saving shop data...");
  const body = await github(`/contents/${DATA_PATH}`, {
    method: "PUT",
    body: JSON.stringify({ message: "Update shop content from Arabix Shop CMS", content: encodeBase64Utf8(JSON.stringify(state.data, null, 2) + "\n"), sha: state.sha, branch: BRANCH })
  });
  state.sha = body.content.sha;
  setStatus("[data-app-status]", "Saved. Vercel will update automatically.");
}

function renderAll() { renderCategoryFilter(); renderProducts(); renderCategories(); showTab(state.tab); }
function renderCategoryFilter() {
  const select = qs("[data-category-filter]");
  if (!select) return;
  select.innerHTML = `<option value="all">All categories</option>` + (state.data.categories || []).filter((cat) => cat.id !== "all").map((cat) => `<option value="${escapeAttr(cat.id)}">${escapeHtml(cat.name || cat.id)}</option>`).join("");
}
function productEditorHtml(product, index) {
  return `
    <details class="item-card product-card" data-product-index="${index}" data-category="${escapeAttr(product.category)}">
      <summary class="product-summary">
        <span class="summary-dot"></span>
        <span class="summary-main"><strong>${escapeHtml(product.title || "Untitled")}</strong><small>${escapeHtml(product.slug || "no-slug")}</small></span>
        <span class="summary-meta">SAR ${Number(product.price || 0).toLocaleString("en-US")}</span>
        <span class="summary-edit">Edit</span>
      </summary>
      <div class="product-editor-body">
        <div class="row-actions product-actions"><button type="button" class="ghost" data-duplicate-product="${index}">Duplicate</button><button type="button" class="danger" data-remove-product="${index}">Remove</button></div>
        <div class="field-grid">
          ${textField("ID", "id", product.id)}
          ${textField("Slug", "slug", product.slug)}
          ${selectField("Category", "category", product.category)}
          ${textField("Badge EN", "badge", product.badge)}
          ${textField("Title EN", "title", product.title, "field-half")}
          ${textField("Title AR", "titleAr", product.titleAr, "field-half")}
          ${numberField("Sale price SAR", "price", product.price)}
          ${numberField("Old price SAR", "oldPrice", product.oldPrice)}
          ${numberField("Single license SAR", "singleLicensePrice", product.singleLicensePrice ?? product.price)}
          ${numberField("Exclusive buyout SAR", "exclusiveBuyoutPrice", product.exclusiveBuyoutPrice ?? product.commercialPrice ?? 1499)}
          ${textArea("Summary EN", "summary", product.summary, "field-half")}
          ${textArea("Summary AR", "summaryAr", product.summaryAr, "field-half")}
          ${textArea("Details EN", "details", product.details, "field-half")}
          ${textArea("Details AR", "detailsAr", product.detailsAr, "field-half")}
          ${listField("Features EN", "features", product.features)}
          ${listField("Features AR", "featuresAr", product.featuresAr)}
          ${listField("Includes EN", "includes", product.includes)}
          ${listField("Includes AR", "includesAr", product.includesAr)}
          ${listField("Compatible EN", "compatible", product.compatible)}
          ${listField("Compatible AR", "compatibleAr", product.compatibleAr)}
          ${textField("Updated", "updated", product.updated)}
          ${textField("Currency", "currency", product.currency || "SAR")}
        </div>
      </div>
    </details>`;
}
function renderProducts() {
  const wrap = qs("[data-products]");
  const products = state.data.products || [];
  const categories = (state.data.categories || []).filter((cat) => cat.id !== "all");
  const known = new Set(categories.map((cat) => cat.id));
  const groups = categories.map((cat) => ({ ...cat, products: products.map((product, index) => ({ product, index })).filter((item) => item.product.category === cat.id) }));
  const uncategorized = products.map((product, index) => ({ product, index })).filter((item) => !known.has(item.product.category));
  if (uncategorized.length) groups.push({ id: "uncategorized", name: "Uncategorized", color: "#64748b", products: uncategorized });
  wrap.innerHTML = groups.map((group) => `
    <details class="category-group" data-category-group="${escapeAttr(group.id)}" open style="--group-color:${escapeAttr(group.color || "#a6ff00")}">
      <summary class="category-summary"><span></span><strong>${escapeHtml(group.name || group.id)}</strong><em>${group.products.length} themes</em></summary>
      <div class="category-product-list">${group.products.length ? group.products.map((item) => productEditorHtml(item.product, item.index)).join("") : `<p class="empty-group">No themes in this category yet.</p>`}</div>
    </details>`).join("");
  applyFilters();
}function renderCategories() {
  const wrap = qs("[data-categories]");
  wrap.innerHTML = (state.data.categories || []).map((cat, index) => `
    <article class="item-card category-card" data-category-index="${index}">
      <div class="item-top"><div><div class="item-title">${escapeHtml(cat.name || cat.id)}</div><div class="item-meta">${escapeHtml(cat.id)}</div></div><div class="row-actions"><span class="color-dot" style="background:${escapeAttr(cat.color || "#a6ff00")}"></span>${cat.id === "all" ? "" : `<button type="button" class="danger" data-remove-category="${index}">Remove</button>`}</div></div>
      <div class="field-grid">
        ${textField("ID", "id", cat.id)}
        ${textField("Icon", "icon", cat.icon)}
        ${textField("Color", "color", cat.color)}
        ${textField("Name EN", "name", cat.name)}
        ${textField("Name AR", "nameAr", cat.nameAr)}
        ${textArea("Blurb EN", "blurb", cat.blurb, "field-half")}
        ${textArea("Blurb AR", "blurbAr", cat.blurbAr, "field-half")}
      </div>
    </article>`).join("");
}

function readFields(card) {
  const item = {};
  qsa("[data-field]", card).forEach((field) => { item[field.dataset.field] = field.type === "number" ? Number(field.value || 0) : field.value.trim(); });
  qsa("[data-list-field]", card).forEach((box) => { item[box.dataset.listField] = qsa("[data-list-item]", box).map((input) => input.value.trim()).filter(Boolean); });
  return item;
}
function syncAll() {
  state.data.products = qsa("[data-product-index]").map(readFields);
  state.data.products.forEach((p) => {
    if (!p.slug) p.slug = slugify(p.title);
    if (!p.singleLicensePrice) p.singleLicensePrice = p.price;
    p.commercialPrice = p.exclusiveBuyoutPrice || p.commercialPrice || 1499;
  });
  state.data.categories = qsa("[data-category-index]").map(readFields);
}
function fillArabicDraft() {
  syncAll();
  state.data.categories.forEach((cat) => { if (!cat.nameAr) cat.nameAr = autoArabicText(cat.name); if (!cat.blurbAr) cat.blurbAr = autoArabicText(cat.blurb); });
  state.data.products.forEach((p) => {
    if (!p.titleAr) p.titleAr = autoArabicText(p.title);
    if (!p.badgeAr) p.badgeAr = autoArabicText(p.badge);
    if (!p.summaryAr) p.summaryAr = autoArabicLong(p);
    if (!p.detailsAr) p.detailsAr = autoArabicLong(p);
    if (!p.featuresAr?.length) p.featuresAr = (p.features || []).map(autoArabicText);
    if (!p.includesAr?.length) p.includesAr = (p.includes || []).map(autoArabicText);
    if (!p.compatibleAr?.length) p.compatibleAr = (p.compatible || []).map(autoArabicText);
  });
  renderAll();
  setStatus("[data-app-status]", "Arabic draft filled. Please review before saving.");
}
function applyFilters() {
  const query = (qs("[data-product-search]")?.value || "").toLowerCase();
  const category = qs("[data-category-filter]")?.value || "all";
  qsa("[data-product-index]").forEach((card) => {
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    const matchesCategory = category === "all" || card.dataset.category === category;
    card.classList.toggle("is-hidden", !(matchesQuery && matchesCategory));
  });
  qsa("[data-category-group]").forEach((group) => {
    const visibleCards = qsa("[data-product-index]", group).filter((card) => !card.classList.contains("is-hidden"));
    group.classList.toggle("is-hidden", visibleCards.length === 0);
    if (category !== "all" && group.dataset.categoryGroup === category) group.open = true;
  });
}
function resetProductFilters() {
  const search = qs("[data-product-search]");
  const category = qs("[data-category-filter]");
  if (search) search.value = "";
  if (category) category.value = "all";
}
function revealProduct(id) {
  const card = qsa("[data-product-index]").find((item) => qs('[data-field="id"]', item)?.value === id);
  if (!card) return;
  const group = card.closest("[data-category-group]");
  if (group) group.open = true;
  card.open = true;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  qs('[data-field="title"]', card)?.focus();
}
function addProduct() {
  syncAll();
  const firstCategory = (state.data.categories || []).find((cat) => cat.id !== "all");
  const product = blankProduct();
  product.category = firstCategory?.id || product.category || "ecommerce";
  product.id = String(Date.now()).slice(-6);
  product.slug = slugify(`${product.title}-${product.id}`);
  state.data.products.unshift(product);
  resetProductFilters();
  renderAll();
  showTab("products");
  revealProduct(product.id);
  setStatus("[data-app-status]", "New theme added. Fill the details, then click Save changes.");
}
function showTab(tab) {
  state.tab = tab;
  qsa("[data-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === tab));
  qsa("[data-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.panel !== tab));
}
async function login(token) {
  state.token = String(token || "").trim();
  sessionStorage.setItem(TOKEN_KEY, state.token);
  setStatus("[data-login-status]", "Checking GitHub access...");
  await github("");
  qs("[data-login-view]").classList.add("is-hidden");
  qs("[data-app-view]").classList.remove("is-hidden");
  setStatus("[data-login-status]", "");
  await loadData();
}

document.addEventListener("submit", async (event) => {
  if (!event.target.matches("[data-login-form]")) return;
  event.preventDefault();
  try { await login(new FormData(event.target).get("token")); }
  catch (error) { sessionStorage.removeItem(TOKEN_KEY); setStatus("[data-login-status]", error.message, true); }
});
document.addEventListener("input", (event) => {
  if (event.target.matches("[data-product-search]")) applyFilters();
  if (event.target.matches('[data-field="title"]')) {
    const card = event.target.closest("[data-product-index]");
    const slug = qs('[data-field="slug"]', card);
    if (slug && !slug.value.trim()) slug.value = slugify(event.target.value);
  }
});
document.addEventListener("change", (event) => { if (event.target.matches("[data-category-filter]")) applyFilters(); });
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  try {
    if (target.matches("[data-tab]")) showTab(target.dataset.tab);
    if (target.matches("[data-refresh]")) await loadData();
    if (target.matches("[data-logout]")) { sessionStorage.removeItem(TOKEN_KEY); location.reload(); }
    if (target.matches("[data-save]")) await saveData();
    if (target.matches("[data-fill-arabic]")) fillArabicDraft();
    if (target.matches("[data-add-product]")) addProduct();
    if (target.matches("[data-add-category]")) { syncAll(); state.data.categories.push(blankCategory()); renderAll(); showTab("categories"); }
    if (target.matches("[data-remove-product]")) { const card = target.closest("[data-product-index]"); const index = qsa("[data-product-index]").indexOf(card); syncAll(); state.data.products.splice(index, 1); renderAll(); }
    if (target.matches("[data-duplicate-product]")) { const card = target.closest("[data-product-index]"); const index = qsa("[data-product-index]").indexOf(card); syncAll(); const copy = structuredClone(state.data.products[index]); copy.id = String(Date.now()).slice(-6); copy.slug = slugify(copy.slug + " copy"); copy.title += " Copy"; state.data.products.splice(index + 1, 0, copy); renderAll(); }
    if (target.matches("[data-remove-category]")) { syncAll(); state.data.categories.splice(Number(target.dataset.removeCategory), 1); renderAll(); showTab("categories"); }
    if (target.matches("[data-add-list-row]")) { const box = target.closest("[data-list-field]").querySelector(".list-box"); box.insertAdjacentHTML("beforeend", `<div class="list-row"><input type="text" data-list-item value="" /><button class="danger" type="button" data-remove-list-row>Remove</button></div>`); }
    if (target.matches("[data-remove-list-row]")) target.closest(".list-row")?.remove();
  } catch (error) { setStatus("[data-app-status]", error.message, true); }
});
if (state.token) login(state.token).catch(() => { sessionStorage.removeItem(TOKEN_KEY); qs("[data-login-view]").classList.remove("is-hidden"); });
