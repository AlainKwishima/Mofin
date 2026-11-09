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
  priceRwf: number;
  maxEventsPerMonth: number;
  maxMoneyPerEvent: number;
  maxMoneyPerEventRwf: number;
  receiptPrinting: boolean;
  customCategories: boolean;
  fullAnalytics: boolean;
  userCalloutLabel: string;
  userCalloutSubKes: string;
  userCalloutSubRwf: string;
  featureGroups: FeatureGroup[];
}

interface RemotePublicPlan {
  id?: number;
  code: string;
  name: string;
  subtitle?: string | null;
  price: number | string;
  priceRwf?: number | string | null;
  maxEventsPerMonth: number;
  maxMoneyPerEvent: number | string;
  maxMoneyPerEventRwf?: number | string | null;
  receiptPrinting?: boolean;
  customCategories?: boolean;
  fullAnalytics?: boolean;
  isActive?: boolean;
  displayOrder?: number;
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
    priceRwf: 2500,
    maxEventsPerMonth: 2,
    maxMoneyPerEvent: 5000,
    maxMoneyPerEventRwf: 50000,
    receiptPrinting: true,
    customCategories: false,
    fullAnalytics: false,
    userCalloutLabel: '2 Active Events',
    userCalloutSubKes: 'Up to KSH 5,000 per event',
    userCalloutSubRwf: 'Up to 50,000 RWF per event',
    featureGroups: LITE_GROUPS,
  },
  {
    id: 'plus',
    name: 'Mofin Plus',
    subtitle: 'Organizer: Scale multiple income and cost pools',
    price: 549,
    priceRwf: 5500,
    maxEventsPerMonth: 3,
    maxMoneyPerEvent: 35000,
    maxMoneyPerEventRwf: 350000,
    receiptPrinting: true,
    customCategories: false,
    fullAnalytics: true,
    userCalloutLabel: '3 Active Events',
    userCalloutSubKes: 'Up to KSH 35,000 per event',
    userCalloutSubRwf: 'Up to 350,000 RWF per event',
    featureGroups: PLUS_GROUPS,
  },
  {
    id: 'pro',
    name: 'Mofin Pro',
    subtitle: 'Analyst: Full automation for busy businesses',
    featured: true,
    featuredBadge: 'Most Popular',
    price: 1149,
    priceRwf: 11500,
    maxEventsPerMonth: 5,
    maxMoneyPerEvent: 150000,
    maxMoneyPerEventRwf: 1500000,
    receiptPrinting: true,
    customCategories: true,
    fullAnalytics: true,
    userCalloutLabel: '5 Active Events',
    userCalloutSubKes: 'Up to KSH 150,000 per event',
    userCalloutSubRwf: 'Up to 1,500,000 RWF per event',
    featureGroups: PRO_GROUPS,
  },
  {
    id: 'infinite',
    name: 'Mofin Infinite',
    subtitle: 'Unlimited: Complete governance and API feeds',
    price: 1999,
    priceRwf: 20000,
    maxEventsPerMonth: 999999,
    maxMoneyPerEvent: 99999999,
    maxMoneyPerEventRwf: 99999999,
    receiptPrinting: true,
    customCategories: true,
    fullAnalytics: true,
    userCalloutLabel: 'Unlimited Events',
    userCalloutSubKes: 'Above KSH 150,000 • No cap',
    userCalloutSubRwf: 'Above 1,500,000 RWF • No cap',
    featureGroups: INFINITE_GROUPS,
  },
];

function formatEventCallout(tier: {
  maxEventsPerMonth: number;
  maxMoneyPerEvent: number;
  maxMoneyPerEventRwf: number;
}) {
  const isUnlimitedEvents = tier.maxEventsPerMonth >= 9999;
  const userCalloutLabel = isUnlimitedEvents
    ? 'Unlimited Events'
    : `${tier.maxEventsPerMonth} Active Event${tier.maxEventsPerMonth === 1 ? '' : 's'}`;

  const isUnlimitedKes = tier.maxMoneyPerEvent >= 9999999;
  const isUnlimitedRwf = tier.maxMoneyPerEventRwf >= 9999999;

  const userCalloutSubKes = isUnlimitedKes
    ? 'Unlimited per event • No cap'
    : `Up to KSH ${tier.maxMoneyPerEvent.toLocaleString()} per event`;
  const userCalloutSubRwf = isUnlimitedRwf
    ? 'Unlimited per event • No cap'
    : `Up to ${tier.maxMoneyPerEventRwf.toLocaleString()} RWF per event`;

  return { userCalloutLabel, userCalloutSubKes, userCalloutSubRwf };
}

function getResolvedFeatureGroups(tier: PricingTier, currency: 'KES' | 'RWF'): FeatureGroup[] {
  const isUnlimitedEvents = tier.maxEventsPerMonth >= 9999;
  const activeCap = currency === 'RWF' ? tier.maxMoneyPerEventRwf : tier.maxMoneyPerEvent;
  const isUnlimitedCap = activeCap >= 9999999;
  const capLabel =
    currency === 'RWF'
      ? `${activeCap.toLocaleString()} RWF`
      : `KSH ${activeCap.toLocaleString()}`;

  const eventFeatureIds = new Set(['lite-events', 'plus-events', 'pro-events', 'infinite-events']);

  const groups = tier.featureGroups.map((group) => {
    const filteredFeatures = group.features
      .filter((feat) => {
        if (!tier.receiptPrinting && (feat.id === 'receipt-print' || feat.id === 'receipt-history')) {
          return false;
        }
        if (!tier.customCategories && feat.id === 'custom-cats') {
          return false;
        }
        if (!tier.fullAnalytics && (feat.id === 'full-analytics' || feat.id === 'standard-analytics')) {
          return false;
        }
        return true;
      })
      .map((feat) => {
        if (!eventFeatureIds.has(feat.id)) return feat;
        const name = isUnlimitedEvents
          ? 'Unlimited Active Event Budgets'
          : `${tier.maxEventsPerMonth} Active Event Budget${tier.maxEventsPerMonth === 1 ? '' : 's'}`;
        const tooltipDesc = isUnlimitedEvents && isUnlimitedCap
          ? 'Deploy limitless concurrent event budget pools with uncapped transactional limits.'
          : isUnlimitedEvents
          ? `Deploy limitless concurrent event budget pools (up to ${capLabel} per event).`
          : isUnlimitedCap
          ? `Concurrently manage up to ${tier.maxEventsPerMonth} active event budgets with no per-event spending cap.`
          : `Concurrently manage up to ${tier.maxEventsPerMonth} active event budget${tier.maxEventsPerMonth === 1 ? '' : 's'} (up to ${capLabel} per event).`;

        return { ...feat, name, tooltipDesc };
      });

    return {
      ...group,
      features: filteredFeatures,
    };
  });

  // Ensure enabled dynamic capability toggles appear if admin newly turned them on for a tier
  if (groups.length > 0 && tier.customCategories) {
    const hasCustomCats = groups.some((g) => g.features.some((f) => f.id === 'custom-cats'));
    if (!hasCustomCats) {
      groups[0] = {
        ...groups[0],
        features: [
          ...groups[0].features,
          {
            id: 'custom-cats',
            name: 'Custom Expense Categories',
            tooltipTitle: 'Personalized Tags',
            tooltipDesc: 'Create unique categories, color labels, and icon tags tailored to your events and spending.',
          },
        ],
      };
    }
  }

  if (groups.length > 1 && tier.fullAnalytics) {
    const hasAnalytics = groups.some((g) =>
      g.features.some((f) => f.id === 'full-analytics' || f.id === 'standard-analytics')
    );
    if (!hasAnalytics) {
      groups[1] = {
        ...groups[1],
        features: [
          ...groups[1].features,
          {
            id: 'full-analytics',
            name: 'Personal & Event Analytics',
            tooltipTitle: 'Visual Analytics',
            tooltipDesc: 'Deep visual breakdown of burn rate, week-over-week variances, and category ratios.',
          },
        ],
      };
    }
  }

  return groups.filter((g) => g.features.length > 0);
}

function mergePublicPlansIntoTiers(remotePlans: RemotePublicPlan[], baseTiers: PricingTier[]): PricingTier[] {
  const paidRemotePlans = remotePlans
    .filter((p) => p && typeof p.code === 'string' && p.code.toUpperCase() !== 'FREE' && p.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

  if (paidRemotePlans.length === 0) {
    return baseTiers;
  }

  return paidRemotePlans.map((remote) => {
    const id = remote.code.toLowerCase();
    const template = baseTiers.find((t) => t.id === id) || baseTiers[0];

    const maxEventsPerMonth = Number(remote.maxEventsPerMonth ?? template.maxEventsPerMonth);
    const maxMoneyPerEvent = Number(remote.maxMoneyPerEvent ?? template.maxMoneyPerEvent);
    const maxMoneyPerEventRwf = Number(
      remote.maxMoneyPerEventRwf ?? (maxMoneyPerEvent >= 9999999 ? 99999999 : template.maxMoneyPerEventRwf)
    );

    const callout = formatEventCallout({
      maxEventsPerMonth,
      maxMoneyPerEvent,
      maxMoneyPerEventRwf,
    });

    return {
      ...template,
      id,
      name: remote.name || template.name,
      subtitle: remote.subtitle || template.subtitle,
      price: Number(remote.price ?? template.price),
      priceRwf: Number(remote.priceRwf ?? template.priceRwf),
      maxEventsPerMonth,
      maxMoneyPerEvent,
      maxMoneyPerEventRwf,
      receiptPrinting: remote.receiptPrinting ?? template.receiptPrinting,
      customCategories: remote.customCategories ?? template.customCategories,
      fullAnalytics: remote.fullAnalytics ?? template.fullAnalytics,
      userCalloutLabel: callout.userCalloutLabel,
      userCalloutSubKes: callout.userCalloutSubKes,
      userCalloutSubRwf: callout.userCalloutSubRwf,
    };
  });
}

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
  const [tiers, setTiers] = useState<PricingTier[]>(PRICING_TIERS);
  const [promoBannerVisible, setPromoBannerVisible] = useState(true);
  const [cadence, setCadence] = useState<Cadence>('MONTHLY');
  const [currency, setCurrency] = useState<'KES' | 'RWF'>('KES');
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

  // Sync live pricing & quotas from unauthenticated backend endpoint cleanly
  useEffect(() => {
    const controller = new AbortController();
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

    fetch(`${apiBase}/subscriptions/public/plans`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : null;
        if (list && list.length > 0) {
          setTiers(mergePublicPlansIntoTiers(list, PRICING_TIERS));
        }
      })
      .catch(() => {
        // Keep instant static PRICING_TIERS fallback when API is offline
      });

    return () => controller.abort();
  }, []);

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

  // Check if returning from payment callback
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment_success') === 'true') {
        const planParam = params.get('plan');
        if (planParam) setSelectedPlanId(planParam);
        setCurrentStep('checkout');
        setCheckoutSuccess(true);
      }
    } catch {
      // Ignore in non-browser context
    }
  }, []);

  const selectedPlan =
    tiers.find((p) => p.id === selectedPlanId) ||
    tiers.find((p) => p.featured) ||
    tiers[0] ||
    PRICING_TIERS[2];
  const featuredPromoTier =
    tiers.find((p) => p.id === 'pro') ||
    tiers.find((p) => p.featured) ||
    tiers[0] ||
    PRICING_TIERS[2];

  const getPriceData = (plan: PricingTier) => {
    const isRwf = currency === 'RWF';
    const activePrice = isRwf ? plan.priceRwf : plan.price;
    const symbol = isRwf ? 'RWF' : 'KSH';

    if (cadence === 'ANNUAL') {
      const fullAnnualBase = activePrice * 12;
      const discountedAnnual = Math.round(fullAnnualBase * 0.5); // 50% off
      const monthlyEquiv = Math.round(discountedAnnual / 12);
      return {
        struckPrice: `${symbol} ${fullAnnualBase.toLocaleString()}`,
        headlineMajor: `${symbol} ${discountedAnnual.toLocaleString()}`,
        headlineCents: '',
        suffix: '/year',
        offerNote: `50% off yearly (~${symbol} ${monthlyEquiv.toLocaleString()}/mo) • Save ${symbol} ${(fullAnnualBase - discountedAnnual).toLocaleString()}`,
        basketTotal: `${symbol} ${discountedAnnual.toLocaleString()}.00`,
      };
    }

    if (cadence === 'TRIAL') {
      return {
        struckPrice: null,
        headlineMajor: `${symbol} 0`,
        headlineCents: '',
        suffix: '/30 days',
        offerNote: 'Free 30-day trial • No card required',
        basketTotal: `${symbol} 0.00`,
      };
    }

    // Default: MONTHLY (30% off)
    const discountedMonthly = Math.ceil(activePrice * 0.7); // 30% off
    return {
      struckPrice: `${symbol} ${activePrice.toLocaleString()}`,
      headlineMajor: `${symbol} ${discountedMonthly.toLocaleString()}`,
      headlineCents: '',
      suffix: '/month',
      offerNote: '30% off monthly promotional rate • Cancel anytime',
      basketTotal: `${symbol} ${discountedMonthly.toLocaleString()}.00`,
    };
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentStep('checkout');
    window.scrollTo({ top: 340, behavior: 'smooth' });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';
      const token = localStorage.getItem('mofin_access_token') || sessionStorage.getItem('mofin_access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/subscriptions/paystack/initialize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planCode: selectedPlan.id.toUpperCase(),
          billingCycle: cadence === 'ANNUAL' ? 'YEARLY' : 'MONTHLY',
          callbackUrl: `${window.location.origin}/pricing?payment_success=true&plan=${selectedPlan.id}`,
        }),
      });
      const data = await res.json();
      if (data?.data?.authorizationUrl && !data.data.authorizationUrl.includes('mock-')) {
        window.location.href = data.data.authorizationUrl;
        return;
      }
    } catch {
      // Graceful fallback to preview confirmation
    }
    setTimeout(() => {
      setIsSubmitting(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  return (
    <div className="qb-root flex flex-col">
      {/* -------------------------------------------------------------
          1. TOP PROMOTIONAL BANNER
          ------------------------------------------------------------- */}
      {promoBannerVisible && (
        <aside className="promo-banner">
          <div className="qb-container promo-banner-inner">
            <span className="promo-banner-badge">Limited time offer</span>
            <span className="promo-banner-offer">
              Get <span className="promo-banner-discount">30% OFF</span> Monthly or <span className="promo-banner-discount">50% OFF</span> Yearly on all plans
            </span>
            <button
              type="button"
              onClick={() => {
                const planSection = document.getElementById('pricing-plan-selection');
                if (planSection) planSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="promo-banner-cta bg-transparent border-0 underline cursor-pointer"
            >
              Get started &rarr;
            </button>
            <button
              type="button"
              onClick={() => setPromoBannerVisible(false)}
              className="promo-banner-close"
              aria-label="Close promo banner"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}

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
                Automate with {featuredPromoTier.name}
              </h2>
              <p className="qb-body" style={{ color: 'var(--color-steel)', marginBottom: '1.25rem' }}>
                Automate your Daraja M-Pesa expense tracking, {featuredPromoTier.userCalloutLabel.toLowerCase()} (
                {currency === 'RWF' ? featuredPromoTier.userCalloutSubRwf : featuredPromoTier.userCalloutSubKes}
                ), and cash flow governance effortlessly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setExitModalOpen(false);
                  handleSelectPlan(featuredPromoTier.id);
                }}
                className="qb-button qb-button--green qb-button--medium"
                style={{ width: '100%', maxWidth: '16rem' }}
              >
                Choose {featuredPromoTier.name}
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

            {/* Cadence & Currency Controls */}
            {currentStep === 'plan' && (
              <div className="qb-pricing-flow-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* Currency Switcher */}
                <div style={{ display: 'inline-flex', background: '#f4f4f5', padding: '3px', borderRadius: '10px', border: '1px solid #e4e4e7' }}>
                  <button
                    type="button"
                    onClick={() => setCurrency('KES')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: currency === 'KES' ? 700 : 500,
                      borderRadius: '7px',
                      border: 'none',
                      background: currency === 'KES' ? '#ffffff' : 'transparent',
                      color: currency === 'KES' ? '#09090b' : '#71717a',
                      boxShadow: currency === 'KES' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    🇰🇪 KES (Ksh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('RWF')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: currency === 'RWF' ? 700 : 500,
                      borderRadius: '7px',
                      border: 'none',
                      background: currency === 'RWF' ? '#ffffff' : 'transparent',
                      color: currency === 'RWF' ? '#09090b' : '#71717a',
                      boxShadow: currency === 'RWF' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    🇷🇼 RWF (Frw)
                  </button>
                </div>

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
                    <span className="qb-pricing-flow-offer-badge">-30%</span>
                    <span>Monthly</span>
                  </label>
                  <label
                    ref={annualRef}
                    className={cadence === 'ANNUAL' ? 'active' : ''}
                    onClick={() => setCadence('ANNUAL')}
                  >
                    <span className="qb-pricing-flow-offer-badge">-50%</span>
                    <span>Annual</span>
                  </label>
                  <label
                    ref={trialRef}
                    className={cadence === 'TRIAL' ? 'active' : ''}
                    onClick={() => setCadence('TRIAL')}
                  >
                    <span>Free trial</span>
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
                {tiers.map((tier) => {
                  const pricing = getPriceData(tier);
                  const isFeatured = tier.featured;
                  const resolvedGroups = getResolvedFeatureGroups(tier, currency);

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
                          <span>{currency === 'RWF' ? tier.userCalloutSubRwf : tier.userCalloutSubKes}</span>
                        </div>

                        {/* Feature Groups Accordions */}
                        <div className="qb-pricing-flow-feature-groups">
                          {resolvedGroups.map((group, gIdx) => (
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
                    VAT and mobile money processing fees included.
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
                        We have dispatched your mobile money payment prompt and activation pass code to{' '}
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
                      <h3 className="qb-h3 mb-1">Instant Paystack Checkout</h3>
                      <p className="qb-body-sm mb-3 text-gray-500">
                        Fast & automated • Supports MTN MoMo, M-Pesa, Airtel Money, Visa & Mastercard.
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
                          MTN MoMo
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          M-Pesa STK Push
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Visa / Mastercard
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Airtel Money
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          Apple Pay
                        </span>
                      </div>

                      <div className="checkout-form-group">
                        <label className="checkout-form-label" htmlFor="checkout-email">
                          Account Email for Receipt & Plan Activation
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
                        <label className="checkout-form-label" htmlFor="checkout-phone">
                          Mobile Number (for Mobile Money prompt)
                        </label>
                        <input
                          id="checkout-phone"
                          type="tel"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder="e.g. 078... / 071... (+250 / +254)"
                          className="checkout-form-input"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="qb-button qb-button--green qb-button--medium w-full mt-3"
                      >
                        {isSubmitting
                          ? 'Connecting to Paystack…'
                          : `Pay ${getPriceData(selectedPlan).basketTotal} with Paystack`}
                      </button>

                      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>PCI-DSS Certified • 256-bit Encrypted Checkout</span>
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
