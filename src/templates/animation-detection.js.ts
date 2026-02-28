export const ANIMATION_DETECTION_TEMPLATE = `(function detectAnimations() {
  function getUniqueSelector(el) {
    if (!el || !(el instanceof Element)) return null;
    if (el.id) return '#' + CSS.escape(el.id);

    const parts = [];
    let current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        parts.unshift('#' + CSS.escape(current.id));
        break;
      }

      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\\s+/).filter(c => c.length > 0);
        if (classes.length > 0) {
          selector += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
      }

      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          c => c.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += ':nth-of-type(' + index + ')';
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  function extractKeyframes() {
    const keyframes = {};
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSKeyframesRule) {
            keyframes[rule.name] = Array.from(rule.cssRules).map(r => ({
              keyText: r.keyText,
              style: r.style.cssText
            }));
          }
        }
      } catch (e) {}
    }
    return keyframes;
  }

  function detectCSSAnimations() {
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.animationName && cs.animationName !== 'none') {
        const names = cs.animationName.split(',').map(s => s.trim());
        names.forEach(name => {
          results.push({
            selector: getUniqueSelector(el),
            type: 'css-animation',
            trigger: 'page-load',
            animationName: name,
            duration: cs.animationDuration,
            delay: cs.animationDelay,
            easing: cs.animationTimingFunction,
            iterationCount: cs.animationIterationCount,
            fillMode: cs.animationFillMode,
            direction: cs.animationDirection
          });
        });
      }
    });
    return results;
  }

  function detectCSSTransitions() {
    const results = [];
    const defaultTransition = 'all 0s ease 0s';
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      const transition = cs.transition;
      if (transition && transition !== defaultTransition && transition !== 'none' && transition !== '') {
        results.push({
          selector: getUniqueSelector(el),
          type: 'css-transition',
          trigger: 'hover',
          transition: transition,
          transitionProperty: cs.transitionProperty,
          transitionDuration: cs.transitionDuration,
          transitionTimingFunction: cs.transitionTimingFunction,
          transitionDelay: cs.transitionDelay
        });
      }
    });
    return results;
  }

  function detectWebAnimations() {
    try {
      return document.getAnimations().map(a => ({
        selector: getUniqueSelector(a.effect?.target),
        type: 'web-animation',
        trigger: 'page-load',
        name: a.animationName || a.id || 'unnamed',
        duration: a.effect?.getTiming?.()?.duration,
        delay: a.effect?.getTiming?.()?.delay,
        easing: a.effect?.getTiming?.()?.easing,
        playState: a.playState
      }));
    } catch (e) {
      return [];
    }
  }

  function detectScrollAnimations() {
    const results = [];
    const scrollClasses = [
      'aos-animate', 'aos-init', 'wow', 'animated',
      'scroll-reveal', 'reveal', 'fade-in', 'fade-up', 'fade-down',
      'fade-left', 'fade-right', 'slide-in', 'slide-up', 'slide-down',
      'zoom-in', 'zoom-out', 'is-visible', 'in-view',
      'gsap-reveal', 'scroll-trigger'
    ];

    scrollClasses.forEach(cls => {
      document.querySelectorAll('.' + CSS.escape(cls)).forEach(el => {
        results.push({
          selector: getUniqueSelector(el),
          type: 'scroll-triggered',
          trigger: 'in-view',
          className: cls,
          dataset: { ...el.dataset }
        });
      });
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
      results.push({
        selector: getUniqueSelector(el),
        type: 'scroll-triggered',
        trigger: 'in-view',
        library: 'aos',
        animation: el.dataset.aos,
        duration: el.dataset.aosDuration,
        delay: el.dataset.aosDelay
      });
    });

    document.querySelectorAll('[data-scroll]').forEach(el => {
      results.push({
        selector: getUniqueSelector(el),
        type: 'scroll-triggered',
        trigger: 'in-view',
        library: 'locomotive-scroll',
        speed: el.dataset.scrollSpeed
      });
    });

    document.querySelectorAll('[data-gsap], .gsap-marker-start, .gsap-marker-end').forEach(el => {
      results.push({
        selector: getUniqueSelector(el),
        type: 'scroll-triggered',
        trigger: 'in-view',
        library: 'gsap-scrolltrigger'
      });
    });

    return results;
  }

  function detectLibraries() {
    const libraries = [];
    if (window.gsap || window.TweenMax || window.TweenLite) {
      libraries.push({ name: 'gsap', version: window.gsap?.version || 'unknown' });
    }
    if (window.anime) libraries.push({ name: 'anime.js', version: 'detected' });
    if (window.__FRAMER_MOTION__) libraries.push({ name: 'framer-motion', version: 'detected' });
    if (window.Motion || document.querySelector('[data-motion]')) libraries.push({ name: 'motion', version: 'detected' });
    if (window.ScrollReveal) libraries.push({ name: 'scrollreveal', version: 'detected' });
    if (window.AOS) libraries.push({ name: 'aos', version: 'detected' });
    if (window.lottie || window.bodymovin) libraries.push({ name: 'lottie', version: 'detected' });

    const scriptSrcs = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    const libraryPatterns = [
      { pattern: /gsap|greensock/i, name: 'gsap' },
      { pattern: /anime\\.min|animejs/i, name: 'anime.js' },
      { pattern: /framer-motion/i, name: 'framer-motion' },
      { pattern: /motion\\.dev|motion\\/dist/i, name: 'motion' },
      { pattern: /scrollreveal/i, name: 'scrollreveal' },
      { pattern: /aos\\.js/i, name: 'aos' },
      { pattern: /lottie/i, name: 'lottie' }
    ];

    scriptSrcs.forEach(src => {
      libraryPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(src) && !libraries.find(l => l.name === name)) {
          libraries.push({ name, version: 'detected (script tag)' });
        }
      });
    });

    return libraries;
  }

  function generateCatalog() {
    const keyframes = extractKeyframes();
    const cssAnimations = detectCSSAnimations();
    const cssTransitions = detectCSSTransitions();
    const webAnimations = detectWebAnimations();
    const scrollAnimations = detectScrollAnimations();
    const detectedLibraries = detectLibraries();

    const allAnimations = [
      ...cssAnimations, ...cssTransitions, ...webAnimations, ...scrollAnimations
    ];

    allAnimations.forEach((anim, i) => { anim.id = anim.type + '-' + (i + 1); });

    const byType = {};
    const byTrigger = {};
    allAnimations.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
      byTrigger[a.trigger] = (byTrigger[a.trigger] || 0) + 1;
    });

    const total = allAnimations.length;
    let complexity = 'none';
    if (total > 0 && total <= 5) complexity = 'simple';
    else if (total <= 15) complexity = 'intermediate';
    else if (total > 15) complexity = 'complex';

    return {
      url: window.location.href,
      detectedLibraries,
      keyframes,
      animations: allAnimations,
      summary: { total, byType, byTrigger, complexity }
    };
  }

  return JSON.stringify(generateCatalog(), null, 2);
})();`;
