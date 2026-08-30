import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Step } from '../types';

const steps: Step[] = [
  {
    number: '①',
    title: 'You Transact',
    description: 'Send or receive money via M-Pesa as usual.',
  },
  {
    number: '②',
    title: 'Mofin Detects',
    description: 'The app reads the SMS or notification automatically.',
  },
  {
    number: '③',
    title: 'You Label',
    description: "A popup asks 'What was this for?' Type 'Rice' or 'Bus fare'.",
  },
  {
    number: '④',
    title: 'Algorithm Organizes',
    description: 'Mofin categorizes it into Grocery, Transport, Income, etc.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="how-it-works reveal">
      <div className="container">
        <div className="section-header">
          <span className="uppercase-label">HOW IT WORKS</span>
          <h2 className="heading">From SMS to Insight in Seconds</h2>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="step-card">
                <div className="step-number">{step.number}</div>
                <h3 className="subheading text-white">{step.title}</h3>
                <p className="body text-ash">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <ArrowRight size={24} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
