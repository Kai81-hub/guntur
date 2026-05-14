/* =========================================================
   Guntur Properties - Property Details Page
   Supports id query and SEO slug URL.
   ========================================================= */

window.GP_PROPERTY_DETAILS = {
  current: null,

  route() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "";
    let slug = params.get("slug") || "";

    if (!slug) {
      const last = location.pathname.split("/").filter(Boolean).pop() || "";
      slug = last.replace(/\.html$/i, "");
      if (slug === "property-details") slug = "";
    }

    const spid = slug.match(/spid-([a-zA-Z0-9_-]+)/i);

    return {
      id,
      slug,
      propertyCode: spid ? spid[1] : ""
    };
  },

  images(property) {
    const rows = property.property_images || [];

    const urls = rows
      .sort((a, b) => Number(b.is_main || false) - Number(a.is_main || false))
      .map((item) => item.image_url)
      .filter(Boolean);

    if (property.image_url) urls.unshift(property.image_url);
    if (property.main_image_url) urls.unshift(property.main_image_url);

    const unique = [...new Set(urls)];

    return unique.length
      ? unique
      : ["https://placehold.co/1200x700/f3f4f6/735c00?text=Guntur+Properties"];
  },

  updateMeta(property, images) {
    const title = property.title || "Property Details";
    const locationText = [property.location, property.district].filter(Boolean).join(", ");
    const price = window.GP_UTILS.formatPrice(property.price);
    const url = window.GP_CONFIG.SITE_URL + "/" + window.GP_UTILS.propertyDetailsUrl(property);
    const description = `${title} in ${locationText || "Guntur"} listed at ${price}. View photos, BHK, area, bathrooms, facing, amenities and contact details.`;

    document.title = `${title} | ${locationText || "Guntur"} | Guntur Properties`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);

    const map = {
      'meta[property="og:title"]': `${title} | Guntur Properties`,
      'meta[property="og:description"]': description,
      'meta[property="og:url"]': url,
      'meta[property="og:image"]': images[0],
      'meta[name="twitter:title"]': `${title} | Guntur Properties`,
      'meta[name="twitter:description"]': description,
      'meta[name="twitter:image"]': images[0]
    };

    Object.entries(map).forEach(([selector, value]) => {
      document.querySelector(selector)?.setAttribute("content", value);
    });
  },

  render(property) {
    this.current = property;
    const images = this.images(property);
    this.updateMeta(property, images);

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("property-title", property.title || "Property Details");
    setText("property-price", window.GP_UTILS.formatPrice(property.price));
    setText("breadcrumb-title", property.title || "Property");
    setText("breadcrumb-location", property.location || property.district || "Guntur");
    setText("overview-text", property.description || "No description available.");
    setText("spec-bhk", property.bedrooms ? property.bedrooms + " BHK" : "N/A");
    setText("spec-bath", property.bathrooms ? property.bathrooms + " Bath" : "N/A");
    setText("spec-area", property.area_sqft ? property.area_sqft + " Sq.Ft" : "N/A");
    setText("spec-facing", property.facing || "N/A");
    setText("property-id", property.property_code || property.code || property.id || "-");
    setText("property-type", window.GP_UTILS.titleCase(property.property_type || "Property"));
    setText("summary-status", window.GP_UTILS.titleCase(property.listing_status || "Available"));
    setText("summary-facing", property.facing || "N/A");
    setText("summary-listed-by", window.GP_UTILS.titleCase(property.seller_type || "Owner / Agent"));

    const location = [property.location, property.district].filter(Boolean).join(", ");
    const locEl = document.getElementById("property-location");
    if (locEl) locEl.innerHTML = `<span class="material-symbols-outlined mr-2">location_on</span>${location || "Guntur"}`;

    const mainImg = document.getElementById("main-gallery-img") || document.getElementById("main-image");
    if (mainImg) {
      mainImg.src = images[0];
      mainImg.alt = property.title || "Property image";
    }

    ["gallery-img-1", "gallery-img-2", "gallery-img-3", "gallery-img-4"].forEach((id, index) => {
      const img = document.getElementById(id);
      if (img) img.src = images[index + 1] || images[0];
    });

    const thumbRow = document.getElementById("thumb-row") || document.getElementById("thumbnail-row");
    if (thumbRow) {
      thumbRow.innerHTML = images.map((src, index) => `
        <button class="thumb ${index === 0 ? "active" : ""} w-24 h-20 rounded-2xl overflow-hidden shrink-0 border-2" data-src="${src}">
          <img src="${src}" alt="${property.title || "Property"} image ${index + 1}" class="w-full h-full object-cover">
        </button>
      `).join("");

      thumbRow.querySelectorAll(".thumb").forEach((button) => {
        button.addEventListener("click", () => {
          if (mainImg) mainImg.src = button.dataset.src;
          thumbRow.querySelectorAll(".thumb").forEach((item) => item.classList.remove("active"));
          button.classList.add("active");
        });
      });
    }

    const phone = String(property.whatsapp_number || property.contact_phone || window.GP_CONFIG.DEFAULT_WHATSAPP).replace(/\D/g, "");
    const message = encodeURIComponent(`I am interested in ${property.title || "this property"} at ${location}`);

    document.querySelectorAll("[data-property-whatsapp], #whatsapp-btn, #top-whatsapp").forEach((a) => {
      a.href = `https://wa.me/${phone}?text=${message}`;
    });

    document.querySelectorAll("[data-property-call], #call-btn, #top-call").forEach((a) => {
      a.href = `tel:+${phone}`;
    });

    document.getElementById("loading-state")?.classList.remove("active");
    document.getElementById("not-connected-state")?.classList.remove("active");
    document.getElementById("not-found-state")?.classList.remove("active");
    document.getElementById("page-content")?.classList.add("active");
    document.getElementById("details-section")?.classList.remove("hidden");
  },

  async init() {
    if (!window.GP_SUPABASE?.isConfigured()) {
      document.getElementById("loading-state")?.classList.remove("active");
      document.getElementById("not-connected-state")?.classList.add("active");
      return;
    }

    const route = this.route();

    try {
      let property = null;

      if (route.id) property = await window.GP_API.getPropertyById(route.id);
      if (!property && (route.slug || route.propertyCode)) {
        property = await window.GP_API.getPropertyBySlugOrCode(route.slug || route.propertyCode);
      }

      if (!property) {
        document.getElementById("loading-state")?.classList.remove("active");
        document.getElementById("not-found-state")?.classList.add("active");
        return;
      }

      this.render(property);
      window.GP_API.trackPropertyView(property.id);
    } catch (error) {
      window.GP_ERROR_LOGGER?.log(error, "property-details.js");
      document.getElementById("loading-state")?.classList.remove("active");
      document.getElementById("error-state")?.classList.add("active");
      const msg = document.getElementById("error-message");
      if (msg) msg.textContent = error.message || "Property could not be loaded.";
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("property-title") || document.getElementById("page-content")) {
    window.GP_PROPERTY_DETAILS.init();
  }
});
