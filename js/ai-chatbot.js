/* =========================================================
   Guntur Properties - AI Chatbot Placeholder
   Safe frontend placeholder. Connect backend/Edge Function later.
   ========================================================= */

window.GP_AI_CHATBOT = {
  quickReplies: [
    "Show properties for sale",
    "Show rental properties",
    "How to post property?",
    "Need plumbing service",
    "Contact staff"
  ],

  createWidget() {
    if (document.getElementById("gp-ai-chatbot")) return;

    const wrap = document.createElement("div");
    wrap.id = "gp-ai-chatbot";
    wrap.innerHTML = `
      <button id="gp-ai-toggle" style="
        position:fixed;right:22px;bottom:92px;z-index:9000;width:58px;height:58px;border-radius:999px;
        border:0;background:#d4af37;color:white;box-shadow:0 18px 40px rgba(15,23,42,.18);
        display:flex;align-items:center;justify-content:center;font-weight:900;">
        AI
      </button>

      <section id="gp-ai-window" style="
        display:none;position:fixed;right:22px;bottom:160px;z-index:9000;width:min(360px,calc(100vw - 32px));
        background:white;border:1px solid rgba(208,197,175,.55);border-radius:24px;overflow:hidden;
        box-shadow:0 24px 70px rgba(15,23,42,.18);font-family:Manrope,system-ui,sans-serif;">
        <div style="background:#151c27;color:white;padding:16px 18px;">
          <strong>Guntur Properties Assistant</strong>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.72);font-size:13px">Ask about properties or services.</p>
        </div>
        <div id="gp-ai-messages" style="height:250px;overflow:auto;padding:14px;display:grid;gap:10px;background:#f9f9ff"></div>
        <div style="padding:12px;border-top:1px solid #eee;display:flex;gap:8px">
          <input id="gp-ai-input" placeholder="Type your question..." style="flex:1;border:1px solid #d0c5af;border-radius:14px;padding:10px;outline:none">
          <button id="gp-ai-send" style="background:#d4af37;color:white;border:0;border-radius:14px;padding:0 14px;font-weight:900">Send</button>
        </div>
      </section>
    `;

    document.body.appendChild(wrap);

    const toggle = document.getElementById("gp-ai-toggle");
    const win = document.getElementById("gp-ai-window");

    toggle.addEventListener("click", () => {
      win.style.display = win.style.display === "none" ? "block" : "none";
    });

    document.getElementById("gp-ai-send").addEventListener("click", () => this.send());
    document.getElementById("gp-ai-input").addEventListener("keydown", (event) => {
      if (event.key === "Enter") this.send();
    });

    this.bot("Hi! I can help you find properties, services, or contact staff.");
    this.quickReplies.forEach((reply) => this.quick(reply));
  },

  add(text, from = "bot") {
    const box = document.getElementById("gp-ai-messages");
    if (!box) return;

    const item = document.createElement("div");
    item.style.cssText = `
      justify-self:${from === "user" ? "end" : "start"};
      max-width:85%;
      padding:10px 12px;
      border-radius:15px;
      font-size:13px;
      line-height:1.45;
      background:${from === "user" ? "#d4af37" : "#ffffff"};
      color:${from === "user" ? "#ffffff" : "#151c27"};
      border:1px solid rgba(208,197,175,.35);
    `;
    item.textContent = text;
    box.appendChild(item);
    box.scrollTop = box.scrollHeight;
  },

  bot(text) {
    this.add(text, "bot");
  },

  quick(text) {
    const box = document.getElementById("gp-ai-messages");
    const button = document.createElement("button");
    button.textContent = text;
    button.style.cssText = "justify-self:start;border:1px solid #d0c5af;background:white;border-radius:999px;padding:8px 11px;font-weight:800;color:#735c00";
    button.addEventListener("click", () => this.answer(text));
    box.appendChild(button);
  },

  async send() {
    const input = document.getElementById("gp-ai-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    this.answer(text);
  },

  async answer(text) {
    this.add(text, "user");

    const lower = text.toLowerCase();

    if (lower.includes("rent")) {
      this.bot("You can view rentals here: properties.html?purpose=rent");
    } else if (lower.includes("sale") || lower.includes("buy")) {
      this.bot("You can view properties for sale here: properties.html?purpose=buy");
    } else if (lower.includes("service") || lower.includes("plumbing") || lower.includes("electrician")) {
      this.bot("You can open the service hub here: services.html");
    } else if (lower.includes("post")) {
      this.bot("Owners, brokers and developers can register first, then post properties from their panel.");
    } else {
      this.bot("I can help with property search, rentals, posting property, services, and staff contact. Full AI answers can be connected later using a Supabase Edge Function.");
    }
  },

  init() {
    if (document.body.dataset.aiChatbot === "off") return;
    this.createWidget();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_AI_CHATBOT.init();
});
