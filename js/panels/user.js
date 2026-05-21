/* Guntur Properties - User/Profile Panel
   Loads profile, saved properties, inquiries, chats.
   Requires: config.js, supabase.js
*/

const $ = (id) => document.getElementById(id);

const tbl = () => window.GP_CONFIG?.TABLES || {};
const toast = (m, t = "info") => window.GP_TOAST?.[t]?.(m) || console.log(m);

function getPhone() {
  return String(
    window.GP_AUTH?.getPhone?.() ||
    localStorage.getItem("gp_auth_phone") ||
    localStorage.getItem("gp_phone") ||
    ""
  ).replace(/\D/g, "").slice(-10);
}

function getRole() {
  return (
    localStorage.getItem("gp_auth_role") ||
    localStorage.getItem("gp_role") ||
    "user"
  );
}

function logout() {
  if (window.GP_AUTH?.logout) {
    window.GP_AUTH.logout();
    return;
  }

  ["gp_auth_phone", "gp_auth_role", "gp_phone", "gp_role", "gp_user"].forEach((key) => {
    localStorage.removeItem(key);
  });

  location.href = "login.html";
}

function money(value) {
  if (!value && value !== 0) return "Price on request";

  const n = Number(value);
  if (Number.isNaN(n)) return value;

  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + " L";

  return "₹" + n.toLocaleString("en-IN");
}

function dateIN(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}

function mustConnect() {
  if (!window.GP_SUPABASE?.isConfigured?.()) {
    toast("Connect Supabase in js/config.js to load data.", "warning");
    return false;
  }

  return true;
}

async function rows(table, options = {}) {
  return window.GP_SUPABASE.select(table, options);
}

function propertyImage(property) {
  if (property.main_image) return property.main_image;
  if (property.image_url) return property.image_url;

  if (Array.isArray(property.image_urls) && property.image_urls[0]) {
    return property.image_urls[0];
  }

  if (Array.isArray(property.images) && property.images[0]) {
    return property.images[0];
  }

  return "https://placehold.co/600x420/f3f4f6/735c00?text=Guntur+Properties";
}

function propertyCard(property) {
  const title = property.title || property.property_title || "Property";
  const location = [property.location, property.district].filter(Boolean).join(", ");
  const img = propertyImage(property);

  return `
    <a href="property-details.html?id=${encodeURIComponent(property.id)}"
       class="rounded-3xl overflow-hidden border border-[#d0c5af]/50 bg-white hover:shadow-xl transition block">
      <img src="${img}" alt="${title}" class="w-full h-40 object-cover">
      <div class="p-4">
        <p class="font-black text-[#151c27] line-clamp-1">${title}</p>
        <p class="text-sm text-[#476080] font-semibold mt-1">${location || "Guntur"}</p>
        <p class="text-[#735c00] font-black mt-2">${property.price_label || money(property.price)}</p>
      </div>
    </a>
  `;
}

async function loadProfile(phone) {
  try {
    const profiles = await rows(tbl().profiles || "profiles", {
      eq: { phone },
      limit: 1
    });

    const profile = Array.isArray(profiles) ? profiles[0] : null;

    const name =
      profile?.full_name ||
      profile?.name ||
      "Guntur Properties User";

    const role = profile?.role || getRole() || "user";
    const photo = profile?.photo_url || profile?.profile_photo || profile?.avatar_url;

    if ($("profile-name")) $("profile-name").textContent = name;
    if ($("profile-meta")) $("profile-meta").textContent = `+91 ${phone} • ${String(role).toUpperCase()} profile`;
    if (photo && $("profile-photo")) $("profile-photo").src = photo;

    localStorage.setItem("gp_auth_role", role);
    localStorage.setItem("gp_role", role);
  } catch (error) {
    console.warn("Profile load failed:", error);
  }
}

async function loadSaved(phone) {
  const saved = await rows("saved_properties", {
    eq: { user_phone: phone },
    order: "created_at",
    limit: 50
  });

  if ($("stat-saved")) $("stat-saved").textContent = saved.length;
  if ($("stat-fav")) $("stat-fav").textContent = saved.length;

  if (!saved.length) {
    if ($("saved-list")) {
      $("saved-list").innerHTML = `<p class="text-[#476080] font-semibold">No saved properties yet.</p>`;
    }
    return;
  }

  const ids = saved.map((item) => item.property_id).filter(Boolean);

  const client = window.GP_SUPABASE.createClient();
  const { data, error } = await client
    .from("properties")
    .select("*")
    .in("id", ids)
    .limit(50);

  if (error) {
    console.warn("Saved property details failed:", error);
    if ($("saved-list")) {
      $("saved-list").innerHTML = `<p class="text-[#476080] font-semibold">${saved.length} saved item(s), but property details could not load.</p>`;
    }
    return;
  }

  if ($("saved-list")) {
    $("saved-list").innerHTML = data?.length
      ? data.map(propertyCard).join("")
      : `<p class="text-[#476080] font-semibold">${saved.length} saved item(s). Property details will show after IDs match.</p>`;
  }
}

let activeChatId = "";
let activeChatPropertyId = "";

async function loadInquiries(phone) {
  const inquiries = await rows(tbl().propertyChats || "property_chats", {
    eq: { visitor_phone: phone },
    order: "created_at",
    limit: 100
  });

  if ($("stat-inquiries")) $("stat-inquiries").textContent = inquiries.length;
  if ($("stat-chats")) $("stat-chats").textContent = inquiries.length;

  if ($("inquiries-body")) {
    $("inquiries-body").innerHTML = inquiries.length
      ? inquiries.map((item) => `
          <tr>
            <td>${item.property_id || "-"}</td>
            <td><span class="status ${item.lead_status || "new"}">${item.lead_status || "new"}</span></td>
            <td>${dateIN(item.created_at)}</td>
            <td>
              <button
                type="button"
                class="font-black text-[#735c00] open-user-chat-btn"
                data-chat-id="${item.id}"
                data-property-id="${item.property_id || ""}"
              >
                Open Chat
              </button>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="4">No inquiries yet.</td></tr>`;
  }

  if ($("chats-list")) {
    $("chats-list").innerHTML = inquiries.length
      ? inquiries.map((item) => `
          <button
            type="button"
            class="open-user-chat-btn rounded-2xl border border-[#d0c5af]/50 p-4 flex items-center justify-between gap-3 hover:bg-[#fff8dc] transition text-left"
            data-chat-id="${item.id}"
            data-property-id="${item.property_id || ""}"
          >
            <div>
              <p class="font-black">Property Chat</p>
              <p class="text-sm text-[#476080] font-semibold">Property ID: ${item.property_id || "-"}</p>
            </div>
            <span class="status ${item.lead_status || "new"}">${item.lead_status || "new"}</span>
          </button>
        `).join("")
      : `<p class="text-[#476080] font-semibold">No chats yet.</p>`;
  }

  bindChatButtons();
}
function openUserChatModal() {
  $("user-chat-modal")?.classList.remove("hidden");
}

function closeUserChatModal() {
  $("user-chat-modal")?.classList.add("hidden");
}

function renderChatMessages(messages) {
  const box = $("user-chat-messages");
  if (!box) return;

  if (!messages.length) {
    box.innerHTML = `<p class="text-sm text-[#476080] font-semibold">No messages yet. Send your first message.</p>`;
    return;
  }

  box.innerHTML = messages.map((msg) => {
    const role = String(msg.sender_role || "user").toLowerCase();
    const mine = role === "user" || role === "visitor";
    const bubbleClass = mine ? "user" : role;

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
  const messages = await rows("property_chat_messages", {
    eq: { chat_id: chatId },
    order: "created_at",
    limit: 100
  });

  renderChatMessages(messages);
}

function bindChatButtons() {
  document.querySelectorAll(".open-user-chat-btn").forEach((btn) => {
    btn.onclick = async () => {
      activeChatId = btn.dataset.chatId;
      activeChatPropertyId = btn.dataset.propertyId || "";

      $("chat-modal-title").textContent = "Property Chat";
      $("chat-modal-subtitle").textContent = "Property ID: " + (activeChatPropertyId || "-");

      openUserChatModal();
      await loadChatMessages(activeChatId);
    };
  });
}

async function sendUserChatMessage(event) {
  event.preventDefault();

  const input = $("user-chat-input");
  const message = input?.value?.trim();

  if (!activeChatId) {
    alert("Please open a chat first.");
    return;
  }

  if (!message) return;

  const client = window.GP_SUPABASE.createClient();

  const { error } = await client.from("property_chat_messages").insert({
    chat_id: activeChatId,
    sender_role: "user",
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
function bindLogout() {
  $("logout-btn")?.addEventListener("click", logout);

  $("close-user-chat")?.addEventListener("click", closeUserChatModal);
  $("user-chat-backdrop")?.addEventListener("click", closeUserChatModal);
  $("user-chat-form")?.addEventListener("submit", sendUserChatMessage);
}

window.GP_USER_PANEL = {
  async init() {
    bindLogout();

    const userPhone = getPhone();

    if (!userPhone) {
      location.href = "login.html?next=user-panel.html";
      return;
    }

    if ($("auth-phone")) $("auth-phone").textContent = "+91 " + userPhone;
    if ($("auth-role")) $("auth-role").textContent = "Role: " + String(getRole()).toUpperCase();

    if (!mustConnect()) return;

    try {
      await loadProfile(userPhone);
      await loadSaved(userPhone);
      await loadInquiries(userPhone);
    } catch (error) {
      window.GP_ERROR_LOGGER?.log?.(error, "js/panels/user.js");
      toast(error.message || "Unable to load profile.", "error");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => window.GP_USER_PANEL.init());
