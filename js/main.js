/* ============================================================
   R&B Tech Solutions — Animaciones (GSAP + ScrollTrigger)
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 0.8 });

/* ---------- Año dinámico ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Header: estado "scrolled" + barra de progreso ---------- */
const header = document.getElementById("header");
const progress = document.querySelector(".scroll-progress");

ScrollTrigger.create({
  start: 0, end: "max",
  onUpdate: (self) => {
    header.classList.toggle("scrolled", self.scroll() > 40);
    progress.style.width = (self.progress * 100).toFixed(2) + "%";
  }
});

/* ---------- Menú móvil ---------- */
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("navMenu");
const backdrop = document.getElementById("navBackdrop");

function setMenu(open) {
  menu.classList.toggle("open", open);
  backdrop.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
backdrop.addEventListener("click", () => setMenu(false));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Botones magnéticos ---------- */
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    gsap.to(btn, {
      x: (e.clientX - r.left - r.width / 2) * 0.35,
      y: (e.clientY - r.top - r.height / 2) * 0.45,
      duration: 0.5, ease: "power3.out"
    });
  });
  btn.addEventListener("mouseleave", () =>
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" })
  );
});

/* ---------- Brillo que sigue al cursor en las tarjetas ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* ============================================================
   matchMedia: animaciones completas vs. reduced-motion
   ============================================================ */
const mm = gsap.matchMedia();

mm.add(
  {
    isDesktop: "(min-width: 981px)",
    reduceMotion: "(prefers-reduced-motion: reduce)"
  },
  (ctx) => {
    const { reduceMotion } = ctx.conditions;

    /* ----- Si el usuario prefiere menos movimiento: solo revelar ----- */
    if (reduceMotion) {
      gsap.set("[data-anim='hero'], [data-reveal], [data-card], [data-step]", { opacity: 1, y: 0 });
      return;
    }

    /* ----- Timeline de entrada del HERO ----- */
    const heroTl = gsap.timeline({ delay: 0.2 });
    heroTl
      .from("[data-anim='hero']", {
        y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power3.out"
      })
      .from(".hero__visual .orbit", {
        scale: 0.6, autoAlpha: 0, rotation: -40, duration: 1.2, ease: "back.out(1.4)"
      }, "-=0.8");

    /* ----- Isotipo de doble órbita en movimiento continuo ----- */
    gsap.to(".orbit__arc--top, .orbit__sat--top", { rotation: 360, duration: 14, repeat: -1, ease: "none", svgOrigin: "160 160" });
    gsap.to(".orbit__arc--bottom, .orbit__sat--bottom", { rotation: -360, duration: 18, repeat: -1, ease: "none", svgOrigin: "160 160" });
    gsap.to(".orbit__ring--inner", { rotation: 360, duration: 30, repeat: -1, ease: "none", svgOrigin: "160 160" });
    gsap.to(".orbit__core", { scale: 1.12, transformOrigin: "160px 160px", duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.fromTo(".orbit__core-glow",
      { scale: 1, autoAlpha: 0.6 },
      { scale: 2.4, autoAlpha: 0, transformOrigin: "160px 160px", duration: 2.2, repeat: -1, ease: "power1.out" }
    );

    /* ----- Parallax sutil del isotipo al hacer scroll ----- */
    gsap.to(".hero__visual", {
      y: 120, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
    });

    return () => {}; // limpieza automática vía matchMedia
  }
);

/* ============================================================
   Animaciones de scroll comunes (todas las resoluciones)
   ============================================================ */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduced) {
  /* ----- Encabezados de sección + bloques reveal ----- */
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 50, autoAlpha: 0, duration: 0.9,
      scrollTrigger: { trigger: el, start: "top 82%" }
    });
  });

  /* ----- Tarjetas (servicios, valores) con batch + stagger ----- */
  gsap.set("[data-card]", { y: 60, autoAlpha: 0 });
  ScrollTrigger.batch("[data-card]", {
    start: "top 88%",
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: "power3.out", overwrite: true })
  });

  /* ----- Pasos del proceso + progreso de la línea ----- */
  gsap.set("[data-step]", { y: 40, autoAlpha: 0 });
  ScrollTrigger.batch("[data-step]", {
    start: "top 85%",
    onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.15, overwrite: true })
  });
  gsap.to(".timeline__progress", {
    width: "100%", ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: 1 }
  });

  /* ----- Chips de tecnología ----- */
  gsap.set("[data-chip]", { scale: 0.6, autoAlpha: 0 });
  ScrollTrigger.batch("[data-chip]", {
    start: "top 88%",
    onEnter: (batch) =>
      gsap.to(batch, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: { each: 0.06, from: "random" }, ease: "back.out(1.7)", overwrite: true })
  });

  /* ----- Marquee infinito de tecnologías ----- */
  const track = document.querySelector(".marquee__track");
  if (track) {
    gsap.to(track, {
      xPercent: -50, repeat: -1, duration: 22, ease: "none"
    });
  }
} else {
  /* Sin animación: aseguramos visibilidad */
  gsap.set("[data-reveal], [data-card], [data-step], [data-chip]", { autoAlpha: 1, y: 0, scale: 1 });
}

/* ============================================================
   Formulario de contacto (demo)
   ============================================================ */
const form = document.getElementById("contactForm");
const hint = document.getElementById("formHint");
const CONTACT_EMAIL = "rbtechsolutionspy@gmail.com";
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const nombre = (data.get("nombre") || "").toString().trim();
  const email = (data.get("email") || "").toString().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    hint.style.color = "#ff6b6b";
    hint.textContent = "Por favor ingresa un correo válido.";
    return;
  }
  // Abre el cliente de correo con la propuesta dirigida a R&B Tech Solutions
  const subject = encodeURIComponent(`Solicitud de propuesta — ${nombre || "Nuevo contacto"}`);
  const body = encodeURIComponent(
    `Hola R&B Tech Solutions,\n\nMe gustaría solicitar una propuesta.\n\nNombre: ${nombre}\nCorreo: ${email}\n\nCuéntanos sobre tu proyecto:\n`
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  hint.style.color = "";
  hint.textContent = "Abriendo tu correo para enviar la propuesta…";
  form.reset();
  gsap.fromTo(hint, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 });
});

/* ============================================================
   Video CargaPy: reproduce al entrar en pantalla + control de sonido
   ============================================================ */
const cargapyVideo = document.getElementById("cargapyVideo");
const soundBtn = document.getElementById("cargapySound");
if (cargapyVideo) {
  // Reproduce (silenciado) solo cuando es visible; pausa al salir (ahorra recursos)
  ScrollTrigger.create({
    trigger: cargapyVideo,
    start: "top 85%",
    end: "bottom 15%",
    onEnter: () => cargapyVideo.play().catch(() => {}),
    onEnterBack: () => cargapyVideo.play().catch(() => {}),
    onLeave: () => cargapyVideo.pause(),
    onLeaveBack: () => cargapyVideo.pause()
  });

  // Botón para activar/silenciar el audio
  soundBtn.addEventListener("click", () => {
    cargapyVideo.muted = !cargapyVideo.muted;
    soundBtn.classList.toggle("is-on", !cargapyVideo.muted);
    soundBtn.setAttribute("aria-label", cargapyVideo.muted ? "Activar sonido" : "Silenciar");
    if (!cargapyVideo.muted) cargapyVideo.play().catch(() => {});
  });
}

/* Recalcular posiciones cuando carguen las fuentes/imágenes */
window.addEventListener("load", () => ScrollTrigger.refresh());
