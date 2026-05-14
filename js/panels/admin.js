/* Guntur Properties panel script.
   Requires before this file:
   config.js, supabase.js, validation.js, toast.js, error-logger.js, analytics.js, api.js, auth.js, main.js
*/
const $ = (id) => document.getElementById(id);
const tbl = () => window.GP_CONFIG?.TABLES || {};
const money = (v) => window.GP_UTILS?.formatPrice ? window.GP_UTILS.formatPrice(v) : (v || "-");
const dateIN = (v) => v ? new Date(v).toLocaleDateString("en-IN") : "-";
const toast = (m,t="info") => window.GP_TOAST?.[t]?.(m) || console.log(m);
const requireRole = (roles) => window.GP_AUTH?.requireRole ? window.GP_AUTH.requireRole(roles) : true;
const phone = () => window.GP_AUTH?.getPhone?.() || localStorage.getItem("gp_auth_phone") || "";
const logout = () => window.GP_AUTH?.logout ? window.GP_AUTH.logout() : (localStorage.clear(), location.href="login.html");
async function rows(table, options={}) { return window.GP_SUPABASE.select(table, options); }
async function add(table, payload) { return window.GP_SUPABASE.insert(table, payload); }
async function edit(table, id, payload) { return window.GP_SUPABASE.update(table, id, payload); }
function setText(id, value){ const el=$(id); if(el) el.textContent=value; }
function mustConnect(){ if(!window.GP_SUPABASE?.isConfigured?.()){ toast("Connect Supabase in js/config.js to load data.","warning"); return false; } return true; }
function bindLogout(){ $("logout-btn")?.addEventListener("click", logout); }

window.GP_ADMIN_PANEL = {
  async init(){ if(!requireRole(["admin"])) return; bindLogout(); this.bind(); await this.load(); },
  bind(){
    $("refresh-btn")?.addEventListener("click",()=>this.load());
    $("banner-form")?.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      try { await add(tbl().homeBanners,{...data,is_active:true,display_order:Number(data.display_order||1)}); e.target.reset(); toast("Banner added","success"); this.load(); }
      catch(err){ toast(err.message,"error"); }
    });
    $("media-form")?.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      try { await add(tbl().pageMedia,{...data,is_active:true,display_order:Number(data.display_order||1)}); e.target.reset(); toast("Page media added","success"); }
      catch(err){ toast(err.message,"error"); }
    });
  },
  async load(){
    if(!mustConnect()) return;
    try {
      const [users, props, services, banners, errors] = await Promise.all([
        rows(tbl().profiles,{order:"created_at",limit:100}),
        rows(tbl().properties,{order:"created_at",limit:100}),
        rows(tbl().serviceLeads,{order:"created_at",limit:100}),
        rows(tbl().homeBanners,{order:"display_order",ascending:true,limit:8}),
        rows(tbl().errorLogs,{order:"created_at",limit:30})
      ]);
      setText("stat-users", users.length); setText("stat-properties", props.length);
      setText("stat-pending", props.filter(p=>p.approval_status==="pending").length);
      setText("stat-services", services.length);
      this.properties(props); this.users(users); this.banners(banners); this.errors(errors);
    } catch(err){ window.GP_ERROR_LOGGER?.log(err,"admin.js"); toast(err.message,"error"); }
  },
  properties(data){
    const body=$("properties-body"); if(!body) return;
    body.innerHTML = data.length ? data.map(p=>`<tr><td>${p.title||"-"}</td><td>${p.property_type||"-"}</td><td>${money(p.price)}</td><td>${p.contact_name||p.user_phone||"-"}</td><td><span class="status ${p.approval_status||"pending"}">${p.approval_status||"pending"}</span></td><td><button data-approve="${p.id}" class="panel-action">Approve</button> · <button data-reject="${p.id}" class="panel-action text-red-700">Reject</button></td></tr>`).join("") : `<tr><td colspan="6">No properties found.</td></tr>`;
    body.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>this.status(b.dataset.approve,"approved"));
    body.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>this.status(b.dataset.reject,"rejected"));
  },
  users(data){
    const body=$("users-body"); if(!body) return;
    body.innerHTML = data.length ? data.map(u=>`<tr><td>${u.full_name||"-"}</td><td>${u.phone||"-"}</td><td>${u.role||"user"}</td><td><span class="status ${u.verification_status||"pending"}">${u.verification_status||"-"}</span></td><td>${u.selfie_url?`<a class="panel-action" target="_blank" href="${u.selfie_url}">View</a>`:"-"}</td><td><button class="panel-action">Verify</button></td></tr>`).join("") : `<tr><td colspan="6">No users found.</td></tr>`;
  },
  banners(data){ const body=$("banners-body"); if(body) body.innerHTML = data.length ? data.map(b=>`<tr><td>${b.title||"-"}</td><td>${b.image_url?`<a class="panel-action" target="_blank" href="${b.image_url}">Open</a>`:"-"}</td><td>${b.display_order||1}</td><td>${b.is_active?"Yes":"No"}</td></tr>`).join("") : `<tr><td colspan="4">No banners found.</td></tr>`; },
  errors(data){ const body=$("errors-body"); if(body) body.innerHTML = data.length ? data.map(e=>`<tr><td>${e.source||"-"}</td><td>${e.message||"-"}</td><td>${e.page_url||"-"}</td><td>${dateIN(e.created_at)}</td></tr>`).join("") : `<tr><td colspan="4">No error logs found.</td></tr>`; },
  async status(id,status){ try{ await edit(tbl().properties,id,{approval_status:status}); toast("Property updated","success"); this.load(); } catch(err){ toast(err.message,"error"); } }
};
document.addEventListener("DOMContentLoaded",()=>window.GP_ADMIN_PANEL.init());
