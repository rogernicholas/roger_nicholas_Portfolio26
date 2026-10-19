// Projects come from content/projects.json. The home page lays them out side by
// side in rows; project.html#<slug> shows one project expanded. Both pages also
// get the list of projects in the menu.
(function () {
  var list = document.getElementById('project-list');
  var page = document.getElementById('project-page');
  var menuList = document.getElementById('menu-projects');
  if (!list && !page && !menuList) return;
  var el = Site.el;

  function link(p) { return 'project.html#' + p.slug; }

  function meta(p) {
    var m = el('p', 'meta label');
    m.appendChild(el('span', null, p.year));
    if (p.kind) m.appendChild(document.createTextNode(' · ' + p.kind));
    return m;
  }

  function renderMenu(projects) {
    projects.forEach(function (p) {
      var a = el('a', null, p.title);
      a.href = link(p);
      menuList.appendChild(a);
    });
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

  function renderList(projects) {
    var w = list.clientWidth;
    var narrow = w < 640;
    var gap = narrow ? 0 : 40; // matches --s-4 between tiles
    var h = 340;               // target image height for a row
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

    var head = el('header', 'detail-head');
    head.appendChild(meta(p));
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

    if (p.body && p.body.length) {
      var body = el('div', 'detail-body');
      p.body.forEach(function (t) { body.appendChild(el('p', null, t)); });
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
      var projects = data.projects || [];
      if (!projects.length) return;
      if (menuList) renderMenu(projects);
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
      var target = list || page;
      if (target) target.appendChild(el('p', 'load-error', 'Projects could not be loaded. Refresh the page to try again.'));
    });
})();
