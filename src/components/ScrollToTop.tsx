import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures the browser resets window scroll position to the top
 * whenever the route (pathname) changes, preventing SPAs from maintaining
 * the previous page's scroll position (e.g., landing at the footer).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
