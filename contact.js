/* ============================================
   VARUNEXA TECHNOLOGY — Contact Form Handler
   Client-side validation & Supabase submission
   ============================================ */

(function() {
  'use strict';

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  // ========== VALIDATION ==========
  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Please enter your name';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return null;
    },
    email: (value) => {
      if (!value.trim()) return 'Please enter your email';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email';
      return null;
    },
    phone: (value) => {
      if (value && value.trim()) {
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) return 'Please enter a valid phone number';
      }
      return null;
    },
    requirements: (value) => {
      if (!value.trim()) return 'Please describe your project requirements';
      if (value.trim().length < 10) return 'Please provide more details (at least 10 characters)';
      return null;
    }
  };

  function validateField(name, value) {
    if (validators[name]) {
      return validators[name](value);
    }
    return null;
  }

  function showFieldError(fieldId, message) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    if (group) {
      group.classList.add('error');
      const errorText = group.querySelector('.error-text');
      if (errorText) errorText.textContent = message;
    }
  }

  function clearFieldError(fieldId) {
    const group = document.getElementById(fieldId)?.closest('.form-group');
    if (group) {
      group.classList.remove('error');
    }
  }

  // Real-time validation on blur
  ['contact-name', 'contact-email', 'contact-phone', 'contact-requirements'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('blur', () => {
        const name = field.name;
        const error = validateField(name, field.value);
        if (error) {
          showFieldError(id, error);
        } else {
          clearFieldError(id);
        }
      });

      field.addEventListener('input', () => {
        clearFieldError(id);
      });
    }
  });


  // ========== FORM SUBMISSION ==========
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let hasErrors = false;
    const formData = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      phone: document.getElementById('contact-phone').value,
      business: document.getElementById('contact-business').value,
      requirements: document.getElementById('contact-requirements').value
    };

    // Validate required fields
    const fieldMap = {
      name: 'contact-name',
      email: 'contact-email',
      phone: 'contact-phone',
      requirements: 'contact-requirements'
    };

    for (const [name, id] of Object.entries(fieldMap)) {
      const error = validateField(name, formData[name]);
      if (error) {
        showFieldError(id, error);
        hasErrors = true;
      }
    }

    if (hasErrors) return;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Call FastAPI backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Success
      window.showToast('Message sent successfully! We\'ll get back to you soon. 🚀', 'success');
      form.reset();

    } catch (error) {
      console.error('Form submission error:', error);
      window.showToast('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

})();
