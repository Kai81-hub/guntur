/* =========================================================
   Guntur Properties - API Layer
   Uses GP_SUPABASE helper.
   ========================================================= */

window.GP_API = {
 async getApprovedProperties(options = {}) {
  const tables = window.GP_CONFIG.TABLES;

  let rows = await window.GP_SUPABASE.select(tables.properties, {
    select: "*, property_images (*)",
    eq: { status: "active", ...(options.eq || {}) },
    order: options.order || "created_at",
    limit: options.limit || 100
  });

  return rows;
},

 async getPropertyById(id) {
  const tables = window.GP_CONFIG.TABLES;

  return window.GP_SUPABASE.single(tables.properties, {
    select: "*, property_images (*)",
    eq: { id, status: "active" }
  });
},

  async getPropertyBySlugOrCode(slugOrCode) {
    const rows = await this.getApprovedProperties({ limit: 300 });
    const wanted = window.GP_UTILS.slugify(slugOrCode || "");

    return rows.find((item) => {
      const code = String(item.property_code || item.code || item.id || "").toLowerCase();
      const generated = window.GP_UTILS.generatePropertySlug(item);
      return (
        wanted === window.GP_UTILS.slugify(item.seo_slug || "") ||
        wanted === window.GP_UTILS.slugify(item.slug || "") ||
        wanted === window.GP_UTILS.slugify(generated) ||
        slugOrCode.toLowerCase().includes(code)
      );
    }) || null;
  },

  async trackPropertyView(propertyId) {
    const tables = window.GP_CONFIG.TABLES;
    const sessionId = window.GP_ANALYTICS.getSessionId();

    try {
      return await window.GP_SUPABASE.insert(tables.propertyViews, {
        property_id: propertyId,
        session_id: sessionId,
        viewed_from: document.referrer || "direct",
        page_url: location.href
      });
    } catch (error) {
      console.warn("Property view tracking failed:", error);
      return null;
    }
  },

  async createPropertyChat(payload) {
    const tables = window.GP_CONFIG.TABLES;
    const chat = await window.GP_SUPABASE.insert(tables.propertyChats, {
      property_id: payload.property_id,
      property_owner_id: payload.property_owner_id || null,
      visitor_name: payload.visitor_name,
      visitor_phone: payload.visitor_phone,
      chat_status: "open",
      lead_status: "new"
    });

    const chatId = chat?.[0]?.id;
    if (chatId && payload.message) {
      await window.GP_SUPABASE.insert(tables.propertyChatMessages, {
        chat_id: chatId,
        sender_role: "visitor",
        message: payload.message
      });
    }

    return chat?.[0] || null;
  },

  async submitContactMessage(payload) {
    return window.GP_SUPABASE.insert(window.GP_CONFIG.TABLES.contactMessages, {
      ...payload,
      status: "new"
    });
  },

  async submitServiceLead(payload) {
    return window.GP_SUPABASE.insert(window.GP_CONFIG.TABLES.serviceLeads, {
      ...payload,
      lead_status: "new"
    });
  },

  async submitServiceEnrollment(payload) {
    return window.GP_SUPABASE.insert(window.GP_CONFIG.TABLES.serviceEnrollments, {
      ...payload,
      verification_status: "pending",
      phone_verified: true
    });
  },

  async getPageMedia(pageKey) {
    return window.GP_SUPABASE.select(window.GP_CONFIG.TABLES.pageMedia, {
      eq: { page_key: pageKey, is_active: true },
      order: "display_order",
      ascending: true
    });
  },

  async getHomeBanners() {
    return window.GP_SUPABASE.select(window.GP_CONFIG.TABLES.homeBanners, {
      eq: { is_active: true },
      order: "display_order",
      ascending: true,
      limit: 8
    });
  }
};
