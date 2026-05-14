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

window.GP_DEVELOPER_PANEL = {
  async init(){ if(!requireRole(["admin","developer"])) return; bindLogout(); $("project-form")?.addEventListener("submit",e=>this.save(e)); await this.load(); },
  async save(e){
    e.preventDefault(); const status=$("project-status"); const data=Object.fromEntries(new FormData(e.target).entries());
    try{ await add(tbl().properties,{...data,property_type:data.property_type||"project",approval_status:"pending",user_phone:phone(),seller_type:"developer"}); if(status)status.textContent="Project submitted for approval."; e.target.reset(); this.load(); }
    catch(err){ if(status)status.textContent=err.message; }
  },
  async load(){
    if(!mustConnect()) return;
    try{
      const projects=await rows(tbl().properties,{eq:{user_phone:phone()},order:"created_at",limit:100});
      const leads=await rows(tbl().propertyChats,{order:"created_at",limit:100});
      setText("stat-projects",projects.length); setText("stat-units",0); setText("stat-leads",leads.length);
      const body=$("projects-body");
      if(body) body.innerHTML=projects.length?projects.map(p=>`<tr><td>${p.title||"-"}</td><td>${p.location||"-"}</td><td>${money(p.price)}</td><td><span class="status ${p.approval_status||"pending"}">${p.approval_status||"pending"}</span></td></tr>`).join(""):`<tr><td colspan="4">No projects yet.</td></tr>`;
    }catch(err){ window.GP_ERROR_LOGGER?.log(err,"developer.js"); toast(err.message,"error");}
  }
};
document.addEventListener("DOMContentLoaded",()=>window.GP_DEVELOPER_PANEL.init());
