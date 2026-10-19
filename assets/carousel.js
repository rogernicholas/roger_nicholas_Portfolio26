// Home carousel: works from content/work.json on one centre line, drifting right
// at a steady pace. Hovering eases it down to a crawl; it never stops.
(function () {
  var track = document.getElementById('track');
  var belt = document.getElementById('belt');
  if (!track || !belt) return;
  var el = Site.el;

  function figure(w) {
    var fig = el('figure', 'work');
    fig.appendChild(Site.shot(w));
    var cap = el('figcaption');
    cap.appendChild(el('span', null, w.title || ''));
    if (w.caption) cap.appendChild(document.createTextNode(', ' + w.caption));
    fig.appendChild(cap);
    return fig;
  }

  function start() {
    // copy the works once so the belt can loop without a seam
    Array.prototype.slice.call(belt.children).forEach(function (fig) {
      var copy = fig.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      belt.appendChild(copy);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var FAST = 40, SLOW = 10; // px per second
    var speed = FAST, target = FAST, x = null, then = null;
    track.addEventListener('pointerenter', function () { target = SLOW; });
    track.addEventListener('pointerleave', function () { target = FAST; });
    function frame(now) {
      var half = belt.scrollWidth / 2;
      if (x === null) x = -half;
      var dt = then === null ? 0 : Math.min(0.1, (now - then) / 1000);
      then = now;
      speed += (target - speed) * Math.min(1, dt * 3);
      x += speed * dt;
      if (x >= 0) x -= half;
      belt.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  Site.load('content/work.json')
    .then(function (data) {
      (data.works || []).forEach(function (w) { belt.appendChild(figure(w)); });
      if (belt.children.length) start();
    })
    .catch(function () {
      track.appendChild(el('p', 'load-error', 'The work could not be loaded. Refresh the page to try again.'));
    });
})();
