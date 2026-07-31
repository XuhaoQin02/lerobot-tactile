document.addEventListener('DOMContentLoaded', function () {
  var links = Array.from(document.querySelectorAll('.contents-links a'));
  var sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var activeId = '';
  var ticking = false;

  function setActive(id) {
    if (!id || id === activeId) return;
    activeId = id;

    links.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
        if (window.innerWidth < 1520) {
          link.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveSection() {
    var marker = window.innerHeight * 0.28;
    var current = sections[0];
    var lastSection = sections[sections.length - 1];

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });

    if (
      lastSection &&
      lastSection.getBoundingClientRect().top <= window.innerHeight * 0.85
    ) {
      current = lastSection;
    }

    if (current) setActive(current.id);
    ticking = false;
  }

  function requestActiveUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActiveSection);
  }

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      setActive(link.getAttribute('href').slice(1));
    });
  });

  window.addEventListener('scroll', requestActiveUpdate, { passive: true });
  window.addEventListener('resize', requestActiveUpdate);
  updateActiveSection();

  var copyButton = document.getElementById('copy-bibtex');
  var bibtexCode = document.getElementById('bibtex-code');

  if (copyButton && bibtexCode) {
    copyButton.addEventListener('click', async function () {
      var citation = bibtexCode.textContent.trim();

      try {
        await navigator.clipboard.writeText(citation);
      } catch (error) {
        var textArea = document.createElement('textarea');
        textArea.value = citation;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      var label = copyButton.querySelector('span');
      copyButton.classList.add('is-copied');
      if (label) label.textContent = 'Copied';

      window.setTimeout(function () {
        copyButton.classList.remove('is-copied');
        if (label) label.textContent = 'Copy';
      }, 1800);
    });
  }
});
