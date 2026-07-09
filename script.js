const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll("[data-nav-link]");
const navMenuLinks = document.querySelectorAll(".nav-menu a");
const indicator = document.querySelector(".nav-indicator");
const desktopQuery = window.matchMedia("(min-width: 981px)");
const canvas = document.querySelector("[data-hero-canvas]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroCanvasQuery = window.matchMedia("(min-width: 761px)");
const typedWord = document.querySelector("[data-typed-word]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const moveIndicator = (link) => {
  if (!indicator || !desktopQuery.matches || !link) return;

  const navBox = nav.getBoundingClientRect();
  const linkBox = link.getBoundingClientRect();
  nav.style.setProperty("--indicator-x", `${linkBox.left - navBox.left - 12}px`);
  nav.style.setProperty("--indicator-w", `${linkBox.width}px`);
  indicator.style.opacity = "1";
};

const setActiveLink = () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const activeLink = [...navLinks].find((link) => {
    const linkPage = new URL(link.href).pathname.split("/").pop() || "index.html";
    return linkPage === currentPage && currentPage !== "index.html";
  });

  navLinks.forEach((link) => link.classList.toggle("is-active", link === activeLink));
  navMenuLinks.forEach((link) => {
    const linkPage = new URL(link.href).pathname.split("/").pop() || "index.html";
    link.classList.toggle("is-active", linkPage === currentPage);
  });
  moveIndicator(activeLink);
};

setHeaderState();
setActiveLink();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", setActiveLink);

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => moveIndicator(link));
  link.addEventListener("focus", () => moveIndicator(link));
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  });
});

nav.addEventListener("mouseleave", setActiveLink);

if (typedWord && !reduceMotion.matches) {
  const words = typedWord.dataset.typedWords ? typedWord.dataset.typedWords.split("|") : ["websites", "stores", "brands", "funnels", "apps"];
  let wordIndex = 0;
  let letterIndex = words[0].length;
  let deleting = true;

  const typeLoop = () => {
    const current = words[wordIndex];
    typedWord.textContent = current.slice(0, letterIndex);

    if (deleting) {
      letterIndex -= 1;
      if (letterIndex < 1) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    } else {
      letterIndex += 1;
      if (letterIndex > words[wordIndex].length) {
        deleting = true;
        window.setTimeout(typeLoop, 1150);
        return;
      }
    }

    const speed = deleting ? 46 : 78;
    window.setTimeout(typeLoop, speed);
  };

  window.setTimeout(typeLoop, 1200);
}

if (canvas && !reduceMotion.matches && heroCanvasQuery.matches) {
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(86, Math.max(42, Math.floor(width / 18)));
    particles.length = 0;
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.2 + 0.8,
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const dx = point.x - next.x;
        const dy = point.y - next.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 124) {
          const alpha = (1 - distance / 124) * 0.16;
          ctx.strokeStyle = `rgba(199, 239, 79, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = index % 8 === 0 ? "rgba(199, 239, 79, 0.82)" : "rgba(255, 255, 255, 0.72)";
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrame = requestAnimationFrame(draw);
  };

  resizeCanvas();
  draw();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));
}

const langKey = (document.documentElement.lang || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
const textFrom = (value) => {
  if (value && typeof value === "object") return value[langKey] || value.en || value.ar || "";
  return value || "";
};
const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const setupImageFallback = (image) => {
  const fail = () => {
    const media = image.closest(".portfolio-card-media, .shop-card-media");
    if (!media) return;
    image.remove();
    media.classList.add("is-placeholder");
    if (!media.querySelector(".cms-placeholder-mark")) {
      const mark = document.createElement("span");
      mark.className = "cms-placeholder-mark";
      mark.textContent = media.dataset.mark || "A";
      media.appendChild(mark);
    }
  };
  image.addEventListener("error", fail, { once: true });
  if (image.complete && image.naturalWidth === 0) fail();
};
const buildCmsMedia = (item, kind) => {
  const title = textFrom(item.title);
  const letter = (title.trim()[0] || "A").toUpperCase();
  const image = String(item.image || "").trim();
  if (!image) return '<div class="' + kind + '-card-media is-placeholder" data-mark="' + escapeHtml(letter) + '"><span class="cms-placeholder-mark">' + escapeHtml(letter) + '</span></div>';
  return '<div class="' + kind + '-card-media" data-mark="' + escapeHtml(letter) + '"><img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '" loading="lazy" /></div>';
};
const renderFilterButtons = (bar, categories, fallbackAllLabel) => {
  if (!bar || !Array.isArray(categories)) return;
  const list = categories.length ? categories : [{ id: "all", en: fallbackAllLabel, ar: fallbackAllLabel }];
  bar.innerHTML = list.map((category, index) => {
    const id = category.id || "all";
    const active = index === 0;
    return '<button class="' + (active ? 'is-active' : '') + '" type="button" data-filter="' + escapeHtml(id) + '" aria-pressed="' + String(active) + '">' + escapeHtml(textFrom(category)) + '</button>';
  }).join("");
};
const setupCmsFilter = (bar, grid) => {
  if (!bar || !grid) return;
  const buttons = [...bar.querySelectorAll("[data-filter]")];
  const items = () => [...grid.querySelectorAll("[data-category]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      items().forEach((item) => item.classList.toggle("is-filtered-out", filter !== "all" && item.dataset.category !== filter));
    });
  });
};
const loadCmsJson = async (source) => {
  if (!source) return null;
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load " + source);
  return response.json();
};
const renderPortfolioCms = async () => {
  const grid = document.querySelector("[data-portfolio-grid]");
  const bar = document.querySelector("[data-portfolio-filters]");
  if (!grid) return;
  try {
    const data = await loadCmsJson(grid.dataset.source || "./data/portfolio.json");
    renderFilterButtons(bar, data.categories, langKey === "ar" ? "\u0643\u0644 \u0627\u0644\u0623\u0639\u0645\u0627\u0644" : "All Work");
    grid.innerHTML = (data.projects || []).map((project) => {
      const timeLabel = langKey === "ar" ? "\u0627\u0644\u0645\u062f\u0629" : "Timeframe";
      const budgetLabel = langKey === "ar" ? "\u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629" : "Budget";
      return '<figure class="portfolio-image-tile" data-category="' + escapeHtml(project.category || "all") + '">' + buildCmsMedia(project, "portfolio") + '<figcaption class="portfolio-project-meta"><h3>' + escapeHtml(textFrom(project.title)) + '</h3><dl><div><dt>' + timeLabel + '</dt><dd>' + escapeHtml(textFrom(project.timeframe)) + '</dd></div><div><dt>' + budgetLabel + '</dt><dd>' + escapeHtml(textFrom(project.budget)) + '</dd></div></dl></figcaption></figure>';
    }).join("");
  } catch (error) {
    console.warn(error);
  }
  grid.querySelectorAll("img").forEach(setupImageFallback);
  setupCmsFilter(bar, grid);
};
const parsePriceValue = (value) => {
  if (typeof value === "number") return value;
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const formatSar = (amount) => (langKey === "ar" ? "\u0631.\u0633 " : "SAR ") + Number(amount || 0).toLocaleString("en-US");
const shopCart = [];
const ensureShopCart = () => {
  let drawer = document.querySelector("[data-shop-cart]");
  if (drawer) return drawer;
  drawer = document.createElement("aside");
  drawer.className = "shop-cart-drawer";
  drawer.setAttribute("data-shop-cart", "");
  drawer.innerHTML = '<button class="shop-cart-close" type="button" data-cart-close>?</button><h3>' + (langKey === "ar" ? "\u0633\u0644\u0629 \u0627\u0644\u0637\u0644\u0628" : "Your Cart") + '</h3><div class="shop-cart-items" data-cart-items></div><div class="shop-cart-total"><span>' + (langKey === "ar" ? "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a" : "Total") + '</span><strong data-cart-total></strong></div><button class="shop-cart-checkout" type="button" data-cart-checkout>' + (langKey === "ar" ? "\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628" : "Checkout") + '</button><p>' + (langKey === "ar" ? "\u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637 \u062f\u0641\u0639 \u0623\u0648 \u0641\u0627\u062a\u0648\u0631\u0629 Payoneer \u0628\u0639\u062f \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0637\u0644\u0628." : "We will send a payment link or Payoneer invoice after reviewing your order.") + '</p>';
  document.body.appendChild(drawer);
  drawer.querySelector("[data-cart-close]").addEventListener("click", () => drawer.classList.remove("is-open"));
  drawer.querySelector("[data-cart-checkout]").addEventListener("click", () => {
    if (!shopCart.length) return;
    const total = shopCart.reduce((sum, item) => sum + item.total, 0);
    const message = shopCart.map((item, index) => (index + 1) + ". " + item.title + " - " + item.license + " - " + formatSar(item.total) + (item.addons.length ? "\nAdd-ons: " + item.addons.join(", ") : "")).join("\n\n");
    window.location.href = "./contact.html?order=" + encodeURIComponent(message) + "&total=" + encodeURIComponent(formatSar(total));
  });
  return drawer;
};
const renderShopCart = () => {
  const drawer = ensureShopCart();
  const items = drawer.querySelector("[data-cart-items]");
  const total = shopCart.reduce((sum, item) => sum + item.total, 0);
  items.innerHTML = shopCart.length ? shopCart.map((item, index) => '<div class="shop-cart-item"><div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.license) + '</span></div><b>' + formatSar(item.total) + '</b><button type="button" data-remove-cart="' + index + '">?</button></div>').join("") : '<p class="shop-cart-empty">' + (langKey === "ar" ? "\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063a\u0629" : "Cart is empty") + '</p>';
  drawer.querySelector("[data-cart-total]").textContent = formatSar(total);
  items.querySelectorAll("[data-remove-cart]").forEach((button) => button.addEventListener("click", () => {
    shopCart.splice(Number(button.dataset.removeCart), 1);
    renderShopCart();
  }));
  drawer.classList.add("is-open");
};

const getProductBasePrice = (product) => product?.license?.personal?.price || parsePriceValue(textFrom(product?.price));
const ensureShopModal = () => {
  let modal = document.querySelector("[data-shop-modal]");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.className = "shop-product-modal";
  modal.setAttribute("data-shop-modal", "");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = '<div class="shop-product-backdrop" data-shop-close></div><section class="shop-product-panel" role="dialog" aria-modal="true"><button class="shop-product-close" type="button" data-shop-close aria-label="Close">?</button><div data-shop-detail></div></section>';
  document.body.appendChild(modal);
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-shop-close]")) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("shop-modal-open");
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("shop-modal-open");
    }
  });
  return modal;
};
const openShopProduct = (product) => {
  const modal = ensureShopModal();
  const detail = modal.querySelector("[data-shop-detail]");
  const personal = product.license?.personal || { price: getProductBasePrice(product), oldPrice: 0, en: "Personal license", ar: "\u0631\u062e\u0635\u0629 \u0634\u062e\u0635\u064a\u0629" };
  const commercial = product.license?.commercial || { price: getProductBasePrice(product) * 2, oldPrice: 0, en: "Commercial license", ar: "\u0631\u062e\u0635\u0629 \u062a\u062c\u0627\u0631\u064a\u0629" };
  const addons = Array.isArray(product.addons) ? product.addons : [];
  const productTitle = textFrom(product.title);
  detail.innerHTML = '<div class="shop-detail-layout"><div class="shop-detail-preview"><div class="shop-detail-topline"><span>' + escapeHtml(textFrom(product.platform) || "Arabix Theme") + '</span><a href="' + escapeHtml(product.liveDemo || "#") + '">' + (langKey === "ar" ? "\u0639\u0631\u0636 \u0645\u0628\u0627\u0634\u0631" : "Live Demo") + '</a></div><div class="shop-detail-media-wrap">' + buildCmsMedia(product, "shop") + '<b>' + escapeHtml(textFrom(product.badge) || (langKey === "ar" ? "\u0642\u0627\u0644\u0628 \u062c\u0627\u0647\u0632" : "Ready Theme")) + '</b></div><h2>' + escapeHtml(productTitle) + '</h2><p>' + escapeHtml(textFrom(product.description)) + '</p></div><aside class="shop-detail-buy"><p class="shop-detail-kicker">' + (langKey === "ar" ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u0631\u062e\u0635\u0629" : "Choose a license") + '</p><div class="shop-license-list"><label><input type="radio" name="shop-license" value="personal" checked data-license-price="' + personal.price + '"><span><strong>' + escapeHtml(textFrom(personal)) + '</strong><em>' + (personal.oldPrice ? '<del>' + formatSar(personal.oldPrice) + '</del>' : '') + '<b>' + formatSar(personal.price) + '</b></em></span></label><label><input type="radio" name="shop-license" value="commercial" data-license-price="' + commercial.price + '"><span><strong>' + escapeHtml(textFrom(commercial)) + '</strong><em>' + (commercial.oldPrice ? '<del>' + formatSar(commercial.oldPrice) + '</del>' : '') + '<b>' + formatSar(commercial.price) + '</b></em></span></label></div><p class="shop-detail-kicker">' + (langKey === "ar" ? "\u062e\u062f\u0645\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629" : "Popular services") + '</p><div class="shop-addon-list">' + addons.map((addon) => '<label><input type="checkbox" data-addon-price="' + Number(addon.price || 0) + '" ' + (addon.selected ? 'checked' : '') + '><span><strong>' + escapeHtml(textFrom(addon)) + '</strong><em>+' + formatSar(addon.price || 0) + '</em></span></label>').join("") + '</div><div class="shop-total-row"><span>' + (langKey === "ar" ? "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a" : "Total") + '</span><strong data-shop-total></strong></div><button class="shop-cart-button" type="button" data-shop-order>' + (langKey === "ar" ? "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629" : "Add to Cart") + '</button><p class="shop-manual-note">' + (langKey === "ar" ? "\u0628\u0639\u062f \u0627\u0644\u0637\u0644\u0628 \u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637 \u0627\u0644\u062f\u0641\u0639 \u0623\u0648 \u0641\u0627\u062a\u0648\u0631\u0629 Payoneer." : "After the order, we will send a Payoneer invoice or payment link.") + '</p></aside></div>';
  detail.querySelectorAll("img").forEach(setupImageFallback);
  const totalEl = detail.querySelector("[data-shop-total]");
  const updateTotal = () => {
    const license = detail.querySelector('input[name="shop-license"]:checked');
    const addonsTotal = [...detail.querySelectorAll("[data-addon-price]:checked")].reduce((sum, item) => sum + Number(item.dataset.addonPrice || 0), 0);
    const total = Number(license?.dataset.licensePrice || 0) + addonsTotal;
    totalEl.textContent = formatSar(total);
    return total;
  };
  detail.querySelectorAll("input").forEach((input) => input.addEventListener("change", updateTotal));
  detail.querySelector("[data-shop-order]").addEventListener("click", () => {
    const total = updateTotal();
    const licenseLabel = detail.querySelector('input[name="shop-license"]:checked')?.closest("label")?.querySelector("strong")?.textContent || "";
    const selectedAddons = [...detail.querySelectorAll("[data-addon-price]:checked")].map((item) => item.closest("label")?.querySelector("strong")?.textContent).filter(Boolean);
    shopCart.push({ title: productTitle, license: licenseLabel, addons: selectedAddons, total });
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("shop-modal-open");
    renderShopCart();
  });
  updateTotal();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("shop-modal-open");
};

const shopIconSvg = (name) => {
  const icons = {
    market: '<path d="M4 8h16l-1.2 11H5.2L4 8Z"/><path d="M7 8a5 5 0 0 1 10 0"/>',
    store: '<path d="M4 10h16l-1-5H5l-1 5Z"/><path d="M6 10v9h12v-9"/><path d="M9 19v-5h6v5"/>',
    utensils: '<path d="M7 4v16"/><path d="M4.5 4v5a2.5 2.5 0 0 0 5 0V4"/><path d="M15 4v16"/><path d="M15 4c3 1.4 4.5 4 3.3 7H15"/>',
    hotel: '<path d="M4 20V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14"/><path d="M2 20h20"/><path d="M8 8h2M8 12h2M14 8h2M14 12h2"/>',
    medical: '<path d="M12 5v14"/><path d="M5 12h14"/><path d="M6 6h12v12H6z"/>',
    building: '<path d="M4 20V6l8-3 8 3v14"/><path d="M9 20v-6h6v6"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 11h.01M12 11h.01M16 11h.01"/>',
    scale: '<path d="M12 4v16"/><path d="M5 7h14"/><path d="M7 7l-3 6h6L7 7Z"/><path d="M17 7l-3 6h6l-3-6Z"/><path d="M9 20h6"/>',
    briefcase: '<path d="M4 8h16v11H4z"/><path d="M9 8V5h6v3"/><path d="M4 13h16"/>',
    book: '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z"/><path d="M5 16V4"/>',
    user: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (icons[name] || icons.market) + '</svg>';
};
const shopCategoryHref = (categoryId) => (langKey === "ar" ? "./shop-category.html" : "./shop-category.html") + "?cat=" + encodeURIComponent(categoryId);
const shopThemeHref = (slug) => (langKey === "ar" ? "./theme.html" : "./theme.html") + "?slug=" + encodeURIComponent(slug || "");
const shopCategoryById = (data, id) => (data.categories || []).find((category) => category.id === id);
const productSlug = (product, index = 0) => product.slug || String(textFrom(product.title) || "theme").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "theme-" + index;
const shopCardHtml = (product, index, compact = false) => {
  const href = shopThemeHref(productSlug(product, index));
  const price = product.license?.personal?.price ? formatSar(product.license.personal.price) : escapeHtml(textFrom(product.price));
  const badge = textFrom(product.badge) || (langKey === "ar" ? "???? ????" : "Ready Theme");
  return '<article class="shop-card shop-market-card" data-category="' + escapeHtml(product.category || "all") + '"><a href="' + href + '">' + buildCmsMedia(product, "shop") + '<div class="shop-card-body"><p>' + escapeHtml(badge) + '</p><h3>' + escapeHtml(textFrom(product.title)) + '</h3><strong>' + price + '</strong>' + (compact ? '' : '<span>' + escapeHtml(textFrom(product.description)) + '</span>') + '<em>' + (langKey === "ar" ? "??? ????????" : "View details") + '</em></div></a></article>';
};
const renderShopRows = (target, data, products) => {
  const newest = products.filter((item) => item.isNew).slice(0, 8);
  const popular = products.filter((item) => item.isPopular).slice(0, 8);
  const featuredCats = (data.categories || []).filter((category) => category.id !== "all");
  const row = (title, subtitle, list) => '<div class="shop-product-row"><div class="shop-row-head"><div><p class="eyebrow">' + escapeHtml(subtitle) + '</p><h2>' + escapeHtml(title) + '</h2></div></div><div class="shop-row-grid">' + list.map((product, index) => shopCardHtml(product, index, true)).join("") + '</div></div>';
  let html = row(langKey === "ar" ? "???? ??????" : "New Added", langKey === "ar" ? "??????? ?????" : "Fresh picks", newest.length ? newest : products.slice(0, 8));
  html += row(langKey === "ar" ? "?????? ?????" : "Popular", langKey === "ar" ? "?? ???? ??? ???????" : "Customer favorites", popular.length ? popular : products.slice(2, 10));
  featuredCats.forEach((category) => {
    const list = products.filter((product) => product.category === category.id).slice(0, 5);
    if (list.length) html += row((langKey === "ar" ? "?????? ?? " : "Latest in ") + textFrom(category), textFrom(category.description) || textFrom(category), list);
  });
  target.innerHTML = html;
  target.querySelectorAll("img").forEach(setupImageFallback);
};
const renderShopHome = async (root) => {
  const data = await loadCmsJson(root.dataset.source || "./data/shop.json");
  const products = data.products || [];
  const categoryWrap = root.querySelector("[data-shop-categories]");
  const search = root.querySelector("[data-shop-search]");
  const showcase = root.querySelector("[data-shop-showcase]");
  categoryWrap.innerHTML = (data.categories || []).filter((category) => category.id !== "all").map((category) => '<a class="shop-category-tile" href="' + shopCategoryHref(category.id) + '"><span>' + shopIconSvg(category.icon) + '</span><strong>' + escapeHtml(textFrom(category)) + '</strong><small>' + escapeHtml(textFrom(category.description)) + '</small></a>').join("");
  const update = () => {
    const query = (search?.value || "").trim().toLowerCase();
    const filtered = query ? products.filter((product) => [textFrom(product.title), textFrom(product.description), product.category].join(" ").toLowerCase().includes(query)) : products;
    renderShopRows(showcase, data, filtered);
  };
  search?.addEventListener("input", update);
  update();
};
const renderShopCategoryPage = async (root) => {
  const data = await loadCmsJson(root.dataset.source || "./data/shop.json");
  const params = new URLSearchParams(window.location.search);
  const catId = params.get("cat") || "ecommerce";
  const category = shopCategoryById(data, catId) || (data.categories || [])[1] || { id: "all", en: "Themes", ar: "???????", icon: "market" };
  const products = (data.products || []).filter((product) => product.category === category.id);
  const hero = root.querySelector("[data-category-hero]");
  const list = root.querySelector("[data-category-products]");
  hero.innerHTML = '<div class="shop-category-title"><span>' + shopIconSvg(category.icon) + '</span><p class="eyebrow">' + (langKey === "ar" ? "??? ???????" : "Theme category") + '</p><h1>' + escapeHtml(textFrom(category)) + '</h1><p>' + escapeHtml(textFrom(category.description)) + '</p></div>';
  list.innerHTML = '<div class="shop-product-row"><div class="shop-row-head"><div><p class="eyebrow">' + (langKey === "ar" ? "?? ???????" : "All themes") + '</p><h2>' + escapeHtml(textFrom(category)) + '</h2></div><a href="./shop.html">' + (langKey === "ar" ? "?? ??????" : "All categories") + '</a></div><div class="shop-grid">' + products.map((product, index) => shopCardHtml(product, index)).join("") + '</div></div>';
  list.querySelectorAll("img").forEach(setupImageFallback);
};
const renderThemeDetailPage = async (root) => {
  const data = await loadCmsJson(root.dataset.source || "./data/shop.json");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || "";
  const product = (data.products || []).find((item, index) => productSlug(item, index) === slug) || (data.products || [])[0];
  const target = root.querySelector("[data-shop-detail-page-target]");
  if (!product || !target) return;
  const category = shopCategoryById(data, product.category) || {};
  const personal = product.license?.personal || { price: getProductBasePrice(product), oldPrice: 0, en: "Personal license", ar: "???? ?????" };
  const commercial = product.license?.commercial || { price: getProductBasePrice(product) * 2, oldPrice: 0, en: "Commercial license", ar: "???? ??????" };
  const addons = Array.isArray(product.addons) ? product.addons : [];
  const productTitle = textFrom(product.title);
  target.innerHTML = '<div class="shop-detail-layout shop-detail-page-layout"><div class="shop-detail-preview"><nav class="shop-breadcrumb"><a href="./shop.html">' + (langKey === "ar" ? "??????" : "Shop") + '</a><span>/</span><a href="' + shopCategoryHref(product.category) + '">' + escapeHtml(textFrom(category) || product.category) + '</a></nav><div class="shop-detail-topline"><span>' + escapeHtml(textFrom(product.platform) || "Arabix Theme") + '</span><a href="' + escapeHtml(product.liveDemo || "#") + '">' + (langKey === "ar" ? "??? ?????" : "Live Demo") + '</a></div><h1>' + escapeHtml(productTitle) + '</h1><p>' + escapeHtml(textFrom(product.description)) + '</p><div class="shop-detail-media-wrap">' + buildCmsMedia(product, "shop") + '<b>' + escapeHtml(textFrom(product.badge) || (langKey === "ar" ? "???? ????" : "Ready Theme")) + '</b></div></div><aside class="shop-detail-buy"><p class="shop-detail-kicker">' + (langKey === "ar" ? "???? ??????" : "Choose a license") + '</p><div class="shop-license-list"><label><input type="radio" name="shop-license" value="personal" checked data-license-price="' + personal.price + '"><span><strong>' + escapeHtml(textFrom(personal)) + '</strong><em>' + (personal.oldPrice ? '<del>' + formatSar(personal.oldPrice) + '</del>' : '') + '<b>' + formatSar(personal.price) + '</b></em></span></label><label><input type="radio" name="shop-license" value="commercial" data-license-price="' + commercial.price + '"><span><strong>' + escapeHtml(textFrom(commercial)) + '</strong><em>' + (commercial.oldPrice ? '<del>' + formatSar(commercial.oldPrice) + '</del>' : '') + '<b>' + formatSar(commercial.price) + '</b></em></span></label></div><p class="shop-detail-kicker">' + (langKey === "ar" ? "????? ??????" : "Popular services") + '</p><div class="shop-addon-list">' + addons.map((addon) => '<label><input type="checkbox" data-addon-price="' + Number(addon.price || 0) + '" ' + (addon.selected ? 'checked' : '') + '><span><strong>' + escapeHtml(textFrom(addon)) + '</strong><em>+' + formatSar(addon.price || 0) + '</em></span></label>').join("") + '</div><div class="shop-total-row"><span>' + (langKey === "ar" ? "????????" : "Total") + '</span><strong data-shop-total></strong></div><button class="shop-cart-button" type="button" data-shop-order>' + (langKey === "ar" ? "??? ??? ?????" : "Add to Cart") + '</button><p class="shop-manual-note">' + (langKey === "ar" ? "??? ????? ????? ?? ???? ????? ?? ?????? Payoneer." : "After the order, we will send a Payoneer invoice or payment link.") + '</p></aside></div>';
  target.querySelectorAll("img").forEach(setupImageFallback);
  const totalEl = target.querySelector("[data-shop-total]");
  const updateTotal = () => {
    const license = target.querySelector('input[name="shop-license"]:checked');
    const addonsTotal = [...target.querySelectorAll("[data-addon-price]:checked")].reduce((sum, item) => sum + Number(item.dataset.addonPrice || 0), 0);
    const total = Number(license?.dataset.licensePrice || 0) + addonsTotal;
    totalEl.textContent = formatSar(total);
    return total;
  };
  target.querySelectorAll("input").forEach((input) => input.addEventListener("change", updateTotal));
  target.querySelector("[data-shop-order]").addEventListener("click", () => {
    const total = updateTotal();
    const licenseLabel = target.querySelector('input[name="shop-license"]:checked')?.closest("label")?.querySelector("strong")?.textContent || "";
    const selectedAddons = [...target.querySelectorAll("[data-addon-price]:checked")].map((item) => item.closest("label")?.querySelector("strong")?.textContent).filter(Boolean);
    shopCart.push({ title: productTitle, license: licenseLabel, addons: selectedAddons, total });
    renderShopCart();
  });
  updateTotal();
};
const renderShopCms = async () => {
  const home = document.querySelector("[data-shop-home]");
  const categoryPage = document.querySelector("[data-shop-category-page]");
  const detailPage = document.querySelector("[data-shop-detail-page]");
  try {
    if (home) await renderShopHome(home);
    if (categoryPage) await renderShopCategoryPage(categoryPage);
    if (detailPage) await renderThemeDetailPage(detailPage);
  } catch (error) {
    console.warn(error);
  }
};
renderPortfolioCms();
renderShopCms();

const projectForm = document.querySelector(".project-form");
if (projectForm) {
  const statusEl = projectForm.querySelector("[data-form-status]");
  const setupOtherField = (key) => {
    const toggles = [...projectForm.querySelectorAll(`[data-other-toggle="${key}"]`)];
    const field = projectForm.querySelector(`[data-other-field="${key}"]`);
    const input = field?.querySelector("input");
    if (!toggles.length || !field || !input) return;

    const sync = () => {
      const isActive = toggles.some((toggle) => toggle.checked);
      field.classList.toggle("is-visible", isActive);
      input.disabled = !isActive;
      input.required = isActive;
      if (!isActive) input.value = "";
    };

    toggles.forEach((toggle) => toggle.addEventListener("change", sync));
    sync();
  };

  setupOtherField("service");
  setupOtherField("budget");
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = projectForm.querySelector('button[type="submit"]');
    const formData = new FormData(projectForm);
    const action = projectForm.getAttribute("action") || "";
    const ajaxAction = action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");

    if (statusEl) statusEl.textContent = "Sending your brief...";
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(ajaxAction, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("FormSubmit did not accept the message.");

      window.location.href = projectForm.querySelector('input[name="_next"]')?.value || "./thank-you.html";
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = "Message could not be sent. Please email hello@arabixweb.com or message on WhatsApp.";
      }
      if (submitButton) submitButton.disabled = false;
    }
  });
}
const setupArabixChat = () => {
  if (document.querySelector("[data-arabix-chat]")) return;

  window.Tawk_API = window.Tawk_API || {};
  const pageLang = document.documentElement.lang || "";
  const isArabicPage = document.documentElement.dir === "rtl" || pageLang.toLowerCase().startsWith("ar");
  const tawkPosition = isArabicPage ? "bl" : "br";
  window.Tawk_API.customStyle = {
    visibility: {
      desktop: { position: tawkPosition, xOffset: 24, yOffset: 24 },
      mobile: { position: tawkPosition, xOffset: 12, yOffset: 12 }
    }
  };
  window.Tawk_LoadStart = new Date();

  const launcherTitle = isArabicPage ? "ØªØ­Ø¯Ø« Ù…Ø¹ Ø£Ø±Ø§Ø¨ÙƒØ³" : "Chat with Arabix";
  const launcherSubcopy = isArabicPage ? "Ù†Ø±Ø¯ Ø¨Ø³Ø±Ø¹Ø© Ø¹Ø§Ø¯Ø©" : "Usually replies fast";
  const launcherLabel = isArabicPage ? "Ø§ÙØªØ­ Ù…Ø­Ø§Ø¯Ø«Ø© Ø£Ø±Ø§Ø¨ÙƒØ³ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©" : "Open Arabix live chat";

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "arabix-chat-launcher";
  launcher.setAttribute("data-arabix-chat", "");
  launcher.setAttribute("aria-label", launcherLabel);
  launcher.innerHTML = `
    <span class="arabix-chat-pulse" aria-hidden="true"></span>
    <span class="arabix-chat-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4A3.5 3.5 0 0 1 3 10.5v-4Z" />
      </svg>
    </span>
    <span class="arabix-chat-copy">
      <strong>${launcherTitle}</strong>
      <small>${launcherSubcopy}</small>
    </span>
  `;

  document.body.appendChild(launcher);

  const hideTawkBubble = () => {
    if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
      window.Tawk_API.hideWidget();
    }
  };

  window.Tawk_API.onLoad = () => {
    launcher.classList.add("is-ready");
    window.setTimeout(hideTawkBubble, 500);
  };

  window.Tawk_API.onChatMaximized = () => {
    launcher.classList.add("is-open");
    launcher.setAttribute("aria-hidden", "true");
  };

  window.Tawk_API.onChatMinimized = () => {
    launcher.classList.remove("is-open");
    launcher.removeAttribute("aria-hidden");
    window.setTimeout(hideTawkBubble, 350);
  };

  window.Tawk_API.onChatHidden = () => {
    launcher.classList.remove("is-open");
    launcher.removeAttribute("aria-hidden");
  };

  launcher.addEventListener("click", () => {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
      if (typeof window.Tawk_API.showWidget === "function") window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
      return;
    }

    launcher.classList.add("is-loading");
  });

  const tawkScript = document.createElement("script");
  tawkScript.async = true;
  tawkScript.src = "https://embed.tawk.to/6a396583dbc2651d48d4bf3a/1jro397sd";
  tawkScript.charset = "UTF-8";
  tawkScript.setAttribute("crossorigin", "*");
  tawkScript.addEventListener("load", () => launcher.classList.remove("is-loading"));
  document.head.appendChild(tawkScript);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupArabixChat);
} else {
  setupArabixChat();
}