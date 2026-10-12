import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LIGHT_LOGO = '/images/BridgefortHomesLogo.png';
// Existing second logo asset is used for dark mode to avoid referencing a missing file.
const DARK_LOGO = '/images/BridgefortHomesLogo2.png';

/**
 * Header brand: theme-aware logo. The brand mark slides in from the left;
 * the label drops in centered on mobile and slides in beside the logo on desktop.
 * Theme switching follows the existing `.dark` class on <html>.
 */
const LogoSlideIn = () => {
  const [darkLogoFailed, setDarkLogoFailed] = useState(false);
  const logoClass = 'h-11 sm:h-14 lg:h-20 w-auto max-w-none object-contain';

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

      <span
        aria-hidden="true"
        className="lg:hidden pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
      >
        <span className="block bf-label-drop font-extrabold tracking-[0.12em] text-sm sm:text-base md:text-lg text-foreground">
          BRIDGEFORT HOMES
        </span>
      </span>

      <span
        aria-hidden="true"
        className="hidden lg:inline-block ml-3 whitespace-nowrap bf-label-slide font-extrabold tracking-[0.12em] text-lg xl:text-xl 2xl:text-2xl text-foreground"
      >
        BRIDGEFORT HOMES
      </span>
    </>
  );
};

export default LogoSlideIn;
