// Copy-email button
(function () {
  var btn = document.getElementById('copy');
  var mail = document.getElementById('mail');
  if (!btn || !mail) return;
  btn.addEventListener('click', function () {
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1600); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = 'Selected';
    }
    if (navigator.clipboard) navigator.clipboard.writeText(mail.textContent).then(done, fallback);
    else fallback();
  });
})();

// Contact form -> POST /api/contact
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var send = document.getElementById('send');

  function show(msg, ok) {
    status.textContent = msg;
    status.className = ok ? 'ok' : 'err';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      website: form.website.value // honeypot, must stay empty
    };
    if (!data.name || !data.email || !data.message) return show('Please fill in every field.', false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return show('Please enter a valid email address.', false);

    send.disabled = true;
    show('Sending...', true);

    // Same-origin by default. If the site is hosted separately from the backend,
    // set API_URL to the backend address, e.g. 'https://your-api.onrender.com'.
    var API_URL = '';
    fetch(API_URL + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
      .then(function (r) {
        if (r.ok) { form.reset(); show('Thank you. Your message was sent.', true); }
        else show(r.body.error || 'Something went wrong. Please try again.', false);
      })
      .catch(function () { show('Could not reach the server. Please email me directly.', false); })
      .then(function () { send.disabled = false; });
  });
})();
