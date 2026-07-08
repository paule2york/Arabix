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
const renderShopCms = async () => {
  const grid = document.querySelector("[data-shop-grid]");
  const bar = document.querySelector("[data-shop-filters]");
  if (!grid) return;
  try {
    const data = await loadCmsJson(grid.dataset.source || "./data/shop.json");
    renderFilterButtons(bar, data.categories, langKey === "ar" ? "\u0643\u0644 \u0627\u0644\u0642\u0648\u0627\u0644\u0628" : "All Themes");
    grid.innerHTML = (data.products || []).map((product) => {
      const cta = langKey === "ar" ? "\u0627\u0637\u0644\u0628 \u0627\u0644\u0642\u0627\u0644\u0628" : "Request Theme";
      return '<article class="shop-card" data-category="' + escapeHtml(product.category || "all") + '">' + buildCmsMedia(product, "shop") + '<div class="shop-card-body"><p>' + escapeHtml(textFrom(product.timeframe)) + '</p><h3>' + escapeHtml(textFrom(product.title)) + '</h3><strong>' + escapeHtml(textFrom(product.price)) + '</strong><span>' + escapeHtml(textFrom(product.description)) + '</span><a href="./contact.html">' + cta + '</a></div></article>';
    }).join("");
  } catch (error) {
    console.warn(error);
  }
  grid.querySelectorAll("img").forEach(setupImageFallback);
  setupCmsFilter(bar, grid);
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

  const launcherTitle = isArabicPage ? "تحدث مع أرابكس" : "Chat with Arabix";
  const launcherSubcopy = isArabicPage ? "نرد بسرعة عادة" : "Usually replies fast";
  const launcherLabel = isArabicPage ? "افتح محادثة أرابكس المباشرة" : "Open Arabix live chat";

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