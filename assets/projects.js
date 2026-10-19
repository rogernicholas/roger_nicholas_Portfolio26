// Projects come from content/projects.json. The home page lists each one with its
// first one to three images; project.html#<slug> shows one project expanded.
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

  function renderList(projects) {
    list.textContent = '';
    projects.forEach(function (p) {
      var href = 'project.html#' + p.slug;
      var art = el('article', 'project');
      // the first one to three images, side by side at one shared height
      var imgs = (p.images || []).slice(0, 3);
      var spread = el('a', 'spread');
      spread.href = href;
      spread.setAttribute('aria-label', p.title);
      var sum = 0;
      imgs.forEach(function (img) {
        var r = ratio(img.ratio);
        sum += r;
        var s = shot(img);
        s.style.flex = r + ' 1 0';
        spread.appendChild(s);
      });
      // cap the row's height so a lone portrait image doesn't fill the screen
      spread.style.maxWidth = 'calc(' + sum + ' * var(--row-h) + ' + (imgs.length - 1) + ' * var(--row-gap))';
      art.appendChild(spread);
      var text = el('div', 'project-text');
      text.appendChild(meta(p));
      text.appendChild(el('h3', null, p.title));
      text.appendChild(el('p', 'summary', p.summary));
      var more = el('a', 'more label', 'View project →');
      more.href = href;
      text.appendChild(more);
      art.appendChild(text);
      list.appendChild(art);
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
      if (list) renderList(projects);
      if (page) {
        renderPage(projects);
        window.addEventListener('hashchange', function () { renderPage(projects); });
      }
    })
    .catch(function () {
      (list || page).appendChild(el('p', 'load-error', 'Projects could not be loaded. Refresh the page to try again.'));
    });
})();
