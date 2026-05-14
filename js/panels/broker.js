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

window.GP_BROKER_PANEL = {
  role:"broker",
  async init(){ if(!requireRole(["admin","broker"])) return; bindLogout(); $("property-form")?.addEventListener("submit",e=>this.save(e)); await this.load(); },
  async save(e){
    e.preventDefault(); const status=$("property-status"); const data=Object.fromEntries(new FormData(e.target).entries());
    try{ await add(tbl().properties,{...data,approval_status:"pending",user_phone:phone(),seller_type:this.role,contact_phone:data.contact_phone||phone()}); if(status)status.textContent="Broker listing submitted for approval."; e.target.reset(); this.load(); }
    catch(err){ if(status)status.textContent=err.message; }
  },
  async load(){
    if(!mustConnect()) return;
    try{
      const props=await rows(tbl().properties,{eq:{user_phone:phone()},order:"created_at",limit:100});
      const leads=await rows(tbl().propertyChats,{order:"created_at",limit:100});
      setText("stat-properties",props.length); setText("stat-leads",leads.length); setText("stat-status","Pending");
      this.props(props); this.leads(leads);
    }catch(err){ window.GP_ERROR_LOGGER?.log(err,"broker.js"); toast(err.message,"error"); }
  },
  props(data){ const body=$("my-properties-body"); if(body) body.innerHTML=data.length?data.map(p=>`<tr><td>${p.title||"-"}</td><td>${p.property_type||"-"}</td><td>${money(p.price)}</td><td><span class="status ${p.approval_status||"pending"}">${p.approval_status||"pending"}</span></td><td>${dateIN(p.created_at)}</td></tr>`).join(""):`<tr><td colspan="5">No properties yet.</td></tr>`; },
  leads(data){ const body=$("leads-body"); if(body) body.innerHTML=data.length?data.map(l=>`<tr><td>${l.visitor_name||"-"}</td><td>${l.visitor_phone||"-"}</td><td>${l.property_id||"-"}</td><td><span class="status ${l.lead_status||"new"}">${l.lead_status||"new"}</span></td></tr>`).join(""):`<tr><td colspan="4">No leads.</td></tr>`; }
};
document.addEventListener("DOMContentLoaded",()=>window.GP_BROKER_PANEL.init());
