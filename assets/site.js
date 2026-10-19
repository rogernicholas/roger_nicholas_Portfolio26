// Shared by the home and project pages: small DOM helpers, the image/placeholder
// box used everywhere, the content loader and the full-screen menu.
window.Site = (function () {
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) {
      n.textContent = text;
      if (/^\[.*\]$/.test(text)) n.classList.add('ph'); // still a placeholder
    }
    return n;
  }

  // "3 / 2" -> 1.5
  function ratio(r) {
    var parts = String(r || '4 / 5').split('/');
    var v = parseFloat(parts[0]) / parseFloat(parts[1] || 1);
    return isFinite(v) && v > 0 ? v : 0.8;
  }

  // An image from content, or a tinted box of the same shape until it has a src.
  function shot(img) {
    img = img || {};
    var box = el('div', 'shot');
    box.style.setProperty('--ratio', img.ratio || '4 / 5');
    if (img.tone) box.style.setProperty('--tone', img.tone);
    if (img.src) {
      var i = document.createElement('img');
      i.src = img.src;
      i.alt = img.alt || '';
      i.loading = 'lazy';
      i.decoding = 'async';
      box.appendChild(i);
    } else {
      var ph = el('span', 'ph-label label');
      ph.textContent = '[' + (img.label || 'Image') + ']';
      box.appendChild(ph);
    }
    return box;
  }

  var cache = {};
  function load(path) {
    if (!cache[path]) {
      cache[path] = fetch(path).then(function (r) {
        if (!r.ok) throw new Error(path + ' ' + r.status);
        return r.json();
      });
    }
    return cache[path];
  }

  // Menu overlay
  var menu = document.getElementById('menu');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  if (menu && openBtn && closeBtn) {
    var setMenu = function (open) {
      menu.hidden = !open;
      openBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      (open ? closeBtn : openBtn).focus();
    };
    openBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) setMenu(false);
    });
  }

  return { el: el, ratio: ratio, shot: shot, load: load };
})();
