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

window.GP_USER_PANEL = {
  async init(){ if(!requireRole(["admin","staff","user","owner","broker","developer"])) return; bindLogout(); await this.load(); },
  async load(){
    if(!mustConnect()) return;
    try{
      const chats = await rows(tbl().propertyChats,{eq:{visitor_phone:phone()},order:"created_at",limit:100});
      setText("stat-inquiries",chats.length); setText("stat-chats",chats.length); setText("stat-fav",0);
      const body=$("inquiries-body");
      if(body) body.innerHTML=chats.length?chats.map(c=>`<tr><td>${c.property_id||"-"}</td><td><span class="status ${c.lead_status||"new"}">${c.lead_status||"new"}</span></td><td>${dateIN(c.created_at)}</td></tr>`).join(""):`<tr><td colspan="3">No inquiries yet.</td></tr>`;
    }catch(err){ window.GP_ERROR_LOGGER?.log(err,"user.js"); toast(err.message,"error"); }
  }
};
document.addEventListener("DOMContentLoaded",()=>window.GP_USER_PANEL.init());
