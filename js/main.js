/* =========================================================
   Guntur Properties - Main UI
   Header mega menu, profile link, homepage banners.
   ========================================================= */

window.GP_UTILS = {
  slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/₹/g, "rs")
      .replace(/&/g, "and")
      .replace(/\+/g, "")
      .replace(/\//g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  },

  formatPrice(value) {
    if (!value && value !== 0) return "Price on Request";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    if (num >= 10000000) return "₹" + (num / 10000000).toFixed(num % 10000000 ? 2 : 0) + " Cr";
    if (num >= 100000) return "₹" + (num / 100000).toFixed(num % 100000 ? 1 : 0) + " L";
    return "₹" + num.toLocaleString("en-IN");
  },

  titleCase(value) {
    if (!value) return "N/A";
    return String(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (s) => s.toUpperCase());
  },

  generatePropertySlug(property) {
    const code = property.property_code || property.code || property.id || "";
    const parts = [
      property.bedrooms ? `${property.bedrooms}-bhk-bedroom` : "",
      property.property_type || "property",
      property.listing_type ? `for-${property.listing_type}` : "for-sale",
      property.title || "",
      property.location || "",
      property.district || "",
      property.area_sqft ? `${property.area_sqft}-sqft` : "",
      code ? "spid-" + code : ""
    ];

    return this.slugify(parts.filter(Boolean).join("-"));
  },

  propertyDetailsUrl(property) {
    const slug = property.seo_slug || property.slug || this.generatePropertySlug(property);
    return slug ? `${slug}` : `property-details.html?id=${encodeURIComponent(property.id)}`;
  }
};

window.GP_MAIN = {
  bindMegaMenus() {
    function closeAll() {
      document.querySelectorAll(".main-nav > .group").forEach((item) => {
        item.classList.remove("menu-open");
      });
    }

    document.querySelectorAll(".main-nav > .group").forEach((menu) => {
      const link = menu.querySelector(".nav-link");
      const panel = menu.querySelector(".mega-menu");

      if (!link || !panel) return;

      link.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = menu.classList.contains("menu-open");
        closeAll();

        if (!isOpen) menu.classList.add("menu-open");
      });

      panel.addEventListener("click", (event) => event.stopPropagation());
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".main-nav")) closeAll();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });
  },

  bindSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(form);
        const params = new URLSearchParams();

        for (const [key, value] of data.entries()) {
          if (String(value).trim()) params.set(key, value);
        }

        window.GP_ANALYTICS?.trackSearch({
          keyword: params.get("q") || params.get("search") || "",
          location: params.get("location") || "",
          property_type: params.get("type") || "",
          budget: params.get("budget") || ""
        });

        window.location.href = "properties.html?" + params.toString();
      });
    });
  },

  async loadHomeBanners() {
    const track = document.querySelector("[data-banner-track]");
    if (!track) return;

    let banners = [];

    try {
      if (window.GP_SUPABASE?.isConfigured()) {
        banners = await window.GP_API.getHomeBanners();
      }
    } catch (error) {
      console.warn("Banner loading failed:", error);
    }

    if (!banners.length) return;

    track.innerHTML = banners.map((banner) => `
      <article class="banner-slide">
        <img src="${banner.image_url}" alt="${banner.title || "Guntur Properties banner"}" loading="lazy">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <span class="banner-badge">${banner.badge || "Guntur Properties"}</span>
          <h1>${banner.title || ""}</h1>
          <p>${banner.subtitle || ""}</p>
          ${banner.button_link ? `<a class="banner-btn" href="${banner.button_link}">${banner.button_text || "Explore"}</a>` : ""}
        </div>
      </article>
    `).join("");
  },

  initBannerSlider() {
    const track = document.querySelector("[data-banner-track]");
    const dotsWrap = document.querySelector("[data-banner-dots]");
    const prev = document.querySelector("[data-banner-prev]");
    const next = document.querySelector("[data-banner-next]");

    if (!track) return;

    let index = 0;

    function slides() {
      return [...track.children];
    }

    function renderDots() {
      if (!dotsWrap) return;

      dotsWrap.innerHTML = slides().map((_, i) => `
        <button class="banner-dot ${i === index ? "active" : ""}" data-dot="${i}" aria-label="Go to banner ${i + 1}"></button>
      `).join("");

      dotsWrap.querySelectorAll("[data-dot]").forEach((dot) => {
        dot.addEventListener("click", () => {
          index = Number(dot.dataset.dot);
          update();
        });
      });
    }

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      renderDots();
    }

    function move(step) {
      const count = slides().length;
      if (!count) return;
      index = (index + step + count) % count;
      update();
    }

    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));

    renderDots();

    setInterval(() => move(1), 5000);
  },

  async init() {
    this.bindMegaMenus();
    this.bindSearchForms();
    await this.loadHomeBanners();
    this.initBannerSlider();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_MAIN.init();
});
