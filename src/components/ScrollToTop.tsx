
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Browsers restore the previous scroll position on back/forward navigation
// by default ('scrollRestoration: auto'). That restoration happens before
// React's effects run, so a useEffect-based reset fires one paint too late —
// you briefly see the old, scrolled-down position before it snaps to the
// top. Disabling native restoration once, up front, is what actually fixes
// that flash; it only needs to run a single time for the whole session.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Keep normal route changes at the top, but honor in-page anchors after the
  // destination route has committed its DOM. This supports links into sections
  // such as the announcements carousel from a full article page.
  useLayoutEffect(() => {
    if (hash) {
      const targetId = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
