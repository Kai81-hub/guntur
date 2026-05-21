/* Guntur Properties Staff Panel Script
   Manual location verification + role wise staff sheets.
   Properties go live directly. Staff checks only location spelling and user/contact details.
*/

const $ = (id) => document.getElementById(id);
const tbl = () => window.GP_CONFIG?.TABLES || {};
const toast = (m, t = "info") => window.GP_TOAST?.[t]?.(m) || console.log(m);
const requireRole = (roles) => window.GP_AUTH?.requireRole ? window.GP_AUTH.requireRole(roles) : true;
const logout = () => window.GP_AUTH?.logout ? window.GP_AUTH.logout() : (localStorage.clear(), location.href = "login.html");

let STAFF_DATA = {
  profiles: [],
  properties: [],
  visits: [],
  searches: [],
  chats: [],
  messages: [],
  services: [],
  manualPlaces: []
};

async function rows(table, options = {}) {
  return window.GP_SUPABASE.select(table, options);
}

async function edit(table, id, payload) {
  return window.GP_SUPABASE.update(table, id, payload);
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function dateIN(v) {
  return v ? new Date(v).toLocaleDateString("en-IN") : "-";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mustConnect() {
  if (!window.GP_SUPABASE?.isConfigured?.()) {
    toast("Connect Supabase in js/config.js to load data.", "warning");
    return false;
  }
  return true;
}

function tableName(key, fallback) {
  return tbl()[key] || fallback;
}

function profilePhone(profile) {
  return String(profile.phone || profile.mobile || profile.phone_number || "").replace(/\D/g, "").slice(-10);
}

function propertyOwnerPhone(property) {
  return String(
    property.posted_by_phone ||
    property.owner_phone ||
    property.contact_phone ||
    property.user_phone ||
    ""
  ).replace(/\D/g, "").slice(-10);
}

function propertyIdList(properties) {
  if (!properties.length) return "-";

  return properties
    .map((p) => p.id)
    .filter(Boolean)
    .join(", ");
}

function countVisitorsForProperties(properties) {
  const ids = properties.map((p) => String(p.id));
  if (!ids.length) return 0;

  return STAFF_DATA.visits.filter((visit) =>
    ids.includes(String(visit.property_id))
  ).length;
}

function searchesForPhone(phone) {
  const items = STAFF_DATA.searches
    .filter((s) => String(s.user_phone || s.phone || "").replace(/\D/g, "").slice(-10) === phone)
    .map((s) => s.search_query || s.query || s.keyword || s.q)
    .filter(Boolean);

  return [...new Set(items)].slice(0, 10).join(", ") || "-";
}

function visitedPropertiesForPhone(phone) {
  const items = STAFF_DATA.visits
    .filter((v) => String(v.user_phone || v.phone || "").replace(/\D/g, "").slice(-10) === phone)
    .map((v) => v.property_id)
    .filter(Boolean);

  return [...new Set(items)].slice(0, 20).join(", ") || "-";
}

function roleProfiles(role) {
  return STAFF_DATA.profiles.filter((p) =>
    String(p.role || "user").toLowerCase() === role
  );
}

function propertiesForPhone(phone) {
  return STAFF_DATA.properties.filter((p) => propertyOwnerPhone(p) === phone);
}

function contactedBadge(profile) {
  const contacted = profile.contacted_us === true || profile.contacted_us === "true";

  return contacted
    ? `<span class="status approved">Yes</span>`
    : `<span class="status pending">No</span>`;
}

function bindLogout() {
  $("logout-btn")?.addEventListener("click", logout);
}

function bindMobileSidebarClose() {
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector(".sidebar")?.classList.remove("open");
    });
  });
}

window.GP_STAFF_PANEL = {
  async init() {
    if (!requireRole(["admin", "staff"])) return;

    bindLogout();
    bindMobileSidebarClose();

    $("refresh-btn")?.addEventListener("click", () => this.load());

    ["users", "owners", "brokers", "developers"].forEach((sheet) => {
      $(`${sheet}-search`)?.addEventListener("input", () => this.renderRoleSheets());
    });

    await this.load();
  },

  async safeRows(table, options = {}) {
    try {
      return await rows(table, options);
    } catch (error) {
      console.warn("Table not available:", table, error.message);
      return [];
    }
  },

  async load() {
    if (!mustConnect()) return;

    try {
      const [
        manualPlaces,
        profiles,
        properties,
        visits,
        searches,
        chats,
        messages,
        services
      ] = await Promise.all([
        this.safeRows(tableName("properties", "properties"), {
          select: "*",
          eq: {
            is_manual_place: true,
            place_review_status: "pending"
          },
          order: "created_at",
          limit: 100
        }),

        this.safeRows(tableName("profiles", "profiles"), {
          select: "*",
          order: "created_at",
          limit: 500
        }),

        this.safeRows(tableName("properties", "properties"), {
          select: "*",
          order: "created_at",
          limit: 500
        }),

        this.safeRows(tableName("propertyVisits", "property_visits"), {
          select: "*",
          order: "created_at",
          limit: 1000
        }),

        this.safeRows(tableName("userSearchLogs", "user_search_logs"), {
          select: "*",
          order: "created_at",
          limit: 1000
        }),

        this.safeRows(tableName("propertyChats", "property_chats"), {
          order: "created_at",
          limit: 100
        }),

        this.safeRows(tableName("propertyChatMessages", "property_chat_messages"), {
          order: "created_at",
          limit: 100
        }),

        this.safeRows(tableName("serviceLeads", "service_leads"), {
          order: "created_at",
          limit: 100
        })
      ]);

      STAFF_DATA = {
        manualPlaces,
        profiles,
        properties,
        visits,
        searches,
        chats,
        messages,
        services
      };

      setText("stat-pending", manualPlaces.length);
      setText("stat-leads", chats.length);
      setText("stat-chats", messages.length);
      setText("stat-services", services.length);

      this.manualPlaces(manualPlaces);
      this.renderRoleSheets();
      this.leads(chats);
      this.services(services);

    } catch (err) {
      window.GP_ERROR_LOGGER?.log(err, "staff.js");
      toast(err.message, "error");
    }
  },

  manualPlaces(data) {
    const body = $("pending-body");
    if (!body) return;

    body.innerHTML = data.length
      ? data.map((p) => `
        <tr>
          <td>
            <strong>${escapeHtml(p.title || "-")}</strong>
            <br/>
            <span class="text-xs text-[#476080]">${escapeHtml(p.property_type || "-")}</span>
          </td>

          <td>
            <input class="location-edit-input" data-field="state" data-id="${p.id}" value="${escapeHtml(p.state || "")}" placeholder="State"/>
          </td>

          <td>
            <input class="location-edit-input" data-field="district" data-id="${p.id}" value="${escapeHtml(p.district || "")}" placeholder="District"/>
          </td>

          <td>
            <input class="location-edit-input" data-field="location" data-id="${p.id}" value="${escapeHtml(p.location || "")}" placeholder="City / Local Area"/>
          </td>

          <td>
            <span class="status pending">Location Pending</span>
            <br/>
            <span class="text-xs text-[#476080]">${dateIN(p.created_at)}</span>
          </td>

          <td>
            <button data-verify-location="${p.id}" class="panel-action">Verify</button>
          </td>
        </tr>
      `).join("")
      : `<tr><td colspan="6">No manual locations pending.</td></tr>`;

    body.querySelectorAll("[data-verify-location]").forEach((btn) => {
      btn.onclick = () => this.verifyLocation(btn.dataset.verifyLocation);
    });
  },

  getEditedLocation(id) {
    const inputs = document.querySelectorAll(`[data-id="${id}"].location-edit-input`);

    const data = {
      state: "",
      district: "",
      location: ""
    };

    inputs.forEach((input) => {
      data[input.dataset.field] = input.value.trim();
    });

    return data;
  },

  async verifyLocation(id) {
    try {
      const data = this.getEditedLocation(id);

      if (!data.state || !data.district || !data.location) {
        toast("State, district and city/local area are required.", "error");
        return;
      }

      await edit(tableName("properties", "properties"), id, {
        state: data.state,
        district: data.district,
        city: data.location,
        location: data.location,
        area: data.location,
        locality: data.location,
        is_manual_place: false,
        place_review_status: "approved",
        updated_at: new Date().toISOString()
      });

      toast("Location verified and corrected successfully.", "success");
      this.load();

    } catch (err) {
      toast(err.message || "Unable to verify location.", "error");
    }
  },

  renderRoleSheets() {
    this.renderUserSheet();
    this.renderSellerSheet("owner", "owners-sheet-body", "owners-search", 7);
    this.renderSellerSheet("broker", "brokers-sheet-body", "brokers-search", 7);
    this.renderSellerSheet("developer", "developers-sheet-body", "developers-search", 7);
  },

  searchMatch(text, inputId) {
    const q = String($(inputId)?.value || "").toLowerCase().trim();
    if (!q) return true;

    return String(text || "").toLowerCase().includes(q);
  },

  renderUserSheet() {
    const body = $("users-sheet-body");
    if (!body) return;

    const users = roleProfiles("user");

    const rowsHtml = users
      .map((user) => {
        const phone = profilePhone(user);
        const searched = searchesForPhone(phone);
        const visited = visitedPropertiesForPhone(phone);

        const searchText = [
          user.full_name,
          user.name,
          phone,
          searched,
          visited,
          user.contacted_us ? "contacted yes" : "contacted no"
        ].join(" ");

        if (!this.searchMatch(searchText, "users-search")) return "";

        return `
          <tr>
            <td>${escapeHtml(user.full_name || user.name || "-")}</td>
            <td>${escapeHtml(phone || "-")}</td>
            <td class="id-list">${escapeHtml(searched)}</td>
            <td class="id-list">${escapeHtml(visited)}</td>
            <td>${contactedBadge(user)}</td>
            <td>
              <button data-toggle-contact="${user.id}" class="contact-toggle">
                ${user.contacted_us ? "Mark Not Contacted" : "Mark Contacted"}
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    body.innerHTML = rowsHtml || `<tr><td colspan="6">No users found.</td></tr>`;

    body.querySelectorAll("[data-toggle-contact]").forEach((btn) => {
      btn.onclick = () => this.toggleContact(btn.dataset.toggleContact);
    });
  },

  renderSellerSheet(role, bodyId, searchId, colspan) {
    const body = $(bodyId);
    if (!body) return;

    const sellers = roleProfiles(role);

    const rowsHtml = sellers
      .map((seller) => {
        const phone = profilePhone(seller);
        const posted = propertiesForPhone(phone);
        const ids = propertyIdList(posted);
        const visitCount = countVisitorsForProperties(posted);

        const searchText = [
          seller.full_name,
          seller.name,
          phone,
          ids,
          visitCount,
          seller.contacted_us ? "contacted yes" : "contacted no"
        ].join(" ");

        if (!this.searchMatch(searchText, searchId)) return "";

        return `
          <tr>
            <td>${escapeHtml(seller.full_name || seller.name || "-")}</td>
            <td>${escapeHtml(phone || "-")}</td>
            <td>${posted.length}</td>
            <td class="id-list">${escapeHtml(ids)}</td>
            <td>${visitCount}</td>
            <td>${contactedBadge(seller)}</td>
            <td>
              <button data-toggle-contact="${seller.id}" class="contact-toggle">
                ${seller.contacted_us ? "Mark Not Contacted" : "Mark Contacted"}
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    body.innerHTML = rowsHtml || `<tr><td colspan="${colspan}">No ${role}s found.</td></tr>`;

    body.querySelectorAll("[data-toggle-contact]").forEach((btn) => {
      btn.onclick = () => this.toggleContact(btn.dataset.toggleContact);
    });
  },

  async toggleContact(profileId) {
    try {
      const profile = STAFF_DATA.profiles.find((p) => String(p.id) === String(profileId));
      if (!profile) return;

      const newValue = !(profile.contacted_us === true || profile.contacted_us === "true");

      await edit(tableName("profiles", "profiles"), profileId, {
        contacted_us: newValue,
        contacted_updated_at: new Date().toISOString()
      });

      profile.contacted_us = newValue;

      toast(newValue ? "Marked as contacted." : "Marked as not contacted.", "success");
      this.renderRoleSheets();

    } catch (err) {
      toast(err.message || "Unable to update contact status.", "error");
    }
  },

  leads(data) {
    const body = $("leads-body");
    if (!body) return;

    body.innerHTML = data.length
      ? data.map((l) => `
        <tr>
          <td>${escapeHtml(l.visitor_name || "-")}</td>
          <td>${escapeHtml(l.visitor_phone || "-")}</td>
          <td>${escapeHtml(l.property_id || "-")}</td>
          <td><span class="status ${escapeHtml(l.lead_status || "new")}">${escapeHtml(l.lead_status || "new")}</span></td>
          <td>${dateIN(l.created_at)}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="5">No leads.</td></tr>`;
  },

  services(data) {
    const body = $("services-body");
    if (!body) return;

    body.innerHTML = data.length
      ? data.map((s) => `
        <tr>
          <td>${escapeHtml(s.service_name || "-")}</td>
          <td>${escapeHtml(s.visitor_name || "-")}</td>
          <td>${escapeHtml(s.visitor_phone || "-")}</td>
          <td>${escapeHtml(s.visitor_location || "-")}</td>
          <td><span class="status ${escapeHtml(s.lead_status || "new")}">${escapeHtml(s.lead_status || "new")}</span></td>
        </tr>
      `).join("")
      : `<tr><td colspan="5">No service leads.</td></tr>`;
  }
};

document.addEventListener("DOMContentLoaded", () => window.GP_STAFF_PANEL.init());
