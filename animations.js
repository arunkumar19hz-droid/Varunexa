/* ============================================
   VARUNEXA TECHNOLOGY — Animations Engine
   Scroll reveals, particle system, parallax
   ============================================ */

(function() {
  'use strict';

  // ========== PARTICLE SYSTEM ==========
  class ParticleSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.connections = [];
      this.mouse = { x: null, y: null, radius: 150 };
      this.animationId = null;
      
      this.resize();
      this.init();
      this.bindEvents();
      this.animate();
    }

    resize() {
      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;
    }

    init() {
      this.particles = [];
      const particleCount = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 15000), 80);
      
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: Math.random() > 0.5 ? '99, 102, 241' : '139, 92, 246'
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.init();
      });

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update & draw particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        
        // Mouse interaction
        if (this.mouse.x !== null && this.mouse.y !== null) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < this.mouse.radius) {
            const force = (this.mouse.radius - dist) / this.mouse.radius;
            p.vx -= (dx / dist) * force * 0.02;
            p.vy -= (dy / dist) * force * 0.02;
          }
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Boundary check
        if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

        // Damping
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        this.ctx.fill();

        // Draw connections
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }


  // ========== SCROLL REVEAL ==========
  class ScrollReveal {
    constructor() {
      this.elements = [];
      this.observer = null;
      this.init();
    }

    init() {
      this.elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              // Optionally unobserve after revealed
              // this.observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => this.observer.observe(el));
      } else {
        // Fallback: reveal all
        this.elements.forEach(el => el.classList.add('revealed'));
      }
    }
  }


  // ========== COUNTER ANIMATION ==========
  class CounterAnimation {
    constructor() {
      this.counters = document.querySelectorAll('.stat-number[data-target]');
      this.observed = new Set();
      this.init();
    }

    init() {
      if (!this.counters.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.observed.has(entry.target)) {
            this.observed.add(entry.target);
            this.animateCounter(entry.target);
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
      const target = parseInt(element.dataset.target);
      const suffix = element.textContent.replace(/[0-9]/g, '');
      const duration = 2000;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        
        element.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.textContent = target + suffix;
        }
      };

      requestAnimationFrame(update);
    }
  }


  // ========== TILT EFFECT ==========
  class TiltEffect {
    constructor() {
      this.cards = document.querySelectorAll('.service-card, .why-card');
      this.init();
    }

    init() {
      if (window.matchMedia('(hover: hover)').matches) {
        this.cards.forEach(card => {
          card.addEventListener('mousemove', (e) => this.handleMove(e, card));
          card.addEventListener('mouseleave', (e) => this.handleLeave(e, card));
        });
      }
    }

    handleMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    }

    handleLeave(e, card) {
      card.style.transform = '';
    }
  }


  // ========== INITIALIZE ==========
  window.addEventListener('DOMContentLoaded', () => {
    // Page loader
    const loader = document.getElementById('page-loader');
    if (loader) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          loader.classList.add('hidden');
          // Start animations after loader
          new ScrollReveal();
          new CounterAnimation();
          new TiltEffect();
        }, 600);
      });
    } else {
      new ScrollReveal();
      new CounterAnimation();
      new TiltEffect();
    }

    // Particle system
    new ParticleSystem('hero-canvas');
  });

})();
