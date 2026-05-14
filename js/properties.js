/* =========================================================
   Guntur Properties - Properties Listing Page
   Supabase-only cards. No fake property cards.
   ========================================================= */

window.GP_PROPERTIES = {
  state: {
    rows: [],
    filtered: [],
    view: "grid",
    params: {}
  },

  getImage(property) {
    const imgs = property.property_images || [];
    return (
      imgs.find((item) => item.is_main)?.image_url ||
      imgs[0]?.image_url ||
      property.image_url ||
      property.main_image_url ||
      "https://placehold.co/800x520/f3f4f6/735c00?text=Guntur+Properties"
    );
  },

  card(property) {
    const url = window.GP_UTILS.propertyDetailsUrl(property);

    return `
      <article class="property-card bg-white rounded-3xl overflow-hidden border border-[#d0c5af]/40 shadow-sm" data-link="${url}">
        <div class="relative h-52 overflow-hidden">
          <img src="${this.getImage(property)}" class="w-full h-full object-cover" alt="${property.title || "Property"}" loading="lazy">
          <span class="absolute top-3 left-3 bg-white/95 px-3 py-1 rounded-full text-[10px] font-extrabold text-[#735c00] uppercase">
            ${window.GP_UTILS.titleCase(property.property_type || "Property")}
          </span>
        </div>

        <div class="p-5">
          <div class="flex justify-between gap-3">
            <div>
              <h3 class="text-lg font-extrabold">${property.title || "Untitled Property"}</h3>
              <p class="text-sm text-[#7f7663] mt-1">${property.location || ""}, ${property.district || "Guntur"}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-[10px] text-[#7f7663] font-bold">PRICE</p>
              <p class="font-extrabold text-[#735c00]">${window.GP_UTILS.formatPrice(property.price)}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 py-4 my-4 border-y border-[#d0c5af]/30 text-center">
            <div><p class="text-[10px] text-[#7f7663] font-bold">BHK</p><p class="font-extrabold text-sm">${property.bedrooms || "N/A"}</p></div>
            <div><p class="text-[10px] text-[#7f7663] font-bold">AREA</p><p class="font-extrabold text-sm">${property.area_sqft ? property.area_sqft + " sqft" : "N/A"}</p></div>
            <div><p class="text-[10px] text-[#7f7663] font-bold">STATUS</p><p class="font-extrabold text-sm text-[#735c00]">${property.listing_status || "available"}</p></div>
          </div>

          <button class="details-btn btn-gold w-full py-3 rounded-xl font-extrabold">Details</button>
        </div>
      </article>
    `;
  },

  render() {
    const grid = document.getElementById("property-grid");
    const empty = document.getElementById("empty-state");
    const loading = document.getElementById("loading-state");
    const notConnected = document.getElementById("not-connected-state");
    const heading = document.getElementById("results-heading");
    const subtitle = document.getElementById("results-subtitle");

    if (!grid) return;

    loading?.classList.add("hidden");

    if (!window.GP_SUPABASE?.isConfigured()) {
      notConnected?.classList.remove("hidden");
      grid.classList.add("hidden");
      if (heading) heading.textContent = "0 Properties";
      if (subtitle) subtitle.textContent = "No property listings are available right now.";
      return;
    }

    const rows = this.state.filtered;

    if (heading) heading.textContent = rows.length + " Properties";
    if (subtitle) subtitle.textContent = "Approved Supabase property listings";

    if (!rows.length) {
      grid.classList.add("hidden");
      empty?.classList.remove("hidden");
      return;
    }

    empty?.classList.add("hidden");
    notConnected?.classList.add("hidden");
    grid.classList.remove("hidden");
    grid.innerHTML = rows.map((item) => this.card(item)).join("");

    grid.querySelectorAll(".property-card").forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("button,a")) return;
        window.location.href = card.dataset.link;
      });
    });

    grid.querySelectorAll(".details-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href = button.closest(".property-card").dataset.link;
      });
    });
  },

  async init() {
    const loading = document.getElementById("loading-state");
    loading?.classList.remove("hidden");

    this.state.params = window.GP_SEARCH?.readParams() || {};

    if (!window.GP_SUPABASE?.isConfigured()) {
      this.render();
      return;
    }

    try {
      this.state.rows = await window.GP_API.getApprovedProperties({ limit: 200 });
      this.state.filtered = window.GP_SEARCH.filterProperties(this.state.rows, this.state.params);

      window.GP_ANALYTICS?.trackSearch({
        keyword: this.state.params.q,
        location: this.state.params.location,
        property_type: this.state.params.type,
        budget: this.state.params.budget
      });

      this.render();
    } catch (error) {
      window.GP_ERROR_LOGGER?.log(error, "properties.js");
      window.GP_TOAST?.error("Unable to load properties.");
      loading?.classList.add("hidden");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("property-grid")) {
    window.GP_PROPERTIES.init();
  }
});
