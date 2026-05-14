/* =========================================================
   Guntur Properties - Toast Notifications
   ========================================================= */

window.GP_TOAST = {
  container: null,

  init() {
    if (this.container) return;

    this.container = document.createElement("div");
    this.container.id = "gp-toast-container";
    this.container.style.cssText = `
      position: fixed;
      right: 18px;
      top: 90px;
      z-index: 99999;
      display: grid;
      gap: 10px;
      width: min(360px, calc(100vw - 32px));
    `;
    document.body.appendChild(this.container);
  },

  show(message, type = "info", timeout = 3500) {
    this.init();

    const colors = {
      info: ["#dbeafe", "#1d4ed8"],
      success: ["#dcfce7", "#166534"],
      error: ["#fee2e2", "#991b1b"],
      warning: ["#fff7d6", "#8a6500"]
    };

    const [bg, color] = colors[type] || colors.info;

    const item = document.createElement("div");
    item.style.cssText = `
      background: ${bg};
      color: ${color};
      border: 1px solid rgba(15,23,42,.08);
      box-shadow: 0 15px 38px rgba(15,23,42,.12);
      border-radius: 16px;
      padding: 13px 15px;
      font-weight: 800;
      font-family: Manrope, system-ui, sans-serif;
      transform: translateY(-8px);
      opacity: 0;
      transition: .2s;
    `;
    item.textContent = message;

    this.container.appendChild(item);
    requestAnimationFrame(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateY(-8px)";
      setTimeout(() => item.remove(), 220);
    }, timeout);
  },

  success(message) {
    this.show(message, "success");
  },

  error(message) {
    this.show(message, "error");
  },

  warning(message) {
    this.show(message, "warning");
  },

  info(message) {
    this.show(message, "info");
  }
};
