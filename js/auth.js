/* =========================================================
   Guntur Properties - Auth Helpers
   Phone OTP demo + role redirection.
   For production, connect Supabase Edge Function with SMS provider.
   ========================================================= */

window.GP_AUTH = {
  currentOtp: "",
  pendingPhone: "",

  getPhone() {
    return localStorage.getItem("gp_auth_phone") || "";
  },

  getRole() {
    return localStorage.getItem("gp_auth_role") || "user";
  },

  isLoggedIn() {
    return Boolean(this.getPhone());
  },

  setSession(phone, role = "user") {
    localStorage.setItem("gp_auth_phone", phone);
    localStorage.setItem("gp_auth_role", role);
  },

  logout() {
    localStorage.removeItem("gp_auth_phone");
    localStorage.removeItem("gp_auth_role");
    window.location.href = "login.html";
  },

  getPanelUrl(role = this.getRole()) {
    return window.GP_CONFIG.ROLE_PANELS[role] || window.GP_CONFIG.ROLE_PANELS.user;
  },

  redirectToPanel(role = this.getRole()) {
    window.location.href = this.getPanelUrl(role);
  },

  makeOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  async sendOtp(phone, purpose = "login") {
    const clean = window.GP_VALIDATION.phone(phone);
    if (!clean) throw new Error("Enter a valid 10-digit Indian mobile number.");

    this.pendingPhone = clean;
    this.currentOtp = this.makeOtp();

    /*
      Production:
      await window.GP_SUPABASE.createClient().functions.invoke("send-otp", {
        body: { phone: "+91" + clean, otp: this.currentOtp, purpose }
      });
    */

    return this.currentOtp;
  },

  verifyOtp(otp) {
    return String(otp || "").trim() === this.currentOtp;
  },

  async findRoleByPhone(phone) {
    if (!window.GP_SUPABASE?.isConfigured()) return "user";

    try {
      const profile = await window.GP_SUPABASE.single(window.GP_CONFIG.TABLES.profiles, {
        eq: { phone }
      });
      return profile?.role || "user";
    } catch (error) {
      console.warn("Role lookup failed:", error);
      return "user";
    }
  },

  requireRole(allowedRoles = []) {
    if (!this.isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }

    const role = this.getRole();

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      document.body.innerHTML = `
        <div style="font-family:Manrope,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9f9ff;padding:20px">
          <div style="max-width:520px;background:white;border:1px solid #d0c5af;border-radius:28px;padding:34px;text-align:center;box-shadow:0 15px 45px rgba(15,23,42,.08)">
            <h1 style="margin:0 0 10px;color:#151c27">Access Denied</h1>
            <p style="color:#476080">Your role does not have permission to open this panel.</p>
            <a href="index.html" style="display:inline-flex;margin-top:18px;background:#d4af37;color:white;text-decoration:none;padding:12px 18px;border-radius:14px;font-weight:800">Go Home</a>
          </div>
        </div>`;
      return false;
    }

    return true;
  },

  bindProfileLinks() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-profile-link], #profile-link");
      if (!link) return;

      event.preventDefault();

      if (this.isLoggedIn()) {
        this.redirectToPanel();
      } else {
        window.location.href = "login.html";
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_AUTH.bindProfileLinks();
});
