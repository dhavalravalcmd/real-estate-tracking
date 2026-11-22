/* ==========================================================
   SURAT HOMES - TRACKING LAYER
   Loads GTM (ID from js/config.js), pushes events to dataLayer,
   captures UTMs (sessionStorage only), optional debug panel (?debug=1).
   NO personal data is ever put into an event.
   ========================================================== */
(function () {
  window.dataLayer = window.dataLayer || [];
  var cfg = window.SURAT_HOMES_CONFIG || {};
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var sent = {}, log = [];

  /* ---- GTM INSTALLATION POINT (standard snippet; ID comes from config.js) ---- */
  if (/^GTM-[A-Z0-9]+$/.test(cfg.GTM_ID || '') && cfg.GTM_ID !== 'GTM-XXXXXXX') {
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s);
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', cfg.GTM_ID);
  } else if (window.console) {
    console.info('[Surat Homes] GTM ID not set (js/config.js). Events go to dataLayer only.');
  }

  /* UTM: URL values win (and are saved for the session), else the session copy */
  function getUtm() {
    var q = new URLSearchParams(location.search), found = {}, any = false;
    UTM_KEYS.forEach(function (k) { var v = q.get(k); if (v) { found[k] = v.slice(0, 100); any = true; } });
    try {
      if (any) sessionStorage.setItem('sh_utm', JSON.stringify(found));
      else found = JSON.parse(sessionStorage.getItem('sh_utm') || '{}');
    } catch (e) {}
    return found;
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* push(name, extra, dedupeKey): a repeated dedupeKey is ignored, so no double firing */
  function push(name, extra, dedupeKey) {
    if (dedupeKey) { if (sent[dedupeKey]) return null; sent[dedupeKey] = true; }
    var payload = Object.assign({
      event: name, event_id: uid(),
      page_url: location.href.split('#')[0], page_path: location.pathname, page_title: document.title
    }, getUtm(), extra || {});
    window.dataLayer.push(payload);
    log.push(payload); render();
    return payload;
  }

  function render() {
    var el = document.getElementById('sh-debug-out');
    if (el) el.textContent = 'UTM: ' + JSON.stringify(getUtm()) + '\n\nEVENTS:\n' + log.map(function (e) { return JSON.stringify(e, null, 1); }).join('\n');
  }

  function initDebug() {
    try { if (new URLSearchParams(location.search).get('debug') === '1') sessionStorage.setItem('sh_debug', '1'); } catch (e) {}
    var on = false; try { on = sessionStorage.getItem('sh_debug') === '1'; } catch (e) {}
    if (!on) return;
    var box = document.createElement('details');
    box.id = 'sh-debug'; box.open = true;
    box.innerHTML = '<summary>Tracking debug</summary><pre id="sh-debug-out"></pre>';
    document.body.appendChild(box); render();
  }

  window.Tracking = { push: push, getUtm: getUtm };

  document.addEventListener('DOMContentLoaded', function () {
    initDebug();
    push('PageView', {}, 'PageView');   /* once per page load */
  });
})();
