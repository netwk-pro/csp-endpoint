/* ==========================================================================
netlify/functions/csp-report.js

Copyright © 2025 Network Pro Strategies (Network Pro™)
SPDX-License-Identifier: CC-BY-4.0 OR GPL-3.0-or-later
This file is part of Network Pro.
========================================================================== */

/**
 * @file csp-report.js
 * @description Netlify Function to handle CSP violation reports.
 *
 * Accepts POST requests to /.netlify/functions/csp-report and logs relevant
 * CSP reports. Filters out common low-value reports (e.g., img-src) to reduce
 * invocation cost. Alerts on high-risk violations via ntfy topic.
 *
 * @module netlify/functions
 * @author SunDevil311
 * @updated 2025-07-11
 */

/**
 * TTL for deduping alerts
 * @type {number}
 */
const VIOLATION_TTL_MS = 60_000;

/**
 * Recent violations for rate-limiting
 * @type {Map<string, number>}
 */
const recentViolations = new Map();

/**
 * Netlify Function handler for CSP reporting.
 *
 * @param {import('@netlify/functions').HandlerEvent} event - The incoming HTTP request
 * @param {import('@netlify/functions').HandlerContext} _context - The Netlify Function context (unused)
 * @returns {Promise<import('@netlify/functions').HandlerResponse>} HTTP Response object
 */
export const handler = async (event, _context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const report = body['csp-report'];

    // Ignore if report is missing or malformed
    if (!report || typeof report !== 'object') {
      return { statusCode: 204 };
    }

    const violated = report['violated-directive'] ?? '';
    const blockedUri = report['blocked-uri'] ?? '';

    // Filter: Skip noisy or unactionable reports
    const ignored = [
      violated.startsWith('img-src'),
      blockedUri === '',
      blockedUri === 'eval',
      blockedUri === 'about',
      blockedUri.startsWith('chrome-extension://'),
      blockedUri.startsWith('moz-extension://'),
      !report['source-file'],
      !report['document-uri'],
    ].some(Boolean);

    if (ignored) {
      console.log('[CSP] Ignored low-value violation:', {
        directive: violated,
        uri: blockedUri,
      });
      return { statusCode: 204 };
    }

    // Send alert for high-risk directives
    await sendToNtfy(violated, blockedUri, report);

    // Log useful violations
    console.log('[CSP] Violation:', {
      directive: violated,
      uri: blockedUri,
      referrer: report['referrer'],
      source: report['source-file'],
      line: report['line-number'],
    });
  } catch (err) {
    console.warn('[CSP] Failed to parse CSP report:', err.message);
  }

  return { statusCode: 204 };
};

/**
 * Sends a high-priority alert to your ntfy topic for high-risk CSP violations.
 * Applies rate-limiting to avoid sending duplicate alerts within 60 seconds.
 *
 * @param {string} violated - The violated CSP directive
 * @param {string} blockedUri - The URI that was blocked
 * @param {Record<string, any>} report - The full CSP report object
 * @returns {Promise<void>}
 */
async function sendToNtfy(violated, blockedUri, report) {
  const highRiskDirectives = [
    'script-src',
    'form-action',
    'frame-ancestors',
    'base-uri',
  ];

  const directiveKey = violated.split(' ')[0]; // strip fallback values or sources
  const isHighRisk = highRiskDirectives.includes(directiveKey);

  console.log(
    `[CSP] Directive ${directiveKey} is ${isHighRisk ? '' : 'not '}high-risk`,
  );
  if (!isHighRisk) return;

  const key = `${violated}|${blockedUri}`;
  const now = Date.now();

  // Skip and log if violation was reported recently
  if (
    recentViolations.has(key) &&
    now - recentViolations.get(key) < VIOLATION_TTL_MS
  ) {
    console.log(`[CSP] Skipped duplicate alert for ${key}`);
    return;
  }

  // Record the current timestamp
  recentViolations.set(key, now);

  // Cleanup old entries (memory-safe for low volume)
  for (const [k, t] of recentViolations.entries()) {
    if (now - t > VIOLATION_TTL_MS) {
      recentViolations.delete(k);
    }
  }

  const topicUrl = 'https://ntfy.neteng.pro/csp-alerts';

  const message = [
    `🚨 CSP Violation Detected`,
    `Directive: ${violated}`,
    `Blocked URI: ${blockedUri}`,
    `Referrer: ${report.referrer || 'N/A'}`,
    `Source: ${report['source-file'] || 'N/A'}`,
    `Line: ${report['line-number'] || 'N/A'}`,
  ].join('\n');

  await fetch(topicUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-Title': 'High-Risk CSP Violation',
      'X-Priority': '5',
    },
    body: message,
  });
}
