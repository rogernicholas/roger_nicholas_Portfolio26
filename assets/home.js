// Menu overlay and the drifting carousel for the home page.
(function () {
  var menu = document.getElementById('menu');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');

  function setMenu(open) {
    menu.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? closeBtn : openBtn).focus();
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // Carousel: copy the works once so the belt loops seamlessly, then move it
  // right at a steady pace. Hovering eases it down to a crawl; it never stops.
  var track = document.getElementById('track');
  var belt = document.getElementById('belt');
  if (!belt) return; // pages without the carousel
  Array.prototype.slice.call(belt.children).forEach(function (fig) {
    var copy = fig.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    belt.appendChild(copy);
  });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var FAST = 40, SLOW = 10; // px per second
    var speed = FAST, target = FAST, x = null, then = null;
    track.addEventListener('pointerenter', function () { target = SLOW; });
    track.addEventListener('pointerleave', function () { target = FAST; });
    var frame = function (now) {
      var half = belt.scrollWidth / 2;
      if (x === null) x = -half;
      var dt = then === null ? 0 : Math.min(0.1, (now - then) / 1000);
      then = now;
      speed += (target - speed) * Math.min(1, dt * 3);
      x += speed * dt;
      if (x >= 0) x -= half;
      belt.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
})();
