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
 * @author Scott Lopez
 * @updated 2025-11-05
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
    const rawBody = Buffer.from(event.body, 'utf8').toString();
    const body = JSON.parse(rawBody);
    const report = body['csp-report'];

    // Ignore if report is missing or malformed
    if (!report || typeof report !== 'object') {
      return { statusCode: 204 };
    }

    const violated = report['violated-directive'] ?? '';
    const blockedUri = report['blocked-uri'] ?? '';

    // Filter only known useless reports
    if (
      blockedUri.startsWith('chrome-extension://') ||
      blockedUri.startsWith('moz-extension://')
    ) {
      console.log('[CSP] Ignored browser extension violation:', blockedUri);
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
    console.warn(`[CSP] Failed to parse CSP report: ${String(err.message)}`);
  }

  return { statusCode: 204 };
};

/**
 * Sends a high-priority alert to your ntfy topic for CSP violations.
 * Applies rate-limiting to avoid sending duplicate alerts within TTL.
 *
 * @param {string} violated - The violated CSP directive
 * @param {string} blockedUri - The URI that was blocked
 * @param {Record<string, any>} report - The full CSP report object
 * @returns {Promise<void>}
 */
async function sendToNtfy(violated, blockedUri, report) {
  const directiveKey = violated.split(' ')[0].toLowerCase(); // e.g., "script-src" from "script-src-elem"

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

  // Clean up expired entries
  cleanUpOldViolations(recentViolations, VIOLATION_TTL_MS, now);

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
      'X-Title': `CSP Violation: ${directiveKey} → ${encodeURI(blockedUri)}`,
      'X-Priority': getPriority(directiveKey),
    },
    body: message,
  });
}

/**
 * Returns a priority level for a CSP directive (1 = min, 5 = max).
 *
 * @param {string} directiveKey - The base CSP directive (e.g., "script-src")
 * @returns {'1' | '2' | '3' | '4' | '5'} - ntfy priority as a string
 */
function getPriority(directiveKey) {
  switch (directiveKey) {
    case 'script-src':
    case 'form-action':
    case 'frame-ancestors':
    case 'base-uri':
      return '5'; // Max urgency
    case 'style-src':
    case 'connect-src':
      return '3'; // Default
    default:
      return '2'; // Low
  }
}

/**
 * Removes expired entries from the Map based on TTL.
 *
 * @param {Map<string, number>} map - The map of recent violations
 * @param {number} ttl - Time-to-live in milliseconds
 * @param {number} now - Current timestamp (Date.now())
 * @returns {void}
 */
function cleanUpOldViolations(map, ttl, now) {
  for (const [key, timestamp] of map.entries()) {
    if (now - timestamp > ttl) {
      map.delete(key);
    }
  }
}
