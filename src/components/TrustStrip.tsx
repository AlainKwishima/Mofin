import React from 'react';
import mpesaLogo from '../assets/logos/mpesa.png';
import airtelLogo from '../assets/logos/airtel.svg';
import mtnLogo from '../assets/logos/mtn.jpeg';
import equitelLogo from '../assets/logos/equitel.png';

export const TrustStrip: React.FC = () => {
  return (
    <div className="trust-strip reveal">
      <div className="container trust-strip-inner">
        <div className="caption text-fog">Works with all Kenyan mobile money providers</div>
        <div className="trust-logos">
          <img src={mpesaLogo} alt="M-PESA" className="h-6 md:h-8 w-auto object-contain" />
          <img src={airtelLogo} alt="AIRTEL MONEY" className="h-6 md:h-8 w-auto object-contain" />
          <img src={mtnLogo} alt="MTN MOMO" className="h-6 md:h-8 w-auto object-contain" />
          <img src={equitelLogo} alt="EQUITEL" className="h-6 md:h-8 w-auto object-contain" />
        </div>
      </div>
    </div>
  );
};
