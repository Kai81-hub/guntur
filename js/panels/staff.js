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

window.GP_STAFF_PANEL = {
  async init(){ if(!requireRole(["admin","staff"])) return; bindLogout(); $("refresh-btn")?.addEventListener("click",()=>this.load()); await this.load(); },
  async load(){
    if(!mustConnect()) return;
    try{
      const [pending, chats, messages, services] = await Promise.all([
        rows(tbl().properties,{eq:{approval_status:"pending"},order:"created_at",limit:100}),
        rows(tbl().propertyChats,{order:"created_at",limit:100}),
        rows(tbl().propertyChatMessages,{order:"created_at",limit:100}),
        rows(tbl().serviceLeads,{order:"created_at",limit:100})
      ]);
      setText("stat-pending",pending.length); setText("stat-leads",chats.length); setText("stat-chats",messages.length); setText("stat-services",services.length);
      this.pending(pending); this.leads(chats); this.services(services);
    }catch(err){ window.GP_ERROR_LOGGER?.log(err,"staff.js"); toast(err.message,"error");}
  },
  pending(data){
    const body=$("pending-body"); if(!body)return;
    body.innerHTML=data.length?data.map(p=>`<tr><td>${p.title||"-"}</td><td>${p.property_type||"-"}</td><td>${money(p.price)}</td><td><span class="status pending">pending</span></td><td><button data-approve="${p.id}" class="panel-action">Approve</button> · <button data-reject="${p.id}" class="panel-action text-red-700">Reject</button></td></tr>`).join(""):`<tr><td colspan="5">No pending properties.</td></tr>`;
    body.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>this.status(b.dataset.approve,"approved"));
    body.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>this.status(b.dataset.reject,"rejected"));
  },
  leads(data){ const body=$("leads-body"); if(body) body.innerHTML=data.length?data.map(l=>`<tr><td>${l.visitor_name||"-"}</td><td>${l.visitor_phone||"-"}</td><td>${l.property_id||"-"}</td><td><span class="status ${l.lead_status||"new"}">${l.lead_status||"new"}</span></td><td>${dateIN(l.created_at)}</td></tr>`).join(""):`<tr><td colspan="5">No leads.</td></tr>`; },
  services(data){ const body=$("services-body"); if(body) body.innerHTML=data.length?data.map(s=>`<tr><td>${s.service_name||"-"}</td><td>${s.visitor_name||"-"}</td><td>${s.visitor_phone||"-"}</td><td>${s.visitor_location||"-"}</td><td><span class="status ${s.lead_status||"new"}">${s.lead_status||"new"}</span></td></tr>`).join(""):`<tr><td colspan="5">No service leads.</td></tr>`; },
  async status(id,status){ try{ await edit(tbl().properties,id,{approval_status:status}); toast("Property updated","success"); this.load(); }catch(err){toast(err.message,"error");} }
};
document.addEventListener("DOMContentLoaded",()=>window.GP_STAFF_PANEL.init());
