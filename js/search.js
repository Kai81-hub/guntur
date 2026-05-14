/* =========================================================
   Guntur Properties - Search Page Helpers
   ========================================================= */

window.GP_SEARCH = {
  readParams() {
    const params = new URLSearchParams(location.search);
    return {
      q: params.get("q") || params.get("search") || "",
      location: params.get("location") || params.get("area") || "",
      purpose: params.get("purpose") || "",
      type: params.get("type") || params.get("property_type") || "all",
      budget: params.get("budget") || "all"
    };
  },

  filterProperties(properties, state) {
    let rows = [...properties];

    if (state.location) {
      const q = state.location.toLowerCase();
      rows = rows.filter((p) =>
        String(p.location || "").toLowerCase().includes(q) ||
        String(p.district || "").toLowerCase().includes(q)
      );
    }

    if (state.q) {
      const q = state.q.toLowerCase();
      rows = rows.filter((p) =>
        String(p.title || "").toLowerCase().includes(q) ||
        String(p.location || "").toLowerCase().includes(q) ||
        String(p.property_type || "").toLowerCase().includes(q)
      );
    }

    if (state.type && state.type !== "all") {
      rows = rows.filter((p) =>
        String(p.property_type || "").toLowerCase().includes(String(state.type).toLowerCase())
      );
    }

    if (state.purpose) {
      rows = rows.filter((p) =>
        String(p.listing_type || "").toLowerCase() === String(state.purpose).toLowerCase()
      );
    }

    return rows;
  }
};
