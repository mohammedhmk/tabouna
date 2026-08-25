// طابونة — منطق الصفحة: روابط ديناميكية، ظهور تدريجي، كاروسيل المراجعات،
// وتتبّع بيكسل سناب شات.
import { SNAP_PIXEL_ID, LINKS } from "./config.js";

/* ---------- 1. مزامنة روابط الاتصال/واتساب/الاتجاهات من config.js ---------- */
// أي عنصر عليه data-sync="tel|whatsapp|directions" يأخذ رابطه الفعلي من LINKS
// تلقائياً — يعني تعديل رقم الجوال بملف config.js يكفي لتحديث كل أزرار الصفحة.
function syncActionLinks() {
  const map = { tel: LINKS.tel, whatsapp: LINKS.whatsapp, directions: LINKS.directions };
  document.querySelectorAll("[data-sync]").forEach((el) => {
    const href = map[el.dataset.sync];
    if (href) el.setAttribute("href", href);
  });

  const mapFrame = document.querySelector("[data-map-embed]");
  if (mapFrame) mapFrame.src = LINKS.mapEmbed;
}

/* ---------- 2. ظهور تدريجي عند التمرير ---------- */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    io.observe(el);
  });
}

/* ---------- 3. كاروسيل المراجعات ---------- */
// ملاحظة RTL: نتجنّب أي حساب يدوي لـ scrollLeft/offsetLeft عمداً — متصفحات
// كروميوم تستخدم قيماً سالبة لـ scrollLeft داخل حاويات RTL بينما فايرفوكس
// يعاملها بشكل مختلف تماماً، فأي حساب يدوي بمنطق LTR يطلع غلط في RTL.
// الحل الآمن عبر المتصفحات: scrollIntoView (للتنقّل) + IntersectionObserver
// (لمعرفة البطاقة الظاهرة حالياً) — كلاهما يفهم الاتجاه تلقائياً من المتصفح.
function initReviewsCarousel() {
  const track = document.querySelector("[data-reviews-track]");
  if (!track) return;

  // === إصلاح بق السكرول التلقائي ===
  // scroll-snap-type: x mandatory يجبر المتصفح على snap scroll عند التحميل،
  // ومع scroll-behavior: smooth على html، السكرول يتسرّب للصفحة كلها
  // وينزّلها لقسم التقييمات.
  // الحل: نعطّل snap أثناء التهيئة ونفعّله بعد ما الصفحة تستقر.
  track.style.scrollSnapType = "none";

  const cards = Array.from(track.children);
  const dotsWrap = document.querySelector("[data-reviews-dots]");
  const prevBtn = document.querySelector("[data-reviews-prev]");
  const nextBtn = document.querySelector("[data-reviews-next]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let current = 0;

  const dots = cards.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "reviews__dot";
    b.setAttribute("aria-label", `مراجعة ${i + 1} من ${cards.length}`);
    b.addEventListener("click", () => scrollToIndex(i));
    dotsWrap?.appendChild(b);
    return b;
  });

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  }

  function scrollToIndex(i, instant) {
    current = Math.max(0, Math.min(i, cards.length - 1));
    const card = cards[current];
    const trackDir = getComputedStyle(track).direction;
    const isRtl = trackDir === "rtl";
    const cardRect = card.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const offset = isRtl
      ? trackRect.right - cardRect.right + track.scrollLeft
      : cardRect.left - trackRect.left + track.scrollLeft;
    track.scrollTo({
      left: offset,
      behavior: (reduced || instant) ? "auto" : "smooth",
    });
    updateDots();
  }

  // يحدّد البطاقة الأكثر ظهوراً داخل الشريط ليبقى المؤشر متزامناً مع
  // السحب اليدوي بالإصبع أيضاً، لا فقط مع الأزرار
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const top = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
        const idx = cards.indexOf(top.target);
        if (idx !== -1) {
          current = idx;
          updateDots();
        }
      },
      { root: track, threshold: [0.6] }
    );
    cards.forEach((c) => io.observe(c));
  }

  prevBtn?.addEventListener("click", () => scrollToIndex(current - 1));
  nextBtn?.addEventListener("click", () => scrollToIndex(current + 1));

  let auto = null;
  function startAuto() {
    if (reduced) return;
    stopAuto();
    auto = window.setInterval(() => {
      scrollToIndex(current + 1 >= cards.length ? 0 : current + 1);
    }, 6000);
  }
  function stopAuto() {
    if (auto) window.clearInterval(auto);
  }
  ["mouseenter", "touchstart", "focusin"].forEach((ev) =>
    track.addEventListener(ev, stopAuto, { passive: true })
  );
  ["mouseleave", "touchend"].forEach((ev) => track.addEventListener(ev, startAuto, { passive: true }));

  updateDots();

  // نفعّل scroll-snap ونبدأ التمرير التلقائي بعد ما الصفحة تستقر تماماً
  window.addEventListener("load", () => {
    setTimeout(() => {
      track.style.scrollSnapType = "";
      startAuto();
    }, 800);
  }, { once: true });
}

/* ---------- 4. بيكسل سناب شات ---------- */
function loadSnapPixel() {
  if (!SNAP_PIXEL_ID) return;

  /* eslint-disable */
  (function (e, t, n) {
    if (e.snaptr) return;
    var a = (e.snaptr = function () {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
    });
    a.queue = [];
    var s = "script";
    var r = t.createElement(s);
    r.async = !0;
    r.src = n;
    var u = t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r, u);
  })(window, document, "https://sc-static.net/scevent.min.js");
  /* eslint-enable */

  window.snaptr("init", SNAP_PIXEL_ID);
  window.snaptr("track", "PAGE_VIEW");
}

function snap(event, custom) {
  if (typeof window.snaptr !== "function") return;
  window.snaptr("track", event);
  if (custom) window.snaptr("track", custom);
}

function initPixelTracking() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (!el) return;
    const kind = el.dataset.track;
    if (kind === "call") snap("SIGN_UP", "CUSTOM_EVENT_1");
    else if (kind === "whatsapp") snap("START_CHECKOUT", "CUSTOM_EVENT_2");
    else if (kind === "directions") snap("VIEW_CONTENT", "CUSTOM_EVENT_3");
  });
}

/* ---------- 5. بانر الإعلان ---------- */
function initAnnouncementBar() {
  const bar = document.querySelector("[data-announcement]");
  const closeBtn = document.querySelector("[data-announcement-close]");
  if (!bar || !closeBtn) return;

  // لو المستخدم سكّره قبل كذا في نفس الجلسة، ما نعرضه
  if (sessionStorage.getItem("announcement-closed")) {
    bar.classList.add("is-hidden");
    return;
  }

  closeBtn.addEventListener("click", () => {
    bar.classList.add("is-hidden");
    sessionStorage.setItem("announcement-closed", "1");
  });
}

/* ---------- 6. زر الاتصال العائم ---------- */
function initFloatingCTA() {
  const fab = document.getElementById("floating-cta");
  const hero = document.querySelector(".hero");
  if (!fab || !hero) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      fab.classList.toggle("is-visible", !entry.isIntersecting);
    },
    { threshold: 0.05 }
  );
  io.observe(hero);
}

/* ---------- التشغيل ---------- */

// === إصلاح بق السكرول التلقائي ===
// المتصفح يحفظ موضع السكرول ويرجعه عند الريفرش (scroll restoration)
// مما يسبب نزول الصفحة للتقييمات. نعطّله ونرجع الصفحة لفوق يدوياً.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
document.documentElement.style.scrollBehavior = "auto";
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);

  syncActionLinks();
  initReveal();
  initReviewsCarousel();
  initPixelTracking();
  initAnnouncementBar();
  initFloatingCTA();

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
});

window.addEventListener("load", () => {
  // نرجّع الصفحة لفوق مرة أخيرة بعد التحميل الكامل
  window.scrollTo(0, 0);

  // نرجّع scroll-behavior: smooth بعد ما كل شي يستقر
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = "";
  }, 1200);

  loadSnapPixel();
});
