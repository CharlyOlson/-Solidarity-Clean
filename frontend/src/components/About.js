/*
 * SOLIDARITY PLATFORM - ABOUT
 * ============================
 * Sales pitch with capability cards.
 * Grounded language — no hype per charter rules.
 */

import React from 'react';
import './About.css';

const CAPABILITIES = [
  {
    title: 'Coherence-Gated Operations',
    description:
      'Every financial operation passes through a coherence gate before execution. The platform uses proportional convergence as the mathematical validator \u2014 not rule-based compliance, but structural mathematical validation.',
    quote:
      "Your transactions aren\u2019t just checked against a list of rules. They\u2019re validated against the same proportional relationships that govern stable systems.",
  },
  {
    title: 'Three-Body Validation',
    description:
      'Every transaction is checked across three independent mathematical dimensions. All three must converge before any operation executes, preventing single-point-of-failure in validation logic.',
    quote: 'Three independent checks. All three agree, or nothing moves.',
  },
  {
    title: 'Distributed Treasury Management',
    description:
      '17 on-chain slot wallets managed by smart contracts. Real fund distribution \u2014 not a single hot wallet. A 500 basis point infrastructure reserve ensures operational stability.',
    quote:
      'Your funds are distributed across purpose-built wallet slots, each managed by auditable smart contracts on Ethereum.',
  },
  {
    title: 'Hanko Verification Stamps',
    description:
      'Cryptographic proof of identity tied to every action. Inspired by the Japanese hanko seal tradition, your digital signature carries weight. Every stamp is verifiable, timestamped, and permanent.',
    quote:
      "Every action you take is stamped with your cryptographic identity. Not just logged \u2014 sealed.",
  },
  {
    title: 'AI-Assisted Analysis',
    description:
      'Context-aware AI that understands your financial position. Personal tier runs local AI through Ollama \u2014 your data stays on your machine. Pro and Business tiers use cloud AI with full platform context.',
    quote: 'AI that works with your data, not just about your data.',
  },
  {
    title: 'GENIUS Act Ready',
    description:
      'Built with the upcoming regulatory framework in mind. OCC rules take effect July 2026 with full activation in January 2027. Designed for compliance from day one, not retrofitted.',
    quote:
      "Regulatory compliance isn\u2019t an afterthought. The platform is built for the framework that\u2019s coming.",
  },
];

const TIERS = [
  {
    name: 'Personal',
    price: 'Free',
    features: ['Local AI (Ollama)', 'Basic wallet', 'Community access', 'Geometric pattern tools'],
  },
  {
    name: 'Pro',
    price: '$29/mo',
    features: ['Cloud AI', 'Advanced analytics', 'Priority support', 'All Personal features'],
  },
  {
    name: 'Business',
    price: 'Custom',
    features: ['Treasury management', 'Multi-user accounts', 'Hanko verification', 'Full API access'],
  },
];

function About() {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1 className="about-hero-title">Solidarity Platform</h1>
        <p className="about-hero-tagline">
          Financial infrastructure built on mathematical coherence.
        </p>
        <p className="about-hero-sub">
          A platform where every transaction, every verification, and every AI response
          is governed by the same mathematical principles that structure nature itself.
        </p>
      </section>

      <div className="about-cards-grid">
        {CAPABILITIES.map((cap) => (
          <div className="about-card" key={cap.title}>
            <h3 className="about-card-title">{cap.title}</h3>
            <p className="about-card-desc">{cap.description}</p>
            <blockquote className="about-card-quote">{cap.quote}</blockquote>
          </div>
        ))}
      </div>

      <section className="about-tiers">
        <h2 className="about-tiers-heading">Choose Your Tier</h2>
        <div className="about-tiers-grid">
          {TIERS.map((tier) => (
            <div className="about-tier-card" key={tier.name}>
              <h3 className="about-tier-name">{tier.name}</h3>
              <span className="about-tier-price">{tier.price}</span>
              <ul className="about-tier-features">
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;
