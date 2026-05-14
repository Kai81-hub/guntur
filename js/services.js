/* =========================================================
   Guntur Properties - Services Page + Service Details
   ========================================================= */

window.GP_SERVICES = {
  workerKeys: ["plumbing", "electrician", "painting", "construction-workers"],

  data: {
    "property-management": {
      title: "Property Management",
      icon: "real_estate_agent",
      category: "Professional Service",
      desc: "Rental support, inspections, tenant coordination, maintenance follow-up and NRI property care."
    },
    "interior-design": {
      title: "Interior Design",
      icon: "chair",
      category: "Professional Service",
      desc: "Modular kitchens, wardrobes, living room planning and complete interior design support."
    },
    "architectural-design": {
      title: "Architectural Design",
      icon: "architecture",
      category: "Professional Service",
      desc: "House plans, elevation ideas, floor planning and architectural concept assistance."
    },
    vastu: {
      title: "Vastu Consultation",
      icon: "explore",
      category: "Professional Service",
      desc: "Vastu guidance for homes, plots, shops and new projects."
    },
    plumbing: {
      title: "Plumbing",
      icon: "plumbing",
      category: "Worker Service",
      desc: "Leak repair, bathroom fittings, tank lines, drainage support and pipeline work."
    },
    electrician: {
      title: "Electrician",
      icon: "electrical_services",
      category: "Worker Service",
      desc: "Wiring, switch boards, lights, inverter lines, safety checks and repairs."
    },
    painting: {
      title: "Painting",
      icon: "format_paint",
      category: "Worker Service",
      desc: "Interior painting, exterior painting, texture walls and rental repainting."
    },
    "construction-workers": {
      title: "Construction Workers",
      icon: "engineering",
      category: "Worker Service",
      desc: "Masons, helpers, civil workers, renovation support and construction labor."
    }
  },

  getCurrentService() {
    const params = new URLSearchParams(location.search);
    const key = window.GP_UTILS.slugify(params.get("service") || params.get("type") || "plumbing");
    return this.data[key] ? key : "plumbing";
  },

  renderServiceGrid() {
    const grid = document.getElementById("services-grid");
    if (!grid) return;

    grid.innerHTML = Object.entries(this.data).map(([key, item]) => `
      <a href="services-details.html?service=${key}" class="service-card bg-white rounded-3xl border border-[#d0c5af]/40 p-6 gp-card-hover">
        <div class="w-14 h-14 rounded-2xl bg-[#d4af37]/12 text-[#d4af37] flex items-center justify-center mb-5">
          <span class="material-symbols-outlined text-4xl">${item.icon}</span>
        </div>
        <p class="text-xs font-black uppercase tracking-widest text-[#735c00] mb-2">${item.category}</p>
        <h3 class="text-xl font-extrabold mb-2">${item.title}</h3>
        <p class="text-sm text-[#476080] leading-relaxed mb-5">${item.desc}</p>
        <span class="inline-flex items-center gap-2 text-[#735c00] font-extrabold">
          View Details <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </a>
    `).join("");
  },

  renderServiceDetails() {
    const heroTitle = document.getElementById("hero-title");
    if (!heroTitle) return;

    const key = this.getCurrentService();
    const item = this.data[key];

    document.title = `${item.title} in Guntur | Guntur Properties Services`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", `${item.title} services in Guntur. ${item.desc}`);

    document.getElementById("crumb-service") && (document.getElementById("crumb-service").textContent = item.title);
    document.getElementById("hero-icon") && (document.getElementById("hero-icon").textContent = item.icon);
    document.getElementById("hero-tag") && (document.getElementById("hero-tag").textContent = item.category);
    heroTitle.innerHTML = `${item.title} <br>in Guntur`;
    document.getElementById("hero-desc") && (document.getElementById("hero-desc").textContent = item.desc);
    document.getElementById("scope-text") && (document.getElementById("scope-text").textContent = item.desc);

    const enrollPanel = document.getElementById("enroll-panel");
    if (enrollPanel) enrollPanel.classList.toggle("hidden", !this.workerKeys.includes(key));
  },

  async submitServiceLead(form) {
    const status = document.getElementById("lead-status");
    const key = this.getCurrentService();
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      await window.GP_API.submitServiceLead({
        service_name: key,
        visitor_name: data.name,
        visitor_phone: data.phone,
        visitor_location: data.location,
        message: data.message
      });

      status.textContent = "Request submitted. Staff will contact you.";
      form.reset();
    } catch (error) {
      status.textContent = error.message || "Unable to submit request.";
    }
  },

  init() {
    this.renderServiceGrid();
    this.renderServiceDetails();

    const form = document.getElementById("service-request-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.submitServiceLead(form);
      });
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.GP_SERVICES.init();
});
