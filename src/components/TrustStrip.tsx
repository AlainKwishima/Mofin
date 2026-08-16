import React from 'react';

export const TrustStrip: React.FC = () => {
  return (
    <div className="trust-strip reveal">
      <div className="container trust-strip-inner">
        <div className="caption text-fog">Works with all Kenyan mobile money providers</div>
        <div className="trust-logos">
          <span className="trust-logo">M-PESA</span>
          <span className="trust-logo">AIRTEL MONEY</span>
          <span className="trust-logo">MTN MOMO</span>
          <span className="trust-logo">EQUITEL</span>
          <span className="trust-logo">T-KASH</span>
        </div>
      </div>
    </div>
  );
};
