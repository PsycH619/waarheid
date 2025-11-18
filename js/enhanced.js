/**
 * Waarheid Marketing - Enhanced Interactions
 * Modals, Galleries, Filters, Animations
 */

document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // Modal System
  // ============================================
  const modals = {};

  // Create modal overlay if it doesn't exist
  function createModalOverlay() {
    let overlay = document.querySelector('.modal-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3></h3>
            <button class="modal-close" aria-label="Close modal">×</button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Close on overlay click
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeModal();
        }
      });

      // Close button
      overlay.querySelector('.modal-close').addEventListener('click', closeModal);

      // Close on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeModal();
        }
      });
    }

    return overlay;
  }

  // Open modal with content
  window.openModal = function(config) {
    const overlay = createModalOverlay();
    const modal = overlay.querySelector('.modal-content');
    const header = modal.querySelector('.modal-header h3');
    const body = modal.querySelector('.modal-body');
    const footer = modal.querySelector('.modal-footer');

    // Set header
    header.innerHTML = config.icon ?
      `<div class="modal-header-icon">${config.icon}</div><span>${config.title}</span>` :
      config.title;

    // Set body
    body.innerHTML = config.content || '';

    // Set footer
    if (config.footer) {
      footer.innerHTML = config.footer;
      footer.style.display = 'block';
    } else {
      footer.style.display = 'none';
    }

    // Show modal with a small delay to ensure DOM is ready
    setTimeout(() => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }, 10);
  };

  // Close modal
  window.closeModal = function() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Service detail modal trigger
  document.querySelectorAll('[data-service-modal]').forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const serviceData = JSON.parse(this.getAttribute('data-service-modal'));

      openModal({
        title: serviceData.title,
        icon: serviceData.icon || '<i class="fas fa-rocket"></i>',
        content: `
          <div class="modal-text-section">
            <div class="modal-text-block">
              <h4>What It Is</h4>
              <p>${serviceData.description || ''}</p>
            </div>
            <div class="modal-text-block">
              <h4>Who It's For</h4>
              <p>${serviceData.target || ''}</p>
            </div>
            <div class="modal-text-block">
              <h4>Key Benefits</h4>
              <ul>
                ${(serviceData.benefits || []).map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
            <div class="modal-text-block">
              <h4>Our Process</h4>
              <p>${serviceData.process || ''}</p>
            </div>
          </div>
          <div class="modal-media-section">
            <div class="modal-media-carousel">
              ${serviceData.media ? createMediaHTML(serviceData.media) : ''}
            </div>
          </div>
        `,
        footer: `
          <a href="#contact" class="btn btn-primary" onclick="closeModal()">Book a Consultation</a>
          ${serviceData.caseStudies ? '<a href="#" class="btn btn-outline">View Case Studies</a>' : ''}
        `
      });
    });
  });

  // ============================================
  // Portfolio Filter System
  // ============================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');

  // Add transition styles to portfolio items
  portfolioItems.forEach(item => {
    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');

        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Filter items with smoother transitions
        portfolioItems.forEach(item => {
          const categories = item.getAttribute('data-categories').split(',');

          if (filter === 'all' || categories.includes(filter)) {
            // Show items
            item.style.display = 'block';
            item.style.pointerEvents = 'auto';
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1) translateY(0)';
            });
          } else {
            // Hide items
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95) translateY(10px)';
            item.style.pointerEvents = 'none';
            setTimeout(() => {
              item.style.display = 'none';
            }, 400);
          }
        });
      });
    });
  }

  // ============================================
  // Image Gallery / Carousel
  // ============================================
  class ImageGallery {
    constructor(element) {
      this.gallery = element;
      this.images = element.querySelectorAll('.gallery-images img');
      this.currentIndex = 0;
      this.setupNavigation();
    }

    setupNavigation() {
      const nav = this.gallery.querySelector('.gallery-nav');
      if (!nav) return;

      nav.querySelector('.gallery-prev').addEventListener('click', () => this.prev());
      nav.querySelector('.gallery-next').addEventListener('click', () => this.next());
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.updateGallery();
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.updateGallery();
    }

    updateGallery() {
      const container = this.gallery.querySelector('.gallery-images');
      container.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
  }

  // Initialize galleries
  document.querySelectorAll('.image-gallery').forEach(gallery => {
    new ImageGallery(gallery);
  });

  // ============================================
  // Portfolio/Case Study Detail Modal
  // ============================================
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('click', function() {
      const data = JSON.parse(this.getAttribute('data-case-study') || '{}');

      openModal({
        title: data.title || 'Case Study',
        content: `
          <div style="width: 100%;">
            ${data.video ? `
              <div style="position: relative; padding-bottom: 56.25%; height: 0; margin-bottom: 2rem;">
                <iframe
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
                  src="${data.video}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2rem;">
              <div>
                <h4 style="color: var(--color-primary); margin-bottom: 1rem;">Overview</h4>
                <p>${data.overview || ''}</p>

                <h4 style="color: var(--color-primary); margin-top: 2rem; margin-bottom: 1rem;">Challenge</h4>
                <p>${data.challenge || ''}</p>
              </div>

              <div>
                <h4 style="color: var(--color-primary); margin-bottom: 1rem;">Solution</h4>
                <p>${data.solution || ''}</p>

                <h4 style="color: var(--color-primary); margin-top: 2rem; margin-bottom: 1rem;">Results</h4>
                <div class="stats-grid" style="margin: 1rem 0;">
                  ${(data.results || []).map(r => `
                    <div class="stat-card">
                      <div class="stat-number">${r.value}</div>
                      <div class="stat-label">${r.label}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            ${data.images && data.images.length > 0 ? `
              <div style="margin-top: 3rem;">
                <h4 style="color: var(--color-primary); margin-bottom: 1rem;">Project Gallery</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                  ${data.images.map(img => `<img src="${img}" style="width: 100%; border-radius: 8px;" alt="Project screenshot">`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `,
        footer: '<a href="#contact" class="btn btn-primary" onclick="closeModal()">Start Your Project</a>'
      });
    });
  });

  // ============================================
  // Video Play Button Overlay
  // ============================================
  document.querySelectorAll('.portfolio-play-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.portfolio-card');
      const videoUrl = card.getAttribute('data-video-url');

      if (videoUrl) {
        openModal({
          title: 'Project Video',
          content: `
            <div style="position: relative; padding-bottom: 56.25%; height: 0;">
              <iframe
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
                src="${videoUrl}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          `
        });
      }
    });
  });

  // ============================================
  // Hover Video Preview (Category Cards)
  // ============================================
  document.querySelectorAll('.category-card').forEach(card => {
    const video = card.querySelector('.category-card-video');

    if (video) {
      card.addEventListener('mouseenter', function() {
        video.play().catch(e => console.log('Video play failed:', e));
      });

      card.addEventListener('mouseleave', function() {
        video.pause();
        video.currentTime = 0;
      });
    }
  });

  // ============================================
  // Scroll Triggered Animations
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply to all cards
  document.querySelectorAll('.category-card, .service-card-enhanced, .portfolio-card, .industry-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(el);
  });

  // ============================================
  // Counter Animation (Stats)
  // ============================================
  function animateCounter(element, target, duration = 2000, suffix = '') {
    let current = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.round(target) + suffix;
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current) + suffix;
      }
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const number = entry.target.querySelector('.stat-number');
        const target = parseInt(number.getAttribute('data-count'));
        const suffix = number.getAttribute('data-suffix') || '';
        animateCounter(number, target, 2000, suffix);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-card').forEach(stat => {
    statsObserver.observe(stat);
  });

  // ============================================
  // Lazy Load Images
  // ============================================
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  // ============================================
  // Helper Functions
  // ============================================
  function createMediaHTML(media) {
    if (Array.isArray(media)) {
      return `
        <div class="image-gallery">
          <div class="gallery-images">
            ${media.map(m => {
              if (m.type === 'video') {
                return `<video src="${m.url}" controls style="width: 100%;"></video>`;
              } else {
                return `<img src="${m.url}" alt="${m.alt || 'Service image'}">`;
              }
            }).join('')}
          </div>
          ${media.length > 1 ? `
            <div class="gallery-nav">
              <button class="gallery-prev">‹</button>
              <button class="gallery-next">›</button>
            </div>
          ` : ''}
        </div>
      `;
    } else if (media.includes('youtube.com') || media.includes('vimeo.com')) {
      return `
        <div style="position: relative; padding-bottom: 56.25%; height: 0;">
          <iframe
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            src="${media}"
            frameborder="0"
            allowfullscreen>
          </iframe>
        </div>
      `;
    } else {
      return `<img src="${media}" alt="Service image" style="width: 100%; border-radius: 8px;">`;
    }
  }

  console.log('Enhanced features loaded successfully');
});