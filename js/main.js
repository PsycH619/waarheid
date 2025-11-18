/**
 * Waarheid Marketing - Main JavaScript
 * Handles all interactive features and animations
 */

document.addEventListener('DOMContentLoaded', function() {
  // ============================================
  // Mobile Menu Toggle
  // ============================================
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class for styling
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // ============================================
  // Scroll to Top Button
  // ============================================
  const scrollToTopBtn = document.querySelector('.scroll-to-top');

  if (scrollToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 500) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ============================================
  // Active Navigation Link
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a');

  function updateActiveNav() {
    const scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Only prevent default for hash links, not for "#" alone
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const headerHeight = header.offsetHeight;
          const targetPosition = target.offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ============================================
  // Intersection Observer for Animations
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all service cards and other elements
  document.querySelectorAll('.service-card, .client-logo').forEach(el => {
    observer.observe(el);
  });

  // ============================================
  // Form Handling
  // ============================================
  const contactForm = document.querySelector('.contact-form form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Disable submit button to prevent double submission
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Get form data
      const formData = new FormData(this);

      // Send data to PHP handler
      fetch('contact-handler.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showNotification(data.message, 'success');
          this.reset();
        } else {
          showNotification(data.message || 'Error sending message. Please try again.', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('Error sending message. Please try again or email us directly.', 'error');
      })
      .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
    });
  }

  // ============================================
  // Notification System
  // ============================================
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 30px;
      padding: 1rem 1.5rem;
      background: ${bgColor};
      color: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // ============================================
  // Counter Animation for Stats (if needed)
  // ============================================
  function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.round(target);
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  }

  // Observe counters if they exist
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-counter'));
          animateCounter(entry.target, target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ============================================
  // Typing Effect for Hero (Optional)
  // ============================================
  function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  // Add typing effect to tagline if it has data-type attribute
  const typingElement = document.querySelector('[data-type]');
  if (typingElement) {
    const text = typingElement.textContent;
    typeWriter(typingElement, text, 50);
  }

  // ============================================
  // Lazy Loading Images
  // ============================================
  const lazyImages = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));

  // ============================================
  // Parallax Effect (Simple)
  // ============================================
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-parallax') || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ============================================
  // Initialize AOS or other animation libraries
  // (Optional - would require including the library)
  // ============================================

  // ============================================
  // Particles Animation for Hero Section
  // ============================================
  const canvas = document.getElementById('particles-canvas');

  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = document.querySelector('.hero');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Set canvas size
    function resizeCanvas() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
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

    // Mouse move parallax effect
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    // Animate particles and parallax
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Apply parallax to background
      const heroImageBg = document.querySelector('.hero-image-bg');
      if (heroImageBg) {
        const moveX = (targetX - canvas.width / 2) * 0.02;
        const moveY = (targetY - canvas.height / 2) * 0.02;
        heroImageBg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
      }

      // Update and draw particles
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

  // ============================================
  // Drag to Scroll for Cards
  // ============================================
  function initDragScroll(container) {
    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });
  }

  // Initialize drag scroll for category and portfolio cards
  initDragScroll(document.querySelector('.category-cards'));
  initDragScroll(document.querySelector('.portfolio-grid'));

  // ============================================
  // Navigation Dots for Cards
  // ============================================
  function initNavigationDots(container, dotsContainer) {
    if (!container || !dotsContainer) return;

    const cards = container.querySelectorAll('.category-card, .portfolio-card');
    const cardCount = cards.length;

    // Set first card as active initially
    if (cards.length > 0) {
      cards[0].classList.add('active');
    }

    // Create dots
    for (let i = 0; i < cardCount; i++) {
      const dot = document.createElement('button');
      dot.classList.add('card-nav-dot');
      dot.setAttribute('aria-label', `Go to card ${i + 1}`);
      if (i === 0) dot.classList.add('active');

      dot.addEventListener('click', () => {
        // Scroll to the card's center position
        const containerRect = container.getBoundingClientRect();
        const cardRect = cards[i].getBoundingClientRect();
        const scrollOffset = cardRect.left - containerRect.left + container.scrollLeft;
        const centerOffset = (containerRect.width - cardRect.width) / 2;

        container.scrollTo({
          left: scrollOffset - centerOffset,
          behavior: 'smooth'
        });
      });

      dotsContainer.appendChild(dot);
    }

    // Update active dot and card on scroll
    let scrollTimeout;
    container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerCenter = container.scrollLeft + container.offsetWidth / 2;

        let closestCard = null;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestCard = index;
          }
        });

        // Update active states
        dotsContainer.querySelectorAll('.card-nav-dot').forEach((dot, index) => {
          if (index === closestCard) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        cards.forEach((card, index) => {
          if (index === closestCard) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });
      }, 100);
    });
  }

  // Initialize navigation dots
  initNavigationDots(
    document.querySelector('.category-cards'),
    document.getElementById('category-dots')
  );
  initNavigationDots(
    document.querySelector('.portfolio-grid'),
    document.getElementById('portfolio-dots')
  );

  console.log('Waarheid Marketing - Website Loaded Successfully');
});

// ============================================
// Add CSS for animations
// ============================================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .fade-in {
    animation: fadeInUp 0.6s ease forwards;
  }
`;
document.head.appendChild(style);