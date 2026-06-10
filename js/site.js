document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.site-header-toggle');
  var siteMenu = document.querySelector('.site-menu');

  function closeMenu() {
    if (!menuButton || !siteMenu) return;
    siteMenu.classList.remove('is-open');
    
    menuButton.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    if (!menuButton || !siteMenu) return;
    siteMenu.classList.add('is-open');
    
    menuButton.setAttribute('aria-expanded', 'true');
  }

  if (menuButton && siteMenu) {
    menuButton.setAttribute('aria-label', 'Open menu');
    menuButton.setAttribute('aria-expanded', 'false');

    menuButton.addEventListener('click', function (event) {
      event.preventDefault();
      if (siteMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    siteMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // 代替原本的 window.addEventListener('resize', ...)
    var mediaQuery = window.matchMedia('(min-width: 993px)');
    function handleTabletChange(e) {
      if (e.matches) {
        closeMenu();
  }
}
mediaQuery.addEventListener('change', handleTabletChange);
handleTabletChange(mediaQuery); // 初始化執行一次
  }

  var revealItems = document.querySelectorAll('.card, .widget, .content, .sidebar');
  revealItems.forEach(function (item) {
    item.classList.add('js-reveal');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }
});
