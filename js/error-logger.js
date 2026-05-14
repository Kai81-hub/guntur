/* =========================================================
   Guntur Properties - Error Logger
   Saves errors to Supabase error_logs when connected.
   ========================================================= */

window.GP_ERROR_LOGGER = {
  async log(error, source = "client") {
    const message = error?.message || String(error);
    console.error(`[${source}]`, error);

    try {
      if (!window.GP_SUPABASE?.isConfigured()) return;

      await window.GP_SUPABASE.insert(window.GP_CONFIG.TABLES.errorLogs, {
        source,
        message,
        stack: error?.stack || "",
        page_url: location.href,
        user_agent: navigator.userAgent
      });
    } catch (logError) {
      console.warn("Error log save failed:", logError);
    }
  },

  init() {
    window.addEventListener("error", (event) => {
      this.log(event.error || event.message, "window.error");
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.log(event.reason, "unhandledrejection");
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_ERROR_LOGGER.init();
});
