/* SURAT HOMES - UI logic: header/footer, listings, details, enquiry form. */
(function () {
  var P = window.PROPERTIES, $ = function (s) { return document.querySelector(s); };
  var page = document.body.getAttribute('data-page'), qs = new URLSearchParams(location.search);

  function money(n) { return n >= 1e7 ? '₹' + (n / 1e7).toFixed(2) + ' Cr' : '₹' + Math.round(n / 1e5) + ' Lakh'; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function byId(id) { return P.filter(function (p) { return p.id === id; })[0]; }

  /* Generated illustration, used when a property has no photo */
  function img(p) {
    if (p.img) return p.img;
    var c = p.colors, tower = p.type === 'tower', bx = tower ? 290 : 170, bw = tower ? 220 : 460, by = tower ? 50 : 190, w = '';
    for (var y = by + 30; y < 370; y += 55) for (var x = bx + 22; x < bx + bw - 40; x += 52) w += '<rect x="' + x + '" y="' + y + '" width="30" height="34" fill="#ffe9a8"/>';
    var roof = tower ? '' : '<polygon points="' + (bx - 20) + ',' + by + ' ' + (bx + bw / 2) + ',' + (by - 80) + ' ' + (bx + bw + 20) + ',' + by + '" fill="' + c[2] + '"/>';
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="#fdf3e3"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><circle cx="680" cy="80" r="38" fill="#fff" opacity=".75"/><rect y="400" width="800" height="100" fill="#7bb274"/><rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + (400 - by) + '" fill="' + c[1] + '"/>' + roof + w + '<rect x="' + (bx + bw / 2 - 28) + '" y="335" width="56" height="65" fill="' + c[2] + '"/></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  function card(p) {
    return '<article class="card"><img src="' + img(p) + '" alt="' + esc(p.title) + ' in ' + esc(p.location) + '" width="800" height="500" loading="lazy">' +
      '<div class="card-b"><p class="price">' + money(p.price) + '</p><h3>' + esc(p.title) + '</h3><p class="muted">' + esc(p.location) + '</p>' +
      '<p class="meta">' + p.beds + ' bedrooms &middot; ' + p.size + ' sq ft</p><a class="btn btn-o" href="property.html?id=' + p.id + '">View Details</a></div></article>';
  }

  function chrome() {
    var links = [['index.html', 'Home', 'home'], ['properties.html', 'Properties', 'list'], ['enquiry.html', 'Enquire', 'enquiry']];
    $('#site-header').innerHTML = '<div class="wrap bar"><a class="logo" href="index.html"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="7" fill="#1d6fe8"/><path d="M6 15 15 7l9 8v9h-6v-6h-6v6H6z" fill="#fff"/></svg>Surat Homes</a><nav>' +
      links.map(function (l) { return '<a href="' + l[0] + '"' + (l[2] === page ? ' aria-current="page"' : '') + '>' + l[1] + '</a>'; }).join('') + '</nav></div>';
    $('#site-footer').innerHTML = '<div class="wrap foot"><div><strong>Surat Homes</strong><p>A fictional company for tracking practice. Not a real business.</p></div>' +
      '<div><p>Phone: +91 00000 00000</p><p>Email: hello@surathomes.example</p><p>101 Demo Tower, Ring Road, Surat, Gujarat 395002</p></div>' +
      '<div><p>Mon-Sat, 10am-7pm</p><p><a href="properties.html">Browse properties</a></p></div></div>';
  }

  function initHome() { $('#featured').innerHTML = P.slice(0, 3).map(card).join(''); }

  function initList() {
    var q = (qs.get('q') || '').toLowerCase(), b = +qs.get('beds') || 0, m = +qs.get('max') || 0;
    ['q', 'beds', 'max'].forEach(function (k) { if (qs.get(k)) $('#f-' + k).value = qs.get(k); });
    var r = P.filter(function (p) { return (!q || (p.title + p.location).toLowerCase().indexOf(q) > -1) && (!b || p.beds >= b) && (!m || p.price <= m); });
    $('#count').textContent = r.length + ' propert' + (r.length === 1 ? 'y' : 'ies') + ' found';
    $('#grid').innerHTML = r.length ? r.map(card).join('') : '<p>No properties match. <a href="properties.html">Clear filters</a></p>';
  }

  function initDetail() {
    var p = byId(qs.get('id')), box = $('#detail');
    if (!p) { box.innerHTML = '<p>Property not found. <a href="properties.html">See all properties</a></p>'; return; }
    document.title = p.title + ' | Surat Homes';
    box.innerHTML = '<img class="hero-img" src="' + img(p) + '" alt="' + esc(p.title) + '" width="800" height="500">' +
      '<div class="d-grid"><div><h1>' + esc(p.title) + '</h1><p class="muted">' + esc(p.location) + '</p><p>' + esc(p.desc) + '</p><h2>Features</h2><ul class="feat">' +
      p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div>' +
      '<aside class="panel"><p class="price big">' + money(p.price) + '</p><p>' + p.beds + ' bedrooms &middot; ' + p.baths + ' bathrooms</p><p>' + p.size + ' sq ft</p><p class="muted">ID: ' + p.id + '</p>' +
      '<a id="enquire-btn" class="btn" href="enquiry.html?property=' + p.id + '">Enquire About This Property</a></aside></div>';
    /* ViewContent: once per property view */
    Tracking.push('ViewContent', { property_id: p.id, property_name: p.title, value: p.price, currency: 'INR', content_type: 'product' }, 'ViewContent:' + p.id);
    /* Contact: enquiry button click, once per page load; short delay lets tags fire before navigating */
    var btn = $('#enquire-btn');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      Tracking.push('Contact', { property_id: p.id, property_name: p.title }, 'Contact:' + p.id);
      setTimeout(function () { location.href = btn.href; }, 250);
    });
  }

  function initEnquiry() {
    var f = $('#enq'), sel = $('#property'), submitting = false;
    sel.innerHTML = '<option value="">Select a property</option>' + P.map(function (p) { return '<option value="' + p.id + '">' + esc(p.title) + ' (' + p.id + ')</option>'; }).join('');
    if (byId(qs.get('property'))) sel.value = qs.get('property');
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your full name.'; },
      phone: function (v) { return /^(\+91)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid 10-digit Indian mobile number.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address.'; },
      property: function (v) { return v ? '' : 'Choose a property.'; }
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;
      var ok = true;
      Object.keys(rules).forEach(function (k) {
        var el = f.elements[k], msg = rules[k](el.value);
        $('#err-' + k).textContent = msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg && ok) el.focus();
        if (msg) ok = false;
      });
      if (!ok) return;                       /* invalid: NO Lead event */
      submitting = true; $('#submit').disabled = true; $('#submit').textContent = 'Sending...';
      var id = f.elements.property.value, p = byId(id);
      setTimeout(function () {               /* simulated submission: nothing is sent or stored */
        Tracking.push('Lead', { property_id: id, property_name: p.title, value: p.price, currency: 'INR', form_id: 'enquiry_form' }, 'Lead'); /* no personal data */
        f.reset(); f.hidden = true;
        $('#success-prop').textContent = p.title; $('#success').hidden = false; $('#success').focus();
      }, 600);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    chrome();
    var fn = { home: initHome, list: initList, detail: initDetail, enquiry: initEnquiry }[page];
    if (fn) fn();
  });
})();
