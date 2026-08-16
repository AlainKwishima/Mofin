import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '../types';

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Is Mofin safe to use?',
    answer: 'Absolutely. Mofin stores all your financial data encrypted on your phone using bank-grade encryption (AES-256). We never see your transactions — everything stays on your device unless you choose to back it up.',
  },
  {
    id: 'faq-2',
    question: 'Does it work without internet?',
    answer: 'Yes. Mofin is built offline-first. All tracking, categorization, and reporting works without any data connection. Sync to the cloud only happens when you go online — and only if you want it.',
  },
  {
    id: 'faq-3',
    question: 'Which mobile money providers are supported?',
    answer: 'Currently M-Pesa (Safaricom), Airtel Money, Equitel, and MTN MoMo. We are adding more providers based on user feedback.',
  },
  {
    id: 'faq-4',
    question: 'Why is it not on the Play Store?',
    answer: 'Google Play has strict policies around SMS-reading apps. Rather than compromise on features, we are distributing Mofin directly. The APK is signed, verified, and completely safe to install.',
  },
  {
    id: 'faq-5',
    question: 'Is it really free?',
    answer: 'Yes. Mofin is free for personal use. No ads, no subscriptions, no hidden fees. We may introduce premium features for small businesses in the future, but the core tracker will always be free.',
  },
  {
    id: 'faq-6',
    question: 'Can I export my data?',
    answer: 'Yes. You can generate PDF Income & Expenditure statements at any time. You can also back up your data to the cloud and restore it on a new phone.',
  },
];

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq reveal" id="faq">
      <div className="container-sm">
        <div style={{ textAlign: 'center' }}>
          <h2 className="heading-sm">Questions? Answered.</h2>
        </div>

        <div className="faq-list">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div 
                key={item.id} 
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => toggleFAQ(item.id)}
              >
                <div className="faq-question">
                  <span>{item.question}</span>
                  <ChevronDown className="faq-icon" size={20} />
                </div>
                <div className="faq-answer">
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
