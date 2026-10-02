'use strict';

(function () {
    // =========================================================================
    // UTILITIES
    // =========================================================================

    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    function formatPhoneNumber(number) {
        const cleaned = ('' + number).replace(/\D/g, '');
        const last10 = cleaned.slice(-10);
        if (last10.length === 10) {
            return '+91-' + last10.slice(0, 5) + '-' + last10.slice(5);
        }
        return number;
    }

    function dispatchAnalyticsEvent(eventName, data) {
        try {
            document.dispatchEvent(new CustomEvent('custom_analytics', {
                detail: Object.assign({ event: eventName }, data || {})
            }));
        } catch (e) { /* silent */ }
    }

    // =========================================================================
    // STATE & CONFIG
    // =========================================================================

    var siteConfig = {
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        serviceAreas: [],
        social: {},
        mapsUrl: ''
    };

    // =========================================================================
    // 1. CONFIGURATION LOADING
    // =========================================================================

    function loadConfiguration() {
        fetch('/api/config')
            .then(function (res) {
                if (!res.ok) throw new Error('Config fetch failed');
                return res.json();
            })
            .then(function (data) {
                siteConfig = data;
                applyConfiguration();
            })
            .catch(function () {
                console.warn('Could not load site configuration, using defaults.');
            });
    }

    function applyConfiguration() {
        // Update business name elements
        var nameEls = document.querySelectorAll('[data-config="business-name"]');
        nameEls.forEach(function (el) {
            if (siteConfig.name) el.textContent = siteConfig.name;
        });

        // Update phone elements
        var phoneEls = document.querySelectorAll('[data-config="business-phone"]');
        phoneEls.forEach(function (el) {
            if (siteConfig.phone) {
                el.textContent = formatPhoneNumber(siteConfig.phone);
                if (el.tagName === 'A') {
                    el.href = 'tel:' + siteConfig.phone.replace(/\s/g, '');
                }
            }
        });

        // Update all tel: links
        document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
            if (siteConfig.phone) {
                var clean = siteConfig.phone.replace(/\D/g, '');
                if (clean.length === 10) clean = '+91' + clean;
                el.href = 'tel:' + clean;
            }
            el.addEventListener('click', function () {
                dispatchAnalyticsEvent('call_click');
            });
        });

        // Update phone link elements
        var phoneLinkEls = document.querySelectorAll('[data-config="business-phone-link"]');
        phoneLinkEls.forEach(function (el) {
            if (siteConfig.phone) {
                var clean = siteConfig.phone.replace(/\D/g, '');
                if (clean.length === 10) clean = '+91' + clean;
                el.href = 'tel:' + clean;
                if (el.textContent === 'Call Now' || el.textContent.trim() === '') {
                    // Keep existing text
                }
            }
        });

        // Update WhatsApp links
        var waNumber = siteConfig.whatsapp ? siteConfig.whatsapp.replace(/\D/g, '') : '';
        if (waNumber.length === 10) waNumber = '91' + waNumber;
        var waUrl = waNumber ? 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent('Hi, I need moving services. Please share a quote.') : '#';

        var waEls = document.querySelectorAll('[data-config="whatsapp-link"]');
        waEls.forEach(function (el) {
            if (waNumber) el.href = waUrl;
        });
        // Also update any wa.me links
        document.querySelectorAll('a[href*="wa.me"]').forEach(function (el) {
            if (waNumber) el.href = waUrl;
            el.addEventListener('click', function () {
                dispatchAnalyticsEvent('whatsapp_click');
            });
        });

        // Update email elements
        var emailEls = document.querySelectorAll('[data-config="business-email"]');
        emailEls.forEach(function (el) {
            if (siteConfig.email) {
                el.textContent = siteConfig.email;
                if (el.tagName === 'A') {
                    el.href = 'mailto:' + siteConfig.email;
                }
            }
        });
        document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
            if (siteConfig.email) el.href = 'mailto:' + siteConfig.email;
        });

        // Update address
        var addrEls = document.querySelectorAll('[data-config="business-address"]');
        addrEls.forEach(function (el) {
            if (siteConfig.address) el.textContent = siteConfig.address;
        });

        // Update Google Maps
        var mapEls = document.querySelectorAll('[data-config="map-url"]');
        mapEls.forEach(function (el) {
            if (siteConfig.mapsUrl && el.tagName === 'IFRAME') {
                el.src = siteConfig.mapsUrl;
            }
        });

        // Update social links
        if (siteConfig.social) {
            var socialMap = {
                'social-fb': siteConfig.social.facebook,
                'social-tw': siteConfig.social.twitter,
                'social-ig': siteConfig.social.instagram,
                'social-yt': siteConfig.social.youtube,
                'social-li': siteConfig.social.linkedin
            };
            Object.keys(socialMap).forEach(function (key) {
                var els = document.querySelectorAll('[data-config="' + key + '"]');
                els.forEach(function (el) {
                    if (socialMap[key]) {
                        el.href = socialMap[key];
                        el.style.display = '';
                    } else {
                        el.style.display = 'none';
                    }
                });
            });
        }

        // Service Areas
        buildServiceAreas();

        // Update structured data
        updateStructuredData();
    }

    function buildServiceAreas() {
        var grid = document.getElementById('cities-grid');
        if (!grid || !siteConfig.serviceAreas || !siteConfig.serviceAreas.length) return;

        grid.innerHTML = '';
        siteConfig.serviceAreas.forEach(function (city) {
            var slug = city.trim().toLowerCase().replace(/\s+/g, '-');
            var a = document.createElement('a');
            a.href = '/movers-packers-in-' + slug;
            a.className = 'city-tag';
            a.textContent = city.trim();
            a.addEventListener('click', function () {
                dispatchAnalyticsEvent('service_view', { city: city });
            });
            grid.appendChild(a);
        });
    }

    function updateStructuredData() {
        var schemaEl = document.getElementById('schema-local-business');
        if (!schemaEl) return;
        try {
            var json = JSON.parse(schemaEl.textContent);
            if (siteConfig.name) json.name = siteConfig.name;
            if (siteConfig.phone) {
                var clean = siteConfig.phone.replace(/\D/g, '');
                if (clean.length === 10) clean = '+91' + clean;
                json.telephone = clean;
            }
            if (siteConfig.website) {
                json.url = siteConfig.website;
                json['@id'] = siteConfig.website;
            }
            if (siteConfig.address && json.address) {
                json.address.streetAddress = siteConfig.address;
            }
            if (siteConfig.city && json.address) {
                json.address.addressLocality = siteConfig.city;
            }
            if (siteConfig.pincode && json.address) {
                json.address.postalCode = siteConfig.pincode;
            }
            schemaEl.textContent = JSON.stringify(json, null, 2);
        } catch (e) {
            console.warn('Error updating structured data:', e);
        }
    }

    // =========================================================================
    // 2. NAVIGATION
    // =========================================================================

    function initNavigation() {
        var navbar = document.querySelector('.navbar');
        var hamburger = document.querySelector('.hamburger-menu');
        var navLinks = document.getElementById('nav-links');

        // Sticky navbar shadow on scroll
        if (navbar) {
            window.addEventListener('scroll', function () {
                requestAnimationFrame(function () {
                    if (window.scrollY > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                });
            }, { passive: true });
        }

        // Mobile hamburger toggle
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', function () {
                var expanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', !expanded);
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
            });

            // Close menu when a link is clicked
            navLinks.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', function () {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
        }

        // Smooth scrolling for all hash links
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (href && href.length > 1) {
                    var target = document.getElementById(href.substring(1));
                    if (target) {
                        e.preventDefault();
                        var offset = 80;
                        var top = target.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top: top, behavior: 'smooth' });
                    }
                }
            });
        });

        // Active nav link highlighting
        var debouncedActiveLink = debounce(updateActiveNavLink, 100);
        window.addEventListener('scroll', debouncedActiveLink, { passive: true });
    }

    function updateActiveNavLink() {
        var sections = document.querySelectorAll('section[id]');
        var scrollPos = window.scrollY + 100;
        var navAnchors = document.querySelectorAll('.nav-links a');

        sections.forEach(function (section) {
            var top = section.offsetTop;
            var bottom = top + section.offsetHeight;
            var id = section.getAttribute('id');

            navAnchors.forEach(function (a) {
                if (a.getAttribute('href') === '#' + id) {
                    if (scrollPos >= top && scrollPos < bottom) {
                        a.classList.add('active');
                    } else {
                        a.classList.remove('active');
                    }
                }
            });
        });
    }

    // =========================================================================
    // 3. FORM HANDLING
    // =========================================================================

    function initForms() {
        // Main quote form
        var mainForm = document.getElementById('main-quote-form');
        if (mainForm) {
            setupForm(mainForm, true);
        }

        // Mini form in contact section
        var miniForms = document.querySelectorAll('.mini-form');
        miniForms.forEach(function (form) {
            setupForm(form, false);
        });
    }

    function setupForm(form, isFullForm) {
        // Clear errors on input
        form.querySelectorAll('input, select, textarea').forEach(function (input) {
            input.addEventListener('input', function () { clearFieldError(this); });
            input.addEventListener('change', function () { clearFieldError(this); });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Honeypot check
            var honeypot = form.querySelector('[name="website_url"]');
            if (honeypot && honeypot.value.trim() !== '') {
                // Fake success for spam bots
                showSuccessModal('LEAD-SPAM-0000');
                return;
            }

            if (validateForm(form, isFullForm)) {
                submitForm(form, isFullForm);
            }
        });
    }

    function validateForm(form, isFullForm) {
        var valid = true;

        if (isFullForm) {
            // Full form validation
            var nameField = form.querySelector('[name="fullName"]');
            if (nameField && nameField.value.trim().length < 2) {
                showFieldError(nameField, 'Please enter your full name (minimum 2 characters).');
                valid = false;
            }

            var mobileField = form.querySelector('[name="mobileNumber"]');
            if (mobileField) {
                var mobile = mobileField.value.trim().replace(/\D/g, '');
                if (!/^[6-9]\d{9}$/.test(mobile)) {
                    showFieldError(mobileField, 'Please enter a valid 10-digit Indian mobile number starting with 6-9.');
                    valid = false;
                }
            }

            var pickupField = form.querySelector('[name="pickupCity"]');
            if (pickupField && pickupField.value.trim().length < 2) {
                showFieldError(pickupField, 'Please enter pickup city.');
                valid = false;
            }

            var dropField = form.querySelector('[name="dropCity"]');
            if (dropField && dropField.value.trim().length < 2) {
                showFieldError(dropField, 'Please enter drop city.');
                valid = false;
            }

            var dateField = form.querySelector('[name="movingDate"]');
            if (dateField && dateField.value) {
                var inputDate = new Date(dateField.value);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (inputDate < today) {
                    showFieldError(dateField, 'Moving date cannot be in the past.');
                    valid = false;
                }
            }
        } else {
            // Mini form validation
            var nameField = form.querySelector('[name="name"]');
            if (nameField && nameField.value.trim().length < 2) {
                showFieldError(nameField, 'Please enter your name.');
                valid = false;
            }

            var phoneField = form.querySelector('[name="phone"]');
            if (phoneField) {
                var phone = phoneField.value.trim().replace(/\D/g, '');
                if (!/^[6-9]\d{9}$/.test(phone)) {
                    showFieldError(phoneField, 'Please enter a valid 10-digit mobile number.');
                    valid = false;
                }
            }
        }

        return valid;
    }

    function showFieldError(input, message) {
        input.classList.add('is-invalid');
        var existing = input.parentNode.querySelector('.error-message');
        if (existing) {
            existing.textContent = message;
            return;
        }
        var errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(input) {
        input.classList.remove('is-invalid');
        var errorDiv = input.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    }

    function submitForm(form, isFullForm) {
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Build data object mapping form fields to server-expected names
        var data = {};
        if (isFullForm) {
            data.name = getVal(form, 'fullName');
            data.mobile = getVal(form, 'mobileNumber').replace(/\D/g, '');
            data.pickupCity = getVal(form, 'pickupCity');
            data.pickupAddress = getVal(form, 'pickupAddress');
            data.dropCity = getVal(form, 'dropCity');
            data.dropAddress = getVal(form, 'dropAddress');
            data.movingDate = getVal(form, 'movingDate');
            data.propertyType = getVal(form, 'propertyType');
            data.numberOfRooms = getVal(form, 'numRooms');
            data.vehicleType = getVal(form, 'vehicleType');
            data.additionalRequirements = getVal(form, 'additionalReq');
            data.honeypot = getVal(form, 'website_url');
            data.source = 'website-main-form';
        } else {
            data.name = getVal(form, 'name');
            data.mobile = getVal(form, 'phone').replace(/\D/g, '');
            data.pickupCity = 'Not specified';
            data.dropCity = 'Not specified';
            data.additionalRequirements = getVal(form, 'requirements');
            data.source = 'website-contact-form';
        }

        fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function (res) {
            if (!res.ok) {
                return res.json().then(function (err) { throw new Error(err.error || 'Submission failed'); });
            }
            return res.json();
        })
        .then(function (result) {
            dispatchAnalyticsEvent('form_submit', { source: data.source });
            showSuccessModal(result.leadId || 'LEAD-0000');
            form.reset();
            // Remove any global errors
            var globalErr = form.querySelector('.form-global-error');
            if (globalErr) globalErr.remove();
        })
        .catch(function (error) {
            console.error('Form submission error:', error);
            var globalErr = form.querySelector('.form-global-error');
            if (!globalErr) {
                globalErr = document.createElement('div');
                globalErr.className = 'form-global-error';
                form.prepend(globalErr);
            }
            globalErr.textContent = error.message || 'Something went wrong. Please try again or contact us directly.';
        })
        .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }

    function getVal(form, name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : '';
    }

    // =========================================================================
    // 4. SUCCESS MODAL
    // =========================================================================

    function showSuccessModal(leadId) {
        var modal = document.getElementById('success-modal');
        if (!modal) return;

        var refEl = document.getElementById('lead-ref');
        if (refEl) refEl.textContent = leadId;

        // Update WhatsApp button in modal
        var waBtn = modal.querySelector('.modal-whatsapp-btn');
        if (waBtn && siteConfig.whatsapp) {
            var waNum = siteConfig.whatsapp.replace(/\D/g, '');
            if (waNum.length === 10) waNum = '91' + waNum;
            waBtn.href = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent('Hi, my reference number is ' + leadId + '. I would like to follow up on my moving quote.');
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function hideSuccessModal() {
        var modal = document.getElementById('success-modal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function initModal() {
        var modal = document.getElementById('success-modal');
        if (!modal) return;

        // Close button
        var closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideSuccessModal);
        }

        // Click overlay to close
        modal.addEventListener('click', function (e) {
            if (e.target === modal) hideSuccessModal();
        });

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                hideSuccessModal();
            }
        });
    }

    // =========================================================================
    // 5. FAQ ACCORDION
    // =========================================================================

    function initFAQ() {
        var faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(function (item) {
            var btn = item.querySelector('.faq-question');
            if (!btn) return;

            btn.addEventListener('click', function () {
                toggleFAQ(item, faqItems);
            });
        });
    }

    function toggleFAQ(clickedItem, allItems) {
        var isActive = clickedItem.classList.contains('active');
        var answer = clickedItem.querySelector('.faq-answer');
        var btn = clickedItem.querySelector('.faq-question');

        // Close all items
        allItems.forEach(function (item) {
            item.classList.remove('active');
            var ans = item.querySelector('.faq-answer');
            if (ans) ans.style.maxHeight = null;
            var b = item.querySelector('.faq-question');
            if (b) b.setAttribute('aria-expanded', 'false');
        });

        // If wasn't active, open it
        if (!isActive && answer) {
            clickedItem.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            if (btn) btn.setAttribute('aria-expanded', 'true');
        }
    }

    // =========================================================================
    // 6. FLOATING BUTTONS & BACK TO TOP
    // =========================================================================

    function initFloatingButtons() {
        var floatingContainer = document.querySelector('.floating-actions');
        var backToTopBtn = document.getElementById('back-to-top');

        window.addEventListener('scroll', debounce(function () {
            var y = window.scrollY;

            // Show floating buttons after 300px scroll
            if (floatingContainer) {
                if (y > 300) {
                    floatingContainer.classList.add('show');
                } else {
                    floatingContainer.classList.remove('show');
                }
            }

            // Back to top after 500px
            if (backToTopBtn) {
                if (y > 500) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
            }
        }, 50), { passive: true });

        // Back to top click
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // =========================================================================
    // 7. LAZY LOAD / FADE IN
    // =========================================================================

    function initLazyEffects() {
        if (!('IntersectionObserver' in window)) return;

        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Lazy images
                    if (entry.target.tagName === 'IMG' && entry.target.dataset.src) {
                        entry.target.src = entry.target.dataset.src;
                        entry.target.removeAttribute('data-src');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

        document.querySelectorAll('.fade-in, img[data-src]').forEach(function (el) {
            observer.observe(el);
        });
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function init() {
        loadConfiguration();
        initNavigation();
        initForms();
        initModal();
        initFAQ();
        initFloatingButtons();
        initLazyEffects();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
