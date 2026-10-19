// Projects come from content/projects.json. The home page lists each one with its
// first image, laid out side by side in rows; project.html#<slug> shows one project expanded.
(function () {
  var list = document.getElementById('project-list');
  var page = document.getElementById('project-page');
  if (!list && !page) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) {
      n.textContent = text;
      if (/^\[.*\]$/.test(text)) n.classList.add('ph'); // still a placeholder
    }
    return n;
  }

  function shot(img) {
    var box = el('div', 'shot');
    box.style.setProperty('--ratio', img.ratio || '4 / 5');
    box.style.setProperty('--tone', img.tone || '');
    if (img.src) {
      var i = document.createElement('img');
      i.src = img.src;
      i.alt = img.alt || '';
      i.loading = 'lazy';
      box.appendChild(i);
    } else {
      var ph = el('span', 'ph-label label');
      ph.textContent = '[' + (img.label || 'Image') + ']';
      box.appendChild(ph);
    }
    return box;
  }

  function ratio(r) {
    var parts = String(r || '4 / 5').split('/');
    var v = parseFloat(parts[0]) / parseFloat(parts[1] || 1);
    return isFinite(v) && v > 0 ? v : 0.8;
  }

  function meta(p) {
    var m = el('p', 'meta label');
    m.appendChild(el('span', null, p.year));
    m.appendChild(document.createTextNode(' · ' + p.kind));
    return m;
  }

  // Home: projects sit next to each other in rows, one to three per row depending
  // on how wide their first image is. Every image in a row shares one height.
  function tile(p) {
    var img = (p.images || [])[0] || {};
    var r = ratio(img.ratio);
    var a = el('a', 'tile');
    a.href = 'project.html#' + p.slug;
    a.style.flex = r + ' 1 0';
    a.appendChild(shot(img));
    var text = el('div', 'tile-text');
    text.appendChild(meta(p));
    text.appendChild(el('h3', null, p.title));
    text.appendChild(el('p', 'summary', p.summary));
    a.appendChild(text);
    return { node: a, r: r };
  }

  function renderList(projects) {
    var w = list.clientWidth;
    var narrow = w < 640;
    var gap = narrow ? 0 : 40;
    var h = 340; // target image height for a row
    var tiles = projects.map(tile);
    var rows = [], row = [], sum = 0;
    tiles.forEach(function (t) {
      var wouldBe = (sum + t.r) * h + row.length * gap;
      if (row.length && (narrow || row.length === 3 || wouldBe > w * 1.15)) {
        rows.push({ items: row, sum: sum });
        row = []; sum = 0;
      }
      row.push(t); sum += t.r;
    });
    if (row.length) rows.push({ items: row, sum: sum });

    list.textContent = '';
    rows.forEach(function (rw) {
      var line = el('div', 'project-row');
      rw.items.forEach(function (t) {
        // flex-grow below 1 on a lone tile would leave it short of the full width
        if (rw.items.length === 1) t.node.style.flex = '1 1 0';
        line.appendChild(t.node);
      });
      // a row that can't fill the width keeps a natural size, centred
      var natural = rw.sum * h + (rw.items.length - 1) * gap;
      if (!narrow && natural < w * 0.8) line.style.maxWidth = Math.round(natural * 1.15) + 'px';
      list.appendChild(line);
    });
  }

  function renderPage(projects) {
    var slug = decodeURIComponent(location.hash.slice(1));
    var k = 0;
    for (var i = 0; i < projects.length; i++) if (projects[i].slug === slug) k = i;
    var p = projects[k];
    document.title = p.title + ', Roger Nicholas';
    page.textContent = '';

    var head = el('div', 'project-text detail-head');
    head.appendChild(meta(p));
    head.appendChild(el('h1', null, p.title));
    head.appendChild(el('p', 'summary', p.summary));
    page.appendChild(head);

    var gallery = el('div', 'gallery');
    (p.images || []).forEach(function (img) {
      var fig = el('figure', 'gallery-item');
      fig.appendChild(shot(img));
      if (img.caption) fig.appendChild(el('figcaption', null, img.caption));
      gallery.appendChild(fig);
    });
    page.appendChild(gallery);

    if (p.body && p.body.length) {
      var body = el('div', 'detail-body');
      p.body.forEach(function (t) { body.appendChild(el('p', null, t)); });
      page.appendChild(body);
    }

    var nav = el('nav', 'detail-nav label');
    nav.setAttribute('aria-label', 'More projects');
    var prev = projects[(k - 1 + projects.length) % projects.length];
    var next = projects[(k + 1) % projects.length];
    var a1 = el('a', null, '← ' + prev.title); a1.href = 'project.html#' + prev.slug;
    var a2 = el('a', null, 'All projects'); a2.href = 'home.html#projects';
    var a3 = el('a', null, next.title + ' →'); a3.href = 'project.html#' + next.slug;
    nav.appendChild(a1); nav.appendChild(a2); nav.appendChild(a3);
    page.appendChild(nav);
    window.scrollTo(0, 0);
  }

  fetch('content/projects.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var projects = data.projects || [];
      if (!projects.length) return;
      if (list) {
        renderList(projects);
        var lastW = list.clientWidth, timer;
        window.addEventListener('resize', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            if (list.clientWidth !== lastW) { lastW = list.clientWidth; renderList(projects); }
          }, 150);
        });
      }
      if (page) {
        renderPage(projects);
        window.addEventListener('hashchange', function () { renderPage(projects); });
      }
    })
    .catch(function () {
      (list || page).appendChild(el('p', 'load-error', 'Projects could not be loaded. Refresh the page to try again.'));
    });
})();
