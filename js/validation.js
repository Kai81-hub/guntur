/* =========================================================
   Guntur Properties - Validation Helpers
   ========================================================= */

window.GP_VALIDATION = {
  phone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
    if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) {
      return digits.slice(2);
    }
    return "";
  },

  email(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  },

  required(value) {
    return String(value || "").trim().length > 0;
  },

  otp(value) {
    return /^\d{6}$/.test(String(value || "").trim());
  },

  price(value) {
    if (!value) return true;
    return !Number.isNaN(Number(value));
  },

  showFieldError(input, message) {
    if (!input) return;
    input.classList.add("border-red-500");

    let error = input.parentElement.querySelector(".field-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "field-error text-xs text-red-600 font-bold mt-1";
      input.parentElement.appendChild(error);
    }

    error.textContent = message;
  },

  clearFieldError(input) {
    if (!input) return;
    input.classList.remove("border-red-500");
    const error = input.parentElement.querySelector(".field-error");
    if (error) error.remove();
  }
};
