/*
 * SOLIDARITY PLATFORM - IBM MARKET DATA FETCHER
 * ===============================================
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 *
 * ===============================================
 *
 * Fetches live IBM price data from Yahoo Finance (no API key required).
 * Returns current price, 52-week high/low, and PE ratio for use in
 * the φ-coherence forecast model.
 *
 * Falls back to static seed values if the network request fails.
 */

'use strict';

const axios = require('axios');

const FALLBACK_PRICE  = 230.0;   // approximate recent IBM price (USD)
const FALLBACK_52H    = 270.0;
const FALLBACK_52L    = 170.0;
const FALLBACK_PE     = 22.0;
const TICKER          = 'IBM';

const YAHOO_URL = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}`;
const YAHOO_SUMMARY_URL = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${TICKER}`;

/**
 * Fetch live IBM market data from Yahoo Finance.
 * @returns {Promise<{
 *   price: number,
 *   high52: number,
 *   low52:  number,
 *   peRatio: number,
 *   live: boolean,
 *   timestamp: string
 * }>}
 */
async function fetchIBMMarketData() {
  try {
    const resp = await axios.get(YAHOO_SUMMARY_URL, {
      params: { modules: 'summaryDetail,price' },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000,
    });

    const result = resp.data && resp.data.quoteSummary && resp.data.quoteSummary.result;
    if (!result || result.length === 0) throw new Error('Empty result from Yahoo Finance');

    const summary = result[0].summaryDetail || {};
    const priceData = result[0].price || {};

    const price   = (priceData.regularMarketPrice  && priceData.regularMarketPrice.raw)   || FALLBACK_PRICE;
    const high52  = (summary.fiftyTwoWeekHigh       && summary.fiftyTwoWeekHigh.raw)       || FALLBACK_52H;
    const low52   = (summary.fiftyTwoWeekLow        && summary.fiftyTwoWeekLow.raw)        || FALLBACK_52L;
    const peRatio = (summary.trailingPE             && summary.trailingPE.raw)             || FALLBACK_PE;

    return {
      price,
      high52,
      low52,
      peRatio,
      live: true,
      timestamp: new Date().toISOString(),
    };
  } catch (_err) {
    return {
      price:    FALLBACK_PRICE,
      high52:   FALLBACK_52H,
      low52:    FALLBACK_52L,
      peRatio:  FALLBACK_PE,
      live:     false,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Normalise the current IBM price to a [0,1] signal using 52-week range.
 * Result feeds into Point 1 of IBMThreePointConnector.
 *
 * @param {{ price: number, high52: number, low52: number }} marketData
 * @returns {number} signal in [0,1]
 */
function priceToSignal({ price, high52, low52 }) {
  const range = high52 - low52;
  if (range <= 0) return 0.618;  // default to safety baseline
  return Math.max(0, Math.min(1, (price - low52) / range));
}

module.exports = { fetchIBMMarketData, priceToSignal, TICKER, FALLBACK_PRICE };
