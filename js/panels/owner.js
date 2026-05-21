/* Guntur Properties - Owner Profile Panel
   Frontend-only Supabase saved-message chat.
   Requires before this file: config.js, supabase.js
*/

const $ = (id) => document.getElementById(id);

function getPhone() {
  return String(
    localStorage.getItem("gp_auth_phone") ||
    localStorage.getItem("gp_phone") ||
    ""
  )
    .replace(/\D/g, "")
    .slice(-10);
}

function getRole() {
  return String(
    localStorage.getItem("gp_auth_role") ||
    localStorage.getItem("gp_role") ||
    "owner"
  ).toLowerCase();
}

function logout() {
  ["gp_auth_phone", "gp_auth_role", "gp_phone", "gp_role", "gp_user"].forEach((key) => {
    localStorage.removeItem(key);
  });

  location.href = "login.html";
}

function money(value) {
  if (!value && value !== 0) return "-";

  const n = Number(value);
  if (Number.isNaN(n)) return value;

  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + " L";

  return "₹" + n.toLocaleString("en-IN");
}

function dateIN(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}

function titleCase(value) {
  return String(value || "-")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

function dbClient() {
  if (window.GP_SUPABASE?.createClient) {
    return window.GP_SUPABASE.createClient();
  }

  if (window.supabase && window.GP_CONFIG?.SUPABASE_URL) {
    return window.supabase.createClient(
      window.GP_CONFIG.SUPABASE_URL,
      window.GP_CONFIG.SUPABASE_ANON_KEY
    );
  }

  return null;
}

async function fetchRows(table, options = {}) {
  const db = dbClient();
  if (!db) return [];

  let query = db.from(table).select(options.select || "*");

  if (options.eq) {
    Object.entries(options.eq).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options.in) {
    Object.entries(options.in).forEach(([key, value]) => {
      query = query.in(key, value);
    });
  }

  if (options.or) {
    query = query.or(options.or);
  }

  if (options.order) {
    query = query.order(options.order, { ascending: false });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(table, error.message);
    return [];
  }

  return data || [];
}

let ownerProperties = [];
let ownerLeads = [];
let activeChatId = "";
let activePropertyId = "";

function openSidebar() {
  document.querySelector(".sidebar")?.classList.add("open");
  document.body.classList.add("sidebar-open");
}

function closeSidebar() {
  document.querySelector(".sidebar")?.classList.remove("open");
  document.body.classList.remove("sidebar-open");
}

function openChatModal() {
  $("owner-chat-modal")?.classList.remove("hidden");
}

function closeChatModal() {
  $("owner-chat-modal")?.classList.add("hidden");
}

function bindCommon() {
  $("logout-btn")?.addEventListener("click", logout);
  $("mobile-menu-btn")?.addEventListener("click", openSidebar);
  $("close-sidebar-btn")?.addEventListener("click", closeSidebar);

  $("close-owner-chat")?.addEventListener("click", closeChatModal);
  $("owner-chat-backdrop")?.addEventListener("click", closeChatModal);
  $("owner-chat-form")?.addEventListener("submit", sendOwnerMessage);

  document.querySelectorAll(".sidebar-link, .mobile-bottom-item").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });
}

function checkAccess() {
  const phone = getPhone();
  const role = getRole();

  if (!phone) {
    location.href = "login.html?next=owner-panel.html";
    return false;
  }

  if (!["owner", "admin"].includes(role)) {
    document.body.innerHTML = `
      <div style="font-family:Manrope,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9f9ff;padding:20px">
        <div style="max-width:520px;background:white;border:1px solid #d0c5af;border-radius:28px;padding:34px;text-align:center;box-shadow:0 15px 45px rgba(15,23,42,.08)">
          <h1 style="margin:0 0 10px;color:#151c27">Access Denied</h1>
          <p style="color:#476080">Only owner accounts can open this panel.</p>
          <a href="index.html" style="display:inline-flex;margin-top:18px;background:#d4af37;color:#151c27;text-decoration:none;padding:12px 18px;border-radius:14px;font-weight:800">Go Home</a>
        </div>
      </div>
    `;
    return false;
  }

  if ($("auth-phone")) {
    $("auth-phone").textContent = "+91 " + phone;
  }

  if ($("auth-role")) {
    $("auth-role").textContent = "Role: " + role.toUpperCase();
  }

  return true;
}

async function loadProfile(phone) {
  const profiles = await fetchRows("profiles", {
    eq: { phone },
    limit: 1
  });

  const profile = profiles[0] || {};

  const name = profile.full_name || profile.name || "Guntur Properties Owner";
  const photo = profile.photo_url || profile.profile_photo || profile.avatar_url;
  const role = profile.role || getRole();

  if ($("profile-name")) {
    $("profile-name").textContent = name;
  }

  if ($("profile-meta")) {
    $("profile-meta").textContent = `+91 ${phone} • ${String(role).toUpperCase()} profile`;
  }

  if (photo && $("profile-photo")) {
    $("profile-photo").src = photo;
  }

  if ($("auth-role")) {
    $("auth-role").textContent = "Role: " + String(role).toUpperCase();
  }

  localStorage.setItem("gp_auth_role", role);
  localStorage.setItem("gp_role", role);
}

async function loadOwnerProperties(phone) {
  const db = dbClient();

  if (!db) {
    ownerProperties = [];
    return ownerProperties;
  }

  const { data, error } = await db
    .from("properties")
    .select("*")
    .or(`posted_by_phone.eq.${phone},user_phone.eq.${phone},owner_phone.eq.${phone},contact_phone.eq.${phone}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.warn("Owner properties failed:", error.message);
    ownerProperties = [];
  } else {
    ownerProperties = data || [];
  }

  if ($("stat-properties")) {
    $("stat-properties").textContent = ownerProperties.length;
  }

  if ($("stat-remaining")) {
    $("stat-remaining").textContent = Math.max(2 - ownerProperties.length, 0);
  }

  if ($("stat-status")) {
    $("stat-status").textContent = ownerProperties.length ? "Active" : "New";
  }

  if ($("my-properties-body")) {
    $("my-properties-body").innerHTML = ownerProperties.length
      ? ownerProperties.map((property) => `
          <tr>
            <td>${property.title || property.property_title || "-"}</td>
            <td>${titleCase(property.property_type || "-")}</td>
            <td>${property.price_label || money(property.price)}</td>
            <td>
              <span class="status ${property.status || property.approval_status || "active"}">
                ${property.status || property.approval_status || "active"}
              </span>
            </td>
            <td>${dateIN(property.created_at)}</td>
            <td>
              <a class="font-black text-[#735c00]" href="property-details.html?id=${encodeURIComponent(property.id)}">
                Open
              </a>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="6">No owner properties yet.</td></tr>`;
  }

  return ownerProperties;
}

async function loadOwnerLeads() {
  const propertyIds = ownerProperties
    .map((property) => property.id)
    .filter(Boolean);

  if (!propertyIds.length) {
    ownerLeads = [];
  } else {
    ownerLeads = await fetchRows("property_chats", {
      in: { property_id: propertyIds },
      order: "created_at",
      limit: 100
    });
  }

  if ($("stat-leads")) {
    $("stat-leads").textContent = ownerLeads.length;
  }

  if ($("stat-chats")) {
    $("stat-chats").textContent = ownerLeads.length;
  }

  if ($("leads-body")) {
    $("leads-body").innerHTML = ownerLeads.length
      ? ownerLeads.map((lead) => `
          <tr>
            <td>${lead.visitor_name || lead.user_name || "-"}</td>
            <td>${lead.visitor_phone || lead.user_phone || "-"}</td>
            <td>${lead.property_id || "-"}</td>
            <td>
              <span class="status ${lead.lead_status || "new"}">
                ${lead.lead_status || "new"}
              </span>
            </td>
            <td>
              <button
                type="button"
                class="font-black text-[#735c00] open-owner-chat-btn"
                data-chat-id="${lead.id}"
                data-property-id="${lead.property_id || ""}"
              >
                Open Chat
              </button>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="5">No leads yet.</td></tr>`;
  }

  if ($("owner-chats-list")) {
    $("owner-chats-list").innerHTML = ownerLeads.length
      ? ownerLeads.map((lead) => `
          <button
            type="button"
            class="open-owner-chat-btn rounded-2xl border border-[#d0c5af]/50 p-4 flex items-center justify-between gap-3 hover:bg-[#fff8dc] transition text-left"
            data-chat-id="${lead.id}"
            data-property-id="${lead.property_id || ""}"
          >
            <div>
              <p class="font-black">Property Chat</p>
              <p class="text-sm text-[#476080] font-semibold">
                User: ${lead.visitor_name || lead.visitor_phone || "Lead"}
              </p>
              <p class="text-xs text-[#7f7663] font-bold">
                Property ID: ${lead.property_id || "-"}
              </p>
            </div>
            <span class="status ${lead.lead_status || "new"}">
              ${lead.lead_status || "new"}
            </span>
          </button>
        `).join("")
      : `<p class="text-[#476080] font-semibold">No chats yet.</p>`;
  }

  bindChatButtons();
}

function bindChatButtons() {
  document.querySelectorAll(".open-owner-chat-btn").forEach((button) => {
    button.onclick = async () => {
      activeChatId = button.dataset.chatId;
      activePropertyId = button.dataset.propertyId || "";

      if ($("chat-modal-title")) {
        $("chat-modal-title").textContent = "Property Chat";
      }

      if ($("chat-modal-subtitle")) {
        $("chat-modal-subtitle").textContent = "Property ID: " + (activePropertyId || "-");
      }

      openChatModal();
      await loadChatMessages(activeChatId);
    };
  });
}

function renderChatMessages(messages) {
  const box = $("owner-chat-messages");

  if (!box) return;

  if (!messages.length) {
    box.innerHTML = `<p class="text-sm text-[#476080] font-semibold">No messages yet. Send your first reply.</p>`;
    return;
  }

  box.innerHTML = messages.map((msg) => {
    const role = String(msg.sender_role || "user").toLowerCase();
    const mine = ["owner", "staff", "admin"].includes(role);
    const bubbleClass = mine ? role : "user";

    return `
      <div class="chat-bubble ${bubbleClass}">
        ${String(msg.message || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        <small>${role.toUpperCase()} • ${dateIN(msg.created_at)}</small>
      </div>
    `;
  }).join("");

  box.scrollTop = box.scrollHeight;
}

async function loadChatMessages(chatId) {
  const messages = await fetchRows("property_chat_messages", {
    eq: { chat_id: chatId },
    order: "created_at",
    limit: 100
  });

  renderChatMessages(messages);
}

async function sendOwnerMessage(event) {
  event.preventDefault();

  const input = $("owner-chat-input");
  const message = input?.value?.trim();

  if (!activeChatId) {
    alert("Open a chat first.");
    return;
  }

  if (!message) {
    return;
  }

  const db = dbClient();

  if (!db) {
    alert("Supabase is not connected.");
    return;
  }

  const { error } = await db.from("property_chat_messages").insert({
    chat_id: activeChatId,
    sender_role: "owner",
    message,
    created_at: new Date().toISOString()
  });

  if (error) {
    alert(error.message || "Unable to send message.");
    return;
  }

  input.value = "";
  await loadChatMessages(activeChatId);
}

async function initOwnerPanel() {
  bindCommon();

  if (!checkAccess()) {
    return;
  }

  const phone = getPhone();

  await loadProfile(phone);
  await loadOwnerProperties(phone);
  await loadOwnerLeads();
}

document.addEventListener("DOMContentLoaded", initOwnerPanel);
