/*
 * SOLIDARITY PLATFORM - ABOUT
 * ============================
 * Purpose, mission statement, and platform functions.
 * Grounded language — no hype per charter rules.
 */

import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <section className="about-section">
        <h2>Purpose</h2>
        <p>
          Solidarity is a financial equity platform that connects treasury management,
          identity verification, and AI assistance into a single interface. It is built
          to give individuals and small businesses access to the same financial tools
          that larger institutions use, without requiring specialized knowledge to operate.
        </p>
      </section>

      <section className="about-section">
        <h2>Mission</h2>
        <p>
          To provide transparent, auditable financial infrastructure where every
          transaction, allocation, and decision is traceable on-chain. The platform
          prioritizes safety thresholds derived from the golden ratio, ensuring that
          treasury distributions and fee calculations follow consistent mathematical
          rules rather than arbitrary policies.
        </p>
      </section>

      <section className="about-section">
        <h2>Platform Functions</h2>
        <div className="about-functions">
          <div className="about-func-item">
            <h3>Treasury Management</h3>
            <p>
              On-chain treasury with phi-ratio distribution across designated slots.
              Reserve settings and distribution counts are publicly readable from the
              Sepolia testnet contract.
            </p>
          </div>
          <div className="about-func-item">
            <h3>Coherence-Gated AI</h3>
            <p>
              An AI assistant whose access tier is determined by on-chain coherence
              scores. Safety levels range from critical to optimal, each with defined
              behavioral constraints.
            </p>
          </div>
          <div className="about-func-item">
            <h3>Wallet Connectivity</h3>
            <p>
              Crypto wallets, connected bank accounts, and payment methods in one hub.
              Each connection type has an independent verification status.
            </p>
          </div>
          <div className="about-func-item">
            <h3>Hanko Stamps</h3>
            <p>
              Digital identity seals generated from seven personal markers through a
              sudoku convergence algorithm. Used for authentication across personal,
              registered, bank, and company contexts.
            </p>
          </div>
          <div className="about-func-item">
            <h3>Payment Calculator</h3>
            <p>
              B2B fee comparison tool that calculates traditional processing costs
              against phi-ratio optimized rates. Includes multi-year projection and
              break-even analysis.
            </p>
          </div>
          <div className="about-func-item">
            <h3>Device Trust</h3>
            <p>
              Manage trusted devices with revocable access. Trust ratios are calculated
              using the golden ratio to weight device reliability and usage history.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
