/* ============================================
   BROWAR WYSZAK — JavaScript
   ============================================ */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        hideLoader();
        initNavbar();
        initMobileMenu();
        initDarkMode();
        initHeroSlider();
        initGalleryLightbox();
        initTeamCarousel();
        initFadeIn();
        initBackToTop();
        initActiveNavLink();
    }

    /* --- Loader --- */
    function hideLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return;
        window.addEventListener('load', function () {
            setTimeout(function () {
                loader.classList.add('hidden');
                setTimeout(function () { loader.style.display = 'none'; }, 500);
            }, 300);
        });
    }

    /* --- Sticky Navbar --- */
    function initNavbar() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;
        function onScroll() {
            navbar.classList.toggle('scrolled', window.scrollY > 80);
        }
        window.addEventListener('scroll', throttle(onScroll, 16));
        onScroll();
    }

    /* --- Mobile Menu --- */
    function initMobileMenu() {
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('mobileMenu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('active');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        menu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* --- Dark Mode --- */
    function initDarkMode() {
        var btn = document.getElementById('darkModeToggle');
        if (!btn) return;

        var stored = localStorage.getItem('browarwyszak-theme');
        if (stored === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        btn.addEventListener('click', function () {
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('browarwyszak-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('browarwyszak-theme', 'light');
            }
        });
    }

    /* --- Hero Slider --- */
    function initHeroSlider() {
        var slides = document.querySelectorAll('.slide');
        var dots = document.querySelectorAll('.slider-dot');
        if (!slides.length) return;

        var current = 0;
        var total = slides.length;
        var interval = null;

        function goTo(index) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = (index + total) % total;
            slides[current].classList.add('active');
            dots[current].classList.add('active');
        }

        function next() { goTo(current + 1); }

        function startAutoplay() {
            interval = setInterval(next, 9000);
        }

        function resetAutoplay() {
            clearInterval(interval);
            startAutoplay();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                goTo(parseInt(this.dataset.slide, 10));
                resetAutoplay();
            });
        });

        startAutoplay();
    }

    /* --- Gallery Lightbox --- */
    function initGalleryLightbox() {
        var items = document.querySelectorAll('.gallery-item');
        var lightbox = document.getElementById('lightbox');
        var lightboxImg = document.getElementById('lightboxImg');
        var lightboxCaption = document.getElementById('lightboxCaption');
        var closeBtn = document.getElementById('lightboxClose');
        var prevBtn = document.getElementById('lightboxPrev');
        var nextBtn = document.getElementById('lightboxNext');

        if (!items.length || !lightbox) return;

        var images = [];
        var captions = [];
        var currentIdx = 0;

        items.forEach(function (item) {
            var img = item.querySelector('img');
            images.push(img.src);
            captions.push(item.dataset.caption || '');
        });

        function openLightbox(idx) {
            currentIdx = idx;
            lightboxImg.src = images[idx];
            lightboxCaption.textContent = captions[idx];
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function navigate(dir) {
            currentIdx = (currentIdx + dir + images.length) % images.length;
            lightboxImg.src = images[currentIdx];
            lightboxCaption.textContent = captions[currentIdx];
        }

        items.forEach(function (item, idx) {
            item.addEventListener('click', function () { openLightbox(idx); });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', function () { navigate(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { navigate(1); });

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });
    }

    /* --- Team Carousel --- */
    function initTeamCarousel() {
        var track = document.getElementById('teamTrack');
        var prevBtn = document.getElementById('teamPrev');
        var nextBtn = document.getElementById('teamNext');
        if (!track || !prevBtn || !nextBtn) return;

        var cards = track.querySelectorAll('.team-card');
        var totalCards = cards.length;
        var offset = 0;
        var autoInterval = null;
        var touchStartX = 0;

        function getVisibleCount() {
            var w = window.innerWidth;
            if (w <= 480) return 1;
            if (w <= 1024) return 2;
            return 4;
        }

        function getMaxOffset() {
            return Math.max(0, totalCards - getVisibleCount());
        }

        function updatePosition() {
            var cardWidth = 100 / getVisibleCount();
            track.style.transform = 'translateX(-' + (offset * cardWidth) + '%)';
        }

        function goNext() {
            offset = offset >= getMaxOffset() ? 0 : offset + 1;
            updatePosition();
        }

        function goPrev() {
            offset = offset <= 0 ? getMaxOffset() : offset - 1;
            updatePosition();
        }

        nextBtn.addEventListener('click', function () { goNext(); resetAuto(); });
        prevBtn.addEventListener('click', function () { goPrev(); resetAuto(); });

        // Touch support
        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goNext(); else goPrev();
                resetAuto();
            }
        }, { passive: true });

        function startAuto() {
            autoInterval = setInterval(goNext, 5000);
        }

        function resetAuto() {
            clearInterval(autoInterval);
            startAuto();
        }

        startAuto();

        var carousel = document.getElementById('teamCarousel');
        carousel.addEventListener('mouseenter', function () { clearInterval(autoInterval); });
        carousel.addEventListener('mouseleave', startAuto);

        window.addEventListener('resize', throttle(function () {
            if (offset > getMaxOffset()) offset = getMaxOffset();
            updatePosition();
        }, 200));
    }

    /* --- Fade In --- */
    function initFadeIn() {
        var els = document.querySelectorAll('.fade-in');
        if (!els.length) return;

        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
            els.forEach(function (el) { obs.observe(el); });
        } else {
            els.forEach(function (el) { el.classList.add('visible'); });
        }
    }

    /* --- Back to Top --- */
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', throttle(function () {
            btn.classList.toggle('visible', window.scrollY > 500);
        }, 100));
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* --- Active Nav Link --- */
    function initActiveNavLink() {
        var sections = document.querySelectorAll('section[id], footer[id]');
        var navLinks = document.querySelectorAll('.nav-link');
        if (!sections.length || !navLinks.length) return;

        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var id = entry.target.id;
                        navLinks.forEach(function (link) {
                            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                        });
                    }
                });
            }, { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' });
            sections.forEach(function (s) { obs.observe(s); });
        }
    }

    /* --- Utility --- */
    function throttle(fn, wait) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= wait) { last = now; fn.apply(this, arguments); }
        };
    }
})();
