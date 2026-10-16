/* ===== DATA: add or change videos here ===== */
const LABELS = {short:"Short Form Edit",trailers:"Trailer Edit",ads:"Ad",events:"Event Highlight",school:"School Commission",long:"Longform"};
const FILTERS = [["all","All"],["short","Short Form"],["trailers","Trailers"],["ads","Ads"],["events","Event Highlights"],["school","School Commissions"],["long","Longform"]];
// [category, youtube id, vertical?]
const VIDEOS = [
 ["short","i6MIycHae5A",1],["short","3qdmqJNOscI",1],["short","czvI6Q1nj2g",1],
 ["trailers","xK_KV5KoKYA",0],["trailers","7TqxUz9m1HQ",0],
 ["ads","2A-RAq0ovSY",1],["ads","8qaBkXwh0Cg",1],["ads","Li0AigCqzEc",1],
 ["events","l0bhl2TR6fA",0],["events","_kyib2AWqzY",0],["events","6xY6wLcHJAY",0],
 ["school","RUXomVTvOTs",0],["school","uIh0LqdmWRY",0],["school","4FLPAvRO24k",0],["school","Ia30xeDbNsc",0],["school","4VgJthIrI8c",0],
 ["long","WcFG5BCVxac",0]
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const calm = matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ===== LOADER ===== */
let n = 0;
const tick = setInterval(() => {
  n = Math.min(100, n + Math.ceil(Math.random() * 9));
  $("#loaderNum").textContent = String(n).padStart(2, "0");
  $("#loaderBar").style.width = n + "%";
  if (n >= 100) { clearInterval(tick); setTimeout(() => $("#loader").classList.add("done"), 250); }
}, 45);

/* ===== SMOOTH SCROLL (Lenis, optional) ===== */
let lenis;
if (window.Lenis && !calm) {
  lenis = new Lenis({ lerp: 0.09, smoothTouch: false });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}
const scrollTo = el => lenis ? lenis.scrollTo(el, { offset: -20 }) : el.scrollIntoView({ behavior: "smooth" });
$$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
  const t = $(a.getAttribute("href")); if (!t) return;
  e.preventDefault(); scrollTo(t.id === "home" ? 0 : t);
}));

/* ===== MENU ===== */
const burger = $("#menuButton"), menu = $("#mobileMenu");
const setMenu = open => { menu.classList.toggle("active", open); burger.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); };
burger.addEventListener("click", () => setMenu(!menu.classList.contains("active")));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));

/* ===== SCROLL PROGRESS + PARALLAX ===== */
const bar = $("#progress"), orbs = $$(".orb");
const onScroll = () => {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  orbs.forEach((o, i) => o.style.transform = `translateY(${y * (0.05 + i * 0.04)}px)`);
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ===== HERO TITLE: split letters + pointer shift ===== */
const title = $("#heroTitle");
title.innerHTML = [...title.textContent].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${c}</span>`).join("");

/* ===== GALLERY: pile of playing cards that fans out ===== */
const grid = $("#grid"), filtersEl = $("#filters"), deck = grid, counts = {};
const hint = $("#deckHint"), stackBtn = $("#stackBtn"), narrow = matchMedia("(max-width:700px)");
filtersEl.innerHTML = FILTERS.map(([k, t], i) => `<button class="filter${i ? "" : " active"}" data-f="${k}">${t}</button>`).join("");
grid.innerHTML = VIDEOS.map(([cat, id, v]) => {
  counts[cat] = (counts[cat] || 0) + 1;
  const name = `${LABELS[cat]}${cat === "long" ? "" : " " + String(counts[cat]).padStart(2, "0")}`;
  return `<button class="card" data-cat="${cat}" data-id="${id}" data-v="${v}" aria-label="Play ${name}">
    <img src="https://img.youtube.com/vi/${id}/${v ? "hqdefault" : "maxresdefault"}.jpg" data-fb="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="${name}" loading="lazy" draggable="false">
    <span class="suit">✦</span><span class="play">▶</span><span class="meta"><small>${LABELS[cat].replace(" Edit", "")}</small><strong>${name}</strong></span><span class="back"><b>✦</b></span></button>`;
}).join("");
$$(".card img").forEach(img => {
  const fix = () => { if (img.dataset.fb && img.src !== img.dataset.fb) img.src = img.dataset.fb; };
  img.addEventListener("error", fix);
  img.addEventListener("load", () => { if (img.naturalWidth <= 120) fix(); });
});
const cardEls = $$(".card", deck);
cardEls.forEach(c => { c.dataset.r = (Math.random() - 0.5) * 6; c.dataset.jx = (Math.random() - 0.5) * 12; c.dataset.jy = (Math.random() - 0.5) * 8; });

let fan = false, shift = 0, sel = null, item = null, cfgNow = { R: 500, step: 8.5, maxA: 68 };
const rad = d => d * Math.PI / 180;
const stage = $("#stage"), stageEmpty = $("#stageEmpty");
const hidden = c => c.classList.contains("off") || c.classList.contains("taken");
function layout() {
  const m = narrow.matches, maxA = m ? 44 : 68;
  const vis = cardEls.filter(c => !hidden(c)), n = vis.length, mid = (n - 1) / 2;
  const base = m ? 12 : 8.5, step = n > 1 ? Math.min(m ? 18 : 16, Math.max(base, maxA * 1.6 / (n - 1))) : base;
  const cw = cardEls[0].offsetWidth, ch = cardEls[0].offsetHeight;
  const R = Math.max(150, Math.min(m ? 400 : 640, (deck.clientWidth / 2 - cw / 2 - 8) / Math.sin(rad(maxA))));
  cfgNow = { R, step, maxA };
  deck.style.setProperty("--oy", (ch / 2 + R) + "px");
  const lim = Math.max(0, mid - maxA / step); shift = Math.max(-lim, Math.min(lim, shift));
  deck.style.height = (fan ? ch + R * (1 - Math.cos(rad(maxA))) + cw * 0.65 + 60 : ch + 110) + "px";
  let k = 0;
  cardEls.forEach(c => {
    if (hidden(c)) { c.style.opacity = "0"; c.style.pointerEvents = "none"; c.style.zIndex = 0; return; }
    if (fan) {
      const th = (k - mid + shift) * step, over = Math.abs(th) - maxA, o = over <= 0 ? 1 : Math.max(0, 1 - over / step);
      c.style.setProperty("--a", th.toFixed(2) + "deg"); c.style.setProperty("--tx", "0px"); c.style.setProperty("--ty", "0px");
      c.style.opacity = o; c.style.pointerEvents = o < 0.5 ? "none" : "";
    } else {
      c.style.setProperty("--a", c.dataset.r + "deg"); c.style.setProperty("--tx", c.dataset.jx + "px"); c.style.setProperty("--ty", (+c.dataset.jy - k * 0.7) + "px");
      c.style.opacity = ""; c.style.pointerEvents = "";
    }
    c.style.zIndex = 10 + k++;
  });
}
const stagger = rev => { const vis = cardEls.filter(c => !hidden(c)), n = vis.length; vis.forEach((c, i) => c.style.transitionDelay = ((rev ? n - 1 - i : i) * 38) + "ms"); setTimeout(() => cardEls.forEach(c => c.style.transitionDelay = ""), 1700); };
function words() {
  hint.textContent = !fan ? "Tap the pile to deal the cards." : sel ? "Drag the video back down onto the cards to pick another." : "Drag a card up into the box (or tap it). Swipe sideways to browse.";
  if (!sel) stageEmpty.textContent = fan ? "Drag a card here to watch it." : "Deal the cards, then drag one in here to watch it.";
}
function setFan(on) {
  fan = on; shift = 0; stagger(!on); deck.classList.toggle("fan", on); layout();
  stackBtn.hidden = !on; words();
}
stackBtn.addEventListener("click", () => setFan(false));
layout(); words(); addEventListener("resize", layout); narrow.addEventListener("change", layout);

/* only the cards of the chosen type are dealt */
filtersEl.addEventListener("click", e => {
  const b = e.target.closest(".filter"); if (!b) return;
  $$(".filter", filtersEl).forEach(f => f.classList.toggle("active", f === b));
  cardEls.forEach(c => c.classList.toggle("off", !(b.dataset.f === "all" || c.dataset.cat === b.dataset.f)));
  if (!fan) setFan(true); else { shift = 0; stagger(false); layout(); }
});

/* ---- selected video sits in the stage ---- */
function select(card) {
  if (sel) release();
  sel = card; card.classList.add("taken");
  const v = card.dataset.v === "1", id = card.dataset.id, name = card.getAttribute("aria-label").replace("Play ", "");
  item = document.createElement("div"); item.className = "sitem glass " + (v ? "v" : "h");
  item.innerHTML = `<div class="grip" title="Drag me back onto the cards"><span>⠿ ${name}</span><button type="button" class="ret">Back to cards</button></div><div class="splayer"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${name}"></iframe></div>`;
  stageEmpty.hidden = true; stage.classList.add("has"); stage.appendChild(item);
  bindItem(item); layout(); words();
}
function release() {
  if (!sel) return;
  item.remove(); sel.classList.remove("taken"); sel = item = null;
  stage.classList.remove("has"); stageEmpty.hidden = false; layout(); words();
}
const inside = (e, el, pad) => { const r = el.getBoundingClientRect(); return e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad; };
function bindItem(el) {
  const g = $(".grip", el); let sx, sy, on = false;
  $(".ret", el).addEventListener("click", release);
  g.addEventListener("pointerdown", e => {
    if (e.target.closest(".ret")) return;
    on = true; sx = e.clientX; sy = e.clientY; g.setPointerCapture(e.pointerId); el.classList.add("dragging");
  });
  g.addEventListener("pointermove", e => {
    if (!on) return; const dx = e.clientX - sx, dy = e.clientY - sy;
    el.style.transform = `translate(${dx}px,${dy}px) rotate(${Math.max(-5, Math.min(5, dx * 0.02))}deg) scale(.92)`;
    deck.classList.toggle("over", inside(e, deck, 10));
  });
  const end = e => {
    if (!on) return; on = false; el.classList.remove("dragging");
    const back = inside(e, deck, 10); deck.classList.remove("over");
    if (back) release(); else el.style.transform = "";
  };
  g.addEventListener("pointerup", end); g.addEventListener("pointercancel", end);
}

/* ---- dragging a card out of the fan ---- */
let ghost = null;
function makeGhost(card) {
  const r = card.getBoundingClientRect(), w = card.offsetWidth, h = card.offsetHeight;
  const cl = card.cloneNode(true); const bk = cl.querySelector(".back"); bk && bk.remove();
  const g = document.createElement("div"); g.className = "dragghost"; g.innerHTML = cl.innerHTML;
  g.style.setProperty("--cw", w + "px"); g.style.setProperty("--ch", h + "px");
  g.dataset.w = w; g.dataset.h = h;
  g.style.transition = "none"; g.style.rotate = (parseFloat(card.style.getPropertyValue("--a")) || 0) + "deg";
  g.style.transform = `translate(${r.left + r.width / 2 - w / 2}px,${r.top + r.height / 2 - h / 2}px)`;
  document.body.appendChild(g); void g.offsetWidth; g.style.transition = ""; g.style.rotate = "0deg";
  return g;
}
const moveGhost = (g, x, y) => g.style.transform = `translate(${x - g.dataset.w / 2}px,${y - g.dataset.h / 2}px) scale(1.06)`;
function flyToStage(g) {
  const r = stage.getBoundingClientRect();
  g.classList.add("fly"); g.style.transform = `translate(${r.left + r.width / 2 - g.dataset.w / 2}px,${r.top + r.height / 2 - g.dataset.h / 2}px) scale(.55)`;
  setTimeout(() => g.remove(), 900);
}

let downX = 0, downY = 0, startShift = 0, pressing = false, moved = false, mode = null, press = null;
deck.addEventListener("pointerdown", e => {
  moved = false; mode = null; if (!fan) return;
  pressing = true; downX = e.clientX; downY = e.clientY; startShift = shift; press = e.target.closest(".card");
});
deck.addEventListener("pointermove", e => {
  if (!pressing) return; const dx = e.clientX - downX, dy = e.clientY - downY;
  if (!mode && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    moved = true; try { deck.setPointerCapture(e.pointerId); } catch (_) {}
    if (press && Math.abs(dy) > Math.abs(dx) * 0.8) { mode = "card"; ghost = makeGhost(press); press.style.opacity = ".25"; }
    else { mode = "fan"; deck.classList.add("dragging"); }
  }
  if (mode === "fan") { shift = startShift - dx / (cfgNow.R * rad(cfgNow.step)); layout(); }
  else if (mode === "card" && ghost) { moveGhost(ghost, e.clientX, e.clientY); stage.classList.toggle("over", inside(e, stage, 40)); }
});
const endDrag = e => {
  if (mode === "card" && ghost) {
    if (inside(e, stage, 40)) { flyToStage(ghost); select(press); }
    else { ghost.style.opacity = "0"; const g = ghost; setTimeout(() => g.remove(), 600); layout(); }
    ghost = null; stage.classList.remove("over");
  }
  pressing = false; mode = null; deck.classList.remove("dragging");
};
deck.addEventListener("pointerup", endDrag); deck.addEventListener("pointercancel", endDrag);
deck.addEventListener("click", e => {
  if (moved) return;
  const c = e.target.closest(".card");
  if (!fan) { setFan(true); return; }
  if (c) { flyToStage(makeGhost(c)); select(c); }
});
deck.addEventListener("keydown", e => { if (!fan) return; if (e.key === "ArrowRight") { shift += 1; layout(); } if (e.key === "ArrowLeft") { shift -= 1; layout(); } });
deck.addEventListener("wheel", e => { if (!fan || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; e.preventDefault(); shift += e.deltaX / 120; layout(); }, { passive: false });

/* ===== VIDEO MODAL ===== */
const modal = $("#modal"), box = $("#modalBox"), player = $("#player");
let lastCard;
const openVideo = card => {
  lastCard = card;
  const id = card.dataset.id;
  box.classList.toggle("v", card.dataset.v === "1");
  player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video player"></iframe>`;
  $("#ytLink").href = `https://www.youtube.com/watch?v=${id}`;
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
  lenis && lenis.stop(); $("#close").focus();
};
const closeVideo = () => {
  modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
  setTimeout(() => player.innerHTML = "", 400);
  lenis && lenis.start(); lastCard && lastCard.focus({ preventScroll: true });
};
$("#close").addEventListener("click", closeVideo);
modal.addEventListener("click", e => { if (e.target === modal) closeVideo(); });
addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeVideo(); });

/* ===== 3D TILT + SHINE (mouse, pen and touch) ===== */
const tiltTargets = () => $$("[data-tilt], .card");
const tilt = (el, e, max) => {
  const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", ((x - 0.5) * max * 2).toFixed(2) + "deg");
  el.style.setProperty("--rx", ((0.5 - y) * max * 2).toFixed(2) + "deg");
  el.style.setProperty("--mx", (x * 100) + "%"); el.style.setProperty("--my", (y * 100) + "%");
};
const reset = el => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
if (!calm) document.addEventListener("pointermove", e => {
  const el = e.target.closest && e.target.closest("[data-tilt], .card");
  if (el) tilt(el, e, el.classList.contains("card") ? 9 : 7);
});
document.addEventListener("pointerout", e => { const el = e.target.closest && e.target.closest("[data-tilt], .card"); if (el && !el.contains(e.relatedTarget)) reset(el); });
document.addEventListener("pointerup", e => { if (e.pointerType === "touch") tiltTargets().forEach(reset); });

/* ===== CUSTOM CURSOR + MAGNETIC BUTTONS ===== */
if (fine) {
  const cur = $("#cursor"); let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; });
  (function loop() { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener("pointerover", e => cur.classList.toggle("big", !!e.target.closest(".card")));
  $$(".mag").forEach(m => {
    m.addEventListener("pointermove", e => { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px,${(e.clientY - r.top - r.height / 2) * 0.4}px)`; });
    m.addEventListener("pointerleave", () => m.style.transform = "");
  });
  // ambient orbs lean toward the pointer
  addEventListener("pointermove", e => {
    const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
    $(".hero-copy").style.setProperty("--dx", dx); title.style.transform = `translate(${dx * -14}px,${dy * -10}px)`;
  });
}

const hero = $(".hero");

/* ===== TWINKLING STARS ===== */
if (!calm) for (let i = 0; i < 34; i++) {
  const s = document.createElement("i"), z = 1 + Math.random() * 2.5;
  s.className = "tw"; s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${z}px;height:${z}px;animation-delay:${-Math.random() * 4}s;animation-duration:${3 + Math.random() * 4}s`;
  hero.prepend(s);
}

/* ===== PORTRAIT: slow shatter, Formal <-> Shades ===== */
const frame = $("#frame"), pics = [$("#pFormal"), $("#pShades")], tapHint = $("#tapHint");
let cur = 0, busy = false, shadesOk = true;
pics[1].addEventListener("error", () => { shadesOk = false; tapHint.remove(); });
const fit = () => { if (pics[0].naturalWidth) frame.style.aspectRatio = pics[0].naturalWidth + " / " + pics[0].naturalHeight; };
pics[0].addEventListener("load", fit); if (pics[0].complete) fit();

function shatter(ev) {
  if (busy || !shadesOk) return; busy = true; tapHint.classList.add("gone");
  const from = pics[cur], to = pics[1 - cur];
  if (calm) { from.style.opacity = 0; to.style.opacity = 1; cur = 1 - cur; busy = false; return; }
  const r = frame.getBoundingClientRect(), key = ev && ev.type === "keydown" || !ev || ev.clientX == null;
  const px = key ? 0.5 : (ev.clientX - r.left) / r.width, py = key ? 0.4 : (ev.clientY - r.top) / r.height;
  const layer = document.createElement("div"); layer.className = "shards";
  const C = 6, R = 8, anims = [], tris = ["polygon(0 0,100% 0,0 100%)", "polygon(100% 0,100% 100%,0 100%)"];
  for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) for (let t = 0; t < 2; t++) {
    const s = document.createElement("i");
    s.style.cssText = `left:${x / C * 100}%;top:${y / R * 100}%;width:${100 / C + 0.4}%;height:${100 / R + 0.4}%;background-image:url("${from.currentSrc || from.src}");background-size:${C * 100}% ${R * 100}%;background-position:${x / (C - 1) * 100}% ${y / (R - 1) * 100}%;clip-path:${tris[t]}`;
    layer.appendChild(s);
    const cx = (x + 0.5 + (t ? 0.2 : -0.2)) / C, cy = (y + 0.5) / R, d = Math.hypot(cx - px, cy - py), rnd = () => Math.random() - 0.5;
    const dx = (cx - px) * 70 + rnd() * 24, dy = (cy - py) * 50 + 34 + rnd() * 20, rot = rnd() * 36;
    anims.push(s.animate([
      { opacity: 1, transform: "translate(0,0) rotate(0deg)" },
      { opacity: 1, transform: `translate(${rnd() * 2.5}px,${rnd() * 2.5}px) rotate(${rnd() * 1.2}deg)`, offset: 0.22 },
      { opacity: 0, transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(.9)` }
    ], { duration: 2800, delay: d * 1300 + Math.random() * 300, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" }));
  }
  frame.appendChild(layer); from.style.opacity = 0;
  anims.push(to.animate([
    { opacity: 0, filter: "blur(10px)", transform: "scale(1.05)" },
    { opacity: 1, filter: "blur(0)", transform: "scale(1)" }
  ], { duration: 3000, delay: 600, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" }));
  Promise.all(anims.map(a => a.finished.catch(() => {}))).then(() => {
    to.style.opacity = 1; to.getAnimations().forEach(a => a.cancel()); layer.remove(); cur = 1 - cur; busy = false;
  });
}
frame.addEventListener("click", shatter);
frame.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); shatter(e); } });

/* ===== SECTION REVEAL ===== */
if (!calm && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.animate([{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "none" }], { duration: 800, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" }); io.unobserve(en.target); } }), { threshold: 0.12 });
  $$(".head, .step, .svc details, .contact > *").forEach((el, i) => { el.style.animationDelay = i * 60 + "ms"; io.observe(el); });
}


/* =========================================================
   ASK GEISX — simple question-and-answer chat
   Edit the answers below to say whatever you want.
   "k" = words that trigger the answer, "a" = the reply (HTML allowed).
========================================================= */
const MAIL = "geisbertroans@gmail.com";
const KB = [
  { k: ["hi", "hello", "hey", "yo", "sup", "good morning", "good evening"], a: "Hey! Ask me about my work, my services, or how to hire me." },
  { k: ["start", "started", "began", "begin", "how long have you", "since when", "pandemic", "2020", "experience", "how old were you"], a: "I started editing in 2020, when I was 12, during the pandemic. My first editing work was in high school as the SSLG video editor, and in senior high school I was a video editor for the Paraluman PCU Dasma Official Media Team." },
  { k: ["first work", "first project", "first edit", "first video", "first job", "sslg", "senior high", "high school", "shs", "paraluman", "media team", "official media"], a: "My first editing work was in my high school days as the SSLG video editor. In senior high school, I was a video editor for the Paraluman PCU Dasma Official Media Team." },
  { k: ["club", "clubs", "organization", "organizations", "member", "members"], a: "I'm not in a club right now since I'm a college freshman. In high school I was part of the SSLG and the Paraluman PCU Dasma Official Media Team." },
  { k: ["how old", "your age", "years old", "age"], a: "I'm 18 years old." },
  { k: ["full name", "your name", "real name", "complete name", "geisbert", "sabater", "roan"], a: "My full name is Geisbert Roan S. Sabater, but you can call me Geis." },
  { k: ["college", "university", "pcu", "dasma", "cavite", "course", "bsit", "study", "studying", "student", "freshman", "degree", "where do you go"], a: "I'm a college freshman at PCU Dasma in Cavite, taking BSIT." },
  { k: ["what do you work on", "work on", "what do you use", "what pc", "specs", "spec", "pc", "computer", "processor", "cpu", "ram", "gpu", "graphics", "storage", "ryzen", "rx 6600", "laptop"], a: "I edit on a dual-monitor desktop with speakers and a headset, and I also use a Xiaomi Pad 7 Pro tablet. My PC specs:<br>Processor: AMD Ryzen 7 3700X 8-Core (3.60 GHz)<br>RAM: 16 GB<br>Graphics: AMD Radeon RX 6600 (8 GB)<br>Storage: 466 GB, with about 382 GB in use" },
  { k: ["setup", "set up", "equipment", "gear", "monitor", "monitors", "speaker", "speakers", "headset", "tablet", "xiaomi", "tools"], a: "My setup is a dual-monitor desktop with speakers and a headset. I also use a Xiaomi Pad 7 Pro tablet. Ask me about my PC specs if you want the details." },
  { k: ["hobby", "hobbies", "free time", "for fun", "interests", "like to do", "love to do", "bouquet", "boquet", "ribbon", "fuzzy wire", "gaming", "games", "game", "movies", "movie", "photography", "filming", "cats", "dogs", "cat", "dog", "pets", "pet"], a: "Outside of editing I love gaming, filming and photography, and watching movies. I also make bouquets using ribbon or fuzzy wire, and I'm a big cat and dog lover." },
  { k: ["who are", "about", "yourself", "introduce", "geis", "geisx", "name"], a: "I'm Geis, a video editor and multimedia creative from the Philippines. I focus on short-form content, social media videos, trailers, ads, event highlights, and creative edits." },
  { k: ["service", "offer", "what do you", "what can you", "help with", "edit"], a: "I can help with short-form content, long-form videos and trailers, ads and promo videos, event and highlight videos, and simple motion graphics and visual effects." },
  { k: ["short", "tiktok", "reels", "shorts", "vertical", "captions", "hook"], a: "Short-form is my main thing: TikToks, Reels and Shorts with captions, strong hooks, tight pacing, and retention-focused editing. You can see examples in the <a href=\"#work\">work section</a>." },
  { k: ["trailer", "teaser", "cinematic"], a: "I edit trailers and teasers with storytelling, music, and pacing that build a mood. Check the Trailers filter in my <a href=\"#work\">work section</a>." },
  { k: ["ad", "ads", "advert", "promo", "product", "commercial"], a: "I make product-focused ads and promo videos that explain an idea clearly and keep people watching. See the Ads filter in my <a href=\"#work\">work section</a>." },
  { k: ["event", "highlight", "recap", "program", "celebration"], a: "I cut event recaps and highlight videos for school programs, celebrations, and other memorable moments." },
  { k: ["school", "commission", "student", "project"], a: "I've done school commission projects too. You can watch some under the School Commissions filter in my <a href=\"#work\">work section</a>." },
  { k: ["long", "longform", "youtube video", "documentary"], a: "Yes, I edit longer videos as well. There's a Longform example in my <a href=\"#work\">work section</a>." },
  { k: ["motion", "graphic", "animation", "animated", "effects", "vfx", "transition"], a: "I add simple motion graphics, animated text, transitions, visual effects, and overlays to make edits feel more polished." },
  { k: ["work", "portfolio", "sample", "example", "show", "see", "watch"], a: "You can watch everything in my <a href=\"#work\">work section</a>. Tap any card to play the video right on the page." },
  { k: ["process", "how do you work", "workflow", "steps", "revision", "revisions"], a: "I understand the project first, then plan the structure and pacing, build the edit, and refine it with revisions before delivery. More in the <a href=\"#process\">process section</a>." },
  { k: ["price", "rate", "cost", "how much", "quote", "budget", "pay", "fee"], a: "Pricing depends on the length, style, and amount of work. <a href=\"mailto:" + MAIL + "\">Email me</a> the details and I'll send you a quote." },
  { k: ["how long", "turnaround", "deadline", "rush", "fast", "days", "time"], a: "It depends on the project. Tell me your deadline when you <a href=\"mailto:" + MAIL + "\">email me</a> and I'll let you know what's possible." },
  { k: ["where", "location", "country", "philippines", "based", "from"], a: "I'm based in the Philippines and work with clients online." },
  { k: ["hire", "contact", "email", "reach", "message", "collab", "work with", "book", "available", "phone", "number", "call", "facebook", "linkedin"], a: "Easiest is email: <a href=\"mailto:" + MAIL + "\">" + MAIL + "</a>. You can also call or text +63 977 743 2588, or find me on <a href=\"https://www.facebook.com/profile.php?id=61576937462979\" target=\"_blank\" rel=\"noopener noreferrer\">Facebook</a> and <a href=\"https://www.linkedin.com/in/geis-sabater/\" target=\"_blank\" rel=\"noopener noreferrer\">LinkedIn</a>." },
  { k: ["thank", "thanks", "ty", "cool", "nice", "great", "awesome"], a: "Anytime! Let me know if there's anything else you'd like to ask." },
  { k: ["bye", "goodbye", "see you"], a: "Thanks for stopping by!" }
];
const CHIPS = ["What do you edit?", "When did you start?", "What's your setup?", "How do I hire you?"];

const tip = $("#askTip"), askBtn = $("#askBtn"), chat = $("#chat"), msgs = $("#msgs"), chatForm = $("#chatForm"), chatInput = $("#chatInput"), chips = $("#chips");
const addMsg = (html, who, isText) => {
  const d = document.createElement("div"); d.className = "msg " + who;
  isText ? d.textContent = html : d.innerHTML = html;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
};
const answer = q => {
  const t = " " + q.toLowerCase().replace(/[^a-z0-9' ]/g, " ") + " ";
  let best = null, score = 0;
  KB.forEach(e => {
    const s = e.k.reduce((n, w) => n + (t.includes(" " + w + " ") || (w.length > 3 && t.includes(w)) ? 1 + w.split(" ").length * 0.1 : 0), 0);
    if (s > score) { score = s; best = e; }
  });
  return best ? best.a : `I don't have an answer for that one yet. <a href="mailto:${MAIL}?subject=${encodeURIComponent("Question from your website")}&body=${encodeURIComponent(q)}">Send it to me by email</a> and I'll reply personally.`;
};
const ask = q => {
  q = q.trim(); if (!q) return;
  addMsg(q, "me", true); chips.style.display = "none"; chatInput.value = "";
  const dots = addMsg('<span class="dots"><i></i><i></i><i></i></span>', "bot"); dots.style.padding = "0";
  setTimeout(() => { dots.remove(); addMsg(answer(q), "bot"); }, calm ? 100 : 700 + Math.random() * 500);
};
const openChat = open => {
  chat.classList.toggle("open", open); if (open) tip.classList.remove("show"); chat.setAttribute("aria-hidden", !open);
  askBtn.classList.toggle("hidden", open); askBtn.setAttribute("aria-expanded", open);
  if (open) { if (!msgs.children.length) addMsg("Hi! I'm Geisx. Ask me about my work, my services, or how to hire me.", "bot"); setTimeout(() => chatInput.focus({ preventScroll: true }), 400); }
  else askBtn.focus({ preventScroll: true });
};
chips.innerHTML = CHIPS.map(c => `<button type="button">${c}</button>`).join("");
chips.addEventListener("click", e => { if (e.target.tagName === "BUTTON") ask(e.target.textContent); });
askBtn.addEventListener("click", () => openChat(true));
$("#chatClose").addEventListener("click", () => openChat(false));
chatForm.addEventListener("submit", e => { e.preventDefault(); ask(chatInput.value); });
addEventListener("keydown", e => { if (e.key === "Escape" && chat.classList.contains("open") && !modal.classList.contains("open")) openChat(false); });
msgs.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  e.preventDefault(); openChat(false); const t = $(a.getAttribute("href")); t && scrollTo(t);
});

/* teaser bubble that pops up now and then */
const TIPS = ["You can ask me anything!", "Curious about my work? Ask away.", "Need a quote? Just ask me.", "Wondering how I work? Ask me."];
let tipI = 0, tipTimer;
const showTip = () => {
  if (chat.classList.contains("open") || modal.classList.contains("open")) return;
  tip.textContent = TIPS[tipI++ % TIPS.length]; tip.classList.add("show");
  clearTimeout(tipTimer); tipTimer = setTimeout(() => tip.classList.remove("show"), 5500);
};
tip.addEventListener("click", () => openChat(true));
setTimeout(function loop() { showTip(); setTimeout(loop, 24000); }, 6000);
