/* =========================================================
   Guntur Properties - Visitor / Search Analytics
   Staff can view searches, property views and leads later.
   ========================================================= */

window.GP_ANALYTICS = {
  getSessionId() {
    let id = localStorage.getItem("gp_session_id");
    if (!id) {
      id = "gp_" + Date.now() + "_" + Math.random().toString(16).slice(2);
      localStorage.setItem("gp_session_id", id);
    }
    return id;
  },

  async trackSearch(payload = {}) {
    try {
      if (!window.GP_SUPABASE?.isConfigured()) return;

      await window.GP_SUPABASE.insert(window.GP_CONFIG.TABLES.searchAnalytics, {
        session_id: this.getSessionId(),
        keyword: payload.keyword || "",
        location: payload.location || "",
        property_type: payload.property_type || "",
        budget: payload.budget || "",
        page_url: location.href
      });
    } catch (error) {
      console.warn("Search analytics failed:", error);
    }
  },

  async trackEvent(eventName, payload = {}) {
    try {
      if (!window.GP_SUPABASE?.isConfigured()) return;

      await window.GP_SUPABASE.insert("visitor_events", {
        session_id: this.getSessionId(),
        event_name: eventName,
        payload,
        page_url: location.href
      });
    } catch (error) {
      console.warn("Event analytics failed:", error);
    }
  }
};
