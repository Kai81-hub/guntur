/* =========================================================
   Guntur Properties - Dynamic Search Locations
   Reads active property locations from Supabase and adds them
   to desktop search dropdown, header search dropdown,
   mobile locality chips, and search suggestions.
   ========================================================= */

window.GP_SEARCH_LOCATIONS = {
  locations: [],
  districts: [],
  suggestions: [],

 defaultLocations: [],

apDistricts: [
  "Alluri Sitharama Raju",
  "Anakapalli",
  "Parvathipuram Manyam",
  "Polavaram",
  "Srikakulam",
  "Visakhapatnam",
  "Vizianagaram",
  "Bapatla",
  "Dr. B.R. Ambedkar Konaseema",
  "East Godavari",
  "Eluru",
  "Guntur",
  "Kakinada",
  "Krishna",
  "NTR",
  "Palnadu",
  "Prakasam",
  "Sri Potti Sriramulu Nellore",
  "West Godavari",
  "Ananthapuramu",
  "Annamayya",
  "Chittoor",
  "YSR Kadapa",
  "Kurnool",
  "Markapuram",
  "Nandyal",
  "Sri Sathya Sai",
  "Tirupati"
],
  defaultSuggestions: [
  "Flats",
  "Houses",
  "Plots",
  "Villa",
  "2 BHK",
  "3 BHK"
],

  async init() {
    const clientReady =
      window.GP_SUPABASE?.isConfigured?.() &&
      window.GP_SUPABASE?.select &&
      window.GP_CONFIG?.TABLES?.properties;

    if (!clientReady) {
      console.warn("Dynamic search locations skipped: Supabase is not connected. Using default suggestions.");

      this.locations = [];
this.districts = [];
      this.suggestions = [...this.defaultSuggestions];

      this.renderHeaderLocationMenu();
      this.renderMobileLocalities();
      this.addSearchDatalist();

      return;
    }

    try {
      const rows = await window.GP_SUPABASE.select(window.GP_CONFIG.TABLES.properties, {
  select: `
    title,
    property_title,
    description,
    district,
    location,
    area,
    locality,
    city,
    landmark,
    address,
    property_type,
    listing_type,
    category,
    bhk,
    bedrooms,
    floor,
    floor_number,
    total_floors,
    amenities,
    status
  `,
  eq: { status: "active" },
  order: "created_at",
  limit: 500
});

      this.locations = this.unique(rows.map((p) => p.location));
      this.districts = this.unique(rows.map((p) => p.district));

      this.suggestions = this.unique(
  rows.flatMap((p) => [
    p.title,
    p.property_title,
    p.description,
    p.location,
    p.area,
    p.locality,
    p.district,
    p.city,
    p.landmark,
    p.address,
    p.property_type,
    p.listing_type,
    p.category,
    p.bhk,
    p.bedrooms ? `${p.bedrooms} BHK` : "",
    p.floor,
    p.floor_number ? `${p.floor_number} floor` : "",
    p.total_floors ? `${p.total_floors} floors` : "",
    p.amenities
  ])
);

      this.renderDesktopLocationMenu();
      this.renderHeaderLocationMenu();
      this.renderMobileLocalities();
      this.addSearchDatalist();

    } catch (error) {
      console.warn("Dynamic search locations failed. Using default suggestions:", error);

      this.locations = [...this.defaultLocations];
     this.districts = [];
      this.suggestions = [...this.defaultSuggestions];

      this.renderDesktopLocationMenu();
      this.renderHeaderLocationMenu();
      this.renderMobileLocalities();
      this.addSearchDatalist();
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

 getAllLocations() {
  const activeDistricts = this.unique(
    this.districts.filter((district) => {
      const value = String(district || "").trim();
      return this.apDistricts.includes(value);
    })
  );

  return this.unique([
  ...activeDistricts
]);
},

  setLocation(location) {
  const value = location || "";

    const mainSelected = document.getElementById("selected-location");
    const headerSelected = document.getElementById("header-selected-location");
    const desktopSelected = document.getElementById("desktop-selected-location");

    if (mainSelected) mainSelected.textContent = value || "Select Location";
if (headerSelected) headerSelected.textContent = value || "Select Location";
if (desktopSelected) desktopSelected.textContent = value || "Select Location";

    if (typeof selectedLocation !== "undefined") {
      selectedLocation = value;
    }
  },

  renderDesktopLocationMenu() {
    const menu = document.getElementById("location-menu-main");
    if (!menu) return;

    const allLocations = this.getAllLocations();

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
        this.setLocation(btn.dataset.location || "");
        menu.classList.add("hidden");
      });
    });
  },

  renderHeaderLocationMenu() {
    const menu = document.getElementById("header-location-menu");
    if (!menu) return;

    const allLocations = this.getAllLocations();

    menu.innerHTML = allLocations.map((loc) => `
      <button
        type="button"
        data-location="${this.escapeHtml(loc)}"
        class="header-location-option w-full text-left p-3 rounded-2xl border border-transparent transition-all hover:bg-[#d4af37]/10"
      >
        <span class="font-bold text-on-surface">${this.escapeHtml(loc)}</span>
        <span class="block text-xs text-outline">Available property location</span>
      </button>
    `).join("");

    menu.querySelectorAll(".header-location-option").forEach((btn) => {
      btn.addEventListener("click", () => {
       this.setLocation(btn.dataset.location || "");
        menu.classList.add("hidden");
      });
    });
  },

  renderMobileLocalities() {
    const mobileBody = document.querySelector(".mobile-search-body");
    if (!mobileBody) return;

    const allLocations = this.unique([
      "Brodipet",
      "Lakshmipuram",
      "Arundelpet",
      "Amaravati Road",
      "Gorantla",
      "Pattabhipuram",
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
   const inputs = [
  document.getElementById("main-search-input"),
  document.getElementById("header-property-search"),
  document.getElementById("mobile-search-input")
].filter(Boolean);

    if (!inputs.length) return;

    let datalist = document.getElementById("gp-search-suggestions");

    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "gp-search-suggestions";
      document.body.appendChild(datalist);
    }

    const allSuggestions = this.unique([
      ...this.defaultSuggestions,
      ...this.suggestions
    ]);

    datalist.innerHTML = allSuggestions.map((item) => `
      <option value="${this.escapeHtml(item)}"></option>
    `).join("");

    inputs.forEach((input) => {
      input.setAttribute("list", "gp-search-suggestions");
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_SEARCH_LOCATIONS.init();
});
