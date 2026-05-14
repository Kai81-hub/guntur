/* =========================================================
   Guntur Properties - Global Config
   Update Supabase URL and anon key here only.
   ========================================================= */

window.GP_CONFIG = {
  SITE_NAME: "Guntur Properties",
  SITE_URL: "https://www.gunturproperties.in",

  SUPABASE_URL: "https://mpuwfytcyjrsdkgaqaip.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_Cw3RO0xumC7MRdfOt16HBQ_Ae6PpWOK",

  DEFAULT_PHONE: "919959919999",
  DEFAULT_WHATSAPP: "919959919999",
  DEFAULT_DISTRICT: "Guntur",

  STORAGE_BUCKETS: {
    propertyImages: "property-images",
    verificationDocuments: "verification-documents",
    pageMedia: "page-media"
  },

  TABLES: {
    profiles: "profiles",
    properties: "properties",
    propertyImages: "property_images",
    propertyViews: "property_views",
    propertyChats: "property_chats",
    propertyChatMessages: "property_chat_messages",
    serviceLeads: "service_leads",
    serviceEnrollments: "service_enrollments",
    contactMessages: "contact_messages",
    homeBanners: "home_banners",
    pageMedia: "page_media",
    errorLogs: "error_logs",
    searchAnalytics: "search_analytics"
  },

  ROLES: {
    user: "user",
    owner: "owner",
    broker: "broker",
    developer: "developer",
    staff: "staff",
    admin: "admin"
  },

  ROLE_PANELS: {
    user: "user-panel.html",
    owner: "owner-panel.html",
    broker: "broker-panel.html",
    developer: "developer-panel.html",
    staff: "staff-panel.html",
    admin: "admin-panel.html"
  }
};
