/* =====================================================
   Guntur Properties - Search Bridge
   Connects:
   index main search
   scrolled desktop header search
   mobile search
   properties.html search filters
   Supabase saved property fields
===================================================== */

(function () {
  const AP_DISTRICTS = [
    "Alluri Sitharama Raju",
    "Anakapalli",
    "Parvathipuram Manyam",
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
    "Nandyal",
    "Sri Sathya Sai",
    "Tirupati"
  ];

  const DEFAULT_AREAS = {
    Guntur: ["Guntur", "Brodipet", "Pattabhipuram", "Lakshmipuram", "Arundelpet", "Gorantla", "Amaravati Road", "Vidya Nagar"],
    Krishna: ["Vijayawada", "Benz Circle", "Moghalrajpuram", "Kanuru", "Poranki", "Gollapudi"],
    NTR: ["Vijayawada", "Ibrahimpatnam", "Nandigama", "Tiruvuru"],
    Palnadu: ["Narasaraopet", "Sattenapalli", "Piduguralla", "Chilakaluripet"],
    Bapatla: ["Bapatla", "Chirala", "Repalle", "Addanki"],
    "West Godavari": ["Bhimavaram", "Tadepalligudem", "Tanuku", "Palakollu"],
    "East Godavari": ["Rajahmundry", "Kovvur", "Anaparthi"],
    Visakhapatnam: ["Visakhapatnam", "MVP Colony", "Gajuwaka", "Madhurawada"],
    Tirupati: ["Tirupati", "Renigunta", "Chandragiri"]
  };

  const $ = (id) => document.getElementById(id);

  const state = {
    purpose: "buy",
    type: "all",
    state: localStorage.getItem("gp_search_state") || "Andhra Pradesh",
    district: localStorage.getItem("gp_search_district") || "Guntur",
    location: localStorage.getItem("gp_search_location") || "",
    keyword: ""
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setStorage() {
    localStorage.setItem("gp_search_state", state.state || "");
    localStorage.setItem("gp_search_district", state.district || "");
    localStorage.setItem("gp_search_location", state.location || "");
  }

  function buildSearchUrl(extra = {}) {
    const params = new URLSearchParams();

    const keyword = extra.keyword ?? state.keyword;
    const purpose = extra.purpose ?? state.purpose;
    const type = extra.type ?? state.type;
    const selectedState = extra.state ?? state.state;
    const district = extra.district ?? state.district;
    const location = extra.location ?? state.location;

    if (keyword) params.set("q", keyword);
    if (purpose) params.set("purpose", purpose);
    if (type && type !== "all") params.set("type", type);
    if (selectedState) params.set("state", selectedState);
    if (district) params.set("district", district);
    if (location) params.set("location", location);

    setStorage();

    return "properties.html?" + params.toString();
  }

  function goSearch(extra = {}) {
    window.location.href = buildSearchUrl(extra);
  }

  function typeFromTab(key) {
    if (key === "rent") return { purpose: "rent", type: "all" };
    if (key === "commercial") return { purpose: "buy", type: "commercial" };
    if (key === "pg") return { purpose: "rent", type: "pg" };
    if (key === "plots") return { purpose: "buy", type: "plots" };
    if (key === "projects" || key === "new-launch") return { purpose: "buy", type: "projects" };
    return { purpose: "buy", type: "all" };
  }

  function guessTypeFromKeyword(text) {
    const q = normalize(text);

    if (q.includes("rent") || q.includes("rental") || q.includes("lease")) {
      state.purpose = "rent";
    }

    if (q.includes("buy") || q.includes("sale") || q.includes("sell")) {
      state.purpose = "buy";
    }

    if (q.includes("plot") || q.includes("land") || q.includes("venture")) {
      state.type = "plots";
    } else if (q.includes("commercial") || q.includes("shop") || q.includes("office") || q.includes("showroom") || q.includes("warehouse")) {
      state.type = "commercial";
    } else if (q.includes("villa")) {
      state.type = "villas";
    } else if (q.includes("flat") || q.includes("apartment") || q.includes("bhk")) {
      state.type = "flats";
    } else if (q.includes("house") || q.includes("home")) {
      state.type = "houses";
    }
  }

  function renderLocationPanel() {
    const panel = $("main-location-filter-panel");
    if (!panel) return;

    panel.innerHTML = `
      <div class="location-filter-head">
        <h3>Select Location</h3>
        <button type="button" id="location-filter-close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <p class="location-filter-label">State</p>
      <div class="state-dropdown-grid">
        <button type="button" class="state-option active" data-state="Andhra Pradesh">Andhra Pradesh</button>
      </div>

      <p class="location-filter-label mt-4">District</p>
      <div class="district-dropdown-grid" id="district-dropdown-grid">
        ${AP_DISTRICTS.map((district) => `
          <button type="button" class="district-option ${district === state.district ? "active" : ""}" data-district="${district}">
            ${district}
          </button>
        `).join("")}
      </div>

      <p class="location-filter-label mt-4">Areas with properties</p>
      <div class="area-dropdown-grid" id="area-dropdown-grid"></div>

      <div class="manual-state-search-box">
        <label>Manual area / city / landmark</label>
        <input id="manual-location-search" placeholder="Example: Brodipet, Lakshmipuram, Amaravati Road" />
      </div>

      <button type="button" id="apply-state-filter" class="apply-state-filter">
        Apply Location
      </button>
    `;

    renderAreas();

    $("location-filter-close")?.addEventListener("click", closeLocationPanel);

    document.querySelectorAll(".district-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.district = btn.dataset.district || "";
        state.location = "";

        document.querySelectorAll(".district-option").forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");

        renderAreas();
      });
    });

    $("apply-state-filter")?.addEventListener("click", () => {
      const manual = $("manual-location-search")?.value.trim();

      if (manual) {
        state.location = manual;
      }

      setStorage();
      closeLocationPanel();
      updateLocationLabels();
    });
  }

  function renderAreas() {
    const grid = $("area-dropdown-grid");
    if (!grid) return;

    const areas = DEFAULT_AREAS[state.district] || [];

    if (!areas.length) {
      grid.innerHTML = `
        <p class="text-sm font-bold text-slate-500">
          No fixed areas added. Use manual area search.
        </p>
      `;
      return;
    }

    grid.innerHTML = areas.map((area) => `
      <button type="button" class="area-option ${area === state.location ? "active" : ""}" data-location="${area}">
        ${area}
      </button>
    `).join("");

    document.querySelectorAll(".area-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.location = btn.dataset.location || "";

        document.querySelectorAll(".area-option").forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");

        $("manual-location-search").value = state.location;
      });
    });
  }

  function openLocationPanel() {
    renderLocationPanel();
    $("main-location-filter-panel")?.classList.add("active");
  }

  function closeLocationPanel() {
    $("main-location-filter-panel")?.classList.remove("active");
  }

  function updateLocationLabels() {
    const label = state.location || state.district || "Select Location";

    const selectedLocation = $("selected-location");
    const desktopSelected = $("desktop-selected-location");
    const headerSelected = $("header-selected-location");
    const propertiesSelected = $("properties-selected-location");

    if (selectedLocation) selectedLocation.textContent = label;
    if (desktopSelected) desktopSelected.textContent = label;
    if (headerSelected) headerSelected.textContent = label;
    if (propertiesSelected) propertiesSelected.textContent = label;
  }

  function bindMainSearch() {
    const searchInput = $("property-search");
    const searchBtn = $("search-button");
    const locationBtn = $("location-icon-button");
    const categoryChip = $("location-chip");

    locationBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLocationPanel();
    });

    searchBtn?.addEventListener("click", () => {
      state.keyword = searchInput?.value.trim() || "";
      guessTypeFromKeyword(state.keyword);
      goSearch();
    });

    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        state.keyword = searchInput.value.trim();
        guessTypeFromKeyword(state.keyword);
        goSearch();
      }
    });

    categoryChip?.addEventListener("click", () => {
      document.querySelector(".search-panel")?.classList.toggle("category-open");
    });

    document.querySelectorAll(".desktop-search-tabs .search-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.searchTab || "";

        if (key === "post") {
          window.location.href = "post-property.html";
          return;
        }

        const mapped = typeFromTab(key || tab.textContent.trim().toLowerCase().replace(/\s+/g, "-"));
        state.purpose = mapped.purpose;
        state.type = mapped.type;

        document.querySelectorAll(".desktop-search-tabs .search-tab").forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
      });
    });
  }

  function bindScrolledHeaderSearch() {
    const input = $("header-property-search");
    const btn = $("header-search-button");
    const locationBtn = $("header-location-icon-button");

    function run() {
      state.keyword = input?.value.trim() || "";
      guessTypeFromKeyword(state.keyword);

      const selectedTypeText = $("header-selected-type")?.textContent.trim().toLowerCase() || "buy";
      const mapped = typeFromTab(selectedTypeText);
      state.purpose = mapped.purpose;
      if (mapped.type !== "all") state.type = mapped.type;

      goSearch();
    }

    btn?.addEventListener("click", run);

    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        run();
      }
    });

    locationBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLocationPanel();
    });
  }

  function bindMobileSearch() {
    const homeBox = document.querySelector(".mobile-search-box");
    const overlay = document.querySelector(".mobile-search-overlay");
    const input = $("mobile-overlay-search") || $("mobile-home-search") || $("mobile-header-search-input");

    function openOverlay() {
      if (!overlay) return;
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      setTimeout(() => input?.focus(), 150);
    }

    homeBox?.addEventListener("click", openOverlay);
    document.querySelector(".mobile-header-search-box")?.addEventListener("click", openOverlay);

    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        state.keyword = input.value.trim();
        guessTypeFromKeyword(state.keyword);
        goSearch();
      }
    });

    overlay?.addEventListener("click", (event) => {
      if (event.target === overlay) {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    document.querySelectorAll(".locality-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.location = chip.dataset.location || chip.textContent.trim();
        setStorage();
        updateLocationLabels();
      });
    });
  }

  function bindMiniLocationSearch() {
    const input = $("desktop-location-mini-input");
    const explore = $("desktop-location-mini-explore");

    function runMini(locationValue) {
      state.location = locationValue || input?.value.trim() || state.location || "Guntur";

      const miniType = document.querySelector(".desktop-location-mini-tab.active")?.dataset.miniType || "Buy";
      const category = $("desktop-location-mini-category-label")?.textContent.trim() || "Residential";

      if (category === "Commercial") {
        state.type = "commercial";
        state.purpose = miniType === "Rent" ? "rent" : "buy";
      } else if (miniType === "Rent") {
        state.purpose = "rent";
        state.type = "all";
      } else if (miniType === "Plots") {
        state.purpose = "buy";
        state.type = "plots";
      } else if (miniType === "PG") {
        state.purpose = "rent";
        state.type = "pg";
      } else {
        state.purpose = "buy";
        state.type = "all";
      }

      goSearch();
    }

    explore?.addEventListener("click", (event) => {
      event.preventDefault();
      runMini();
    });

    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runMini();
      }
    });

    document.querySelectorAll(".desktop-location-mini-chips button, .desktop-location-mini-footer button").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        runMini(btn.dataset.location || btn.textContent.trim());
      });
    });
  }

  function init() {
    updateLocationLabels();
    bindMainSearch();
    bindScrolledHeaderSearch();
    bindMobileSearch();
    bindMiniLocationSearch();
  }

  document.addEventListener("DOMContentLoaded", init);
})();