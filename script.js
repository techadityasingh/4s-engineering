/*
  4S Engineering — interactions
  - Navbar shadow on scroll
  - Smooth scroll to sections
  - Certificate modal open/close
*/

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".site-header");
  const yearEl = document.getElementById("year");
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.getElementById("primary-nav");
  const backToTopBtn = document.getElementById("back-to-top");

  const certModal = document.getElementById("cert-modal");
  const certModalImage = certModal ? certModal.querySelector(".modal-image") : null;
  const serviceModal = document.getElementById("service-modal");

  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  const contactSubmit = document.getElementById("contact-submit");
  const contactFormCard = contactForm ? contactForm.closest(".form-card") : null;

  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  let activeModal = null;
  let lastFocusedElement = null;
  let scrollLockCount = 0;

  const lockScroll = () => {
    scrollLockCount += 1;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  };

  // Set year in footer
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Navbar shadow on scroll + back-to-top
  const onScroll = () => {
    const scrolled = window.scrollY > 6;
    if (header) header.classList.toggle("is-scrolled", scrolled);
    if (backToTopBtn) backToTopBtn.classList.toggle("is-visible", window.scrollY > 600);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const closeMobileNav = () => {
    if (!navToggle || !navList) return;
    navList.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const openMobileNav = () => {
    if (!navToggle || !navList) return;
    navList.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  };

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.contains("is-open");
      if (isOpen) closeMobileNav();
      else openMobileNav();
    });
  }

  // Smooth scroll (JS enhanced). Also closes mobile nav.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMobileNav();

      const headerOffset = header ? header.offsetHeight : 0;
      const rect = target.getBoundingClientRect();
      const top = window.pageYOffset + rect.top - headerOffset + 1;

      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  // Scroll-based reveal
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  }

  // Modal utilities (certificates + services)
  const openModal = (modalEl) => {
    if (!modalEl) return;

    if (activeModal && activeModal !== modalEl) {
      closeModal(activeModal);
    }

    lastFocusedElement = document.activeElement;
    activeModal = modalEl;

    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    lockScroll();

    const closeBtn = modalEl.querySelector(".modal-close");
    if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
  };

  const closeModal = (modalEl) => {
    if (!modalEl) return;

    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    unlockScroll();

    if (modalEl === certModal && certModalImage) {
      certModalImage.src = "";
      certModalImage.alt = "";
    }

    if (activeModal === modalEl) activeModal = null;

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  const wireModal = (modalEl) => {
    if (!modalEl) return;

    modalEl.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.hasAttribute("data-modal-close")) {
        closeModal(modalEl);
      }
    });
  };

  wireModal(certModal);
  wireModal(serviceModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });

  // Certificate modal open
  document.querySelectorAll(".js-cert").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-full-src");
      const alt = btn.getAttribute("data-alt") || "Certificate";
      if (!src || !certModal || !certModalImage) return;
      certModalImage.src = src;
      certModalImage.alt = alt;
      openModal(certModal);
    });
  });

  // Service cards: open service modal with details
  const serviceData = {
    panels: {
      kicker: "Division",
      title: "Panel Manufacturing Division",
      text: "Quality-focused panel manufacturing aligned to specifications, built with disciplined workmanship and verification checks.",
      bullets: [
        "LT / HT panel manufacturing",
        "Neat wiring, labeling, and documentation",
        "Quality checks before dispatch",
        "Standards-compliant build practices",
      ],
    },
    turnkey: {
      kicker: "Division",
      title: "Turnkey Project Division",
      text: "End-to-end delivery for industrial electrical projects with structured planning, safe execution, and clear handover.",
      bullets: [
        "Planning and scope coordination",
        "Installation and supervision",
        "Testing and commissioning",
        "Handover documentation",
      ],
    },
  };

  const serviceKicker = document.getElementById("service-kicker");
  const serviceTitle = document.getElementById("service-title");
  const serviceText = document.getElementById("service-text");
  const serviceList = document.getElementById("service-list");

  document.querySelectorAll(".js-service").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-service") || "";
      const data = serviceData[key];
      if (!data || !serviceModal) return;

      if (serviceKicker) serviceKicker.textContent = data.kicker;
      if (serviceTitle) serviceTitle.textContent = data.title;
      if (serviceText) serviceText.textContent = data.text;
      if (serviceList) {
        serviceList.innerHTML = "";
        data.bullets.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t;
          serviceList.appendChild(li);
        });
      }

      openModal(serviceModal);
    });
  });

  // FAQ accordion
  const faqButtons = Array.from(document.querySelectorAll(".js-faq"));
  const setFaqOpen = (btn, open) => {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  faqButtons.forEach((btn) => {
    setFaqOpen(btn, false);
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      faqButtons.forEach((b) => setFaqOpen(b, false));
      setFaqOpen(btn, !isOpen);
    });
  });

  // Contact form (no backend): animated success feedback
  const setFormStatus = ({ message, variant }) => {
    if (!contactStatus) return;
    contactStatus.textContent = message || "";
    contactStatus.classList.remove("is-success", "is-error");
    if (variant === "success") contactStatus.classList.add("is-success");
    if (variant === "error") contactStatus.classList.add("is-error");
  };

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      setFormStatus({ message: "", variant: null });
      if (contactFormCard) contactFormCard.classList.remove("is-success");

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        setFormStatus({ message: "Please complete the required fields.", variant: "error" });
        return;
      }

      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Sending...";
      }

      window.setTimeout(() => {
        if (contactFormCard) contactFormCard.classList.add("is-success");
        setFormStatus({ message: "Message received. We will contact you shortly.", variant: "success" });

        window.setTimeout(() => {
          contactForm.reset();
          if (contactSubmit) {
            contactSubmit.disabled = false;
            contactSubmit.textContent = "Send Message";
          }
        }, 900);
      }, 500);
    });
  }

  // Back to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      closeMobileNav();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  // Close mobile nav on resize up
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 820) {
        closeMobileNav();
      }
    },
    { passive: true }
  );
  // Contact form toggle (message icon → form)
const openFormBtn = document.getElementById("open-message-form");
const formWrapper = document.getElementById("contact-form-wrapper");

if (openFormBtn && formWrapper) {
  openFormBtn.addEventListener("click", () => {
    openFormBtn.style.display = "none";
    formWrapper.hidden = false;

    const firstInput = formWrapper.querySelector("input");
    if (firstInput) firstInput.focus();
  });
}

// Active nav link on scroll
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

function setActiveLink() {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("is-active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("is-active");
    }
  });
}

window.addEventListener("scroll", setActiveLink);

  if (window.scrollY > 80) {
    header.classList.add("is-sticky");
  } else {
    header.classList.remove("is-sticky");
  }
  // Enhanced contact form handling
  const enhancedForm = document.getElementById('contact-form-enhanced');
  const enhancedStatus = document.getElementById('contact-status-enhanced');
  const enhancedSubmit = document.getElementById('contact-submit-enhanced');

  if (enhancedForm && enhancedStatus && enhancedSubmit) {
    enhancedForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!enhancedForm.checkValidity()) {
        enhancedForm.reportValidity();
        return;
      }

      // Disable button
      enhancedSubmit.disabled = true;
      enhancedSubmit.innerHTML = '<span>Sending...</span>';
      enhancedStatus.textContent = '';
      enhancedStatus.classList.remove('is-success', 'is-error');

      // Simulate sending (replace with actual backend call)
      setTimeout(() => {
        enhancedStatus.textContent = 'Message sent successfully! We\'ll get back to you soon.';
        enhancedStatus.classList.add('is-success');
        
        setTimeout(() => {
          enhancedForm.reset();
          enhancedSubmit.disabled = false;
          enhancedSubmit.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          
          setTimeout(() => {
            enhancedStatus.textContent = '';
            enhancedStatus.classList.remove('is-success');
          }, 3000);
        }, 1000);
      }, 1500);
    });
  }
});



