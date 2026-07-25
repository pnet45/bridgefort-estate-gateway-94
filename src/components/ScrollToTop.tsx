
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
  const { pathname } = useLocation();

  // useLayoutEffect runs synchronously before the browser paints, so the
  // reset happens before the user ever sees a frame — useEffect would allow
  // one scrolled-down frame to flash first.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
