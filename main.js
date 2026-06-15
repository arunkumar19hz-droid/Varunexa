/* ============================================
   VARUNEXA TECHNOLOGY — Main UI Logic
   Navigation, testimonials, portfolio filter, etc.
   ============================================ */

(function() {
  'use strict';

  // ========== NAVBAR ==========
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('nav-links');
  const menuToggle = document.getElementById('menu-toggle');
  const scrollTop = document.getElementById('scroll-top');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Scroll-based navbar background
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Show/hide scroll to top
    if (scrollTop) {
      if (currentScroll > 500) {
        scrollTop.classList.add('visible');
      } else {
        scrollTop.classList.remove('visible');
      }
    }

    // Active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });

    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Close mobile menu on link click
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Scroll to top
  if (scrollTop) {
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ========== TESTIMONIAL SLIDER ==========
  const track = document.getElementById('testimonials-track');
  const dots = document.querySelectorAll('#testimonial-dots .dot');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  let currentSlide = 0;
  let testimonialCount = 0;
  let autoSlideInterval = null;

  if (track) {
    testimonialCount = track.children.length;

    function goToSlide(index) {
      if (index < 0) index = testimonialCount - 1;
      if (index >= testimonialCount) index = 0;
      
      currentSlide = index;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    // Dot navigation
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.index));
        resetAutoSlide();
      });
    });

    // Arrow navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoSlide();
      });
    }

    // Auto-slide
    function startAutoSlide() {
      autoSlideInterval = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 5000);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }

    startAutoSlide();

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
        resetAutoSlide();
      }
    }, { passive: true });
  }


  // ========== PORTFOLIO FILTER ==========
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      portfolioCards.forEach(card => {
        const category = card.dataset.category;
        
        if (filter === 'all' || category === filter) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 400);
        }
      });
    });
  });


  // ========== SMOOTH SCROLL FOR ANCHORS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });


  // ========== NEWSLETTER FORM ==========
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thanks for subscribing! 🎉', 'success');
      newsletterForm.reset();
    });
  }


  // ========== TOAST NOTIFICATION ==========
  window.showToast = function(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');

    icon.textContent = type === 'success' ? '✅' : '❌';
    msg.textContent = message;
    
    toast.className = `toast ${type}`;
    
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

})();
