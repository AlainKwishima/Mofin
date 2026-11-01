import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Info, ChevronDown, ShieldCheck } from 'lucide-react';
import '../styles/pricing.css';

type Cadence = 'MONTHLY' | 'ANNUAL' | 'TRIAL';

interface PlanFeature {
  id: string;
  name: string;
  tooltipTitle: string;
  tooltipDesc: string;
}

interface FeatureGroup {
  name: string;
  features: PlanFeature[];
}

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  featured?: boolean;
  featuredBadge?: string;
  price: number;
  userCalloutLabel: string;
  userCalloutSub: string;
  featureGroups: FeatureGroup[];
}

// -------------------------------------------------------------
// REFINED FEATURE DEFINITIONS (MATCHING MOFIN V5 SPECIFICATION)
// -------------------------------------------------------------
const LITE_GROUPS: FeatureGroup[] = [
  {
    name: 'Expense Tracking & Events',
    features: [
      {
        id: 'sms-sync',
        name: 'Direct M-Pesa SMS Auto-Sync',
        tooltipTitle: 'Offline SMS Sync',
        tooltipDesc: 'Mofin detects incoming mobile money payment alerts directly from SMS notifications with zero data usage.',
      },
      {
        id: 'lite-events',
        name: '2 Active Event Budgets',
        tooltipTitle: 'Event Allocation',
        tooltipDesc: 'Concurrently manage up to 2 active event budgets (up to KSH 5,000 per event, KSH 10,000/mo total).',
      },
      {
        id: 'event-duration',
        name: 'Up to 30 Days Per Event',
        tooltipTitle: 'Event Duration',
        tooltipDesc: 'Every event budget can run up to 30 full days without daily penalty fees.',
      },
      {
        id: 'offline-mode',
        name: '100% Offline Capability',
        tooltipTitle: 'Zero-Data Operation',
        tooltipDesc: 'Record expenses and view balances anytime without requiring internet connectivity.',
      },
    ],
  },
  {
    name: 'Exports & Support',
    features: [
      {
        id: 'receipt-history',
        name: 'Download History with Receipts',
        tooltipTitle: 'Receipt Export',
        tooltipDesc: 'Personal and event transaction history can be downloaded with attached receipt files on all plans.',
      },
      {
        id: 'csv-export',
        name: 'Clean CSV / Excel Spreadsheet Export',
        tooltipTitle: 'Spreadsheet Export',
        tooltipDesc: 'Download clean financial records and event statements in standard CSV format.',
      },
      {
        id: 'standard-support',
        name: 'Community & Email Support',
        tooltipTitle: 'Reliable Guidance',
        tooltipDesc: 'Standard business hours email ticket resolution and user documentation access.',
      },
    ],
  },
];

const PLUS_GROUPS: FeatureGroup[] = [
  {
    name: 'Multi-Event Management',
    features: [
      {
        id: 'sms-sync',
        name: 'Direct M-Pesa SMS Auto-Sync',
        tooltipTitle: 'Offline SMS Sync',
        tooltipDesc: 'Mofin detects incoming mobile money payment alerts directly from SMS notifications with zero data usage.',
      },
      {
        id: 'plus-events',
        name: '3 Active Event Budgets',
        tooltipTitle: 'Expanded Events',
        tooltipDesc: 'Concurrently manage up to 3 distinct event budgets (up to KSH 35,000 per event, KSH 105,000/mo total).',
      },
      {
        id: 'event-duration',
        name: 'Up to 30 Days Per Event',
        tooltipTitle: 'Event Duration',
        tooltipDesc: 'Every event budget can run up to 30 full days without daily penalty fees.',
      },
      {
        id: 'multi-account',
        name: 'Multi-Till & Bank Feed Tracking',
        tooltipTitle: 'Consolidated Accounts',
        tooltipDesc: 'Monitor Lipa na M-Pesa, Airtel Money, and bank transactions in a single consolidated dashboard.',
      },
    ],
  },
  {
    name: 'Analytics & Support',
    features: [
      {
        id: 'receipt-history',
        name: 'Download History with Receipts',
        tooltipTitle: 'Receipt Export',
        tooltipDesc: 'Personal and event transaction history can be downloaded with attached receipt files on all plans.',
      },
      {
        id: 'standard-analytics',
        name: 'Personal & Event Analytics',
        tooltipTitle: 'Standard Analytics',
        tooltipDesc: 'Visual breakdown of burn rate, week-over-week variances, and category ratios starting at Plus.',
      },
      {
        id: 'pdf-reports',
        name: 'Audit-Ready PDF Statements',
        tooltipTitle: 'Executive Statements',
        tooltipDesc: 'Generate clean PDF summary statements ready for partners and auditors.',
      },
      {
        id: 'priority-email',
        name: 'Priority Email Help Desk',
        tooltipTitle: 'Accelerated SLA',
        tooltipDesc: 'Guaranteed 12-hour resolution window with technical support specialists.',
      },
    ],
  },
];

const PRO_GROUPS: FeatureGroup[] = [
  {
    name: 'Business Operations & Events',
    features: [
      {
        id: 'sms-sync',
        name: 'Direct M-Pesa SMS Auto-Sync',
        tooltipTitle: 'Offline SMS Sync',
        tooltipDesc: 'Mofin detects incoming mobile money payment alerts directly from SMS notifications with zero data usage.',
      },
      {
        id: 'pro-events',
        name: '5 Active Event Budgets',
        tooltipTitle: 'Business Events',
        tooltipDesc: 'Maintain 5 dedicated concurrent event budgets with high capacity (KSH 150,000 per event, KSH 750,000/mo total).',
      },
      {
        id: 'event-duration',
        name: 'Up to 30 Days Per Event',
        tooltipTitle: 'Event Duration',
        tooltipDesc: 'Every event budget can run up to 30 full days without daily penalty fees.',
      },
      {
        id: 'custom-cats',
        name: 'Custom Expense Categories',
        tooltipTitle: 'Personalized Tags',
        tooltipDesc: 'Create unique categories, color labels, and icon tags tailored to your events and spending.',
      },
      {
        id: 'receipt-print',
        name: 'Thermal Receipt Printing & Vouchers',
        tooltipTitle: 'POS Receipts',
        tooltipDesc: 'Direct Bluetooth thermal printing and digital receipt sharing for in-person customer settlements.',
      },
      {
        id: 'cloud-backup',
        name: 'Automatic Cloud Backup & Restore',
        tooltipTitle: 'Encrypted Cloud Backup',
        tooltipDesc: 'Safely backup and restore your events, categories, and transactions whenever needed.',
      },
    ],
  },
  {
    name: 'Compliance & Analytics',
    features: [
      {
        id: 'receipt-history',
        name: 'Download History with Receipts',
        tooltipTitle: 'Receipt Export',
        tooltipDesc: 'Personal and event transaction history can be downloaded with attached receipt files on all plans.',
      },
      {
        id: 'tax-prep',
        name: 'KRA Tax Schedule & VAT Breakdown',
        tooltipTitle: 'Tax Compliance',
        tooltipDesc: 'Categorizes withholding tax, standard VAT, and exempt expenses for tax filing.',
      },
      {
        id: 'full-analytics',
        name: 'Full Personal & Event Trend Analytics',
        tooltipTitle: 'Visual Analytics',
        tooltipDesc: 'Deep visual breakdown of burn rate, week-over-week variances, and category ratios.',
      },
      {
        id: 'pdf-reports',
        name: 'Audit-Ready PDF Statements',
        tooltipTitle: 'Executive Statements',
        tooltipDesc: 'Generate clean PDF summary statements ready for partners and auditors.',
      },
    ],
  },
  {
    name: 'Onboarding & Phone Support',
    features: [
      {
        id: 'live-call',
        name: '1-on-1 Live Setup & Onboarding Call',
        tooltipTitle: 'Personalized Guidance',
        tooltipDesc: '20-minute scheduled screen setup call with an East African operations specialist.',
      },
      {
        id: 'phone-support',
        name: 'Phone & WhatsApp Support',
        tooltipTitle: 'Direct Hotline',
        tooltipDesc: 'Direct phone and WhatsApp helpline during standard business hours.',
      },
    ],
  },
];

const INFINITE_GROUPS: FeatureGroup[] = [
  {
    name: 'Enterprise Events & Governance',
    features: [
      {
        id: 'sms-sync',
        name: 'Direct M-Pesa SMS Auto-Sync',
        tooltipTitle: 'Offline SMS Sync',
        tooltipDesc: 'Mofin detects incoming mobile money payment alerts directly from SMS notifications with zero data usage.',
      },
      {
        id: 'infinite-events',
        name: 'Unlimited Active Event Budgets',
        tooltipTitle: 'Limitless Scope',
        tooltipDesc: 'Deploy limitless concurrent event budget pools with uncapped transactional limits (Above KSh 150,000).',
      },
      {
        id: 'no-duration-cap',
        name: 'No Event Duration Cap',
        tooltipTitle: 'Unlimited Length',
        tooltipDesc: 'Events can run indefinitely without 30-day cutoffs or renewal limits.',
      },
      {
        id: 'custom-cats',
        name: 'Custom Expense Categories',
        tooltipTitle: 'Personalized Tags',
        tooltipDesc: 'Create unique categories, color labels, and icon tags tailored to your enterprise needs.',
      },
      {
        id: 'receipt-print',
        name: 'Thermal Receipt Printing & Vouchers',
        tooltipTitle: 'POS Receipts',
        tooltipDesc: 'Direct Bluetooth thermal printing and digital receipt sharing for in-person customer settlements.',
      },
      {
        id: 'multi-role',
        name: 'Multi-Staff Role Governance',
        tooltipTitle: 'Role Access Control',
        tooltipDesc: 'Assign Owner, Cashier, and Auditor roles with tamper-proof audit trails.',
      },
      {
        id: 'priority-processing',
        name: 'High-Volume Batch Processing',
        tooltipTitle: 'Batch Engine',
        tooltipDesc: 'Engineered for high-volume merchants processing thousands of customer payments daily.',
      },
    ],
  },
  {
    name: 'Integrations & Compliance',
    features: [
      {
        id: 'receipt-history',
        name: 'Download History with Receipts',
        tooltipTitle: 'Receipt Export',
        tooltipDesc: 'Personal and event transaction history can be downloaded with attached receipt files on all plans.',
      },
      {
        id: 'custom-api',
        name: 'Direct Webhook & ERP Export',
        tooltipTitle: 'Enterprise Integration',
        tooltipDesc: 'Real-time JSON webhooks for external accounting backends and databases.',
      },
      {
        id: 'tax-prep',
        name: 'KRA Tax Schedule & VAT Breakdown',
        tooltipTitle: 'Tax Compliance',
        tooltipDesc: 'Categorizes withholding tax, standard VAT, and exempt expenses for tax filing.',
      },
      {
        id: 'pdf-reports',
        name: 'Audit-Ready PDF Statements',
        tooltipTitle: 'Executive Statements',
        tooltipDesc: 'Generate clean PDF summary statements ready for partners and auditors.',
      },
    ],
  },
  {
    name: 'Dedicated Concierge',
    features: [
      {
        id: 'sla-support',
        name: '24/7 Dedicated Account Manager',
        tooltipTitle: 'VIP Concierge',
        tooltipDesc: 'Dedicated WhatsApp and phone hotline with priority emergency support.',
      },
      {
        id: 'feature-priority',
        name: 'Custom Feature Request Priority',
        tooltipTitle: 'Roadmap Influence',
        tooltipDesc: 'Direct feedback loop to Mofin engineering for custom workflows.',
      },
    ],
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'lite',
    name: 'Mofin Lite',
    subtitle: 'Trackstar: Essential mobile money tracking',
    price: 249,
    userCalloutLabel: '2 Active Events',
    userCalloutSub: 'Up to KSH 5,000 per event',
    featureGroups: LITE_GROUPS,
  },
  {
    id: 'plus',
    name: 'Mofin Plus',
    subtitle: 'Organizer: Scale multiple income and cost pools',
    price: 549,
    userCalloutLabel: '3 Active Events',
    userCalloutSub: 'Up to KSH 35,000 per event',
    featureGroups: PLUS_GROUPS,
  },
  {
    id: 'pro',
    name: 'Mofin Pro',
    subtitle: 'Analyst: Full automation for busy businesses',
    featured: true,
    featuredBadge: 'Most Popular',
    price: 1149,
    userCalloutLabel: '5 Active Events',
    userCalloutSub: 'Up to KSH 150,000 per event',
    featureGroups: PRO_GROUPS,
  },
  {
    id: 'infinite',
    name: 'Mofin Infinite',
    subtitle: 'Unlimited: Complete governance and API feeds',
    price: 1999,
    userCalloutLabel: 'Unlimited Events',
    userCalloutSub: 'Above KSH 150,000 • No cap',
    featureGroups: INFINITE_GROUPS,
  },
];

const FAQS = [
  {
    q: 'Is Mofin accessible on mobile and web, or do I download software?',
    a: 'Mofin runs as an Android mobile app with an optional cloud Web Admin command center. No complicated server setups are required; download the APK directly, authenticate your phone number, and you are live in under 60 seconds.',
  },
  {
    q: 'Can I switch plans, upgrade, or cancel at any time?',
    a: 'Yes, you can upgrade, downgrade, or cancel your Mofin subscription at any time without penalties or lock-in contracts. If you cancel, you will retain active access until the end of your billing cycle.',
  },
  {
    q: 'How does Lipa na M-Pesa automatic reconciliation work?',
    a: 'When customers settle invoices via your Till or Paybill (such as Mofin Till 4549332), Mofin reads and matches the Daraja transaction reference code and receipt numbers immediately without manual transaction entry.',
  },
  {
    q: 'Is phone and WhatsApp support included?',
    a: 'Yes! Phone and direct WhatsApp onboarding support is 100% free with all paid plans. Our East African operations team is available from 08:00 to 20:00 EAT.',
  },
  {
    q: 'What is included in the free onboarding call?',
    a: 'After selecting your plan, you can schedule a complimentary 20-minute screen-share or phone onboarding session with our product experts. We assist with Daraja Till linking, category customization, and thermal receipt printer pairing.',
  },
  {
    q: 'Can I export my transactions to spreadsheets?',
    a: 'Yes, all plans allow instant one-click CSV and Excel workbook exports. Mofin Infinite also provides direct webhooks to feed transactions into external accounting software in real time.',
  },
];

export const Pricing: React.FC = () => {
  const [cadence, setCadence] = useState<Cadence>('MONTHLY');
  const [currentStep, setCurrentStep] = useState<'plan' | 'checkout'>('plan');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Checkout Form State
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPassCode, setCheckoutPassCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // References for sliding pill positioning
  const monthlyRef = useRef<HTMLLabelElement>(null);
  const annualRef = useRef<HTMLLabelElement>(null);
  const trialRef = useRef<HTMLLabelElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 4, width: 80 });

  // Update cadence pill position on cadence switch & window resize
  const updatePill = () => {
    let target = monthlyRef.current;
    if (cadence === 'ANNUAL') target = annualRef.current;
    if (cadence === 'TRIAL') target = trialRef.current;

    if (target) {
      setPillStyle({
        left: target.offsetLeft,
        width: target.offsetWidth,
      });
    }
  };

  useEffect(() => {
    updatePill();
    const timer = setTimeout(updatePill, 40);
    window.addEventListener('resize', updatePill);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePill);
    };
  }, [cadence]);

  // Ensure page always starts at the very top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Exit intent modal detection on desktop
  useEffect(() => {
    const storageKey = 'mofinPromoExitModalShown';
    let shown = false;
    try {
      shown = window.sessionStorage.getItem(storageKey) === '1';
    } catch {
      shown = false;
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (shown || e.clientY > 10 || window.innerWidth < 1024) return;
      setExitModalOpen(true);
      shown = true;
      try {
        window.sessionStorage.setItem(storageKey, '1');
      } catch {}
    };

    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    return () => {
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const selectedPlan = PRICING_TIERS.find((p) => p.id === selectedPlanId) || PRICING_TIERS[2];

  const getPriceData = (plan: PricingTier) => {
    return {
      struckPrice: null,
      headlineMajor: `KSH ${plan.price.toLocaleString()}`,
      headlineCents: '',
      suffix: '/month',
      offerNote: 'Monthly subscription • Cancel anytime',
      basketTotal: `KSH ${plan.price.toLocaleString()}.00`,
    };
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentStep('checkout');
    window.scrollTo({ top: 340, behavior: 'smooth' });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  return (
    <div className="qb-root flex flex-col">
      {/* -------------------------------------------------------------
          EXIT INTENT MODAL
          ------------------------------------------------------------- */}
      {exitModalOpen && (
        <div className="qb-modal-backdrop" onClick={() => setExitModalOpen(false)}>
          <div className="qb-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="qb-modal-close"
              onClick={() => setExitModalOpen(false)}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
            <div className="qb-stack qb-stack--center">
              <span className="promo-exit-modal-badge">Most Popular</span>
              <h2 className="qb-h3" style={{ marginBottom: '0.35rem' }}>
                Automate with Mofin Pro
              </h2>
              <p className="qb-body" style={{ color: 'var(--color-steel)', marginBottom: '1.25rem' }}>
                Automate your Daraja M-Pesa expense tracking, 5 dedicated event budgets up to KSH 150,000, and cash flow governance effortlessly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setExitModalOpen(false);
                  handleSelectPlan('pro');
                }}
                className="qb-button qb-button--green qb-button--medium"
                style={{ width: '100%', maxWidth: '16rem' }}
              >
                Choose Mofin Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN PRICING FLOW
          ------------------------------------------------------------- */}
      <main className="qb-pricing-flow qb-section">
        <div className="qb-container qb-pricing-flow-inner">
          {/* Hero Header */}
          <header className="qb-stack qb-stack--center qb-pricing-flow-intro">
            <h1 className="qb-h1">Find a plan that’s right for you</h1>
            <ul className="qb-pricing-flow-benefits" role="list">
              <li>
                <Check size={16} />
                <span>Automate your mobile money tracking & receipt reconciliation</span>
              </li>
              <li>
                <Check size={16} />
                <span>Cancel, downgrade, or switch plans anytime</span>
              </li>
              <li>
                <Check size={16} />
                <span>Free phone & live onboarding setup guidance</span>
              </li>
            </ul>
          </header>

          {/* Flow Guidance Toolbar (Progress Stepper + Cadence Toggle) */}
          <div className="qb-pricing-flow-toolbar" id="pricing-plan-selection">
            <nav className="qb-pricing-flow-progress" aria-label="Checkout progress">
              <ol role="list">
                <li
                  className="qb-body-sm"
                  aria-current={currentStep === 'plan' ? 'step' : undefined}
                  data-complete={currentStep === 'checkout' ? 'true' : undefined}
                >
                  <span className="qb-pricing-flow-step-number">1</span>
                  <span className="qb-pricing-flow-step-label">Select plan</span>
                </li>
                <li className="qb-body-sm" aria-current={currentStep === 'checkout' ? 'step' : undefined}>
                  <span className="qb-pricing-flow-step-number">2</span>
                  <span className="qb-pricing-flow-step-label">Checkout</span>
                </li>
              </ol>
            </nav>

            {/* Cadence Switcher with Sliding Pill Indicator */}
            {currentStep === 'plan' && (
              <div className="qb-pricing-flow-controls">
                <fieldset className="qb-pricing-flow-cadence">
                  <legend className="qb-pricing-flow-visually-hidden">Offer cadence</legend>
                  <span
                    className="qb-pricing-flow-cadence-pill"
                    style={{
                      transform: `translateX(${pillStyle.left}px)`,
                      width: `${pillStyle.width}px`,
                    }}
                    aria-hidden="true"
                  />
                  <label
                    ref={monthlyRef}
                    className={cadence === 'MONTHLY' ? 'active' : ''}
                    onClick={() => setCadence('MONTHLY')}
                  >
                    <span>Monthly</span>
                  </label>
                  <label
                    ref={annualRef}
                    className="opacity-50 select-none"
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    title="Annual billing coming soon"
                  >
                    <span>Annual</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#f4f4f5', color: '#71717a', marginLeft: '6px' }}>SOON</span>
                  </label>
                  <label
                    ref={trialRef}
                    className="opacity-50 select-none"
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    title="Free trial coming soon"
                  >
                    <span>Free trial</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#f4f4f5', color: '#71717a', marginLeft: '6px' }}>SOON</span>
                  </label>
                </fieldset>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              STEP 1: PLAN COMPARISON MATRIX
              ------------------------------------------------------------- */}
          {currentStep === 'plan' && (
            <section className="qb-pricing-flow-choice" aria-labelledby="qb-pricing-plan-heading">
              <h2 className="qb-pricing-flow-visually-hidden" id="qb-pricing-plan-heading">
                Mofin Plans
              </h2>
              <ul className="qb-pricing-flow-cards" role="list">
                {PRICING_TIERS.map((tier) => {
                  const pricing = getPriceData(tier);
                  const isFeatured = tier.featured;

                  return (
                    <li key={tier.id} id={`plan-card-${tier.id}`} className="qb-pricing-flow-card-item">
                      <div className={`qb-pricing-flow-card ${isFeatured ? 'qb-pricing-flow-card--featured' : ''}`}>
                        {isFeatured && tier.featuredBadge && (
                          <span className="qb-pricing-flow-featured-tab">{tier.featuredBadge}</span>
                        )}

                        {/* Card Header & Price */}
                        <div className="qb-pricing-flow-card-header">
                          <span className="qb-h4">{tier.name}</span>
                          <span className="qb-body-sm">{tier.subtitle}</span>

                          <div className="qb-pricing-flow-price">
                            <span className="qb-pricing-flow-list-price">
                              {pricing.struckPrice || <span>&nbsp;</span>}
                            </span>
                            <div className="qb-pricing-flow-price-headline">
                              <span className="qb-price">{pricing.headlineMajor}</span>
                              <span className="qb-body-sm">{pricing.suffix}</span>
                            </div>
                            <span className="qb-pricing-flow-offer-note">{pricing.offerNote}</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="qb-pricing-flow-card-actions">
                          <button
                            type="button"
                            onClick={() => handleSelectPlan(tier.id)}
                            className={`qb-button qb-button--medium qb-pricing-flow-card-cta ${
                              isFeatured ? 'qb-button--green' : 'qb-button--super-blue'
                            }`}
                          >
                            Choose {tier.name}
                          </button>
                        </div>

                        {/* Audience Callout (No Devices, Clean Budgets) */}
                        <div className="qb-pricing-flow-card-user-callout">
                          <span className="qb-label">{tier.userCalloutLabel}</span>
                          <span>{tier.userCalloutSub}</span>
                        </div>

                        {/* Feature Groups Accordions */}
                        <div className="qb-pricing-flow-feature-groups">
                          {tier.featureGroups.map((group, gIdx) => (
                            <details key={gIdx} className="qb-pricing-flow-feature-group" open>
                              <summary className="qb-pricing-flow-feature-group-title">
                                <span className="qb-pricing-flow-feature-group-label">
                                  <span>{group.name}</span>
                                </span>
                                <ChevronDown size={14} className="qb-pricing-flow-feature-group-chevron" />
                              </summary>

                              <ul className="qb-pricing-flow-features" role="list">
                                {group.features.map((feat) => (
                                  <li key={feat.id} className="qb-pricing-flow-feature">
                                    <Check size={14} className="qb-pricing-flow-feature-icon" />
                                    <span className="qb-pricing-flow-feature-copy">
                                      {feat.name}
                                      <button
                                        type="button"
                                        className="qb-pricing-flow-feature-tooltip-trigger"
                                        onMouseEnter={() => setActiveTooltip(`${tier.id}-${feat.id}`)}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                        onClick={() =>
                                          setActiveTooltip((prev) =>
                                            prev === `${tier.id}-${feat.id}` ? null : `${tier.id}-${feat.id}`
                                          )
                                        }
                                        aria-label={`About ${feat.name}`}
                                      >
                                        <Info size={12} />
                                      </button>
                                      {activeTooltip === `${tier.id}-${feat.id}` && (
                                        <span className="qb-pricing-flow-feature-tooltip">
                                          <span className="qb-pricing-flow-feature-tooltip-title">
                                            {feat.tooltipTitle}
                                          </span>
                                          <span className="qb-pricing-flow-feature-tooltip-description">
                                            {feat.tooltipDesc}
                                          </span>
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* -------------------------------------------------------------
              STEP 2: CHECKOUT PANEL
              ------------------------------------------------------------- */}
          {currentStep === 'checkout' && (
            <section className="qb-pricing-flow-checkout" aria-labelledby="qb-pricing-checkout-heading">
              <h2 className="qb-pricing-flow-visually-hidden" id="qb-pricing-checkout-heading">
                Checkout
              </h2>
              <div className="qb-pricing-flow-checkout-layout">
                {/* Aside: Your Basket */}
                <aside className="qb-pricing-flow-basket" aria-labelledby="qb-pricing-basket-heading">
                  <h3 className="qb-h4" id="qb-pricing-basket-heading" style={{ marginBottom: '1rem' }}>
                    Your basket
                  </h3>

                  <ul className="qb-pricing-flow-basket-list" role="list">
                    <li className="qb-pricing-flow-basket-item">
                      <div className="qb-pricing-flow-basket-header">
                        <span className="qb-body-sm">Selected subscription</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep('plan')}
                          className="qb-button--text"
                        >
                          Edit plan
                        </button>
                      </div>

                      <div className="qb-pricing-flow-basket-name">{selectedPlan.name}</div>
                      <div className="qb-pricing-flow-basket-price">
                        <span>{getPriceData(selectedPlan).headlineMajor}</span>
                        <span className="qb-body-sm">{getPriceData(selectedPlan).suffix}</span>
                      </div>
                      <span className="qb-body-sm text-emerald-600 font-medium">
                        {getPriceData(selectedPlan).offerNote}
                      </span>
                    </li>
                  </ul>

                  <div className="qb-pricing-flow-basket-total">
                    <strong className="qb-body" style={{ fontWeight: 600 }}>Total due today</strong>
                    <span className="qb-pricing-flow-basket-total-value">
                      {getPriceData(selectedPlan).basketTotal}
                    </span>
                  </div>
                  <p className="qb-body-sm" style={{ marginTop: '0.5rem', color: 'var(--color-fog)' }}>
                    VAT and Daraja M-Pesa processing fees included.
                  </p>
                </aside>

                {/* Secure Checkout Form */}
                <div className="qb-pricing-flow-checkout-sui">
                  {checkoutSuccess ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={24} />
                      </div>
                      <h3 className="qb-h3 mb-2">Order Confirmed</h3>
                      <p className="qb-body mb-5 text-gray-600">
                        We have dispatched your M-Pesa STK prompt and activation pass code to{' '}
                        <strong>{checkoutPhone || 'your registered number'}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutSuccess(false);
                          setCurrentStep('plan');
                        }}
                        className="qb-button qb-button--green qb-button--medium"
                      >
                        Return to Plans
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckoutSubmit}>
                      <h3 className="qb-h3 mb-1">Secure checkout</h3>
                      <p className="qb-body-sm mb-5 text-gray-500">
                        Complete payment via Lipa na M-Pesa Till 4549332 or enter an existing pass code.
                      </p>

                      <div className="checkout-form-group">
                        <label className="checkout-form-label" htmlFor="checkout-phone">
                          M-Pesa Mobile Number (Safaricom)
                        </label>
                        <input
                          id="checkout-phone"
                          type="tel"
                          required
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder="e.g. 0712 345 678 or 2547..."
                          className="checkout-form-input"
                        />
                      </div>

                      <div className="checkout-form-group">
                        <label className="checkout-form-label" htmlFor="checkout-email">
                          Work Email for Receipts & Invoices
                        </label>
                        <input
                          id="checkout-email"
                          type="email"
                          required
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="checkout-form-input"
                        />
                      </div>

                      <div className="checkout-form-group">
                        <label className="checkout-form-label" htmlFor="checkout-passcode">
                          Have an 8-character Activation Pass Code? (Optional)
                        </label>
                        <input
                          id="checkout-passcode"
                          type="text"
                          maxLength={9}
                          value={checkoutPassCode}
                          onChange={(e) => setCheckoutPassCode(e.target.value.toUpperCase())}
                          placeholder="XXXX-XXXX"
                          className="checkout-form-input font-mono uppercase tracking-wider"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="qb-button qb-button--green qb-button--medium w-full mt-3"
                      >
                        {isSubmitting
                          ? 'Initiating STK Push…'
                          : `Pay ${getPriceData(selectedPlan).basketTotal} via M-Pesa`}
                      </button>

                      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Instant Daraja API reconciliation • 256-bit encryption</span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* -------------------------------------------------------------
          4. FAQS ACCORDION
          ------------------------------------------------------------- */}
      <section className="qb-faqs qb-section">
        <div className="qb-container qb-faqs-inner">
          <div className="qb-faqs-heading">
            <h2 className="qb-h2">FAQs</h2>
            <p className="qb-body-sm mt-2" style={{ color: 'var(--color-fog)' }}>
              Have questions about pricing, event budgets, or payment options? We are here to help.
            </p>
          </div>

          <div className="qb-faqs-list">
            {FAQS.map((faq, idx) => (
              <details key={idx} className="qb-faqs-item">
                <summary>
                  <span>{faq.q}</span>
                  <ChevronDown className="qb-faqs-icon" size={18} />
                </summary>
                <div className="qb-faqs-answer">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. DISCLAIMER & LEGAL MODAL
          ------------------------------------------------------------- */}
      <section className="qb-footer-disclaimer qb-section--sm">
        <div className="qb-container">
          <button
            type="button"
            onClick={() => setDisclaimerModalOpen(true)}
            className="qb-footer-disclaimer-trigger"
          >
            Important pricing details and product information
          </button>
        </div>
      </section>

      {disclaimerModalOpen && (
        <div className="qb-modal-backdrop" onClick={() => setDisclaimerModalOpen(false)}>
          <div className="qb-footer-disclaimer-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="qb-modal-close"
              style={{ color: '#09090b', top: '1.25rem', right: '1.25rem' }}
              onClick={() => setDisclaimerModalOpen(false)}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <h2 className="qb-h3">Important pricing details and product information</h2>
            <p className="qb-body" style={{ marginTop: '0.5rem' }}>
              Mofin reserves the right to modify pricing, features, and platform capabilities at any time. For full
              terms, please consult our{' '}
              <Link to="/terms" className="text-emerald-600 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-emerald-600 underline">
                Privacy Policy
              </Link>
              .
            </p>

            <section>
              <h3 className="qb-body-emphasis">*Offer terms</h3>
              <p className="qb-body">
                Mofin discount offer terms: Receive the discount stated above on the current monthly or annual price for
                Mofin Lite, Plus, Pro, or Infinite for the stated promotional period starting from enrollment. Your
                account will renew at the standard prevailing rate unless cancelled prior to renewal. Free trial offers
                do not require payment details and convert only upon explicit manual authorization.
              </p>
            </section>

            <section>
              <h3 className="qb-body-emphasis">Cancellation terms</h3>
              <p className="qb-body">
                You may cancel your subscription at any time via the Mofin Android app Settings or Web Admin dashboard.
                Cancellations take effect at the conclusion of the active billing month; no prorated refunds or penalty
                fees apply.
              </p>
            </section>

            <section>
              <h3 className="qb-body-emphasis">**Products, features, and SMS sync</h3>
              <p className="qb-body">
                Automatic M-Pesa SMS parsing requires standard Android SMS access. Mofin operates purely locally on
                your phone for SMS analysis, transmitting zero private customer text content to third-party advertising
                brokers. Daraja Till reconciliation relies on Safaricom network availability.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
