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

const portfolioImages = document.querySelectorAll(".portfolio-image-tile img");
portfolioImages.forEach((image) => {
  const removeBrokenImage = () => image.remove();
  image.addEventListener("error", removeBrokenImage, { once: true });
  if (image.complete && image.naturalWidth === 0) removeBrokenImage();
});
const projectForm = document.querySelector(".project-form");
if (projectForm) {
  const statusEl = projectForm.querySelector("[data-form-status]");
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
        statusEl.textContent = "Message could not be sent. Please email paule2york@gmail.com or message on WhatsApp.";
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

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "arabix-chat-launcher";
  launcher.setAttribute("data-arabix-chat", "");
  launcher.setAttribute("aria-label", "Open Arabix live chat");
  launcher.innerHTML = `
    <span class="arabix-chat-pulse" aria-hidden="true"></span>
    <span class="arabix-chat-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4A3.5 3.5 0 0 1 3 10.5v-4Z" />
      </svg>
    </span>
    <span class="arabix-chat-copy">
      <strong>Chat with Arabix</strong>
      <small>Usually replies fast</small>
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