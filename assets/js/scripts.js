document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. NAVBAR SCROLL EFFECT
     ========================================================================== */
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     2. MOBILE MENU TOGGLE
     ========================================================================== */
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

  if (mobileMenuBtn && mobileMenuOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (mobileMenuOverlay.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        document.body.style.overflow = 'hidden';
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
      }
    });

    // Close menu when a link is clicked
    const mobileLinks = mobileMenuOverlay.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================================
     3. INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animatedElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }

  /* ==========================================================================
     4. NUMBER COUNTERS (Trust Stats)
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (statNumbers.length > 0) {
    const formatNumber = (num, originalText) => {
      let suffix = '';
      if (originalText.includes('+')) suffix = '+';
      if (originalText.includes('%')) suffix = '%';
      
      // Add commas for thousands
      let formatted = Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return formatted + suffix;
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const originalText = target.innerText;
          const targetNum = parseInt(originalText.replace(/,/g, '').replace(/\+/g, '').replace(/%/g, ''));
          
          if (!isNaN(targetNum)) {
            let currentNum = 0;
            const duration = 2000; // 2 seconds
            const increment = targetNum / (duration / 16); // 60fps

            const updateCounter = () => {
              currentNum += increment;
              if (currentNum < targetNum) {
                target.innerText = formatNumber(currentNum, originalText);
                requestAnimationFrame(updateCounter);
              } else {
                target.innerText = originalText; // Ensure exact final value
              }
            };
            
            updateCounter();
          }
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
      counterObserver.observe(stat);
    });
  }

  /* ==========================================================================
     5. FLEET & GALLERY FILTERING
     ========================================================================== */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterItems = document.querySelectorAll('[data-category]');

  if (filterTabs.length > 0 && filterItems.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        const filterValue = tab.getAttribute('data-filter');

        filterItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category').includes(filterValue)) {
            item.style.display = '';
            // Slight timeout to allow layout computation before animating opacity
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  /* ==========================================================================
     6. CUSTOM LIGHTBOX FOR GALLERY
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  if (galleryItems.length > 0) {
    // Create Lightbox DOM Elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    const contentBox = document.createElement('div');
    contentBox.className = 'lightbox-content';
    
    const img = document.createElement('img');
    img.className = 'lightbox-img';
    
    contentBox.appendChild(img);
    lightbox.appendChild(closeBtn);
    lightbox.appendChild(prevBtn);
    lightbox.appendChild(nextBtn);
    lightbox.appendChild(contentBox);
    document.body.appendChild(lightbox);

    let currentIndex = 0;
    // Store only currently visible items for navigation
    let visibleItems = [];

    const updateVisibleItems = () => {
      visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    };

    const showImage = (index) => {
      if (visibleItems.length === 0) return;
      if (index < 0) index = visibleItems.length - 1;
      if (index >= visibleItems.length) index = 0;
      
      currentIndex = index;
      const sourceImg = visibleItems[currentIndex].querySelector('img');
      img.src = sourceImg.src;
      img.alt = sourceImg.alt || 'Gallery Image';
    };

    const openLightbox = (index) => {
      updateVisibleItems();
      showImage(index);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        img.src = '';
      }, 300);
    };

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        updateVisibleItems();
        const index = visibleItems.indexOf(item);
        if (index > -1) {
          openLightbox(index);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showImage(currentIndex + 1);
    });

    // Close when clicking outside image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === contentBox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  /* ==========================================================================
     7. TESTIMONIALS CAROUSEL
     ========================================================================== */
  const track = document.querySelector('.testimonials-track');
  const prevButton = document.querySelector('.carousel-btn.prev');
  const nextButton = document.querySelector('.carousel-btn.next');
  
  if (track && prevButton && nextButton) {
    let index = 0;
    const cards = Array.from(track.children);
    let autoPlayInterval;
    
    const updateCarousel = () => {
      if (cards.length === 0) return;
      
      // Calculate how many cards are visible based on screen size
      let cardsToShow = 3;
      if (window.innerWidth <= 1024) cardsToShow = 2;
      if (window.innerWidth <= 768) cardsToShow = 1;
      
      const maxIndex = Math.max(0, cards.length - cardsToShow);
      
      if (index > maxIndex) index = 0;
      if (index < 0) index = maxIndex;
      
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = 28; // From CSS
      const amountToMove = index * (cardWidth + gap);
      
      track.style.transform = `translateX(-${amountToMove}px)`;
    };

    const nextSlide = () => {
      index++;
      updateCarousel();
    };

    const prevSlide = () => {
      index--;
      updateCarousel();
    };

    nextButton.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });

    prevButton.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      updateCarousel();
    });

    // Auto-scroll functionality
    const startAutoPlay = () => {
      autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoPlay = () => {
      clearInterval(autoPlayInterval);
    };

    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Initial setup
    updateCarousel();
    startAutoPlay();
  }

  /* ==========================================================================
     8. FAQ ACCORDION
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all others
        faqItems.forEach(faq => faq.classList.remove('active'));
        // Open this if it wasn't active
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

});
