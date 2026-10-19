// Projects come from content/projects.json, newest first. The home page lays them
// out side by side in rows with a field filter above; project.html#<slug> shows
// one project expanded.
(function () {
  var list = document.getElementById('project-list');
  var page = document.getElementById('project-page');
  if (!list && !page) return;
  var el = Site.el;

  function link(p) { return 'project.html#' + p.slug; }

  // "2026 · Film", plus the kind on the project page; any part may be missing
  function meta(p, withKind) {
    var parts = [p.year, p.field];
    if (withKind) parts.push(p.kind);
    return el('p', 'meta label', parts.filter(Boolean).join(' · '));
  }

  // newest first by the latest year mentioned ("2023 – 2026" counts as 2026);
  // projects without a year go last, in file order
  function byYear(projects) {
    return projects
      .map(function (p, i) {
        var years = String(p.year || '').match(/\d{4}/g) || [0];
        return { p: p, y: Math.max.apply(null, years.map(Number)), i: i };
      })
      .sort(function (a, b) { return b.y - a.y || a.i - b.i; })
      .map(function (x) { return x.p; });
  }

  // Home: the field filter. The choice is kept in the address (?field=Film) so a
  // filtered view can be shared, and the menu's Fields links set it directly.
  function setupFilters(projects) {
    var buttons = document.querySelectorAll('.filters button');
    var field = new URLSearchParams(location.search).get('field') || '';
    var shown = function () {
      return projects.filter(function (p) { return !field || p.field === field; });
    };
    var mark = function () {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.field === field)); });
    };
    var set = function (f) {
      if (f === field) return;
      field = f;
      mark();
      history.replaceState(null, '', (f ? '?field=' + encodeURIComponent(f) : location.pathname) + '#projects');
      list.classList.add('fading');
      setTimeout(function () { renderList(shown()); list.classList.remove('fading'); }, 250);
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { set(b.dataset.field); });
    });
    document.querySelectorAll('.menu a[data-field]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        set(a.dataset.field);
        // after the menu has closed and the page can scroll again
        setTimeout(function () { document.getElementById('projects').scrollIntoView(); }, 0);
      });
    });
    mark();
    return shown;
  }

  // Home: one to three projects per row depending on how wide each one's first
  // image is. Every image in a row shares one height.
  function tile(p) {
    var img = (p.images || [])[0];
    var r = Site.ratio(img && img.ratio);
    var a = el('a', 'tile');
    a.href = link(p);
    a.style.flex = r + ' 1 0';
    a.appendChild(Site.shot(img));
    var text = el('div', 'tile-text');
    text.appendChild(meta(p));
    text.appendChild(el('h3', null, p.title));
    text.appendChild(el('p', 'summary', p.summary));
    a.appendChild(text);
    return { node: a, r: r };
  }

  // Projects without images: one line each under the image rows.
  function renderMore(projects) {
    var ol = el('ol', 'project-more');
    projects.forEach(function (p) {
      var li = el('li');
      li.appendChild(el('span', 'label', p.year || ''));
      var a = el('a');
      a.href = link(p);
      a.appendChild(el('h3', null, p.title));
      a.appendChild(el('p', null, p.summary));
      li.appendChild(a);
      ol.appendChild(li);
    });
    return ol;
  }

  function renderList(projects) {
    var more = projects.filter(function (p) { return !(p.images && p.images.length); });
    projects = projects.filter(function (p) { return p.images && p.images.length; });
    var w = list.clientWidth;
    var narrow = w < 640;
    var gap = narrow ? 0 : 40; // matches --s-4 between tiles
    var h = 300;               // target image height for a row
    var rows = [], row = [], sum = 0;
    projects.map(tile).forEach(function (t) {
      var wouldBe = (sum + t.r) * h + row.length * gap;
      if (row.length && (narrow || row.length === 3 || wouldBe > w * 1.15)) {
        rows.push({ items: row, sum: sum });
        row = []; sum = 0;
      }
      row.push(t); sum += t.r;
    });
    if (row.length) rows.push({ items: row, sum: sum });
    // don't leave a lone tile at the end when the row before has room
    var last = rows[rows.length - 1], prev = rows[rows.length - 2];
    if (!narrow && prev && last.items.length === 1 && prev.items.length < 3) {
      prev.items.push(last.items[0]); prev.sum += last.sum; rows.pop();
    }

    list.textContent = '';
    if (!projects.length && !more.length) list.appendChild(el('p', 'load-error', 'Nothing here yet.'));
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
    if (more.length) list.appendChild(renderMore(more));
  }

  function renderPage(projects) {
    var slug = decodeURIComponent(location.hash.slice(1));
    var k = 0;
    for (var i = 0; i < projects.length; i++) if (projects[i].slug === slug) k = i;
    var p = projects[k];
    document.title = p.title + ', Roger Nicholas';
    page.textContent = '';

    var head = el('header', 'detail-head');
    head.appendChild(meta(p, true));
    head.appendChild(el('h1', null, p.title));
    head.appendChild(el('p', 'summary', p.summary));
    page.appendChild(head);

    var gallery = el('div', 'gallery');
    (p.images || []).forEach(function (img) {
      var fig = el('figure', 'gallery-item');
      fig.appendChild(Site.shot(img));
      if (img.caption) fig.appendChild(el('figcaption', null, img.caption));
      gallery.appendChild(fig);
    });
    page.appendChild(gallery);

    if ((p.body && p.body.length) || p.tech || (p.links && p.links.length)) {
      var body = el('div', 'detail-body');
      (p.body || []).forEach(function (t) { body.appendChild(el('p', null, t)); });
      if (p.tech) body.appendChild(el('p', 'tech label', p.tech));
      (p.links || []).forEach(function (l) {
        var a = el('a', 'pill', l.label);
        a.href = l.url;
        if (/^https?:/.test(l.url)) { a.target = '_blank'; a.rel = 'noopener'; }
        body.appendChild(a);
      });
      page.appendChild(body);
    }

    if (projects.length > 1) {
      var nav = el('nav', 'detail-nav');
      nav.setAttribute('aria-label', 'More projects');
      var prev = projects[(k - 1 + projects.length) % projects.length];
      var next = projects[(k + 1) % projects.length];
      var a1 = el('a', null, '← ' + prev.title); a1.href = link(prev);
      var a2 = el('a', null, 'All projects'); a2.href = 'home.html#projects';
      var a3 = el('a', null, next.title + ' →'); a3.href = link(next);
      nav.appendChild(a1); nav.appendChild(a2); nav.appendChild(a3);
      page.appendChild(nav);
    }
    window.scrollTo(0, 0);
  }

  Site.load('content/projects.json')
    .then(function (data) {
      var projects = byYear(data.projects || []);
      if (!projects.length) return;
      if (list) {
        var shown = setupFilters(projects);
        renderList(shown());
        var lastW = list.clientWidth, timer;
        window.addEventListener('resize', function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            if (list.clientWidth !== lastW) { lastW = list.clientWidth; renderList(shown()); }
          }, 150);
        });
      }
      if (page) {
        renderPage(projects);
        window.addEventListener('hashchange', function () { renderPage(projects); });
      }
    })
    .catch(function () {
      var target = list || page;
      if (target) target.appendChild(el('p', 'load-error', 'Projects could not be loaded. Refresh the page to try again.'));
    });
})();
