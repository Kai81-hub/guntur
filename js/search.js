/* =========================================================
   Guntur Properties - Combined Smart Search System
   Works for:
   1. index.html main search
   2. scrolled header search
   3. mobile search
   4. properties.html filtering

   Search checks:
   title, description, property type, listing type, location,
   area, locality, district, city, landmark, address, BHK,
   bedrooms, amenities, facing, furnishing, project name,
   developer name, plot details, commercial details, etc.
   ========================================================= */

window.GP_SEARCH = {
 readParams() {
  const params = new URLSearchParams(location.search);

  return {
    q: params.get("q") || params.get("search") || "",
    state: params.get("state") || "",
    district: params.get("district") || "",
    location: params.get("location") || params.get("area") || params.get("city") || "",
    purpose: params.get("purpose") || "",
    filters: params.get("filters") || "",
    type: (() => {
      const value =
        params.get("type") ||
        params.get("property_type") ||
        "all";

      const blocked = [
        "residential",
        "property",
        "properties",
        "realestate",
        "real-estate"
      ];

      return blocked.includes(String(value).toLowerCase())
        ? "all"
        : value;
    })(),
    budget: params.get("budget") || "all"
  };
},
  normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  searchableText(p) {
    return this.normalize([
      p.id,
      p.title,
      p.property_title,
      p.name,
      p.description,
      p.short_description,

      p.property_type,
      p.type,
      p.listing_type,
      p.purpose,
      p.property_for,
      p.category,
      p.sub_category,

      p.bhk,
      p.bedrooms,
      p.bathrooms,
      p.floor,
      p.floor_number,
      p.total_floors,

      p.location,
      p.area,
      p.locality,
      p.district,
      p.city,
      p.landmark,
      p.address,
      p.pincode,

      p.price,
      p.price_text,
      p.budget,
      p.rent,
      p.deposit,

      p.facing,
      p.furnishing,
      p.amenities,
      Array.isArray(p.amenities) ? p.amenities.join(" ") : "",

      p.apartment_name,
      p.flat_number,
      p.door_number,
      p.house_type,

      p.plot_area,
      p.builtup_area,
      p.carpet_area,
      p.area_unit,
      p.villa_name,
      p.villa_number,
      p.plot_number,
      p.survey_number,
      p.road_width,
      p.approval_type,
      p.boundary_wall,

      p.commercial_type,
      p.washroom,
      p.suitable_for,

      p.room_type,
      p.sharing_type,
      p.food_available,

      p.project_name,
      p.rera_number,
      p.project_status,
      p.developer_name,
      p.builder_name,

      p.owner_name,
      p.broker_name,
      p.status
    ].join(" "));
  },

  matchesSearchWord(text, word) {
    if (!word) return true;

    if (word === "house" || word === "houses" || word === "home" || word === "homes") {
      return text.includes("house") || text.includes("home") || text.includes("independent") || text.includes("individual");
    }

    if (word === "flat" || word === "flats") {
      return text.includes("flat") || text.includes("apartment");
    }

    if (word === "apartment" || word === "apartments") {
      return text.includes("apartment") || text.includes("flat");
    }

    if (word === "plot" || word === "plots") {
      return text.includes("plot") || text.includes("land") || text.includes("venture") || text.includes("layout");
    }

    if (word === "land") {
      return text.includes("land") || text.includes("plot") || text.includes("open plot");
    }

    if (word === "villa" || word === "villas") {
      return text.includes("villa");
    }

    if (word === "commercial") {
      return text.includes("commercial") || text.includes("shop") || text.includes("office") || text.includes("showroom") || text.includes("warehouse");
    }

    if (word === "shop" || word === "shops") {
      return text.includes("shop") || text.includes("showroom") || text.includes("commercial");
    }

    if (word === "office" || word === "offices") {
      return text.includes("office") || text.includes("commercial");
    }

    if (word === "rent" || word === "rental") {
      return text.includes("rent") || text.includes("rental") || text.includes("lease");
    }

    if (word === "buy" || word === "sale" || word === "sell") {
      return text.includes("buy") || text.includes("sale") || text.includes("sell") || text.includes("selling");
    }

    if (word === "2bhk") {
      return text.includes("2 bhk") || text.includes("2bhk") || text.includes("2 bedroom") || text.includes("2 bedrooms");
    }

    if (word === "3bhk") {
      return text.includes("3 bhk") || text.includes("3bhk") || text.includes("3 bedroom") || text.includes("3 bedrooms");
    }

    if (word === "1bhk") {
      return text.includes("1 bhk") || text.includes("1bhk") || text.includes("1 bedroom");
    }

    if (word === "4bhk") {
      return text.includes("4 bhk") || text.includes("4bhk") || text.includes("4 bedroom") || text.includes("4 bedrooms");
    }

    return text.includes(word);
  },

  filterProperties(properties, state) {
    const searchText = this.normalize(state.q || "");
    const locationText = this.normalize(state.location || "");
    const typeText = this.normalize(state.type || "all");
    const purposeText = this.normalize(state.purpose || "");
    const stateText = this.normalize(state.state || "");
const districtText = this.normalize(state.district || "");
const filterText = this.normalize(state.filters || "");

    const normalize = this.normalize.bind(this);

    const matchesLocation = (p) => {
      if (!locationText || locationText === "select location") return true;

      const text = normalize([
        p.location,
        p.area,
        p.locality,
        p.district,
        p.city,
        p.landmark,
        p.address,
        p.pincode
      ].join(" "));

      return text.includes(locationText);
    };

    const matchesSearch = (p) => {
      if (!searchText) return true;

      const text = this.searchableText(p);

      const words = searchText
        .split(" ")
        .filter(Boolean)
        .filter((word) =>
  ![
    "in",
    "at",
    "near",
    "for",
    "the",
    "a",
    "an",
    "property",
    "properties",
    "residential",
    "commercial",
    "buy",
    "sale",
    "sell",
    "realestate",
    "real-estate",
    "guntur"
  ].includes(word)
);

      if (!words.length) return true;

      return words.every((word) => this.matchesSearchWord(text, word));
    };

    const matchesType = (p) => {
      if (!typeText || typeText === "all") return true;

      const text = this.searchableText(p);

      if (typeText === "houses" || typeText === "house") {
        return text.includes("house") || text.includes("independent") || text.includes("individual");
      }

      if (typeText === "flats" || typeText === "flat" || typeText === "apartments" || typeText === "apartment") {
        return text.includes("flat") || text.includes("apartment");
      }

      if (typeText === "villas" || typeText === "villa") {
        return text.includes("villa");
      }

      if (typeText === "plots" || typeText === "plot" || typeText === "land") {
        return text.includes("plot") || text.includes("land") || text.includes("venture") || text.includes("layout");
      }

      if (typeText === "commercial") {
        return text.includes("commercial") || text.includes("shop") || text.includes("office") || text.includes("showroom") || text.includes("warehouse");
      }

      if (typeText === "projects" || typeText === "project") {
        return text.includes("project") || text.includes("new launch") || text.includes("venture") || text.includes("developer");
      }

      if (typeText === "pg") {
        return text.includes("pg") || text.includes("co living") || text.includes("coliving");
      }

      return text.includes(typeText);
    };

    const matchesPurpose = (p) => {
  if (!purposeText) return true;

  const text = normalize([
    p.listing_type,
    p.purpose,
    p.property_for,
    p.category,
    p.title,
    p.description
  ].join(" "));

  if (
    purposeText === "buy" ||
    purposeText === "sale" ||
    purposeText === "sell"
  ) {
    return (
      text.includes("buy") ||
      text.includes("sale") ||
      text.includes("sell") ||
      text.includes("selling") ||
      text.includes("resale")
    );
  }

  if (purposeText === "rent") {
    return text.includes("rent") || text.includes("rental") || text.includes("lease");
  }

  return text.includes(purposeText);
};

const matchesState = (p) => {
  if (!stateText) return true;

  const text = normalize([
    p.state,
    p.property_state,
    p.address,
    p.location,
    p.district,
    p.city
  ].join(" "));

  return text.includes(stateText);
};

const matchesDistrict = (p) => {
  if (!districtText) return true;

  const text = normalize([
    p.district,
    p.city,
    p.location,
    p.area,
    p.locality,
    p.address
  ].join(" "));

  return text.includes(districtText);
};

const matchesExtraFilters = (p) => {
  if (!filterText) return true;

  const text = this.searchableText(p);

  const filters = filterText
    .split(",")
    .map(item => normalize(item))
    .filter(Boolean);

  return filters.every(filter => {
    return filter
      .split(" ")
      .filter(Boolean)
      .some(word => this.matchesSearchWord(text, word));
  });
};

return [...(properties || [])].filter((p) =>
  matchesState(p) &&
  matchesDistrict(p) &&
  matchesLocation(p) &&
  matchesSearch(p) &&
  matchesType(p) &&
  matchesPurpose(p) &&
  matchesExtraFilters(p)
);
  }
};

/* =========================================================
   Index Page Smart Search Redirect
   ========================================================= */

(function () {
  let activeSearchType = "Buy";

  const LOCATION_ALIASES = {
    guntur: "Guntur",
    brodipet: "Brodipet",
    brodipeta: "Brodipet",
    pattabhipuram: "Pattabhipuram",
    "pattabhi puram": "Pattabhipuram",
    lakshmipuram: "Lakshmipuram",
    laxmipuram: "Lakshmipuram",
    "lakshmi puram": "Lakshmipuram",
    arundelpet: "Arundelpet",
    arundalpet: "Arundelpet",
    ardanlapeta: "Arundelpet",
    gorantla: "Gorantla",
    tenali: "Tenali",
    mangalagiri: "Mangalagiri",
    tadepalli: "Tadepalli",
    amaravati: "Amaravati",
    "amaravati road": "Amaravati Road",
    vijayawada: "Vijayawada",
    vijaywada: "Vijayawada",
    bezawada: "Vijayawada",
    visakhapatnam: "Visakhapatnam",
    vizag: "Visakhapatnam"
  };

  function $(id) {
    return document.getElementById(id);
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getSelectedLocation() {
    const ids = [
      "selected-location",
      "header-selected-location",
      "desktop-selected-location"
    ];

    for (const id of ids) {
      const el = $(id);
      const value = String(el?.textContent || "").trim();

      if (value && value.toLowerCase() !== "select location") {
        return value;
      }
    }

    if (typeof selectedLocation !== "undefined" && selectedLocation) {
      return selectedLocation;
    }

    return "";
  }

  function detectLocation(text) {
    const q = normalize(text);
    let bestKey = "";
    let bestLocation = "";

    Object.keys(LOCATION_ALIASES).forEach((key) => {
      if (q.includes(key) && key.length > bestKey.length) {
        bestKey = key;
        bestLocation = LOCATION_ALIASES[key];
      }
    });

    return {
      key: bestKey,
      location: bestLocation
    };
  }

  function detectPurpose(text, selectedType) {
    const q = normalize(text);

    if (
      selectedType === "Rent" ||
      q.includes("rent") ||
      q.includes("rental") ||
      q.includes("lease") ||
      q.includes("to let")
    ) {
      return "rent";
    }

    return "buy";
  }

  function detectType(text, selectedType) {
    const q = normalize(text);

    if (
      selectedType === "Commercial" ||
      q.includes("commercial") ||
      q.includes("shop") ||
      q.includes("office") ||
      q.includes("showroom") ||
      q.includes("warehouse")
    ) {
      return "commercial";
    }

    if (
      selectedType === "Plots" ||
      q.includes("plot") ||
      q.includes("plots") ||
      q.includes("land") ||
      q.includes("venture") ||
      q.includes("layout")
    ) {
      return "plots";
    }

    if (
      selectedType === "Projects" ||
      selectedType === "New Launch" ||
      q.includes("project") ||
      q.includes("new launch") ||
      q.includes("venture")
    ) {
      return "projects";
    }

    if (
      selectedType === "PG" ||
      q.includes("pg") ||
      q.includes("co living") ||
      q.includes("coliving")
    ) {
      return "pg";
    }

    if (q.includes("villa") || q.includes("villas")) {
      return "villas";
    }

    if (
      q.includes("flat") ||
      q.includes("flats") ||
      q.includes("apartment") ||
      q.includes("apartments")
    ) {
      return "flats";
    }

    if (
      q.includes("house") ||
      q.includes("houses") ||
      q.includes("home") ||
      q.includes("homes") ||
      q.includes("independent") ||
      q.includes("individual")
    ) {
      return "houses";
    }

    return "all";
  }

  function cleanKeyword(text, locationKey) {
    let q = String(text || "").trim();

    if (locationKey) {
      const escaped = locationKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      q = q
        .replace(new RegExp("\\b(in|at|near)\\s+" + escaped + "\\b", "ig"), "")
        .replace(new RegExp("\\b" + escaped + "\\b", "ig"), "");
    }

    q = q
      .replace(/\bfor sale\b/ig, "")
      .replace(/\bfor buy\b/ig, "")
      .replace(/\bavailable\b/ig, "")
      .replace(/\bproperty\b/ig, "")
      .replace(/\bproperties\b/ig, "")
      .replace(/\bin\b/ig, " ")
      .replace(/\bat\b/ig, " ")
      .replace(/\bnear\b/ig, " ")
      .replace(/\s+/g, " ")
      .trim();

    return q;
  }

  function buildUrl(inputValue) {
    const raw = String(inputValue || "").trim();
    const selectedLocation = getSelectedLocation();

    if (!raw && !selectedLocation) {
      alert("Please search like Brodipet flats, Guntur plots, 2BHK house, or select location.");
      return "";
    }

    const found = detectLocation(raw);
    const location = found.location || selectedLocation || "";
    const type = detectType(raw, activeSearchType);
    const purpose = detectPurpose(raw, activeSearchType);
    const q = cleanKeyword(raw, found.key);

    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (location) params.set("location", location);

    params.set("purpose", purpose);

    if (type && type !== "all") {
      params.set("type", type);
    }

    return "properties.html?" + params.toString();
  }

  function runSearch(inputId) {
    const input = $(inputId);
    const value = input?.value || "";
    const url = buildUrl(value);

    if (url) {
      window.location.href = url;
    }
  }

  function bindTabs() {
    document.querySelectorAll(".search-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".search-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        activeSearchType =
          tab.dataset.type ||
          tab.dataset.searchType ||
          tab.textContent.trim() ||
          "Buy";
      });
    });

    document.querySelectorAll(".header-type-option").forEach((option) => {
      option.addEventListener("click", () => {
        activeSearchType =
          option.dataset.type ||
          option.textContent.trim() ||
          "Buy";
      });
    });

    document.querySelectorAll(".mobile-search-tabs button").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".mobile-search-tabs button").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        activeSearchType =
          tab.dataset.type ||
          tab.dataset.searchType ||
          tab.textContent.trim() ||
          "Buy";
      });
    });
  }

  function bindSearch() {
    function bindButton(buttonId, inputId) {
      const btn = $(buttonId);
      const input = $(inputId);

      if (!btn || !input) return;

      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        runSearch(inputId);
      }, true);

      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          runSearch(inputId);
        }
      }, true);
    }

    bindButton("search-button", "property-search");
    bindButton("search-btn-main", "main-search-input");
    bindButton("header-search-button", "header-property-search");

    const mobileInput = $("mobile-search-input");
    if (mobileInput) {
      mobileInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          runSearch("mobile-search-input");
        }
      }, true);
    }

    document
      .querySelector(".mobile-search-input-box button:first-child")
      ?.addEventListener("click", function (event) {
        event.preventDefault();
        runSearch("mobile-search-input");
      }, true);
  }

  function init() {
    bindTabs();
    bindSearch();
    console.log("GP smart search loaded");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
