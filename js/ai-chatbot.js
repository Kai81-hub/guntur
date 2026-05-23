/* Guntur Properties - Real Estate Chatbot */

window.GP_AI_CHATBOT = {
  quickReplies: [
    "2BHK flats in Brodipet",
    "Plots in Guntur",
    "Rental houses",
    "Commercial shops",
    "Need plumber",
    "Need electrician",
    "How to post property?",
    "How to login?"
  ],

  init() {
    if (document.getElementById("gp-ai-chatbot")) return;

    const wrap = document.createElement("div");
    wrap.id = "gp-ai-chatbot";

    wrap.innerHTML = `
      <section id="gp-ai-window">
        <div class="gp-ai-head">
          <div>
            <strong>Ask Guntur Properties</strong>
            <p>Ask real estate questions, search properties, or open services.</p>
          </div>
          <button id="gp-ai-close" type="button">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div id="gp-ai-messages"></div>

        <div class="gp-ai-input-row">
          <input id="gp-ai-input" placeholder='Ask "2BHK in Brodipet"' />
          <button id="gp-ai-send" type="button">
            <span class="material-symbols-outlined">send</span>
          </button>
        </div>
      </section>
    `;

    document.body.appendChild(wrap);
    this.addStyles();

    const oldMessageBtn = document.getElementById("chat-toggle");
const oldChatWindow = document.getElementById("chat-window");
const aiWindow = document.getElementById("gp-ai-window");

if (oldChatWindow) {
  oldChatWindow.remove();
}

oldMessageBtn?.addEventListener("click", function () {
  aiWindow.classList.toggle("active");
});

    document.getElementById("gp-ai-close").onclick = () => {
      document.getElementById("gp-ai-window").classList.remove("active");
    };

    document.getElementById("gp-ai-send").onclick = () => this.send();

    document.getElementById("gp-ai-input").addEventListener("keydown", e => {
      if (e.key === "Enter") this.send();
    });

    this.bot("Hi! Ask me about flats, houses, plots, rentals, commercial properties, services, posting property, login/register, or staff contact.");

    this.quickReplies.forEach(text => this.quick(text));
  },

  addStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      #gp-ai-toggle {
  position: fixed;
  right: 22px;
  bottom: 92px;
  z-index: 9000;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  border: 0;
  background: #0f4c81;
  color: #fff;
  box-shadow: 0 18px 40px rgba(15,23,42,.22);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

#gp-ai-toggle .material-symbols-outlined {
  font-size: 30px;
}

      #gp-ai-window {
  display: none;
  position: fixed;
  right: 24px;
  bottom: 104px;
        z-index: 9000;
        width: 360px;
        max-width: calc(100vw - 48px);
        background: #fff;
        border: 1px solid #cbd5e1;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 24px 70px rgba(15,23,42,.22);
        font-family: Manrope, sans-serif;
      }

      #gp-ai-window.active {
        display: block;
      }

      .gp-ai-head {
        background: linear-gradient(135deg, #082f5f, #0f4c81);
        color: #fff;
        padding: 16px 18px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }

      .gp-ai-head strong {
        font-size: 16px;
        font-weight: 900;
      }

      .gp-ai-head p {
        margin: 4px 0 0;
        color: rgba(255,255,255,.78);
        font-size: 13px;
        font-weight: 600;
      }

      #gp-ai-close {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 0;
        background: rgba(255,255,255,.12);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      #gp-ai-messages {
        height: 230px;
        overflow: auto;
        padding: 14px;
        display: grid;
        gap: 10px;
        background: #f9fbff;
      }

      .gp-ai-bubble {
        max-width: 88%;
        padding: 10px 12px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.45;
        font-weight: 700;
        border: 1px solid #cbd5e1;
        white-space: pre-line;
      }

      .gp-ai-bot {
        justify-self: start;
        background: #fff;
        color: #151c27;
      }

      .gp-ai-user {
        justify-self: end;
        background: #0f4c81;
        color: #fff;
        border-color: #0f4c81;
      }

      .gp-ai-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .gp-ai-action,
      .gp-ai-quick {
        border: 1px solid rgba(15,76,129,.25);
        background: #fff;
        border-radius: 999px;
        padding: 8px 11px;
        font-weight: 900;
        color: #0f4c81;
        font-size: 12px;
        cursor: pointer;
      }

      .gp-ai-action:hover,
      .gp-ai-quick:hover {
        background: rgba(15,76,129,.08);
      }

      .gp-ai-input-row {
        padding: 12px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }

      #gp-ai-input {
        flex: 1;
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        padding: 11px 12px;
        outline: none;
        font-weight: 700;
        min-width: 0;
      }

      #gp-ai-input:focus {
        border-color: #0f4c81;
        box-shadow: 0 0 0 3px rgba(15,76,129,.12);
      }

      #gp-ai-send {
        width: 46px;
        border: 0;
        border-radius: 14px;
        background: #0f4c81;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      @media(max-width:640px) {
        #gp-ai-toggle {
          right: 18px;
          bottom: 86px;
        }

        #gp-ai-window {
          right: 12px;
          left: 12px;
          width: auto;
          max-width: none;
          bottom: 152px;
        }

        #gp-ai-messages {
          height: 240px;
        }
      }
    `;
    document.head.appendChild(style);
  },

  add(text, type = "bot") {
    const box = document.getElementById("gp-ai-messages");
    const div = document.createElement("div");
    div.className = `gp-ai-bubble ${type === "user" ? "gp-ai-user" : "gp-ai-bot"}`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  },

  bot(text, actions = []) {
    this.add(text, "bot");

    if (actions.length) {
      const box = document.getElementById("gp-ai-messages");
      const row = document.createElement("div");
      row.className = "gp-ai-actions";

      actions.forEach(action => {
        const btn = document.createElement("button");
        btn.className = "gp-ai-action";
        btn.textContent = action.label;
        btn.onclick = () => window.location.href = action.href;
        row.appendChild(btn);
      });

      box.appendChild(row);
      box.scrollTop = box.scrollHeight;
    }
  },

  quick(text) {
    const box = document.getElementById("gp-ai-messages");
    const btn = document.createElement("button");
    btn.className = "gp-ai-quick";
    btn.textContent = text;
    btn.onclick = () => this.answer(text);
    box.appendChild(btn);
  },

  send() {
    const input = document.getElementById("gp-ai-input");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    this.answer(text);
  },

  answer(text) {
    this.add(text, "user");

    const lower = text.toLowerCase();

    if (
      lower.includes("login") ||
      lower.includes("log in") ||
      lower.includes("signin") ||
      lower.includes("sign in") ||
      lower.includes("register") ||
      lower.includes("account") ||
      lower.includes("create account") ||
      lower.includes("forgot password")
    ) {
      this.bot("You can login or create an account here. Owners, brokers, developers and users can access their panel after login.", [
        { label: "Login", href: "login.html" },
        { label: "Register", href: "register.html" },
        { label: "Post Property", href: "post-property.html" }
      ]);
      return;
    }

    if (lower.includes("plumber") || lower.includes("plumbing")) {
      this.bot("Open plumbing service details.", [
        { label: "Open Plumbing", href: "services-details.html?service=plumbing" },
        { label: "Services Hub", href: "services.html" }
      ]);
      return;
    }

    if (lower.includes("electrician") || lower.includes("electrical")) {
      this.bot("Open electrician service details.", [
        { label: "Open Electrician", href: "services-details.html?service=electrician" },
        { label: "Services Hub", href: "services.html" }
      ]);
      return;
    }

    if (lower.includes("paint") || lower.includes("painting")) {
      this.bot("Open painting service details.", [
        { label: "Open Painting", href: "services-details.html?service=painting" },
        { label: "Services Hub", href: "services.html" }
      ]);
      return;
    }

    if (
      lower.includes("post") ||
      lower.includes("list property") ||
      lower.includes("sell my property") ||
      lower.includes("upload property")
    ) {
      this.bot("You can post your property here. Owners, brokers and developers can list properties directly.", [
        { label: "Post Property", href: "post-property.html" },
        { label: "Register", href: "register.html" }
      ]);
      return;
    }

    if (
      lower.includes("contact") ||
      lower.includes("staff") ||
      lower.includes("support") ||
      lower.includes("call") ||
      lower.includes("phone") ||
      lower.includes("whatsapp")
    ) {
      this.bot("You can contact staff here.", [
        { label: "Contact Staff", href: "contact.html" },
        { label: "Call", href: "tel:+918500720404" },
        { label: "WhatsApp", href: "https://wa.me/918500720404" }
      ]);
      return;
    }

    let purpose = "";
    let type = "";

    if (
      lower.includes("rent") ||
      lower.includes("rental") ||
      lower.includes("lease")
    ) {
      purpose = "rent";
    }

    if (
      lower.includes("buy") ||
      lower.includes("sale") ||
      lower.includes("purchase") ||
      lower.includes("for sale")
    ) {
      purpose = "buy";
    }

    if (
      lower.includes("plot") ||
      lower.includes("land") ||
      lower.includes("venture")
    ) {
      type = "plots";
      if (!purpose) purpose = "buy";
    } else if (
      lower.includes("commercial") ||
      lower.includes("shop") ||
      lower.includes("office") ||
      lower.includes("warehouse")
    ) {
      type = "commercial";
      if (!purpose) purpose = "buy";
    } else if (lower.includes("villa")) {
      type = "villas";
      if (!purpose) purpose = "buy";
    } else if (
      lower.includes("flat") ||
      lower.includes("apartment") ||
      lower.includes("bhk")
    ) {
      type = "flats";
      if (!purpose) purpose = "buy";
    } else if (
      lower.includes("house") ||
      lower.includes("home")
    ) {
      type = "houses";
      if (!purpose) purpose = "buy";
    }

    const areas = [
      "guntur",
      "brodipet",
      "pattabhipuram",
      "lakshmipuram",
      "arundelpet",
      "gorantla",
      "tenali",
      "vijayawada",
      "mangalagiri",
      "amaravati road"
    ];

    const area = areas.find(a => lower.includes(a)) || "";

    if (
      purpose ||
      type ||
      area ||
      lower.includes("property") ||
      lower.includes("properties")
    ) {
      const params = new URLSearchParams();

      params.set("q", text);
      if (purpose) params.set("purpose", purpose);
      if (type) params.set("type", type);
      if (area) params.set("location", area);

      this.bot("I found this as a property search.", [
        { label: "Open Property Search", href: "properties.html?" + params.toString() },
        { label: "Post Property", href: "post-property.html" }
      ]);
      return;
    }

    this.bot("I can help with property search, rentals, plots, commercial properties, services, posting property, login/register, and staff contact.", [
      { label: "Buy Properties", href: "properties.html?purpose=buy" },
      { label: "Rent Properties", href: "properties.html?purpose=rent" },
      { label: "Services", href: "services.html" },
      { label: "Login", href: "login.html" },
      { label: "Contact", href: "contact.html" }
    ]);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_AI_CHATBOT.init();
});
