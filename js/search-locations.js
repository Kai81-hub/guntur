/* =========================================================
   Guntur Properties - Dynamic Search Locations
   Reads active property locations from Supabase and adds them
   to desktop search dropdown, mobile locality chips, and search suggestions.
   ========================================================= */

window.GP_SEARCH_LOCATIONS = {
  locations: [],
  districts: [],
  suggestions: [],

  async init() {
    const clientReady =
      window.GP_SUPABASE?.isConfigured?.() &&
      window.GP_SUPABASE?.select &&
      window.GP_CONFIG?.TABLES?.properties;

    if (!clientReady) {
      console.warn("Dynamic search locations skipped: Supabase is not connected.");
      return;
    }

    try {
      const rows = await window.GP_SUPABASE.select(window.GP_CONFIG.TABLES.properties, {
        select: "title, district, location, property_type, status",
        eq: { status: "active" },
        order: "created_at",
        limit: 500
      });

      this.locations = this.unique(rows.map((p) => p.location));
      this.districts = this.unique(rows.map((p) => p.district));

      this.suggestions = this.unique(
        rows.flatMap((p) => [
          p.title,
          p.location,
          p.district,
          p.property_type
        ])
      );

      this.renderDesktopLocationMenu();
      this.renderMobileLocalities();
      this.addSearchDatalist();
    } catch (error) {
      console.warn("Dynamic search locations failed:", error);
    }
  },

  unique(items) {
    return [...new Set(
      items
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  },

  escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  renderDesktopLocationMenu() {
    const menu = document.getElementById("location-menu");
    if (!menu) return;

    const defaultLocations = [
      "Guntur",
      "Brodipet",
      "Lakshmipuram",
      "Arundelpet",
      "Amaravati Road",
      "Gorantla",
      "Pattabhipuram",
      "Tenali"
    ];

    const allLocations = this.unique([
      ...defaultLocations,
      ...this.districts,
      ...this.locations
    ]);

    menu.innerHTML = allLocations.map((loc) => `
      <button
        type="button"
        data-location="${this.escapeHtml(loc)}"
        class="location-option w-full text-left p-3 rounded-2xl border border-transparent transition-all hover:bg-[#d4af37]/10"
      >
        <span class="font-bold text-on-surface">${this.escapeHtml(loc)}</span>
        <span class="block text-xs text-outline">Available property location</span>
      </button>
    `).join("");

    menu.querySelectorAll(".location-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selected = document.getElementById("selected-location");
        if (selected) selected.textContent = btn.dataset.location;
        menu.classList.add("hidden");
      });
    });
  },

  renderMobileLocalities() {
    const mobileBody = document.querySelector(".mobile-search-body");
    if (!mobileBody) return;

    const defaultLocations = [
      "Brodipet",
      "Lakshmipuram",
      "Arundelpet",
      "Amaravati Road",
      "Gorantla",
      "Pattabhipuram"
    ];

    const allLocations = this.unique([
      ...defaultLocations,
      ...this.locations
    ]);

    mobileBody.innerHTML = `
      <h3 class="font-extrabold text-gray-700 mb-5">Popular Localities in Guntur</h3>
      ${allLocations.map((loc) => `
        <button
          type="button"
          class="locality-chip"
          data-chip="${this.escapeHtml(loc)}"
        >
          + ${this.escapeHtml(loc)}
        </button>
      `).join("")}
    `;

    mobileBody.querySelectorAll(".locality-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const input = document.getElementById("mobile-search-input");
        if (input) input.value = chip.dataset.chip;

        window.location.href =
          "properties.html?location=" +
          encodeURIComponent(chip.dataset.chip) +
          "&purpose=buy";
      });
    });
  },

  addSearchDatalist() {
    const input = document.getElementById("property-search");
    if (!input) return;

    let datalist = document.getElementById("gp-search-suggestions");

    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "gp-search-suggestions";
      document.body.appendChild(datalist);
    }

    datalist.innerHTML = this.suggestions.map((item) => `
      <option value="${this.escapeHtml(item)}"></option>
    `).join("");

    input.setAttribute("list", "gp-search-suggestions");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_SEARCH_LOCATIONS.init();
});