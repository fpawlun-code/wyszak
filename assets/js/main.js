/* ============================================
   BROWAR WYSZAK — Main JavaScript
   ============================================ */

(function () {
    'use strict';

    // --- DOM Ready ---
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        hideLoader();
        initNavbar();
        initMobileMenu();
        initDarkMode();
        initCarousel();
        initLightbox();
        initFadeIn();
        initBackToTop();
        initActiveNavLink();
    }

    // --- Loader ---
    function hideLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return;
        window.addEventListener('load', function () {
            setTimeout(function () {
                loader.classList.add('hidden');
                setTimeout(function () {
                    loader.style.display = 'none';
                }, 500);
            }, 300);
        });
    }

    // --- Sticky Navbar ---
    function initNavbar() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;

        var scrollThreshold = 80;

        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', throttle(handleScroll, 16));
        handleScroll();
    }

    // --- Mobile Menu ---
    function initMobileMenu() {
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('active');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close on link click
        var links = menu.querySelectorAll('.nav-link');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (menu.classList.contains('active') &&
                !menu.contains(e.target) &&
                !toggle.contains(e.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Dark Mode ---
    function initDarkMode() {
        var btn = document.getElementById('darkModeToggle');
        if (!btn) return;

        var stored = localStorage.getItem('browarwyszak-theme');
        if (stored === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        btn.addEventListener('click', function () {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('browarwyszak-theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('browarwyszak-theme', 'dark');
            }
        });
    }

    // --- Carousel ---
    function initCarousel() {
        var track = document.getElementById('carouselTrack');
        var prevBtn = document.getElementById('carouselPrev');
        var nextBtn = document.getElementById('carouselNext');
        var dotsContainer = document.getElementById('carouselDots');

        if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

        var slides = track.querySelectorAll('.carousel-slide');
        var slideCount = slides.length;
        var currentIndex = 0;
        var autoPlayInterval = null;
        var touchStartX = 0;
        var touchEndX = 0;

        // Create dots
        for (var i = 0; i < slideCount; i++) {
            var dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', 'Przejdź do zdjęcia ' + (i + 1));
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dotsContainer.appendChild(dot);
        }

        var dots = dotsContainer.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            if (index < 0) index = slideCount - 1;
            if (index >= slideCount) index = 0;
            currentIndex = index;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        prevBtn.addEventListener('click', function () {
            goToSlide(currentIndex - 1);
            resetAutoPlay();
        });

        nextBtn.addEventListener('click', function () {
            goToSlide(currentIndex + 1);
            resetAutoPlay();
        });

        dotsContainer.addEventListener('click', function (e) {
            var dot = e.target.closest('.carousel-dot');
            if (!dot) return;
            goToSlide(parseInt(dot.dataset.index, 10));
            resetAutoPlay();
        });

        // Touch support
        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentIndex + 1);
                } else {
                    goToSlide(currentIndex - 1);
                }
                resetAutoPlay();
            }
        }, { passive: true });

        // Keyboard navigation
        track.closest('.gallery-carousel').addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentIndex - 1);
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentIndex + 1);
                resetAutoPlay();
            }
        });

        // Autoplay
        function startAutoPlay() {
            autoPlayInterval = setInterval(function () {
                goToSlide(currentIndex + 1);
            }, 5000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        startAutoPlay();

        // Pause on hover
        var carousel = track.closest('.gallery-carousel');
        carousel.addEventListener('mouseenter', function () {
            clearInterval(autoPlayInterval);
        });
        carousel.addEventListener('mouseleave', function () {
            startAutoPlay();
        });
    }

    // --- Lightbox ---
    function initLightbox() {
        var lightbox = document.getElementById('lightbox');
        var lightboxImg = document.getElementById('lightboxImg');
        var closeBtn = document.getElementById('lightboxClose');
        var prevBtn = document.getElementById('lightboxPrev');
        var nextBtn = document.getElementById('lightboxNext');

        if (!lightbox || !lightboxImg) return;

        var slides = document.querySelectorAll('.carousel-slide img');
        var images = Array.from(slides).map(function (img) { return img.src; });
        var currentLightboxIndex = 0;

        function openLightbox(index) {
            currentLightboxIndex = index;
            lightboxImg.src = images[index];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function navigateLightbox(dir) {
            currentLightboxIndex += dir;
            if (currentLightboxIndex < 0) currentLightboxIndex = images.length - 1;
            if (currentLightboxIndex >= images.length) currentLightboxIndex = 0;
            lightboxImg.src = images[currentLightboxIndex];
        }

        // Click on carousel slide opens lightbox
        slides.forEach(function (img, index) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                openLightbox(index);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', function () { navigateLightbox(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { navigateLightbox(1); });

        // Close on overlay click
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });
    }

    // --- Fade In on Scroll ---
    function initFadeIn() {
        var elements = document.querySelectorAll('.fade-in');
        if (!elements.length) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show all
            elements.forEach(function (el) {
                el.classList.add('visible');
            });
        }
    }

    // --- Back to Top ---
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;

        function handleScroll() {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', throttle(handleScroll, 100));

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Active Navigation Link ---
    function initActiveNavLink() {
        var sections = document.querySelectorAll('section[id], footer[id]');
        var navLinks = document.querySelectorAll('.nav-link');

        if (!sections.length || !navLinks.length) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var id = entry.target.id;
                        navLinks.forEach(function (link) {
                            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                        });
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '-80px 0px -50% 0px'
            });

            sections.forEach(function (section) {
                observer.observe(section);
            });
        }
    }

    // --- Utility: Throttle ---
    function throttle(fn, wait) {
        var lastTime = 0;
        return function () {
            var now = Date.now();
            if (now - lastTime >= wait) {
                lastTime = now;
                fn.apply(this, arguments);
            }
        };
    }

})();
