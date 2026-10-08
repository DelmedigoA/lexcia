/**
 * Custom BW Header — dropdown and mobile menu interactions.
 * RTL-aware: detects .bw-header--rtl and slides mobile menu from right.
 * Accessible: keyboard navigation, focus management, ARIA state toggling.
 */
(function () {
  var header = document.getElementById('bw-header');
  var isRtl = header && header.classList.contains('bw-header--rtl');

  var closeTimers = {};

  /* ── Helpers ── */

  function setAriaExpanded(btn, expanded) {
    if (btn) btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  /* ── Desktop dropdowns ── */

  document.querySelectorAll('.bw-dropdown').forEach(function (dd) {
    var key = dd.getAttribute('data-dropdown');
    var btn = dd.querySelector('button');
    var menu = dd.querySelector('.bw-dropdown__menu');

    dd.addEventListener('mouseenter', function () {
      if (closeTimers[key]) { clearTimeout(closeTimers[key]); closeTimers[key] = null; }
      closeAll();
      openDropdown(dd, btn);
    });

    dd.addEventListener('mouseleave', function () {
      closeTimers[key] = setTimeout(function () { closeDropdown(dd, btn); }, 150);
    });

    if (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = dd.classList.contains('is-open');
        closeAll();
        if (!wasOpen) {
          openDropdown(dd, btn);
        }
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeAll();
          btn.focus();
        }
        if (e.key === 'ArrowDown' || e.key === 'Down') {
          e.preventDefault();
          if (!dd.classList.contains('is-open')) {
            closeAll();
            openDropdown(dd, btn);
          }
          var items = menu ? menu.querySelectorAll('[role="menuitem"]') : [];
          if (items.length) items[0].focus();
        }
        if (e.key === 'ArrowUp' || e.key === 'Up') {
          e.preventDefault();
          if (!dd.classList.contains('is-open')) {
            closeAll();
            openDropdown(dd, btn);
          }
          var items2 = menu ? menu.querySelectorAll('[role="menuitem"]') : [];
          if (items2.length) items2[items2.length - 1].focus();
        }
      });
    }

    if (menu) {
      var items = menu.querySelectorAll('[role="menuitem"]');
      Array.prototype.forEach.call(items, function (item, idx) {
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            closeAll();
            if (btn) btn.focus();
          }
          if (e.key === 'ArrowDown' || e.key === 'Down') {
            e.preventDefault();
            var next = idx + 1 < items.length ? idx + 1 : 0;
            items[next].focus();
          }
          if (e.key === 'ArrowUp' || e.key === 'Up') {
            e.preventDefault();
            var prev = idx - 1 >= 0 ? idx - 1 : items.length - 1;
            items[prev].focus();
          }
          if (e.key === 'Tab') {
            closeAll();
          }
        });
      });
    }
  });

  function openDropdown(dd, btn) {
    dd.classList.add('is-open');
    setAriaExpanded(btn, true);
  }

  function closeDropdown(dd, btn) {
    dd.classList.remove('is-open');
    setAriaExpanded(btn, false);
  }

  function closeAll() {
    document.querySelectorAll('.bw-dropdown.is-open').forEach(function (d) {
      var b = d.querySelector('button');
      closeDropdown(d, b);
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.bw-dropdown')) closeAll();
  });

  /* ── Mobile menu ── */

  var hamburger = document.getElementById('bw-hamburger');
  var overlay = document.getElementById('bw-mobile-overlay');
  var menu = document.getElementById('bw-mobile-menu');
  var closeBtn = document.getElementById('bw-mobile-close');

  function openMobile() {
    if (overlay) {
      overlay.style.display = 'block';
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    if (menu) {
      if (isRtl) {
        menu.style.right = '0';
        menu.style.left = 'auto';
      } else {
        menu.style.left = '0';
      }
      menu.classList.add('is-open');
    }
    setAriaExpanded(hamburger, true);
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeMobile() {
    if (overlay) {
      overlay.style.display = 'none';
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (menu) {
      if (isRtl) {
        menu.style.right = '-280px';
        menu.style.left = 'auto';
      } else {
        menu.style.left = '-280px';
      }
      menu.classList.remove('is-open');
    }
    setAriaExpanded(hamburger, false);
    document.body.style.overflow = '';
    if (hamburger) hamburger.focus();
  }

  if (hamburger) hamburger.addEventListener('click', openMobile);
  if (overlay) overlay.addEventListener('click', closeMobile);
  if (closeBtn) closeBtn.addEventListener('click', closeMobile);

  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobile);
    });
  }

  /* ── Escape key closes everything ── */

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var mobileOpen = menu && menu.classList.contains('is-open');
      var dropdownOpen = document.querySelector('.bw-dropdown.is-open');

      if (mobileOpen) {
        closeMobile();
      } else if (dropdownOpen) {
        closeAll();
      }
    }
  });

  /* ── Focus trap inside mobile menu ── */

  if (menu) {
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (!menu.classList.contains('is-open')) return;

      var focusable = getFocusableElements(menu);
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
})();
