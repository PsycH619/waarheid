/**
 * Waarheid Marketing - Authentication JavaScript
 * Handles sign in, sign up, and password reset functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // Sign In Form Handler
  // ============================================
  const signinForm = document.getElementById('signin-form');

  if (signinForm) {
    signinForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = this.querySelector('#email').value;
      const password = this.querySelector('#password').value;
      const remember = this.querySelector('input[name="remember"]').checked;

      // Clear any existing messages
      clearFormMessages();

      // Validate inputs
      if (!validateEmail(email)) {
        showFormMessage('Please enter a valid email address', 'error');
        return;
      }

      if (password.length < 8) {
        showFormMessage('Password must be at least 8 characters', 'error');
        return;
      }

      // Show loading state
      const submitBtn = this.querySelector('.btn-submit');
      setButtonLoading(submitBtn, true);

      // Simulate API call (replace with actual authentication)
      setTimeout(() => {
        // For demo purposes, accept any email/password
        // In production, this would make an API call to verify credentials

        // Store auth token (demo)
        localStorage.setItem('authToken', 'demo_token_' + Date.now());
        localStorage.setItem('userEmail', email);

        if (remember) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Show success message
        showFormMessage('Sign in successful! Redirecting...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);

      }, 1500);
    });
  }

  // ============================================
  // Sign Up Form Handler
  // ============================================
  const signupForm = document.getElementById('signup-form');

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const firstName = this.querySelector('#first-name').value.trim();
      const lastName = this.querySelector('#last-name').value.trim();
      const company = this.querySelector('#company').value.trim();
      const email = this.querySelector('#email').value.trim();
      const password = this.querySelector('#password').value;
      const confirmPassword = this.querySelector('#confirm-password').value;
      const termsAccepted = this.querySelector('input[name="terms"]').checked;

      // Clear any existing messages
      clearFormMessages();

      // Validate inputs
      if (!firstName || !lastName) {
        showFormMessage('Please enter your full name', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showFormMessage('Please enter a valid email address', 'error');
        return;
      }

      if (password.length < 8) {
        showFormMessage('Password must be at least 8 characters', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showFormMessage('Passwords do not match', 'error');
        return;
      }

      if (!termsAccepted) {
        showFormMessage('Please accept the Terms of Service and Privacy Policy', 'error');
        return;
      }

      // Show loading state
      const submitBtn = this.querySelector('.btn-submit');
      setButtonLoading(submitBtn, true);

      // Simulate API call (replace with actual registration)
      setTimeout(() => {
        // For demo purposes, create account automatically
        // In production, this would make an API call to create the account

        // Check if DataManager is available
        if (typeof DataManager !== 'undefined') {
          // Create client in data manager
          const client = DataManager.clients.create({
            firstName,
            lastName,
            company,
            email,
            password: password // In production, this would be hashed
          });

          // Store user data
          const userData = {
            clientId: client.id,
            firstName,
            lastName,
            company,
            email,
            createdAt: new Date().toISOString()
          };

          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('authToken', 'demo_token_' + Date.now());
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', 'client');
        } else {
          // Fallback if DataManager not loaded
          const userData = {
            firstName,
            lastName,
            company,
            email,
            createdAt: new Date().toISOString()
          };

          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('authToken', 'demo_token_' + Date.now());
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', 'client');
        }

        // Show success message
        showFormMessage('Account created successfully! Redirecting...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);

      }, 1500);
    });

    // Real-time password matching validation
    const passwordInput = signupForm.querySelector('#password');
    const confirmPasswordInput = signupForm.querySelector('#confirm-password');

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', function() {
        if (this.value && passwordInput.value !== this.value) {
          this.style.borderColor = '#ef4444';
        } else {
          this.style.borderColor = '';
        }
      });
    }
  }

  // ============================================
  // Social Authentication (Demo)
  // ============================================
  const socialButtons = document.querySelectorAll('.social-btn');

  socialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const provider = this.classList.contains('google') ? 'Google' : 'Microsoft';

      // Show loading state
      const originalHTML = this.innerHTML;
      this.innerHTML = `<i class="fas fa-spinner"></i> Connecting...`;
      this.classList.add('loading');

      // Simulate OAuth redirect (replace with actual OAuth flow)
      setTimeout(() => {
        showFormMessage(`${provider} authentication would redirect here. Demo mode only.`, 'error');
        this.innerHTML = originalHTML;
        this.classList.remove('loading');
      }, 1500);
    });
  });

  // ============================================
  // Forgot Password Link (Demo)
  // ============================================
  const forgotLink = document.querySelector('.forgot-link');

  if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
      e.preventDefault();

      const email = document.querySelector('#email').value;

      if (!email) {
        showFormMessage('Please enter your email address first', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showFormMessage('Please enter a valid email address', 'error');
        return;
      }

      // Simulate password reset email
      showFormMessage('Password reset link sent! Check your email.', 'success');
    });
  }

  // ============================================
  // Helper Functions
  // ============================================

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showFormMessage(message, type = 'info') {
    clearFormMessages();

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;

    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    messageDiv.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `;

    const form = document.querySelector('.auth-form');
    form.insertBefore(messageDiv, form.firstChild);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearFormMessages() {
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
  }

  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-spinner';
      }
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  // ============================================
  // Check if already logged in
  // ============================================
  const authToken = localStorage.getItem('authToken');
  const currentPage = window.location.pathname;

  // If on signin/signup page and already logged in, redirect to dashboard
  if (authToken && (currentPage.includes('signin.html') || currentPage.includes('signup.html'))) {
    window.location.href = 'dashboard.html';
  }

  // ============================================
  // Particles Animation (reuse from main.js)
  // ============================================
  const canvas = document.getElementById('particles-canvas');

  if (canvas) {
    const ctx = canvas.getContext('2d');
    const authSection = document.querySelector('.auth-section');
    let particles = [];

    // Set canvas size
    function resizeCanvas() {
      canvas.width = authSection.offsetWidth;
      canvas.height = authSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.4 + 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        // Light blue color with gradient
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(173, 216, 230, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(135, 206, 235, ${this.opacity * 0.8})`);
        gradient.addColorStop(1, `rgba(100, 149, 237, ${this.opacity * 0.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add white shine
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    function createParticles() {
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    createParticles();

    // Animate particles
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    }
    animate();

    // Recreate particles on resize
    window.addEventListener('resize', () => {
      particles = [];
      createParticles();
    });
  }

  console.log('Waarheid Marketing - Auth System Loaded');
});
