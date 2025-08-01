/*!
* Start Bootstrap - Personal v1.0.1 (https://startbootstrap.com/template-overviews/personal)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-personal/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

// Loading screen
window.addEventListener("load", function() {
  const loading = document.getElementById("loading");
  setTimeout(() => {
    loading.classList.add("hidden");
  }, 1000);
});

// Mobile menu toggle
const mobileToggle = document.getElementById("mobile-toggle");
const navMenu = document.getElementById("nav-menu");

mobileToggle.addEventListener("click", function() {
  navMenu.classList.toggle("active");
  const icon = this.querySelector("i");
  icon.classList.toggle("bi-list");
  icon.classList.toggle("bi-x");
});

// Navbar scroll effect
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", function() {
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      // Close mobile menu if open
      navMenu.classList.remove("active");
      const icon = mobileToggle.querySelector("i");
      icon.classList.add("bi-list");
      icon.classList.remove("bi-x");
    }
  });
});

// Active navigation link
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", function() {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach(el => {
  observer.observe(el);
});

// Enhanced hover effects
document.querySelectorAll(".glass-card").forEach(card => {
  card.addEventListener("mouseenter", function() {
    this.style.transform = "translateY(-8px) scale(1.02)";
  });

  card.addEventListener("mouseleave", function() {
    this.style.transform = "translateY(0) scale(1)";
  });
});

// Parallax effect for background
window.addEventListener("scroll", function() {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector(".bg-animated::before");
  const speed = 0.5;

  // Apply parallax to floating elements
  document.querySelectorAll(".floating-tech").forEach((element, index) => {
    const yPos = -(scrolled * (speed + index * 0.1));
    element.style.transform = `translateY(${yPos}px)`;
  });
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// Initialize typing effect after page load
setTimeout(() => {
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const originalText = heroTitle.innerHTML;
    typeWriter(heroTitle, originalText, 50);
  }
}, 1500);

// Add smooth reveal animation for certificates
const certificateCards = document.querySelectorAll(".certificate-card");
certificateCards.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
});
