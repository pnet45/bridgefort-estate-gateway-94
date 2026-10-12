import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LIGHT_LOGO = '/lovable-uploads/BridgefortHomesLogo.png';
const DARK_LOGO = '/bridgefort-logo-dark.png';

/**
 * Header brand: logo slides in from the left. The "BRIDGEFORT HOMES" label
 * drops in centered on mobile and slides in beside the logo on desktop.
 * Logo swaps via the existing `dark` class on <html>; motion respects
 * prefers-reduced-motion through the bf-* animation classes in index.css.
 */
const LogoSlideIn = () => {
  const [darkLogoFailed, setDarkLogoFailed] = useState(false);
  const logoClass = 'h-14 lg:h-20 w-auto max-w-none object-contain';

  return (
    <>
      <Link to="/" className="flex items-center shrink-0 bf-logo-slide" aria-label="Bridgefort Homes Development Ltd home">
        <img
          src={LIGHT_LOGO}
          alt="Bridgefort Homes Development Ltd logo"
          className={`${logoClass} ${darkLogoFailed ? 'dark:brightness-110' : 'dark:hidden'}`}
        />
        {!darkLogoFailed && (
          <img
            src={DARK_LOGO}
            alt="Bridgefort Homes Development Ltd logo"
            className={`${logoClass} hidden dark:block`}
            onError={() => setDarkLogoFailed(true)}
          />
        )}
      </Link>

      {/* Mobile: centered, drops from top */}
      <span
        aria-hidden="true"
        className="lg:hidden pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
      >
        <span className="block bf-label-drop font-bold tracking-[0.18em] text-sm sm:text-base text-foreground">
          BRIDGEFORT HOMES
        </span>
      </span>

      {/* Desktop: immediately after the logo, slides from left */}
      <span
        aria-hidden="true"
        className="hidden xl:inline-block ml-3 whitespace-nowrap bf-label-slide font-bold tracking-[0.16em] text-base text-foreground"
      >
        BRIDGEFORT HOMES
      </span>
    </>
  );
};

export default LogoSlideIn;
