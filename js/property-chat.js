/* =========================================================
   Guntur Properties - Property Chat
   Saves to property_chats and property_chat_messages.
   ========================================================= */

window.GP_PROPERTY_CHAT = {
  currentProperty: null,

  setProperty(property) {
    this.currentProperty = property;
  },

  async submit(form, property = this.currentProperty) {
    const status = form.querySelector("[data-chat-status]") || document.getElementById("chat-status");
    const data = Object.fromEntries(new FormData(form).entries());

    if (!property?.id) {
      if (status) status.textContent = "Property is not loaded.";
      return;
    }

    const phone = window.GP_VALIDATION.phone(data.phone || data.visitor_phone);
    if (!phone) {
      if (status) status.textContent = "Enter a valid phone number.";
      return;
    }

    if (status) status.textContent = "Sending message...";

    try {
      await window.GP_API.createPropertyChat({
        property_id: property.id,
        property_owner_id: property.user_id || null,
        visitor_name: data.name || data.visitor_name,
        visitor_phone: phone,
        message: data.message || data.inquiry_message || "I am interested in this property."
      });

      if (status) status.textContent = "Message sent successfully.";
      form.reset();
    } catch (error) {
      if (status) status.textContent = error.message || "Unable to send message.";
      window.GP_ERROR_LOGGER?.log(error, "property-chat.js");
    }
  },

  bindForms() {
    document.querySelectorAll("[data-property-chat-form], #chat-form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submit(form);
      });
    });
  },

  bindFloatingChat() {
    const toggle = document.getElementById("chat-toggle");
    const chat = document.getElementById("chat-window") || document.getElementById("property-chat-panel");
    const close = document.getElementById("close-floating-chat") || document.getElementById("close-chat-btn");

    toggle?.addEventListener("click", () => chat?.classList.toggle("active"));
    close?.addEventListener("click", () => chat?.classList.remove("active"));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") chat?.classList.remove("active");
    });
  },

  init() {
    this.bindForms();
    this.bindFloatingChat();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_PROPERTY_CHAT.init();
});
