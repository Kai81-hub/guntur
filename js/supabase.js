/* =========================================================
   Guntur Properties - Supabase Client Helper
   Requires:
   - config.js
   - Supabase CDN: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
   ========================================================= */

(function () {
  function isConfigured() {
    const cfg = window.GP_CONFIG || {};
    return Boolean(
      window.supabase &&
      cfg.SUPABASE_URL &&
      cfg.SUPABASE_URL.startsWith("http") &&
      cfg.SUPABASE_ANON_KEY &&
      cfg.SUPABASE_ANON_KEY !== "PASTE_YOUR_SUPABASE_ANON_KEY"
    );
  }

  function createClient() {
    if (!isConfigured()) return null;

    if (!window.GP_SUPABASE_CLIENT) {
      window.GP_SUPABASE_CLIENT = window.supabase.createClient(
        window.GP_CONFIG.SUPABASE_URL,
        window.GP_CONFIG.SUPABASE_ANON_KEY
      );
    }

    return window.GP_SUPABASE_CLIENT;
  }

  async function requireClient() {
    const client = createClient();
    if (!client) {
      throw new Error("Supabase is not connected. Add SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js.");
    }
    return client;
  }

  async function select(table, options = {}) {
    const client = await requireClient();
    let query = client.from(table).select(options.select || "*");

    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.ilike) {
      Object.entries(options.ilike).forEach(([key, value]) => {
        query = query.ilike(key, value);
      });
    }

    if (options.in) {
      Object.entries(options.in).forEach(([key, value]) => {
        query = query.in(key, value);
      });
    }

    if (options.order) {
      query = query.order(options.order, { ascending: options.ascending ?? false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function single(table, options = {}) {
    const client = await requireClient();
    let query = client.from(table).select(options.select || "*");

    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  }

  async function insert(table, payload) {
    const client = await requireClient();
    const { data, error } = await client.from(table).insert(payload).select();
    if (error) throw error;
    return data;
  }

  async function update(table, id, payload) {
    const client = await requireClient();
    const { data, error } = await client.from(table).update(payload).eq("id", id).select();
    if (error) throw error;
    return data;
  }

  async function remove(table, id) {
    const client = await requireClient();
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  async function upload(bucket, path, file, options = {}) {
    const client = await requireClient();
    const { error } = await client.storage.from(bucket).upload(path, file, {
      upsert: true,
      ...options
    });
    if (error) throw error;

    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  window.GP_SUPABASE = {
    isConfigured,
    createClient,
    requireClient,
    select,
    single,
    insert,
    update,
    remove,
    upload
  };
})();
