/* =========================================================
   Guntur Properties - Network Status
   ========================================================= */

window.GP_NETWORK = {
  banner: null,

  init() {
    this.banner = document.createElement("div");
    this.banner.id = "gp-network-banner";
    this.banner.style.cssText = `
      position: fixed;
      left: 50%;
      bottom: 84px;
      transform: translateX(-50%);
      z-index: 9999;
      background: #151c27;
      color: white;
      padding: 10px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 12px 28px rgba(15,23,42,.22);
      display: none;
    `;
    document.body.appendChild(this.banner);

    window.addEventListener("online", () => this.show("Back online", "online"));
    window.addEventListener("offline", () => this.show("You are offline", "offline"));

    if (!navigator.onLine) this.show("You are offline", "offline");
  },

  show(message, type) {
    if (!this.banner) return;

    this.banner.textContent = message;
    this.banner.style.display = "block";
    this.banner.style.background = type === "online" ? "#166534" : "#151c27";

    if (type === "online") {
      setTimeout(() => {
        this.banner.style.display = "none";
      }, 2500);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_NETWORK.init();
});
