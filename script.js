/* ============================================================
   ARKHE — shared interactions
============================================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector(".cursor");
  if (cursor && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
    document.querySelectorAll("a, button, .pcard, .gcard, .cat, .bubble").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("grow"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("grow"));
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open");
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Drag-to-scroll sliders ---------- */
  document.querySelectorAll(".slider").forEach(slider => {
    let isDown = false, startX, scrollLeft;
    slider.addEventListener("mousedown", (e) => {
      isDown = true; slider.classList.add("dragging");
      startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
    });
    ["mouseleave", "mouseup"].forEach(ev => slider.addEventListener(ev, () => {
      isDown = false; slider.classList.remove("dragging");
    }));
    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  });
  document.querySelectorAll("[data-slide]").forEach(btn => {
    btn.addEventListener("click", () => {
      const slider = document.querySelector(btn.dataset.target);
      const dir = btn.dataset.slide === "next" ? 1 : -1;
      slider.scrollBy({ left: dir * 380, behavior: "smooth" });
    });
  });

  /* ---------- Project filters ---------- */
  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".gcard");
  if (chips.length) {
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const f = chip.dataset.filter;
        cards.forEach(card => {
          const match = f === "all" || card.dataset.category === f;
          card.classList.toggle("hide", !match);
        });
      });
    });
  }

  /* ---------- Deep-link support: work.html?category=research
     pre-applies the matching filter chip on page load ---------- */
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category");
  if (requestedCategory) {
    const match = document.querySelector(`.chip[data-filter="${requestedCategory}"]`);
    if (match) match.click();
  }

  /* ---------- Project page navigation ---------- */
  document.querySelectorAll("[data-project]").forEach(card => {
    card.addEventListener("click", () => {
      const page = card.dataset.page;
      if (page) {
        window.location.href = page;
      }
    });
  });

  /* ---------- Timeline scroll progress ---------- */
  const tl = document.querySelector(".timeline");
  if (tl) {
    const items = tl.querySelectorAll(".tl-item");
    window.addEventListener("scroll", () => {
      const rect = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const passed = Math.min(Math.max(vh * 0.65 - rect.top, 0), total);
      tl.style.setProperty("--tl-progress", (passed / total) * 100 + "%");
      items.forEach(item => {
        const r = item.getBoundingClientRect();
        item.classList.toggle("passed", r.top < vh * 0.65);
      });
    }, { passive: true });
    window.dispatchEvent(new Event("scroll"));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(item => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  /* ---------- Map pins tooltip ---------- */
  document.querySelectorAll(".pin").forEach(pin => {
    const tip = document.getElementById(pin.dataset.tip);
    if (!tip) return;
    pin.addEventListener("mouseenter", (e) => {
      tip.classList.add("show");
      const box = pin.closest(".map-card").getBoundingClientRect();
      const p = pin.getBoundingClientRect();
      tip.style.left = (p.left - box.left + p.width / 2) + "px";
      tip.style.top = (p.top - box.top) + "px";
    });
    pin.addEventListener("mouseleave", () => tip.classList.remove("show"));
  });

  /* ---------- Contact form — single handler, sends via FormSubmit ---------- */
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type=submit]");
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "<span>Sending…</span>";

      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(contactForm)
        });
        if (!res.ok) throw new Error("Request failed: " + res.status);

        contactForm.style.display = "none";
        if (formSuccess) formSuccess.style.display = "block";

      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        alert("Could not send — please email tejasjadhav7110@gmail.com directly.");
      }
    });
  }

});