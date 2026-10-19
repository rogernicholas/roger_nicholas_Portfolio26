// Wet blue paint for the landing sheet. Strokes are smooth and wet: they swell
// where the hand slows down, and paint that pools there runs down the paper in drips.
(function () {
  var canvas = document.getElementById('paper');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLOR = '#2B3FA0';
  var down = false;
  var pts = [];      // recent points of the current stroke, for smoothing
  var width = 10;
  var pool = 0;      // paint gathering under the brush while it moves slowly
  var drips = [];
  var running = false;

  function fit() {
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(r.width * dpr));
    var h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width === w && canvas.height === h) return;
    var keep = null;
    if (canvas.width > 1) {
      keep = document.createElement('canvas');
      keep.width = canvas.width;
      keep.height = canvas.height;
      keep.getContext('2d').drawImage(canvas, 0, 0);
    }
    canvas.width = w;
    canvas.height = h;
    if (keep) ctx.drawImage(keep, 0, 0);
  }

  function setup() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = COLOR;
    ctx.fillStyle = COLOR;
    ctx.globalAlpha = 1;
  }

  function point(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function blob(x, y, r) {
    setup();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function addDrip(x, y, size) {
    drips.push({
      x: x, y: y,
      r: Math.max(1.6, size),        // half the drip's width
      v: 0.4 + Math.random() * 0.6,  // px per frame
      paint: 12 + size * 6 + Math.random() * 40 // how far it can run
    });
    if (reduce) { while (drips.length) tick(true); return; }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function tick() {
    setup();
    for (var i = drips.length - 1; i >= 0; i--) {
      var d = drips[i];
      var ny = d.y + d.v;
      var nx = d.x + (Math.random() - 0.5) * 0.35;
      ctx.lineWidth = d.r * 2;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      d.paint -= d.v;
      d.x = nx;
      d.y = ny;
      // runs faster while heavy, then slows and thins as it empties
      d.v = Math.min(3, d.v * 1.015 + 0.01) * (d.paint < 30 ? 0.94 : 1);
      d.r = Math.max(0.9, d.r * 0.9985);
      if (d.paint <= 0 || d.v < 0.08) {
        blob(d.x, d.y, d.r * 1.45); // bead at the end of the run
        drips.splice(i, 1);
      }
    }
  }

  function loop() {
    tick();
    if (drips.length) requestAnimationFrame(loop);
    else running = false;
  }

  function segment(a, b, c, wA, wB) {
    // quadratic curve between the midpoints of a-b and b-c, drawn in small steps
    // so the width can swell and thin smoothly
    var m1x = (a.x + b.x) / 2, m1y = (a.y + b.y) / 2;
    var m2x = (b.x + c.x) / 2, m2y = (b.y + c.y) / 2;
    var len = Math.hypot(m2x - m1x, m2y - m1y);
    var steps = Math.max(1, Math.ceil(len / 2));
    var px = m1x, py = m1y;
    setup();
    for (var s = 1; s <= steps; s++) {
      var t = s / steps, u = 1 - t;
      var x = u * u * m1x + 2 * u * t * b.x + t * t * m2x;
      var y = u * u * m1y + 2 * u * t * b.y + t * t * m2y;
      ctx.lineWidth = wA + (wB - wA) * t;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      px = x; py = y;
    }
  }

  canvas.addEventListener('pointerdown', function (e) {
    fit();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    down = true;
    var p = point(e);
    pts = [p, p];
    width = 12;
    pool = 0;
    blob(p.x, p.y, 7 + Math.random() * 3);
  });

  canvas.addEventListener('pointermove', function (e) {
    if (!down) return;
    var events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (var i = 0; i < events.length; i++) {
      var p = point(events[i]);
      var last = pts[pts.length - 1];
      var dist = Math.hypot(p.x - last.x, p.y - last.y);
      if (dist < 1) continue;
      var prevW = width;
      // slow hand = fat, wet stroke; fast hand = thin, stretched stroke
      var target = Math.max(4, 20 - dist * 0.7);
      width += (target - width) * 0.2;
      pts.push(p);
      if (pts.length > 3) pts.shift();
      segment(pts[0], pts[1], pts[2] || p, prevW, width);

      pool += Math.max(0, 4 - dist) * 0.025;
      if (pool > 1 && Math.random() < 0.25) {
        addDrip(p.x + (Math.random() - 0.5) * width * 0.4, p.y + width * 0.3, width * (0.18 + Math.random() * 0.12));
        pool = 0;
      }
    }
  });

  function end() {
    if (!down) return;
    down = false;
    var p = pts[pts.length - 1];
    if (!p) return;
    blob(p.x, p.y, width * 0.6);
    // the paint left on the brush runs off where it was lifted
    var n = Math.random() < 0.4 ? 1 : 0;
    for (var i = 0; i < n; i++) {
      addDrip(p.x + (Math.random() - 0.5) * width * 0.6, p.y + width * 0.3, width * (0.2 + Math.random() * 0.12));
    }
    pts = [];
  }
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  window.addEventListener('resize', fit);
  fit();
})();
